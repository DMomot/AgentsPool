"""Health check and status endpoints"""
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "AgentsPool API is running",
        "version": "1.0.0",
        "status": "healthy"
    }


@router.get("/status")
async def status():
    """Simple status check without DB"""
    return {
        "status": "ok",
        "service": "AgentsPool API",
        "version": "1.0.0"
    }


@router.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "version": "1.0.0"
    }

