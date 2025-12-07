"""
Database configuration and session management
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL) if DATABASE_URL and DATABASE_URL.strip() else None

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) if engine else None

# Base class for models
Base = declarative_base()

def get_db():
    """
    Dependency function to get database session.
    Yields a database session and ensures it's closed after use.
    """
    if SessionLocal is None:
        raise RuntimeError("Database not configured. Set DATABASE_URL environment variable.")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
