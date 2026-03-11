from fastapi.testclient import TestClient
from main import app
from database import Base, engine

# Create the tables if they don't exist
Base.metadata.create_all(bind=engine)

client = TestClient(app)

print("1. Creating user...")
user_res = client.post("/users/", json={"name": "Test User", "email": "test@example.com"})
print(user_res.status_code, user_res.json())

user_id = user_res.json().get("id", 1) if user_res.status_code == 200 else 1

print("\n2. Creating habit...")
habit_res = client.post(f"/users/{user_id}/habits/", json={"title": "Drink Water", "description": "2L daily"})
print(habit_res.status_code, habit_res.json())

habit_id = habit_res.json().get("id", 1) if habit_res.status_code == 200 else 1

print("\n3. Completing habit (Triggers LLM)...")
log_res = client.post(f"/users/{user_id}/habits/{habit_id}/log", json={"notes": ""})
print(log_res.status_code, log_res.json())
