"""Fundraising endpoints"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional

from api.dependencies import get_db

router = APIRouter(prefix="/fundraising", tags=["fundraising"])


@router.get("")
async def get_fundraising_list(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get list of fundraising companies with pagination"""
    try:
        offset = (page - 1) * limit
        
        # Build query
        where_clause = ""
        params = {"limit": limit, "offset": offset}
        
        if search:
            where_clause = "WHERE name ILIKE :search OR canonical_name ILIKE :search"
            params["search"] = f"%{search}%"
        
        # Get companies
        query = text(f"""
            SELECT 
                id, name, canonical_name, website, last_funding_date,
                funding_summary, profile, social_links, metrics, news, extra_data,
                created_at
            FROM fundraising
            {where_clause}
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :offset
        """)
        
        companies = db.execute(query, params).mappings().all()
        
        # Get total count
        count_query = text(f"""
            SELECT COUNT(*) 
            FROM fundraising
            {where_clause}
        """)
        count_params = {"search": params.get("search")} if search else {}
        total = db.execute(count_query, count_params).scalar()
        
        # Format results
        result = []
        for company in companies:
            result.append({
                "id": company["id"],
                "name": company["name"],
                "canonical_name": company["canonical_name"],
                "website": company["website"],
                "last_funding_date": company["last_funding_date"].isoformat() if company["last_funding_date"] else None,
                "funding_summary": company["funding_summary"] or {},
                "profile": company["profile"] or {},
                "social_links": company["social_links"] or {},
                "metrics": company["metrics"] or {},
                "news": company["news"] or {},
                "extra_data": company["extra_data"] or {},
                "created_at": company["created_at"].isoformat() if company["created_at"] else None
            })
        
        total_pages = (total + limit - 1) // limit if total > 0 else 0
        
        return {
            "companies": result,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
        
    except Exception as e:
        print(f"Error getting fundraising list: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch fundraising data")


@router.get("/{company_id}")
async def get_fundraising_company(company_id: int, db: Session = Depends(get_db)):
    """Get single fundraising company by ID"""
    try:
        query = text("""
            SELECT 
                id, name, canonical_name, website, last_funding_date,
                funding_summary, profile, social_links, metrics, news, extra_data,
                created_at
            FROM fundraising
            WHERE id = :company_id
        """)
        
        company = db.execute(query, {"company_id": company_id}).mappings().first()
        
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        
        return {
            "id": company["id"],
            "name": company["name"],
            "canonical_name": company["canonical_name"],
            "website": company["website"],
            "last_funding_date": company["last_funding_date"].isoformat() if company["last_funding_date"] else None,
            "funding_summary": company["funding_summary"] or {},
            "profile": company["profile"] or {},
            "social_links": company["social_links"] or {},
            "metrics": company["metrics"] or {},
            "news": company["news"] or {},
            "extra_data": company["extra_data"] or {},
            "created_at": company["created_at"].isoformat() if company["created_at"] else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting fundraising company: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch company")

