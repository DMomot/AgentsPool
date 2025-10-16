"""Pydantic schemas for Review endpoints"""
from typing import Optional
from pydantic import BaseModel


class ReviewResponse(BaseModel):
    """Response model for review data"""
    id: int
    agent_id: int
    user_name: str
    user_email: str
    rating: int
    title: Optional[str]
    comment: Optional[str]
    is_verified: bool
    created_at: str
    
    class Config:
        from_attributes = True

