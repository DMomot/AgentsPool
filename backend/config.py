"""
Configuration for AgentsPool API
"""

import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # App settings
    project_name: str = "AgentsPool API"
    api_v1_str: str = "/api/v1"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    port: int = int(os.getenv("PORT", "8000"))  # For uvicorn.run compatibility
    debug: bool = True
    
    # CORS settings
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "https://agentspool.ai",
        "https://www.agentspool.ai",
        "https://api.agentspool.ai"
    ]
    
    # Database
    database_url: str = "sqlite:///./agentspool.db"
    
    class Config:
        env_file = ".env"


# Create settings instance
settings = Settings()
