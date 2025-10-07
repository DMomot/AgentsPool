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

# Debug: Print DATABASE_URL status
try:
    if DATABASE_URL:
        db_type = DATABASE_URL.split(':')[0] if ':' in DATABASE_URL else 'unknown'
        print(f"✅ Database URL configured ({db_type})")
    else:
        print("⚠️ Warning: DATABASE_URL not set!")
except Exception as e:
    print(f"⚠️ Error checking DATABASE_URL: {e}")

# Create engine with error handling
try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    print("✅ Database engine created successfully")
except Exception as e:
    print(f"❌ Failed to create database engine: {e}")
    # Don't raise - let app start anyway
    engine = None

# Create session factory
if engine:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    SessionLocal = None

# Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    """Database dependency for FastAPI"""
    if not SessionLocal:
        raise Exception("Database not configured")
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
