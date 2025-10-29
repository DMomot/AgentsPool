"""Agent endpoints"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text, desc, asc, or_
from typing import Optional, List
from pydantic import BaseModel
import json
from sentence_transformers import SentenceTransformer

from api.dependencies import get_db
from schemas.agent import CreateAgentRequest
from database.models import Agent
from utils.slug import generate_slug

router = APIRouter(prefix="/agents", tags=["agents"])


class AISearchRequest(BaseModel):
    query: str


class AISearchResponse(BaseModel):
    message: str
    agents: List[dict]


# Global model instance
_embedding_model = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        print("Loading embedding model (all-MiniLM-L6-v2 - CPU optimized, 384 dims)...")
        _embedding_model = SentenceTransformer('all-MiniLM-L6-v2')  # 384 dims, 10-15x faster on CPU
        print("Embedding model loaded!")
    return _embedding_model


def convert_agent_data(agent):
    """Convert agent database model to API response format"""
    agent_dict = {
        "id": agent.id,
        "name": agent.name,
        "slug": agent.slug if hasattr(agent, 'slug') else None,
        "description": agent.description,
        "short_description": agent.short_description,
        "category_id": agent.category_id,
        "keywords": agent.keywords if hasattr(agent, 'keywords') else [],
        "created_at": agent.created_at.isoformat() if hasattr(agent.created_at, 'isoformat') else str(agent.created_at),
        "updated_at": agent.updated_at.isoformat() if hasattr(agent.updated_at, 'isoformat') else str(agent.updated_at),
        "url": agent.url,
        "documentation_url": agent.documentation_url,
        "github_url": agent.github_url,
        "api_endpoint": agent.api_endpoint,
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
    
    # Handle interability (JSONB field)
    if hasattr(agent, 'interability') and agent.interability:
        if isinstance(agent.interability, dict):
            agent_dict["interability"] = agent.interability
        else:
            agent_dict["interability"] = None
    else:
        agent_dict["interability"] = None
    
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
    """Get featured agents (marked as featured=true)"""
    try:
        # Get featured agents using raw SQL
        sql_query = text("""
            SELECT id, name, slug, description, short_description, category_id, keywords,
                   url, documentation_url, github_url, api_endpoint, model_info, pricing, interability,
                   is_active, created_at, updated_at
            FROM agents 
            WHERE is_active = true AND featured = true
            ORDER BY created_at DESC 
            LIMIT :limit
        """)
        
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


@router.get("/{agent_id}")
async def get_agent(agent_id: int, db: Session = Depends(get_db)):
    """Get agent by ID"""
    try:
        # Get agent by ID using raw SQL
        sql_query = text("""
            SELECT id, name, slug, description, short_description, category_id, keywords,
                   url, documentation_url, github_url, api_endpoint, model_info, pricing, interability,
                   is_active, created_at, updated_at
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
        # Get agent by slug with category info using raw SQL
        sql_query = text("""
            SELECT a.id, a.name, a.slug, a.description, a.short_description, a.category_id, a.keywords,
                   a.url, a.documentation_url, a.github_url, a.api_endpoint, a.model_info, a.pricing, a.interability,
                   a.is_active, a.created_at, a.updated_at,
                   c.id as category__id, c.name as category__name, c.slug as category__slug, c.icon as category__icon
            FROM agents a
            LEFT JOIN categories c ON a.category_id = c.id
            WHERE a.slug = :agent_slug AND a.is_active = true
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
        
        agent_data = convert_agent_data(agent)
        
        # Add category info if available
        if result.get("category__id"):
            agent_data["category"] = {
                "id": result["category__id"],
                "name": result["category__name"],
                "slug": result["category__slug"],
                "icon": result["category__icon"]
            }
        
        return agent_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get agent by slug: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("")
async def create_agent(agent_data: CreateAgentRequest, db: Session = Depends(get_db)):
    """Create a new agent"""
    try:
        # Create new agent (only using fields that exist in the model)
        new_agent = Agent(
            name=agent_data.name,
            description=agent_data.description,
            short_description=agent_data.description[:200] + "..." if len(agent_data.description) > 200 else agent_data.description,
            category_id=agent_data.category_id,
            keywords=agent_data.tags if hasattr(agent_data, 'tags') else [],
            url=agent_data.url,
            api_endpoint=agent_data.api_endpoint if hasattr(agent_data, 'api_endpoint') else None,
            documentation_url=agent_data.documentation_url if hasattr(agent_data, 'documentation_url') else None,
            github_url=agent_data.github_url if hasattr(agent_data, 'github_url') else None,
            model_info={
                "pricing_model": agent_data.pricing_model if hasattr(agent_data, 'pricing_model') else None,
                "logo_url": agent_data.logo_url if hasattr(agent_data, 'logo_url') else None,
                "screenshots": agent_data.screenshots if hasattr(agent_data, 'screenshots') else [],
                "website_url": agent_data.website_url if hasattr(agent_data, 'website_url') else None,
                "contact_email": agent_data.contact_email if hasattr(agent_data, 'contact_email') else None
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


@router.post("/search-ai")
async def ai_search_agents(request: AISearchRequest, db: Session = Depends(get_db)):
    """AI search: Vector retrieval only (optimized for speed)"""
    try:
        import time
        start_time = time.time()
        
        query = request.query
        print(f"AI Search query: {query}")
        
        # Stage 1: Vector retrieval - Get top candidates using PGVector
        stage1_start = time.time()
        model = get_embedding_model()
        model_load_time = time.time() - stage1_start
        print(f"⏱️  Model load: {model_load_time:.2f}s")
        
        encode_start = time.time()
        query_embedding = model.encode(query).tolist()
        encode_time = time.time() - encode_start
        print(f"⏱️  Query encode: {encode_time:.2f}s")
        
        # Vector search - get top matches
        agents_query = text("""
            SELECT 
                a.id, a.name, a.slug, a.description, a.short_description, 
                a.category_id, a.keywords, a.url, a.is_active,
                c.name as category_name, c.icon as category_icon
            FROM agents a
            LEFT JOIN categories c ON a.category_id = c.id
            WHERE a.vector_description IS NOT NULL
            ORDER BY a.vector_description <=> :query_vector
            LIMIT 10
        """)
        
        query_vector_str = '[' + ','.join(map(str, query_embedding)) + ']'
        
        db_start = time.time()
        results = db.execute(agents_query, {"query_vector": query_vector_str}).mappings().all()
        db_time = time.time() - db_start
        print(f"⏱️  DB vector search: {db_time:.2f}s")
        
        # Filter only active agents and take top 3
        results = [r for r in results if r.get('is_active', True)][:3]
        
        if len(results) == 0:
            return AISearchResponse(
                message="I couldn't find any agents matching your request. Try rephrasing or use different keywords.",
                agents=[]
            )
        
        print(f"Retrieved {len(results)} active agents (vector search only)")
        
        # Build response with top 3 agents from vector search
        agents = []
        for result in results:
            agent_data = {
                "id": result["id"],
                "name": result["name"],
                "slug": result["slug"],
                "description": result["description"],
                "short_description": result["short_description"],
                "category_id": result["category_id"],
                "url": result["url"],
                "tags": result["keywords"] or [],
            }
            
            if result.get("category_name"):
                agent_data["category"] = {
                    "name": result["category_name"],
                    "icon": result["category_icon"]
                }
            
            agents.append(agent_data)
        
        if len(agents) == 0:
            message = "I couldn't find any agents matching your request. Try rephrasing or use different keywords."
        elif len(agents) == 1:
            message = f"I found 1 agent that might help:"
        else:
            message = f"I found {len(agents)} agents that might help:"
        
        total_time = time.time() - start_time
        print(f"⏱️  TOTAL TIME: {total_time:.2f}s")
        
        return AISearchResponse(
            message=message,
            agents=agents
        )
        
    except Exception as e:
        print(f"Error in AI search: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

