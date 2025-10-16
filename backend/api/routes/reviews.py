"""Review endpoints"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text

from api.dependencies import get_db
from database.models import Review

router = APIRouter(prefix="/agents", tags=["reviews"])


@router.get("/{agent_id}/reviews")
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
        }).mappings().all()
        
        result = []
        for review in reviews_result:
            result.append({
                "id": review["id"],
                "agent_id": review["agent_id"],
                "user_name": review["user_name"],
                "user_email": review["user_email"],
                "rating": review["rating"],
                "title": review["title"],
                "comment": review["comment"],
                "is_verified": review["is_verified"],
                "created_at": review["created_at"].isoformat() if hasattr(review["created_at"], 'isoformat') else str(review["created_at"])
            })
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get reviews: {e}")
        raise HTTPException(status_code=500, detail=str(e))

