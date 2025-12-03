"""
Convenience wrapper for database imports.
This allows importing from 'database' instead of 'backend.database'.
"""
from backend.database import SessionLocal, Base, get_db, engine

__all__ = ["SessionLocal", "Base", "get_db", "engine"]
