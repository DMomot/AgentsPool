"""Agent endpoints"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text, desc, asc, or_
from typing import Optional
import json

from api.dependencies import get_db
from schemas.agent import CreateAgentRequest
from database.models import Agent
from utils.slug import generate_slug

router = APIRouter(prefix="/agents", tags=["agents"])


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
    
    # Handle pricing (JSONB field)
    if hasattr(agent, 'pricing') and agent.pricing:
        if isinstance(agent.pricing, dict):
            agent_dict["pricing"] = agent.pricing
        elif isinstance(agent.pricing, str):
            try:
                agent_dict["pricing"] = json.loads(agent.pricing)
            except:
                agent_dict["pricing"] = None
        else:
            agent_dict["pricing"] = agent.pricing
    else:
        agent_dict["pricing"] = None
    
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
    
    # Add category info if available
    if hasattr(agent, 'category') and agent.category:
        agent_dict["category"] = {
            "id": agent.category.id,
            "name": agent.category.name,
            "description": agent.category.description,
            "icon": agent.category.icon
        }
    
    return agent_dict


@router.get("")
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
            sql_parts.append("AND (name ILIKE %s OR short_description ILIKE %s OR description ILIKE %s OR author ILIKE %s)")
            sql_params.extend([f"%{q}%"] * 4)
            search_filter = or_(
                Agent.name.ilike(f"%{q}%"),
                Agent.short_description.ilike(f"%{q}%"),
                Agent.description.ilike(f"%{q}%"),
                Agent.author.ilike(f"%{q}%")
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
        print(f"Search query: {final_sql}")
        
        # Get total count
        total = query.count()
        
        # Get paginated results
        agents = query.offset(offset).limit(limit).all()
        
        # Calculate pagination info
        total_pages = (total + limit - 1) // limit
        
        return {
            "agents": [convert_agent_data(agent) for agent in agents],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
        
    except Exception as e:
        print(f"Error searching agents: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/featured")
async def get_featured_agents(
    limit: int = Query(10, description="Number of featured agents", ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get featured agents"""
    try:
        # Get featured agents using raw SQL
        sql_query = text("""
            SELECT id, name, description, short_description, category_id, author, 
                   tags, capabilities, use_cases, 
                   url, documentation_url, github_url, api_endpoint, a2a, img_url, model_info, pricing,
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


@router.get("/check-url")
async def check_agent_url(url: str = Query(..., description="Agent URL to check"), db: Session = Depends(get_db)):
    """Check if agent URL already exists"""
    try:
        sql_query = text("""
            SELECT COUNT(*) as count
            FROM agents
            WHERE url = :url
        """)
        
        result = db.execute(sql_query, {"url": url}).mappings().first()
        exists = result["count"] > 0 if result else False
        
        return {"exists": exists, "url": url}
        
    except Exception as e:
        print(f"Error checking agent URL: {e}")
        raise HTTPException(status_code=500, detail="Failed to check URL")


@router.get("/{agent_id}")
async def get_agent(agent_id: int, db: Session = Depends(get_db)):
    """Get agent by ID"""
    try:
        # Get agent by ID using raw SQL
        sql_query = text("""
            SELECT id, name, description, short_description, category_id, author, 
                   tags, capabilities, use_cases, 
                   url, documentation_url, github_url, api_endpoint, a2a, img_url, model_info, pricing,
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


@router.get("/slug/{agent_slug}")
async def get_agent_by_slug(agent_slug: str, db: Session = Depends(get_db)):
    """Get agent by slug"""
    try:
        # Get agent by slug using raw SQL
        sql_query = text("""
            SELECT id, name, description, short_description, category_id, author, 
                   tags, capabilities, use_cases, 
                   url, documentation_url, github_url, api_endpoint, a2a, img_url, model_info, pricing,
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


@router.post("")
async def create_agent(agent_data: CreateAgentRequest, db: Session = Depends(get_db)):
    """Create a new agent"""
    try:
        # Generate slug from name
        base_slug = generate_slug(agent_data.name)
        slug = base_slug
        
        # Check if slug exists and make it unique
        counter = 1
        while db.query(Agent).filter(Agent.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
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
            slug=slug,
            model_info={
                "pricing_model": agent_data.pricing_model,
                "logo_url": agent_data.logo_url,
                "screenshots": agent_data.screenshots,
                "website_url": agent_data.website_url,
                "contact_email": agent_data.contact_email
            }
        )
        
        db.add(new_agent)
        db.commit()
        db.refresh(new_agent)
        
        return convert_agent_data(new_agent)
        
    except Exception as e:
        db.rollback()
        print(f"Error creating agent: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create agent: {str(e)}")

