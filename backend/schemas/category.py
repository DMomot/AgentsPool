"""Pydantic schemas for Category endpoints"""
from typing import Optional
from pydantic import BaseModel


class CategoryResponse(BaseModel):
    """Response model for category data"""
    id: int
    name: str
    description: Optional[str]
    icon: Optional[str]
    slug: str
    created_at: str
    
    class Config:
        from_attributes = True

