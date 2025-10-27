"""Category endpoints"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List

from api.dependencies import get_db

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("")
async def get_categories(db: Session = Depends(get_db)):
    """Get all categories"""
    sql_query = text("""
        SELECT id, name, title, description, text, icon, slug, img_url, created_at 
        FROM categories 
        ORDER BY name
    """)
    print("""SELECT id, name, title, description, text, icon, slug, img_url, created_at 
        FROM categories 
        ORDER BY name""")
    
    result = db.execute(sql_query).mappings().all()
    
    return [
        {
            "id": row["id"],
            "name": row["name"],
            "title": row["title"],
            "description": row["description"],
            "text": row["text"],
            "icon": row["icon"],
            "slug": row["slug"],
            "img_url": row["img_url"],
            "created_at": row["created_at"].isoformat() if row["created_at"] else None
        }
        for row in result
    ]


@router.get("/stats")
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


@router.get("/slug/{slug}")
async def get_category_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get category by slug"""
    try:
        category_query = text("""
            SELECT id, name, title, description, text, icon, slug, img_url, created_at 
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
            "title": result["title"],
            "description": result["description"],
            "text": result["text"],
            "icon": result["icon"],
            "slug": result["slug"],
            "img_url": result["img_url"],
            "created_at": result["created_at"].isoformat() if result["created_at"] else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching category by slug: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch category")


@router.get("/{slug}/agents")
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
            SELECT id, name, title, description, text, icon, slug, img_url, created_at 
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
            "title": category_result["title"],
            "description": category_result["description"],
            "text": category_result["text"],
            "icon": category_result["icon"],
            "slug": category_result["slug"],
            "img_url": category_result["img_url"]
        }
        
        # Get agents for this category
        offset = (page - 1) * limit
        
        agents_query = text("""
            SELECT 
                a.id, a.name, a.slug, a.description, a.short_description, a.category_id,
                a.keywords, a.url, a.documentation_url,
                a.github_url, a.api_endpoint, a.model_info, a.pricing, a.interability, a.is_active,
                a.created_at, a.updated_at
            FROM agents a
            WHERE a.category_id = :category_id AND a.is_active = true
            ORDER BY a.created_at DESC
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
                "keywords": agent["keywords"] or [],
                "url": agent["url"],
                "documentation_url": agent["documentation_url"],
                "github_url": agent["github_url"],
                "api_endpoint": agent["api_endpoint"],
                "model_info": agent["model_info"] or {},
                "pricing": agent["pricing"] or {},
                "interability": agent["interability"] or {},
                "is_active": agent["is_active"],
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
        print(f"Error fetching agents by category: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch agents")

