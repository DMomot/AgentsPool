#!/usr/bin/env python3
"""
AgentsPool API - Simple Production Backend
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

def convert_agent_data(agent):
    """Convert agent database model to API response format"""
    agent_dict = {
        "id": agent.id,
        "name": agent.name,
        "description": agent.description,
        "short_description": agent.short_description,
        "category_id": agent.category_id,
        "author": agent.author,
        "featured": agent.featured,
        "slug": agent.slug,
        "created_at": agent.created_at.isoformat() if hasattr(agent.created_at, 'isoformat') else str(agent.created_at),
        "updated_at": agent.updated_at.isoformat() if hasattr(agent.updated_at, 'isoformat') else str(agent.updated_at),
        "url": agent.url,
        "documentation_url": agent.documentation_url,
        "github_url": agent.github_url,
        "api_endpoint": agent.api_endpoint,
        "a2a": agent.a2a,
        "img_url": agent.img_url,
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
        "message": "AgentsPool API is running",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/status")
async def status():
    """Simple status check without DB"""
    return {
        "status": "ok",
        "service": "AgentsPool API",
        "version": "1.0.0"
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
    
    result = db.execute(sql_query).mappings().all()
    
    return [
        {
            "id": row["id"],
            "name": row["name"],
            "description": row["description"],
            "icon": row["icon"],
            "slug": row["slug"],
            "created_at": row["created_at"].isoformat() if row["created_at"] else None
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
        
        result = db.execute(category_query, {"slug": slug}).mappings().first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Category not found")
        
        return {
            "id": result["id"],
            "name": result["name"],
            "description": result["description"],
            "icon": result["icon"],
            "slug": result["slug"],
            "created_at": result["created_at"].isoformat() if result["created_at"] else None
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
        
        category_result = db.execute(category_query, {"slug": slug}).mappings().first()
        
        if not category_result:
            raise HTTPException(status_code=404, detail="Category not found")
        
        category_id = category_result["id"]
        category_info = {
            "id": category_result["id"],
            "name": category_result["name"],
            "description": category_result["description"],
            "icon": category_result["icon"],
            "slug": category_result["slug"]
        }
        
        # Get agents for this category
        offset = (page - 1) * limit
        
        agents_query = text("""
            SELECT 
                a.id, a.name, a.description, a.short_description, a.category_id,
                a.author, a.tags, a.capabilities, a.use_cases, a.url, a.documentation_url,
                a.github_url, a.api_endpoint, a.a2a, a.img_url, a.model_info, a.is_active, a.featured,
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
        }).mappings().all()
        
        total_result = db.execute(count_query, {"category_id": category_id}).fetchone()
        total = total_result[0] if total_result else 0
        
        agents = []
        for agent in agents_result:
            agents.append({
                "id": agent["id"],
                "name": agent["name"],
                "description": agent["description"],
                "short_description": agent["short_description"],
                "category_id": agent["category_id"],
                "author": agent["author"],
                "tags": agent["tags"] or [],
                "capabilities": agent["capabilities"] or [],
                "use_cases": agent["use_cases"] or [],
                "url": agent["url"],
                "documentation_url": agent["documentation_url"],
                "github_url": agent["github_url"],
                "api_endpoint": agent["api_endpoint"],
                "a2a": agent.get("a2a"),
                "img_url": agent.get("img_url"),
                "model_info": agent["model_info"] or {},
                "is_active": agent["is_active"],
                "featured": agent["featured"],
                "slug": agent["slug"],
                "created_at": agent["created_at"].isoformat() if hasattr(agent["created_at"], 'isoformat') else str(agent["created_at"]) if agent["created_at"] else None,
                "updated_at": agent["updated_at"].isoformat() if hasattr(agent["updated_at"], 'isoformat') else str(agent["updated_at"]) if agent["updated_at"] else None,
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
        
        stats_result = db.execute(sql_query).mappings().all()
        
        category_stats = {}
        total_agents = 0
        
        for row in stats_result:
            category_stats[row["id"]] = row["agent_count"]
            total_agents += row["agent_count"]
        
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
    
    result = db.execute(sql_query, {"category_id": category_id}).mappings().first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {
        "id": result["id"],
        "name": result["name"],
        "description": result["description"],
        "icon": result["icon"],
        "created_at": result["created_at"].isoformat() if result["created_at"] else None
    }

# Agents endpoints
@app.get(f"{settings.api_v1_str}/agents")
async def search_agents(
    q: Optional[str] = Query(None, description="Search query"),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    sort_by: str = Query("created_at", description="Sort by: name, created_at"),
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
        
        # Apply sorting
        sql_parts.append(f"ORDER BY {sort_by} {'DESC' if sort_order.lower() == 'desc' else 'ASC'}")
        sort_column = getattr(Agent, sort_by, Agent.created_at)
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
            SELECT id, name, description, short_description, category_id, author, 
                   tags, capabilities, use_cases, 
                   url, documentation_url, github_url, api_endpoint, a2a, img_url, model_info, 
                   is_active, featured, slug, created_at, updated_at
            FROM agents 
            WHERE is_active = true AND featured = true 
            ORDER BY created_at DESC 
            LIMIT :limit
        """)
        print(f"""SELECT * 
            FROM agents 
            WHERE is_active = true AND featured = true 
            ORDER BY created_at DESC 
            LIMIT {limit}""")
        
        result = db.execute(sql_query, {"limit": limit}).mappings().all()
        
        # Convert to Agent objects for compatibility with convert_agent_data
        agents = []
        for row in result:
            agent = Agent()
            for column in Agent.__table__.columns:
                if column.name in row:
                    setattr(agent, column.name, row[column.name])
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
            SELECT id, name, url, documentation_url, github_url 
            FROM agents 
            WHERE 
                url ILIKE :domain_pattern OR 
                documentation_url ILIKE :domain_pattern OR 
                github_url ILIKE :domain_pattern OR
                url ILIKE :url_pattern OR 
                documentation_url ILIKE :url_pattern OR 
                github_url ILIKE :url_pattern
            LIMIT 1
        """)
        
        domain_pattern = f"%{domain}%"
        url_pattern = f"%{normalized_url}%"
        
        # Create final SQL with substituted parameters for logging
        final_sql = f"""
            SELECT id, name, url, documentation_url, github_url 
            FROM agents 
            WHERE 
                url ILIKE '{domain_pattern}' OR 
                documentation_url ILIKE '{domain_pattern}' OR 
                github_url ILIKE '{domain_pattern}' OR
                url ILIKE '{url_pattern}' OR 
                documentation_url ILIKE '{url_pattern}' OR 
                github_url ILIKE '{url_pattern}'
            LIMIT 1
        """
        
        print(f"{final_sql.strip()}")
        
        result = db.execute(sql_query, {
            "domain_pattern": domain_pattern,
            "url_pattern": url_pattern
        }).mappings().first()
        
        if result:
            return {
                "exists": True,
                "agent_id": result["id"],
                "agent_name": result["name"],
                "matched_urls": {
                    "url": result["url"],
                    "documentation_url": result["documentation_url"],
                    "github_url": result["github_url"]
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
            SELECT id, name, description, short_description, category_id, author, 
                   tags, capabilities, use_cases, 
                   url, documentation_url, github_url, api_endpoint, a2a, img_url, model_info, 
                   is_active, featured, slug, created_at, updated_at
            FROM agents 
            WHERE id = :agent_id AND is_active = true
        """)
        print(f"""SELECT * 
            FROM agents 
            WHERE id = {agent_id} AND is_active = true""")
        
        result = db.execute(sql_query, {"agent_id": agent_id}).mappings().first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Convert to Agent object for compatibility
        agent = Agent()
        for column in Agent.__table__.columns:
            if column.name in result:
                setattr(agent, column.name, result[column.name])
        
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
            SELECT id, name, description, short_description, category_id, author, 
                   tags, capabilities, use_cases, 
                   url, documentation_url, github_url, api_endpoint, a2a, img_url, model_info, 
                   is_active, featured, slug, created_at, updated_at
            FROM agents 
            WHERE slug = :agent_slug AND is_active = true
        """)
        print(f"""SELECT * 
            FROM agents 
            WHERE slug = '{agent_slug}' AND is_active = true""")
        
        result = db.execute(sql_query, {"agent_slug": agent_slug}).mappings().first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Convert to Agent object for compatibility
        agent = Agent()
        for column in Agent.__table__.columns:
            if column.name in result:
                setattr(agent, column.name, result[column.name])
        
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
            featured=False,
            tags=agent_data.tags,
            capabilities=agent_data.capabilities,
            use_cases=agent_data.use_cases,
            url=agent_data.url,
            api_endpoint=agent_data.api_endpoint,
            documentation_url=agent_data.documentation_url,
            github_url=agent_data.github_url,
            a2a=agent_data.a2a,
            img_url=agent_data.img_url,
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
