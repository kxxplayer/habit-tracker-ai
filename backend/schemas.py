from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# -----------------
# HABIT LOG SCHEMAS
# -----------------
class HabitLogBase(BaseModel):
    notes: Optional[str] = None

class HabitLogCreate(HabitLogBase):
    pass

class HabitLog(HabitLogBase):
    id: int
    habit_id: int
    completed_at: datetime
    
    class Config:
        from_attributes = True

# -----------------
# HABIT SCHEMAS
# -----------------
class HabitBase(BaseModel):
    title: str
    description: Optional[str] = None

class HabitCreate(HabitBase):
    pass

class Habit(HabitBase):
    id: int
    owner_id: int
    logs: List[HabitLog] = []

    class Config:
        from_attributes = True

# -----------------
# USER SCHEMAS
# -----------------
class UserBase(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    auth_id: Optional[str] = None
    habits: List[Habit] = []

    class Config:
        from_attributes = True
