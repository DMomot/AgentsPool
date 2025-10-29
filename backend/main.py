#!/usr/bin/env python3
"""
AgentsPool API - Refactored Production Backend
AI Agent Catalog and Marketplace
Version: 2.0 (optimized deployment)
"""
import os
from pathlib import Path

# Set HuggingFace cache directory for Railway volume persistence (only if directory exists)
cache_dir = Path('/app/.cache')
if cache_dir.exists():
    os.environ['TRANSFORMERS_CACHE'] = '/app/.cache/huggingface'
    os.environ['HF_HOME'] = '/app/.cache/huggingface'
    print(f"📦 Using model cache: /app/.cache/huggingface")
else:
    # In CI/CD use default cache (~/.cache/huggingface)
    print(f"📦 Using default model cache location")

from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import datetime
from starlette.middleware.base import BaseHTTPMiddleware

from database.config import get_db
from database.models import Agent, Category
from config import settings

# Import routers
from api.routes import health, categories, agents, reviews, fundraising, news

# Create FastAPI app
app = FastAPI(
    title=settings.project_name,
    description="AI Agent Catalog and Marketplace API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:; img-src 'self' https: data:; font-src 'self' https: data:;"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event - preload AI models
@app.on_event("startup")
async def startup_event():
    """Load AI models on server startup for faster first request"""
    # Check if preload is disabled (for faster startup in some environments)
    preload_models = os.getenv("PRELOAD_AI_MODELS", "true").lower() == "true"
    
    if not preload_models:
        print("🚀 Server starting up...")
        print("⚠️  AI models will load on first search request (lazy loading)")
        return
    
    print("🤖 Loading AI models...")
    try:
        from api.routes.agents import get_embedding_model
        
        # Preload embedding model
        print("  📦 Loading embedding model (all-MiniLM-L6-v2)...")
        get_embedding_model()
        print("  ✅ Embedding model loaded")
        
        print("🎉 AI model loaded successfully!")
    except Exception as e:
        print(f"⚠️  Warning: Failed to preload AI model: {e}")
        print("   Model will be loaded on first search request")

# Include routers
app.include_router(health.router)  # No prefix for health endpoints
app.include_router(categories.router, prefix=settings.api_v1_str)
app.include_router(agents.router, prefix=settings.api_v1_str)
app.include_router(reviews.router, prefix=settings.api_v1_str)
app.include_router(fundraising.router, prefix=settings.api_v1_str)
app.include_router(news.router, prefix=settings.api_v1_str)


# Sitemap endpoint (keeping here as it's a special case)
@app.get("/api/v1/sitemap-generated.xml")
async def generate_sitemap(db: Session = Depends(get_db)):
    """Generate sitemap.xml for SEO"""
    
    try:
        # Get all agents and categories
        agents = db.query(Agent).filter(Agent.slug.isnot(None)).all()
        categories = db.query(Category).all()
        
        # Generate sitemap XML
        now = datetime.utcnow().isoformat() + 'Z'
        
        sitemap_lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            '  <url>',
            '    <loc>https://agentspool.ai/</loc>',
            f'    <lastmod>{now}</lastmod>',
            '    <changefreq>daily</changefreq>',
            '    <priority>1.0</priority>',
            '  </url>',
            '  <url>',
            '    <loc>https://agentspool.ai/catalog</loc>',
            f'    <lastmod>{now}</lastmod>',
            '    <changefreq>daily</changefreq>',
            '    <priority>0.9</priority>',
            '  </url>',
            '  <url>',
            '    <loc>https://agentspool.ai/categories</loc>',
            f'    <lastmod>{now}</lastmod>',
            '    <changefreq>daily</changefreq>',
            '    <priority>0.8</priority>',
            '  </url>',
            '  <url>',
            '    <loc>https://agentspool.ai/agents</loc>',
            f'    <lastmod>{now}</lastmod>',
            '    <changefreq>daily</changefreq>',
            '    <priority>0.8</priority>',
            '  </url>',
        ]
        
        # Add categories (using name as slug, lowercase)
        for cat in categories:
            cat_slug = cat.name.lower().replace(' ', '-').replace('&', 'and')
            sitemap_lines.extend([
                '  <url>',
                f'    <loc>https://agentspool.ai/{cat_slug}</loc>',
                f'    <lastmod>{now}</lastmod>',
                '    <changefreq>weekly</changefreq>',
                '    <priority>0.7</priority>',
                '  </url>',
            ])
        
        # Add agents
        for agent in agents:
            agent_lastmod = agent.updated_at.isoformat() + 'Z' if hasattr(agent.updated_at, 'isoformat') else now
            sitemap_lines.extend([
                '  <url>',
                f'    <loc>https://agentspool.ai/agents/{agent.slug}</loc>',
                f'    <lastmod>{agent_lastmod}</lastmod>',
                '    <changefreq>weekly</changefreq>',
                '    <priority>0.7</priority>',
                '  </url>',
            ])
        
        sitemap_lines.append('</urlset>')
        sitemap_content = '\n'.join(sitemap_lines)
        
        return Response(
            content=sitemap_content,
            media_type="text/xml; charset=utf-8",
            headers={
                "Cache-Control": "public, max-age=3600",
                "X-Content-Type-Options": "nosniff"
            }
        )
        
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Failed to generate sitemap: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    import os
    
    # Log startup configuration
    port = int(os.getenv("PORT", "8000"))
    print("=" * 70)
    print(f"🚀 Starting AgentsPool API")
    print(f"📡 Host: 0.0.0.0")
    print(f"📡 Port from env: {os.getenv('PORT', 'NOT SET')}")
    print(f"📡 Using port: {port}")
    print(f"🗄️  Database configured: {'Yes' if os.getenv('DATABASE_URL') else 'No'}")
    print(f"🌐 Frontend URL: {os.getenv('FRONTEND_URL', 'NOT SET')}")
    print(f"🌐 CORS origins: {settings.allowed_origins}")
    print("=" * 70)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )
