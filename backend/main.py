#!/usr/bin/env python3
"""
PrimeAgents API - Simple Production Backend
AI Agent Catalog and Marketplace
"""

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func, or_, text
from typing import Optional, List
from pydantic import BaseModel
import json
from datetime import datetime

from database.config import get_db
from database.models import Agent, Category, Review
from config import settings
from web_parser import WebPageParser

# Create FastAPI app
app = FastAPI(
    title=settings.project_name,
    description="AI Agent Catalog and Marketplace API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class CreateAgentRequest(BaseModel):
    name: str
    description: str
    category_id: int
    price: float = 0.0
    pricing_model: str = "free"
    tags: List[str] = []
    capabilities: List[str] = []
    use_cases: List[str] = []
    demo_url: Optional[str] = None
    api_endpoint: Optional[str] = None
    documentation_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None
    contact_email: Optional[str] = ""
    logo_url: Optional[str] = None
    screenshots: List[str] = []

def convert_agent_data(agent):
    """Convert agent database model to API response format"""
    agent_dict = {
        "id": agent.id,
        "name": agent.name,
        "description": agent.description,
        "short_description": agent.short_description,
        "category_id": agent.category_id,
        "author": agent.author,
        "version": agent.version,
        "price": float(agent.price),
        "is_free": agent.is_free,
        "rating": float(agent.rating),
        "downloads_count": agent.downloads_count,
        "featured": agent.featured,
        "slug": agent.slug,
        "created_at": agent.created_at.isoformat() if hasattr(agent.created_at, 'isoformat') else str(agent.created_at),
        "updated_at": agent.updated_at.isoformat() if hasattr(agent.updated_at, 'isoformat') else str(agent.updated_at),
        "demo_url": agent.demo_url,
        "documentation_url": agent.documentation_url,
        "github_url": agent.github_url,
        "api_endpoint": agent.api_endpoint,
    }
    
    # Convert fields to proper types (PostgreSQL ARRAY fields are already lists)
    agent_dict["tags"] = agent.tags if isinstance(agent.tags, list) else (json.loads(agent.tags) if agent.tags else [])
    agent_dict["capabilities"] = agent.capabilities if isinstance(agent.capabilities, list) else (json.loads(agent.capabilities) if agent.capabilities else [])
    agent_dict["use_cases"] = agent.use_cases if isinstance(agent.use_cases, list) else (json.loads(agent.use_cases) if agent.use_cases else [])
    
    # Handle model_info (JSONB field)
    model_info = {}
    if isinstance(agent.model_info, dict):
        model_info = agent.model_info
    elif isinstance(agent.model_info, str):
        try:
            model_info = json.loads(agent.model_info)
        except:
            model_info = {}
    else:
        model_info = agent.model_info or {}
    
    agent_dict["model_info"] = model_info
    
    # Extract additional fields from model_info
    agent_dict["pricing_model"] = model_info.get("pricing_model")
    agent_dict["website_url"] = model_info.get("website_url")
    agent_dict["contact_email"] = model_info.get("contact_email")
    agent_dict["logo_url"] = model_info.get("logo_url")
    agent_dict["screenshots"] = model_info.get("screenshots", [])
    
    # Add category info if available
    if hasattr(agent, 'category') and agent.category:
        agent_dict["category"] = {
            "id": agent.category.id,
            "name": agent.category.name,
            "description": agent.category.description,
            "icon": agent.category.icon
        }
    
    return agent_dict

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "PrimeAgents API is running",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "version": "1.0.0"
    }

def generate_slug(name: str) -> str:
    """Generate URL-friendly slug from category name"""
    import re
    # Convert to lowercase and replace spaces/special chars with hyphens
    slug = re.sub(r'[^\w\s-]', '', name.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

# Categories endpoints
@app.get(f"{settings.api_v1_str}/categories")
async def get_categories(db: Session = Depends(get_db)):
    """Get all categories"""
    sql_query = text("""
        SELECT id, name, description, icon, slug, created_at 
        FROM categories 
        ORDER BY name
    """)
    print("""SELECT id, name, description, icon, slug, created_at 
        FROM categories 
        ORDER BY name""")
    
    result = db.execute(sql_query).fetchall()
    
    return [
        {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "icon": row[3],
            "slug": row[4],
            "created_at": row[5].isoformat() if row[5] else None
        }
        for row in result
    ]

@app.get(f"{settings.api_v1_str}/categories/slug/{{slug}}")
async def get_category_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get category by slug"""
    try:
        category_query = text("""
            SELECT id, name, description, icon, slug, created_at 
            FROM categories 
            WHERE slug = :slug
        """)
        
        print(f"SELECT category WHERE slug = '{slug}'")
        
        result = db.execute(category_query, {"slug": slug}).fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Category not found")
        
        return {
            "id": result[0],
            "name": result[1],
            "description": result[2],
            "icon": result[3],
            "slug": result[4],
            "created_at": result[5].isoformat() if result[5] else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching category by slug: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch category")

@app.get(f"{settings.api_v1_str}/categories/{{slug}}/agents")
async def get_agents_by_category_slug(
    slug: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get agents by category slug"""
    try:
        # First find category by slug
        category_query = text("""
            SELECT id, name, description, icon, slug, created_at 
            FROM categories 
            WHERE slug = :slug
        """)
        
        category_result = db.execute(category_query, {"slug": slug}).fetchone()
        
        if not category_result:
            raise HTTPException(status_code=404, detail="Category not found")
        
        category_id = category_result[0]
        category_info = {
            "id": category_result[0],
            "name": category_result[1],
            "description": category_result[2],
            "icon": category_result[3],
            "slug": category_result[4]
        }
        
        # Get agents for this category
        offset = (page - 1) * limit
        
        agents_query = text("""
            SELECT 
                a.id, a.name, a.description, a.short_description, a.category_id,
                a.author, a.version, a.price, a.is_free, a.rating, a.downloads_count,
                a.tags, a.capabilities, a.use_cases, a.demo_url, a.documentation_url,
                a.github_url, a.api_endpoint, a.model_info, a.is_active, a.featured,
                a.slug, a.created_at, a.updated_at
            FROM agents a
            WHERE a.category_id = :category_id AND a.is_active = true
            ORDER BY a.featured DESC, a.created_at DESC
            LIMIT :limit OFFSET :offset
        """)
        
        count_query = text("""
            SELECT COUNT(*) 
            FROM agents 
            WHERE category_id = :category_id AND is_active = true
        """)
        
        print(f"""SELECT agents FROM category {category_id} 
            LIMIT {limit} OFFSET {offset}""")
        
        agents_result = db.execute(agents_query, {
            "category_id": category_id,
            "limit": limit,
            "offset": offset
        }).fetchall()
        
        total_result = db.execute(count_query, {"category_id": category_id}).fetchone()
        total = total_result[0] if total_result else 0
        
        agents = []
        for agent in agents_result:
            agents.append({
                "id": agent[0],
                "name": agent[1],
                "description": agent[2],
                "short_description": agent[3],
                "category_id": agent[4],
                "author": agent[5],
                "version": agent[6],
                "price": float(agent[7]) if agent[7] else 0.0,
                "is_free": agent[8],
                "rating": float(agent[9]) if agent[9] else 0.0,
                "downloads_count": agent[10],
                "tags": agent[11] or [],
                "capabilities": agent[12] or [],
                "use_cases": agent[13] or [],
                "demo_url": agent[14],
                "documentation_url": agent[15],
                "github_url": agent[16],
                "api_endpoint": agent[17],
                "model_info": agent[18] or {},
                "is_active": agent[19],
                "featured": agent[20],
                "slug": agent[21],
                "created_at": agent[22].isoformat() if hasattr(agent[22], 'isoformat') else str(agent[22]) if agent[22] else None,
                "updated_at": agent[23].isoformat() if hasattr(agent[23], 'isoformat') else str(agent[23]) if agent[23] else None,
                "category": category_info
            })
        
        total_pages = (total + limit - 1) // limit
        
        return {
            "agents": agents,
            "category": category_info,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching agents by category slug: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch agents")

@app.get(f"{settings.api_v1_str}/categories/stats")
async def get_category_stats(db: Session = Depends(get_db)):
    """Get agent count statistics for each category"""
    try:
        # Get category stats with agent counts
        sql_query = text("""
            SELECT c.id, c.name, COUNT(a.id) as agent_count
            FROM categories c
            LEFT JOIN agents a ON a.category_id = c.id AND a.is_active = true
            GROUP BY c.id, c.name
            ORDER BY c.name
        """)
        print("""SELECT c.id, c.name, COUNT(a.id) as agent_count
            FROM categories c
            LEFT JOIN agents a ON a.category_id = c.id AND a.is_active = true
            GROUP BY c.id, c.name
            ORDER BY c.name""")
        
        stats_result = db.execute(sql_query).fetchall()
        
        category_stats = {}
        total_agents = 0
        
        for row in stats_result:
            category_stats[row[0]] = row[2]
            total_agents += row[2]
        
        # Get total categories count
        count_sql = text("""
            SELECT COUNT(*) 
            FROM categories
        """)
        print("""SELECT COUNT(*) 
            FROM categories""")
        total_categories = db.execute(count_sql).scalar()
        
        return {
            "category_stats": category_stats,
            "total_agents": total_agents,
            "total_categories": total_categories
        }
    except Exception as e:
        print(f"Error in category stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get(f"{settings.api_v1_str}/categories/{{category_id}}")
async def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get category by ID"""
    sql_query = text("""
        SELECT id, name, description, icon, created_at 
        FROM categories 
        WHERE id = :category_id
    """)
    print(f"""SELECT id, name, description, icon, created_at 
        FROM categories 
        WHERE id = {category_id}""")
    
    result = db.execute(sql_query, {"category_id": category_id}).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {
        "id": result[0],
        "name": result[1],
        "description": result[2],
        "icon": result[3],
        "created_at": result[4].isoformat() if result[4] else None
    }

# Agents endpoints
@app.get(f"{settings.api_v1_str}/agents")
async def search_agents(
    q: Optional[str] = Query(None, description="Search query"),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    is_free: Optional[bool] = Query(None, description="Filter by free/paid"),
    min_rating: Optional[float] = Query(None, description="Minimum rating", ge=0, le=5),
    sort_by: str = Query("rating", description="Sort by: name, rating, downloads, price, created_at"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
    page: int = Query(1, description="Page number", ge=1),
    limit: int = Query(12, description="Items per page", ge=1, le=2000),
    db: Session = Depends(get_db)
):
    """Search and filter agents with pagination"""
    try:
        # Log the SQL query being built
        sql_parts = ["SELECT * FROM agents WHERE is_active = true"]
        sql_params = []
        
        # Build query
        query = db.query(Agent).filter(Agent.is_active == True)
        
        # Apply filters
        if q:
            sql_parts.append("AND (name ILIKE %s OR short_description ILIKE %s OR description ILIKE %s OR author ILIKE %s OR tags ILIKE %s)")
            sql_params.extend([f"%{q}%"] * 5)
            search_filter = or_(
                Agent.name.ilike(f"%{q}%"),
                Agent.short_description.ilike(f"%{q}%"),
                Agent.description.ilike(f"%{q}%"),
                Agent.author.ilike(f"%{q}%"),
                Agent.tags.ilike(f"%{q}%")
            )
            query = query.filter(search_filter)
        
        if category_id:
            sql_parts.append(f"AND category_id = {category_id}")
            query = query.filter(Agent.category_id == category_id)
        
        if is_free is not None:
            sql_parts.append(f"AND is_free = {is_free}")
            query = query.filter(Agent.is_free == is_free)
        
        if min_rating is not None:
            sql_parts.append(f"AND rating >= {min_rating}")
            query = query.filter(Agent.rating >= min_rating)
        
        # Apply sorting
        sql_parts.append(f"ORDER BY {sort_by} {'DESC' if sort_order.lower() == 'desc' else 'ASC'}")
        sort_column = getattr(Agent, sort_by, Agent.rating)
        if sort_order.lower() == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # Add pagination
        offset = (page - 1) * limit
        sql_parts.append(f"LIMIT {limit} OFFSET {offset}")
        
        # Log final SQL
        final_sql = " ".join(sql_parts)
        print(f"{final_sql}")
        if sql_params:
            print(f"📊 Params: {sql_params}")
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        agents = query.offset(offset).limit(limit).all()
        
        # Convert agents to response format
        agents_data = [convert_agent_data(agent) for agent in agents]
        
        # Calculate pagination info
        total_pages = (total + limit - 1) // limit
        has_next = page < total_pages
        has_prev = page > 1
        
        return {
            "agents": agents_data,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "has_next": has_next,
            "has_prev": has_prev
        }
    except Exception as e:
        print(f"Error in search agents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get(f"{settings.api_v1_str}/agents/featured")
async def get_featured_agents(
    limit: int = Query(6, description="Number of featured agents", ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Get featured agents"""
    try:
        # Get featured agents using raw SQL
        sql_query = text("""
            SELECT id, name, description, short_description, category_id, author, version, 
                   price, is_free, rating, downloads_count, tags, capabilities, use_cases, 
                   demo_url, documentation_url, github_url, api_endpoint, model_info, 
                   is_active, featured, slug, created_at, updated_at
            FROM agents 
            WHERE is_active = true AND featured = true 
            ORDER BY rating DESC 
            LIMIT :limit
        """)
        print(f"""SELECT * 
            FROM agents 
            WHERE is_active = true AND featured = true 
            ORDER BY rating DESC 
            LIMIT {limit}""")
        
        result = db.execute(sql_query, {"limit": limit}).fetchall()
        
        # Convert to Agent objects for compatibility with convert_agent_data
        agents = []
        for row in result:
            agent = Agent()
            for i, column in enumerate(Agent.__table__.columns):
                setattr(agent, column.name, row[i])
            agents.append(agent)
        
        return [convert_agent_data(agent) for agent in agents]
    except Exception as e:
        print(f"Error in featured agents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get(f"{settings.api_v1_str}/agents/check-url")
async def check_agent_url(url: str, db: Session = Depends(get_db)):
    """Check if agent with given URL already exists - using raw SQL"""
    try:
        # Normalize URL for comparison
        normalized_url = url.lower().strip().rstrip('/')
        if not normalized_url.startswith(('http://', 'https://')):
            normalized_url = 'https://' + normalized_url
        
        # Extract domain for matching
        from urllib.parse import urlparse
        parsed = urlparse(normalized_url)
        domain = parsed.netloc.replace('www.', '')
        
        # Raw SQL query to find existing agents
        sql_query = text("""
            SELECT id, name, demo_url, documentation_url, github_url 
            FROM agents 
            WHERE 
                demo_url ILIKE :domain_pattern OR 
                documentation_url ILIKE :domain_pattern OR 
                github_url ILIKE :domain_pattern OR
                demo_url ILIKE :url_pattern OR 
                documentation_url ILIKE :url_pattern OR 
                github_url ILIKE :url_pattern
            LIMIT 1
        """)
        
        domain_pattern = f"%{domain}%"
        url_pattern = f"%{normalized_url}%"
        
        # Create final SQL with substituted parameters for logging
        final_sql = f"""
            SELECT id, name, demo_url, documentation_url, github_url 
            FROM agents 
            WHERE 
                demo_url ILIKE '{domain_pattern}' OR 
                documentation_url ILIKE '{domain_pattern}' OR 
                github_url ILIKE '{domain_pattern}' OR
                demo_url ILIKE '{url_pattern}' OR 
                documentation_url ILIKE '{url_pattern}' OR 
                github_url ILIKE '{url_pattern}'
            LIMIT 1
        """
        
        print(f"{final_sql.strip()}")
        
        result = db.execute(sql_query, {
            "domain_pattern": domain_pattern,
            "url_pattern": url_pattern
        }).fetchone()
        
        if result:
            return {
                "exists": True,
                "agent_id": result[0],
                "agent_name": result[1],
                "matched_urls": {
                    "demo_url": result[2],
                    "documentation_url": result[3],
                    "github_url": result[4]
                }
            }
        else:
            return {
                "exists": False,
                "agent_id": None,
                "agent_name": None
            }
            
    except Exception as e:
        print(f"💥 Error in check agent URL: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get(f"{settings.api_v1_str}/agents/{{agent_id}}")
async def get_agent(agent_id: int, db: Session = Depends(get_db)):
    """Get agent by ID"""
    try:
        # Get agent by ID using raw SQL
        sql_query = text("""
            SELECT id, name, description, short_description, category_id, author, version, 
                   price, is_free, rating, downloads_count, tags, capabilities, use_cases, 
                   demo_url, documentation_url, github_url, api_endpoint, model_info, 
                   is_active, featured, slug, created_at, updated_at
            FROM agents 
            WHERE id = :agent_id AND is_active = true
        """)
        print(f"""SELECT * 
            FROM agents 
            WHERE id = {agent_id} AND is_active = true""")
        
        result = db.execute(sql_query, {"agent_id": agent_id}).fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Convert to Agent object for compatibility
        agent = Agent()
        for i, column in enumerate(Agent.__table__.columns):
            setattr(agent, column.name, result[i])
        
        return convert_agent_data(agent)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get(f"{settings.api_v1_str}/agents/slug/{{agent_slug}}")
async def get_agent_by_slug(agent_slug: str, db: Session = Depends(get_db)):
    """Get agent by slug"""
    try:
        # Get agent by slug using raw SQL
        sql_query = text("""
            SELECT id, name, description, short_description, category_id, author, version, 
                   price, is_free, rating, downloads_count, tags, capabilities, use_cases, 
                   demo_url, documentation_url, github_url, api_endpoint, model_info, 
                   is_active, featured, slug, created_at, updated_at
            FROM agents 
            WHERE slug = :agent_slug AND is_active = true
        """)
        print(f"""SELECT * 
            FROM agents 
            WHERE slug = '{agent_slug}' AND is_active = true""")
        
        result = db.execute(sql_query, {"agent_slug": agent_slug}).fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Convert to Agent object for compatibility
        agent = Agent()
        for i, column in enumerate(Agent.__table__.columns):
            setattr(agent, column.name, result[i])
        
        return convert_agent_data(agent)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get agent by slug: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Reviews endpoints
@app.get(f"{settings.api_v1_str}/agents/{{agent_id}}/reviews")
async def get_agent_reviews(
    agent_id: int,
    page: int = Query(1, description="Page number", ge=1),
    limit: int = Query(10, description="Items per page", ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get reviews for an agent"""
    try:
        # Check if agent exists using raw SQL
        agent_sql = text("""
            SELECT id 
            FROM agents 
            WHERE id = :agent_id AND is_active = true
        """)
        print(f"""SELECT id 
            FROM agents 
            WHERE id = {agent_id} AND is_active = true""")
        
        agent_result = db.execute(agent_sql, {"agent_id": agent_id}).fetchone()
        if not agent_result:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Get reviews with pagination using raw SQL
        offset = (page - 1) * limit
        reviews_sql = text("""
            SELECT * 
            FROM reviews 
            WHERE agent_id = :agent_id 
            ORDER BY created_at DESC 
            LIMIT :limit OFFSET :offset
        """)
        print(f"""SELECT * 
            FROM reviews 
            WHERE agent_id = {agent_id} 
            ORDER BY created_at DESC 
            LIMIT {limit} OFFSET {offset}""")
        
        reviews_result = db.execute(reviews_sql, {
            "agent_id": agent_id,
            "limit": limit,
            "offset": offset
        }).fetchall()
        
        # Convert to Review objects for compatibility
        reviews = []
        for row in reviews_result:
            review = Review()
            for i, column in enumerate(Review.__table__.columns):
                setattr(review, column.name, row[i])
            reviews.append(review)
        
        result = []
        for review in reviews:
            result.append({
                "id": review.id,
                "agent_id": review.agent_id,
                "user_name": review.user_name,
                "user_email": review.user_email,
                "rating": review.rating,
                "title": review.title,
                "comment": review.comment,
                "is_verified": review.is_verified,
                "created_at": review.created_at.isoformat()
            })
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get reviews: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/agents")
async def create_agent(agent_data: CreateAgentRequest, db: Session = Depends(get_db)):
    """Create a new AI agent"""
    try:
        # Check if category exists using raw SQL
        category_sql = text("""
            SELECT id 
            FROM categories 
            WHERE id = :category_id
        """)
        print(f"""SELECT id 
            FROM categories 
            WHERE id = {agent_data.category_id}""")
        
        category_result = db.execute(category_sql, {"category_id": agent_data.category_id}).fetchone()
        if not category_result:
            raise HTTPException(status_code=400, detail="Category not found")
        
        # Create new agent (only using fields that exist in the model)
        new_agent = Agent(
            name=agent_data.name,
            description=agent_data.description,
            short_description=agent_data.description[:200] + "..." if len(agent_data.description) > 200 else agent_data.description,
            category_id=agent_data.category_id,
            author="User",  # In real app, get from authentication
            version="1.0.0",
            price=agent_data.price,
            is_free=agent_data.price == 0.0,
            rating=0.0,
            downloads_count=0,
            featured=False,
            tags=agent_data.tags,
            capabilities=agent_data.capabilities,
            use_cases=agent_data.use_cases,
            demo_url=agent_data.demo_url,
            api_endpoint=agent_data.api_endpoint,
            documentation_url=agent_data.documentation_url,
            github_url=agent_data.github_url,
            is_active=True,  # Auto-approve from admin panel
            # Store additional info in model_info JSON field
            model_info={
                "pricing_model": agent_data.pricing_model,
                "website_url": agent_data.website_url,
                "contact_email": agent_data.contact_email,
                "logo_url": agent_data.logo_url,
                "screenshots": agent_data.screenshots
            }
        )
        
        db.add(new_agent)
        db.commit()
        db.refresh(new_agent)
        
        return {
            "id": new_agent.id,
            "message": "Agent submitted successfully. It will be reviewed and published after moderation.",
            "status": "pending_moderation"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating agent: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create agent")

# Web parsing endpoint
@app.post("/api/v1/parse-website")
async def parse_website(request: dict):
    """Parse website content for AI analysis"""
    try:
        url = request.get('url')
        if not url:
            raise HTTPException(status_code=400, detail="URL is required")

        print(f"🔍 Parsing website: {url}")

        # Initialize parser
        parser = WebPageParser()

        # Parse the website
        result = parser.parse_website(url)

        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])

        print(f"✅ Successfully parsed website: {result.get('title', 'Unknown')}")

        return {
            "success": True,
            "data": result
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error parsing website: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Remove agent from JSON file endpoint
@app.delete("/api/v1/agents/remove-from-json/{agent_url:path}")
async def remove_agent_from_json(agent_url: str):
    """Remove agent from the JSON file after adding to database"""
    try:
        import json
        import os
        from urllib.parse import unquote
        
        # Decode URL
        decoded_url = unquote(agent_url)
        
        # Path to the JSON file
        json_file_path = "../frontend/public/complete_agents_content_analysis_updated.json"
        
        if not os.path.exists(json_file_path):
            print(f"⚠️ JSON file not found: {json_file_path}")
            return {"success": False, "message": "JSON file not found"}
        
        print(f"🗑️ Removing agent from JSON: {decoded_url}")
        
        # Read current JSON data
        with open(json_file_path, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        # Handle nested structure with agents_content
        if 'agents_content' in json_data:
            agents_data = json_data['agents_content']
        else:
            agents_data = json_data
        
        original_count = len(agents_data)
        
        # Remove agent with matching URL
        filtered_agents = []
        for agent in agents_data:
            if isinstance(agent, dict):
                if agent.get('url') != decoded_url:
                    filtered_agents.append(agent)
            elif isinstance(agent, str):
                if agent != decoded_url:
                    filtered_agents.append(agent)
            else:
                filtered_agents.append(agent)
        
        new_count = len(filtered_agents)
        removed_count = original_count - new_count
        
        if removed_count > 0:
            # Update the data structure
            if 'agents_content' in json_data:
                json_data['agents_content'] = filtered_agents
            else:
                json_data = filtered_agents
            
            # Write updated data back to file
            with open(json_file_path, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, ensure_ascii=False, indent=2)
            
            print(f"✅ Removed {removed_count} agent(s) from JSON. New count: {new_count}")
            
            return {
                "success": True,
                "message": f"Removed {removed_count} agent(s) from JSON",
                "remaining_count": new_count
            }
        else:
            print(f"⚠️ Agent not found in JSON: {decoded_url}")
            return {
                "success": False,
                "message": "Agent not found in JSON file"
            }
            
    except Exception as e:
        print(f"❌ Error removing agent from JSON: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post(f"{settings.api_v1_str}/auto-import-agents")
async def auto_import_agents(
    request: dict,
    db: Session = Depends(get_db)
):
    """Automatically import agents with AI analysis and recommendations"""
    import os
    import json
    import time
    from datetime import datetime
    try:
        # Load agents from JSON file
        json_file_path = "./complete_agents_content_analysis_updated.json"

        print(f"🔍 Loading agents data from: {json_file_path}")

        if not os.path.exists(json_file_path):
            raise HTTPException(status_code=404, detail=f"Agents JSON file not found at: {json_file_path}")

        with open(json_file_path, 'r', encoding='utf-8') as file:
            json_data = json.load(file)
            agents_data = json_data.get('agents_content', [])

        print(f"📊 Found {len(agents_data)} agents in JSON file")

        # Get agents from database that need processing (missing AI analysis or incomplete data)
        print("🔍 Finding agents in database that need AI analysis...")

        # Get agents with incomplete data (empty description, no model_info, etc.)
        incomplete_agents_query = text("""
            SELECT id, name, demo_url, description, short_description, model_info
            FROM agents
            WHERE is_active = true
            AND (
                description IS NULL OR description = ''
                OR short_description IS NULL OR short_description = ''
                OR model_info IS NULL OR model_info = '{}' OR model_info::text = ''
            )
            ORDER BY id DESC
            LIMIT :limit
        """)

        max_agents = request.get('max_agents', 50)  # Default to 50 instead of all
        incomplete_agents = db.execute(incomplete_agents_query, {"limit": max_agents}).fetchall()

        print(f"📋 Found {len(incomplete_agents)} agents in database that need processing")

        if not incomplete_agents:
            return {
                "success": True,
                "message": "No agents found that need AI analysis",
                "results": {
                    "total_processed": 0,
                    "successful_imports": 0,
                    "skipped_existing": 0,
                    "failed_imports": 0,
                    "errors": [],
                    "imported_agents": []
                }
            }

        results = {
            "total_processed": 0,
            "successful_imports": 0,
            "skipped_existing": 0,
            "failed_imports": 0,
            "errors": [],
            "imported_agents": []
        }

        # Initialize AI client (OpenRouter)
        import requests
        openrouter_api_key = "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"

        # Initialize web parser
        from web_parser import WebPageParser
        parser = WebPageParser(headless=True)

        processed_count = 0

        # Process agents from database (those that need AI analysis)
        for db_agent in incomplete_agents:
            if processed_count >= max_agents:
                print(f"✋ Reached maximum limit of {max_agents} agents")
                break
            
            # Extract agent data from database
            agent_id = db_agent[0]
            agent_name = db_agent[1]
            agent_url = db_agent[2]
            current_description = db_agent[3] or ''
            current_short_desc = db_agent[4] or ''

            # Find corresponding data in JSON file
            agent_json_data = None
            for json_agent in agents_data:
                if json_agent.get('url') == agent_url:
                    agent_json_data = json_agent
                    break

            try:
                processed_count += 1
                results["total_processed"] += 1

                print(f"\n🔄 Processing agent {processed_count}/{len(incomplete_agents)}: {agent_name}")
                print(f"🌐 URL: {agent_url}")
                print(f"📝 Current description: {'Empty' if not current_description else 'Has content'}")

                # Skip if we don't have JSON data for this agent
                if not agent_json_data:
                    print(f"⚠️ No JSON data found for agent: {agent_name}")
                    results["failed_imports"] += 1
                    continue
                
                # Parse website
                print(f"🔍 Parsing website: {agent_url}")
                try:
                    parsed_data = parser.parse_website(agent_url)
                    print(f"✅ Website parsed successfully")
                    print(f"📄 Parsed title: {parsed_data.get('title', 'N/A')[:100]}")
                    print(f"📝 Content length: {len(parsed_data.get('main_content', ''))}")
                    print(f"🏷️ Features found: {len(parsed_data.get('features', []))}")
                except Exception as parse_error:
                    print(f"❌ Website parsing failed: {str(parse_error)}")
                    raise
                
                # Generate AI recommendations
                print(f"🤖 Generating AI recommendations...")
                print(f"🔑 Using OpenRouter API key: {'✅ Set' if openrouter_api_key else '❌ Missing'}")
                
                prompt = f"""
Analyze this AI agent data and provide structured recommendations for categorization and tagging:

Original Data:
- Name: {agent_json_data.get('agent_name', '')}
- Description: {agent_json_data.get('agent_description', '')}
- URL: {agent_url}

Parsed Website Data:
- Title: {parsed_data.get('title', '')}
- Description: {parsed_data.get('description', '')}
- Main Content: {parsed_data.get('main_content', '')[:1000]}...
- Features: {', '.join(parsed_data.get('features', [])[:5])}
- Keywords: {', '.join(parsed_data.get('keywords', [])[:10])}

Please provide ONLY a JSON response with these fields:
{{
  "name": "Short 1-2 word name",
  "category_id": 4,
  "tags": ["tag1", "tag2", "tag3"],
  "short_description": "Concise description highlighting core value",
  "description": "Detailed description emphasizing benefits and target audience",
  "capabilities": ["capability1", "capability2", "capability3"]
}}

Categories: 1=AI Assistants, 2=Content Creation, 3=Data Analysis, 4=AI Platforms & Infrastructure, 5=Customer Support, 6=Marketing & Sales, 7=Development Tools, 8=Education & Training, 9=Healthcare, 10=Finance, 11=E-commerce, 12=Entertainment, 13=Productivity, 14=Other

Focus on:
- Name should be 1-2 words maximum
- Choose the most appropriate category
- Tags should be relevant and searchable
- Descriptions should be compelling and clear
"""

                print(f"📝 Prompt length: {len(prompt)} characters")
                print(f"🚀 Sending request to OpenRouter...")
                
                try:
                    response = requests.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {openrouter_api_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": "anthropic/claude-3.5-sonnet",
                            "messages": [{"role": "user", "content": prompt}],
                            "temperature": 0.7,
                            "max_tokens": 2048
                        }
                    )
                    response.raise_for_status()
                    response_data = response.json()
                    response_text = response_data["choices"][0]["message"]["content"].strip()
                    print(f"✅ Received response from OpenRouter")
                except Exception as openrouter_error:
                    print(f"❌ OpenRouter API request failed: {str(openrouter_error)}")
                    raise
                
                if not response_text:
                    raise Exception("Empty response from OpenRouter API")
                
                print(f"🤖 OpenRouter response: {response_text[:200]}...")
                
                # Clean up markdown formatting from AI response
                if response_text.startswith('```json'):
                    response_text = response_text[7:]  # Remove ```json
                if response_text.endswith('```'):
                    response_text = response_text[:-3]  # Remove ```
                response_text = response_text.strip()
                
                print(f"🧹 Cleaned response: {response_text[:200]}...")
                
                try:
                    ai_suggestions = json.loads(response_text)
                except json.JSONDecodeError as e:
                    print(f"❌ Invalid JSON from OpenRouter: {response_text[:500]}")
                    raise Exception(f"Invalid JSON response from OpenRouter: {str(e)}")
                
                print(f"✅ AI suggestions generated")
                
                # Convert arrays to PostgreSQL format
                tags_array = '{' + ','.join([f'"{tag}"' for tag in ai_suggestions.get("tags", [])]) + '}'
                capabilities_array = '{' + ','.join([f'"{cap}"' for cap in ai_suggestions.get("capabilities", [])]) + '}'
                use_cases_array = '{}'  # Empty array
                
                print(f"📋 Tags array: {tags_array}")
                print(f"🔧 Capabilities array: {capabilities_array}")
                
                # Prepare agent data for database update
                agent_update_data = {
                    "description": ai_suggestions.get("description", parsed_data.get('description', ''))[:2000],
                    "short_description": ai_suggestions.get("short_description", '')[:500],
                    "category_id": ai_suggestions.get("category_id", 14),  # Default to "Other"
                    "author": agent_json_data.get('agent_source', 'User')[:100],
                    "tags": tags_array,  # PostgreSQL array format
                    "capabilities": capabilities_array,  # PostgreSQL array format
                    "use_cases": use_cases_array,  # PostgreSQL array format
                    "model_info": json.dumps({
                        "ai_analysis": ai_suggestions,
                        "parsed_data": parsed_data,
                        "last_updated": datetime.now().isoformat()
                    })
                }
                
                # Update existing agent in database
                print(f"💾 Updating agent in database...")
                print(f"📊 Agent data: name='{agent_name}', category={agent_update_data['category_id']}")

                update_query = text("""
                    UPDATE agents SET
                        description = :description,
                        short_description = :short_description,
                        category_id = :category_id,
                        author = :author,
                        tags = :tags,
                        capabilities = :capabilities,
                        use_cases = :use_cases,
                        model_info = :model_info,
                        updated_at = NOW()
                    WHERE id = :agent_id
                """)

                try:
                    result = db.execute(update_query, {**agent_update_data, "agent_id": agent_id})
                    db.commit()
                    print(f"✅ Agent successfully updated: {agent_name}")
                except Exception as db_error:
                    print(f"❌ Database update failed: {str(db_error)}")
                    db.rollback()
                    raise
                
                results["successful_imports"] += 1
                results["imported_agents"].append({
                    "id": agent_id,
                    "name": agent_name,
                    "url": agent_url,
                    "category_id": agent_update_data["category_id"]
                })
                
                # Remove agent from JSON file after successful import
                try:
                    print(f"🗑️ Removing agent from JSON file...")
                    # Remove from agents_data list
                    agents_data[:] = [a for a in agents_data if a.get('url') != agent_url]
                    
                    # Save updated JSON back to file
                    json_data['agents_content'] = agents_data
                    with open(json_file_path, 'w', encoding='utf-8') as f:
                        json.dump(json_data, f, indent=2, ensure_ascii=False)
                    print(f"✅ Agent removed from JSON file. Remaining: {len(agents_data)}")
                except Exception as remove_error:
                    print(f"⚠️ Failed to remove agent from JSON: {str(remove_error)}")
                
                # Small delay to prevent overwhelming the system
                import time
                time.sleep(2)
                
            except Exception as e:
                error_msg = f"Failed to process {agent_name}: {str(e)}"
                print(f"❌ {error_msg}")
                results["failed_imports"] += 1
                results["errors"].append(error_msg)
                
                # Stop after first critical error (API issues)
                if "Empty response from OpenRouter" in str(e) or "Invalid JSON response from OpenRouter" in str(e):
                    print(f"🛑 Stopping auto-import due to critical API error")
                    break
                    
                continue
        
        # Cleanup
        try:
            parser.__del__()
        except:
            pass
        
        print(f"\n🎉 Auto-update completed!")
        print(f"📊 Results: {results['successful_imports']} updated, {results['skipped_existing']} skipped, {results['failed_imports']} failed")

        return {
            "success": True,
            "message": f"Auto-update completed. {results['successful_imports']} agents updated successfully.",
            "results": results
        }
        
    except Exception as e:
        print(f"❌ Auto-update failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/sitemap-generated.xml")
def get_generated_sitemap(db: Session = Depends(get_db)):
    """Return dynamic sitemap XML"""
    from fastapi.responses import Response
    
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
            '    <loc>https://primeagents.info/</loc>',
            f'    <lastmod>{now}</lastmod>',
            '    <changefreq>daily</changefreq>',
            '    <priority>1.0</priority>',
            '  </url>',
            '  <url>',
            '    <loc>https://primeagents.info/catalog</loc>',
            f'    <lastmod>{now}</lastmod>',
            '    <changefreq>daily</changefreq>',
            '    <priority>0.9</priority>',
            '  </url>',
            '  <url>',
            '    <loc>https://primeagents.info/categories</loc>',
            f'    <lastmod>{now}</lastmod>',
            '    <changefreq>daily</changefreq>',
            '    <priority>0.8</priority>',
            '  </url>',
            '  <url>',
            '    <loc>https://primeagents.info/agents</loc>',
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
                f'    <loc>https://primeagents.info/{cat_slug}</loc>',
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
                f'    <loc>https://primeagents.info/agents/{agent.slug}</loc>',
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
        raise HTTPException(status_code=500, detail=f"Failed to generate sitemap: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=False,  # Disable reload in production
        log_level="info"
    )
