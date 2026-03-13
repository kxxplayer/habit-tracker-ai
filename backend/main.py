from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import models, schemas, database, agent
from auth import verify_token

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Habit Tracker AI API",
    description="Backend for the AI-powered habit tracking app",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://habit-tracker-ai-pi.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------
# MCP SERVER SETUP
# -----------------
from starlette.requests import Request
from mcp.server.sse import SseServerTransport
from mcp_server import create_mcp_server, mcp_user_id

mcp_app = create_mcp_server()
sse_transport = SseServerTransport("/mcp/messages")

@app.get("/mcp/sse")
async def handle_mcp_sse(request: Request, db: Session = Depends(database.get_db)):
    token = request.query_params.get("token")
    if not token:
        # Check header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]
    
    if not token:
        raise HTTPException(status_code=401, detail="Token required in 'token' query param or Bearer header")

    try:
        auth_info = verify_token(token)
        user = get_or_create_db_user(auth_info["id"], auth_info["email"], db)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

    # Set context for this connection
    mcp_user_id.set(user.id)

    async with sse_transport.connect_sse(request.scope, request.receive, request.send) as (read_stream, write_stream):
        await mcp_app.run(
            read_stream,
            write_stream,
            mcp_app.create_initialization_options()
        )

@app.post("/mcp/messages")
async def handle_mcp_messages(request: Request):
    await sse_transport.handle_post_message(request.scope, request.receive, request.send)

@app.get("/mcp/config")
def get_mcp_config():
    """Returns the JSON config for Claude Desktop / AI Clients."""
    return {
        "message": "To connect this app to Claude Desktop, add this to your config:",
        "config_snippet": {
            "mcpServers": {
                "habitify": {
                    "url": "https://habit-tracker-ai-13ly.onrender.com/mcp/sse?token=YOUR_SUPABASE_JWT"
                }
            }
        },
        "instructions": "Replace YOUR_SUPABASE_JWT with your actual token from the web app's developer bar (localStorage) or by inspecting requests."
    }

# -----------------------------------------
# Helper: get or create public.users record
# -----------------------------------------
def get_or_create_db_user(supabase_uid: str, email: str, db: Session) -> models.User:
    """Given a Supabase auth UID, look up (or create) the matching public.users row."""
    user = db.query(models.User).filter(models.User.auth_id == supabase_uid).first()
    if not user:
        user = models.User(
            name=email.split("@")[0] if email else "User",
            email=email or None,
            auth_id=supabase_uid
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

# -----------------
# ROOT
# -----------------
@app.get("/")
def read_root():
    return {"message": "Habit Tracker AI API v2.0 - Auth enabled 🔐"}

# -----------------
# USER ROUTES
# -----------------
@app.get("/me", response_model=schemas.User)
def get_me(
    db: Session = Depends(database.get_db),
    auth_info: dict = Depends(verify_token)
):
    return get_or_create_db_user(auth_info["id"], auth_info["email"], db)

# -----------------
# HABIT ROUTES
# -----------------
@app.post("/habits/", response_model=schemas.Habit)
def create_habit(
    habit: schemas.HabitCreate,
    db: Session = Depends(database.get_db),
    auth_info: dict = Depends(verify_token)
):
    user = get_or_create_db_user(auth_info["id"], auth_info["email"], db)
    db_habit = models.Habit(**habit.model_dump(), owner_id=user.id)
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit

@app.get("/habits/", response_model=list[schemas.Habit])
def read_habits(
    db: Session = Depends(database.get_db),
    auth_info: dict = Depends(verify_token)
):
    user = get_or_create_db_user(auth_info["id"], auth_info["email"], db)
    return db.query(models.Habit).filter(models.Habit.owner_id == user.id).all()

@app.delete("/habits/{habit_id}", status_code=204)
def delete_habit(
    habit_id: int,
    db: Session = Depends(database.get_db),
    auth_info: dict = Depends(verify_token)
):
    user = get_or_create_db_user(auth_info["id"], auth_info["email"], db)
    habit = db.query(models.Habit).filter(
        models.Habit.id == habit_id,
        models.Habit.owner_id == user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found or not yours")
    db.delete(habit)
    db.commit()
    return

# -----------------
# AI LOG ROUTES
# -----------------
@app.post("/habits/{habit_id}/log", response_model=schemas.HabitLog)
def complete_habit(
    habit_id: int,
    db: Session = Depends(database.get_db),
    auth_info: dict = Depends(verify_token)
):
    user = get_or_create_db_user(auth_info["id"], auth_info["email"], db)
    habit = db.query(models.Habit).filter(
        models.Habit.id == habit_id,
        models.Habit.owner_id == user.id
    ).first()

    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found or not yours")

    ai_note = agent.get_motivational_note(user_name=user.name, habit_title=habit.title)

    new_log = models.HabitLog(habit_id=habit.id, notes=ai_note)
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log
@app.delete("/habits/{habit_id}/log", status_code=204)
def undo_habit_completion(
    habit_id: int,
    db: Session = Depends(database.get_db),
    auth_info: dict = Depends(verify_token)
):
    """Remove the most recent log entry for this habit created today."""
    from datetime import date
    user = get_or_create_db_user(auth_info["id"], auth_info["email"], db)
    habit = db.query(models.Habit).filter(
        models.Habit.id == habit_id,
        models.Habit.owner_id == user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found or not yours")

    today_start = datetime.combine(date.today(), datetime.min.time())
    log = db.query(models.HabitLog).filter(
        models.HabitLog.habit_id == habit_id,
        models.HabitLog.completed_at >= today_start
    ).order_by(models.HabitLog.completed_at.desc()).first()

    if log:
        db.delete(log)
        db.commit()
    return
