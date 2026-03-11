from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, database
import agent # Import our specific AI agent logic

# 1. Create the database tables
# This line tells SQLAlchemy to look at models.py and create the actual tables in the SQLite file.
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Habit Tracker AI API",
    description="Backend for the AI-powered habit tracking app",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------
# API ENDPOINTS (ROUTES)
# -----------------

@app.get("/")
def read_root():
    return {"message": "Welcome to the Habit Tracker AI API. Go to /docs to test it!"}

# --- USER ROUTES ---

# CREATE a User (POST request)
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new database model object
    new_user = models.User(name=user.name, email=user.email)
    
    # Add it to the session and save (commit) to the database
    db.add(new_user)
    db.commit()
    db.refresh(new_user) # Refresh to get the generated ID
    
    return new_user

# READ all Users (GET request)
@app.get("/users/", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

# --- HABIT ROUTES ---

# CREATE a Habit
@app.post("/users/{user_id}/habits/", response_model=schemas.Habit)
def create_habit_for_user(
    user_id: int, habit: schemas.HabitCreate, db: Session = Depends(database.get_db)
):
    # Create the habit, linked to the user_id from the URL
    db_habit = models.Habit(**habit.model_dump(), owner_id=user_id)
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit

# READ Habits for a User
@app.get("/users/{user_id}/habits/", response_model=list[schemas.Habit])
def read_habits(user_id: int, db: Session = Depends(database.get_db)):
    # Find habits where owner_id matches the user requested
    habits = db.query(models.Habit).filter(models.Habit.owner_id == user_id).all()
    return habits

# --- AI & HABIT LOG ROUTES ---

@app.post("/users/{user_id}/habits/{habit_id}/log", response_model=schemas.HabitLog)
def complete_habit(
    user_id: int, habit_id: int, log_data: schemas.HabitLogCreate, db: Session = Depends(database.get_db)
):
    # 1. Verification
    user = db.query(models.User).filter(models.User.id == user_id).first()
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    
    if not user or not habit:
        raise HTTPException(status_code=404, detail="User or Habit not found")
        
    if habit.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Habit does not belong to user")
        
    # 2. Call our AI Agent (Langchain)
    ai_note = agent.get_motivational_note(user_name=user.name, habit_title=habit.title)
    
    # 3. Create the Database Log with the AI Note
    new_log = models.HabitLog(
        habit_id=habit.id,
        notes=ai_note # Saving the AI's message into our database!
    )
    
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    
    return new_log

