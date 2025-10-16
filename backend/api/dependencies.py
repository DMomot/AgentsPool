"""FastAPI dependencies"""
from database.config import get_db

# Re-export for convenience
__all__ = ['get_db']

