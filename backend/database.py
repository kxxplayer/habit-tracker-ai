from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# 1. Provide the Database URL. UseDATABASE_URL from .env if it exists (Supabase), otherwise fallback to local SQLite.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./habit_tracker.db")

# 2. Create the SQLAlchemy "Engine". 
# 'check_same_thread': False is needed only for SQLite.
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # Quick fix for older Postgres URLs if needed, SQLAlchemy 1.4+ expects postgresql://
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 3. Create a SessionLocal class. 
# Each instance of this class will be a database session (a conversation with the database).
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Create a Base class from which all our database models will inherit.
Base = declarative_base()

# Dependency to get the DB session for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
