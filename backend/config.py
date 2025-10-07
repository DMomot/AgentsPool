"""
Configuration for PrimeAgents API
"""

import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # App settings
    project_name: str = "PrimeAgents API"
    api_v1_str: str = "/api/v1"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    port: int = int(os.getenv("PORT", "8000"))  # For uvicorn.run compatibility
    debug: bool = True
    
    # CORS settings
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "https://primeagents.info",
        "https://www.primeagents.info",
        "https://api.primeagents.info"
    ]
    
    # Database
    database_url: str = "sqlite:///./primeagents.db"
    
    class Config:
        env_file = ".env"


# Create settings instance
settings = Settings()
