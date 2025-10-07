"""
Database configuration for AgentsPool
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv()

# Database URL from environment or default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./agentspool.db")

# Debug: Print DATABASE_URL (without password for security)
if DATABASE_URL:
    # Hide password in logs
    safe_url = DATABASE_URL.split('@')[0].split(':')[:-1]
    safe_url = ':'.join(safe_url) + ':***@' + DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else DATABASE_URL
    print(f"Database URL configured: {safe_url}")
else:
    print("Warning: DATABASE_URL not set!")

# Create engine with error handling
try:
    engine = create_engine(DATABASE_URL)
    print("Database engine created successfully")
except Exception as e:
    print(f"Failed to create database engine: {e}")
    print(f"DATABASE_URL value: {DATABASE_URL}")
    raise

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    """Database dependency for FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection():
    """Test database connection"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False
