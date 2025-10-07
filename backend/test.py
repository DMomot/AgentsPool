#!/usr/bin/env python3
"""
Minimal test server to check Railway deployment
"""

from fastapi import FastAPI
import uvicorn
import os

app = FastAPI()

@app.get("/")
def root():
    return {"status": "ok", "message": "Minimal test server is running"}

@app.get("/status")
def status():
    return {
        "status": "ok",
        "port": os.getenv("PORT", "not set"),
        "database_url": "configured" if os.getenv("DATABASE_URL") else "not set"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    print(f"🚀 Starting test server")
    print(f"📡 Port from env: {os.getenv('PORT', 'NOT SET')}")
    print(f"📡 Using port: {port}")
    print(f"📡 Host: 0.0.0.0")
    uvicorn.run(
        "test:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )
