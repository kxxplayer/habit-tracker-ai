import logging
from contextvars import ContextVar
from mcp.server import Server
from mcp.types import Tool, TextContent
import models, database, agent
from sqlalchemy.orm import Session
from datetime import date, datetime

# Global context for the current user ID
mcp_user_id: ContextVar[int] = ContextVar("mcp_user_id", default=None)

def create_mcp_server():
    server = Server("Habitify")

    @server.list_tools()
    async def list_tools() -> list[Tool]:
        return [
            Tool(
                name="list_habits",
                description="Get a list of all your habits and whether they've been completed today.",
                inputSchema={"type": "object", "properties": {}},
            ),
            Tool(
                name="mark_habit_complete",
                description="Mark a specific habit as complete for today.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "habit_id": {"type": "integer", "description": "The ID of the habit to complete"},
                    },
                    "required": ["habit_id"],
                },
            ),
            Tool(
                name="undo_complete",
                description="Remove today's completion for a specific habit.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "habit_id": {"type": "integer", "description": "The ID of the habit to undo"},
                    },
                    "required": ["habit_id"],
                },
            ),
            Tool(
                name="get_ai_coach_tip",
                description="Get a personalized motivational tip for a habit.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "habit_id": {"type": "integer", "description": "The ID of the habit"},
                    },
                    "required": ["habit_id"],
                },
            ),
        ]

    @server.call_tool()
    async def call_tool(name: str, arguments: dict) -> list[TextContent]:
        db: Session = next(database.get_db())
        user_id = mcp_user_id.get()
        
        if not user_id:
            return [TextContent(type="text", text="Error: Authentication required. User context not found.")]

        try:
            if name == "list_habits":
                habits = db.query(models.Habit).filter(models.Habit.owner_id == user_id).all()
                if not habits:
                    return [TextContent(type="text", text="No habits found. Try adding some in the web app first!")]
                
                today_start = datetime.combine(date.today(), datetime.min.time())
                lines = [f"Found {len(habits)} habits:"]
                for h in habits:
                    done = any(log.completed_at >= today_start for log in h.logs)
                    lines.append(f"- [{ 'X' if done else ' ' }] {h.title} (ID: {h.id})")
                
                return [TextContent(type="text", text="\n".join(lines))]

            elif name == "mark_habit_complete":
                habit_id = arguments["habit_id"]
                habit = db.query(models.Habit).filter(models.Habit.id == habit_id, models.Habit.owner_id == user_id).first()
                if not habit:
                    return [TextContent(type="text", text=f"Error: Habit {habit_id} not found.")]
                
                today_start = datetime.combine(date.today(), datetime.min.time())
                already_done = db.query(models.HabitLog).filter(models.HabitLog.habit_id == habit_id, models.HabitLog.completed_at >= today_start).first()
                if already_done:
                    return [TextContent(type="text", text=f"'{habit.title}' is already done for today.")]

                ai_note = agent.get_motivational_note(user_name=habit.owner.name, habit_title=habit.title)
                new_log = models.HabitLog(habit_id=habit.id, notes=ai_note)
                db.add(new_log)
                db.commit()
                return [TextContent(type="text", text=f"Marked '{habit.title}' as complete! Coach: {ai_note}")]

            elif name == "undo_complete":
                habit_id = arguments["habit_id"]
                today_start = datetime.combine(date.today(), datetime.min.time())
                log = db.query(models.HabitLog).filter(models.HabitLog.habit_id == habit_id, models.HabitLog.completed_at >= today_start).first()
                if log:
                    db.delete(log)
                    db.commit()
                    return [TextContent(type="text", text=f"Removed today's completion for habit {habit_id}.")]
                return [TextContent(type="text", text="No logs found for today.")]

            elif name == "get_ai_coach_tip":
                habit_id = arguments["habit_id"]
                habit = db.query(models.Habit).filter(models.Habit.id == habit_id, models.Habit.owner_id == user_id).first()
                if not habit:
                    return [TextContent(type="text", text="Habit not found.")]
                ai_note = agent.get_motivational_note(user_name=habit.owner.name, habit_title=habit.title)
                return [TextContent(type="text", text=ai_note)]

        except Exception as e:
            return [TextContent(type="text", text=f"Error: {str(e)}")]

        return [TextContent(type="text", text="Unknown tool.")]

    return server
