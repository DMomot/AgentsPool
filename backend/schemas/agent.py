"""Pydantic schemas for Agent endpoints"""
from typing import Optional, List
from pydantic import BaseModel


class CreateAgentRequest(BaseModel):
    """Request model for creating an agent"""
    name: str
    description: str
    category_id: int
    pricing_model: str = "free"
    tags: List[str] = []
    capabilities: List[str] = []
    use_cases: List[str] = []
    url: Optional[str] = None
    api_endpoint: Optional[str] = None
    documentation_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None
    contact_email: Optional[str] = ""
    a2a: Optional[str] = None
    img_url: Optional[str] = None
    logo_url: Optional[str] = None
    screenshots: List[str] = []


class AgentResponse(BaseModel):
    """Response model for agent data"""
    id: int
    name: str
    description: str
    short_description: Optional[str]
    category_id: int
    author: Optional[str]
    featured: bool
    slug: str
    tags: List[str] = []
    capabilities: List[str] = []
    use_cases: List[str] = []
    url: Optional[str]
    documentation_url: Optional[str]
    github_url: Optional[str]
    api_endpoint: Optional[str]
    a2a: Optional[str]
    img_url: Optional[str]
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True

