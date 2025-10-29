"""News endpoints"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
import requests
from bs4 import BeautifulSoup
import asyncio
from concurrent.futures import ThreadPoolExecutor

from api.dependencies import get_db

router = APIRouter(prefix="/news", tags=["news"])


@router.get("")
async def get_news(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    tag: str = Query(None),
    source: str = Query(None),
    db: Session = Depends(get_db)
):
    """Get news articles with pagination"""
    try:
        offset = (page - 1) * limit
        
        # Build query based on filters
        where_conditions = []
        params = {"limit": limit, "offset": offset}
        
        if tag:
            where_conditions.append(":tag = ANY(tags)")
            params["tag"] = tag
            
        if source:
            where_conditions.append("source_name = :source")
            params["source"] = source
        
        # Always filter by articles with tags
        where_conditions.append("tags IS NOT NULL AND array_length(tags, 1) > 0")
        
        where_clause = f"WHERE {' AND '.join(where_conditions)}"
        
        news_query = text(f"""
            SELECT 
                id, title, link, description, content, source_name, 
                source_domain, rss_url, published_at, companies, 
                companies_links, tags, insert_timestamp
            FROM news_articles
            {where_clause}
            ORDER BY insert_timestamp DESC
            LIMIT :limit OFFSET :offset
        """)
        
        count_query = text(f"""
            SELECT COUNT(*) 
            FROM news_articles
            {where_clause}
        """)
        
        print(f"Getting news: page={page}, limit={limit}, tag={tag}, source={source}")
        
        news_result = db.execute(news_query, params).mappings().all()
        total = db.execute(count_query, {k: v for k, v in params.items() if k not in ['limit', 'offset']}).scalar()
        
        # Build articles
        articles = []
        for article in news_result:
            # Clean HTML from description
            clean_description = article["description"]
            if clean_description:
                soup = BeautifulSoup(clean_description, 'html.parser')
                clean_description = soup.get_text(separator=' ', strip=True)
            
            articles.append({
                "id": article["id"],
                "title": article["title"],
                "link": article["link"],
                "description": clean_description,
                "content": article["content"],
                "source_name": article["source_name"],
                "source_domain": article["source_domain"],
                "rss_url": article["rss_url"],
                "published_at": article["published_at"].isoformat() if article["published_at"] else None,
                "companies": article["companies"] or [],
                "companies_links": article["companies_links"] or [],
                "tags": article["tags"] or [],
                "img_url": None,
                "insert_timestamp": article["insert_timestamp"].isoformat() if article["insert_timestamp"] else None
            })
        
        total_pages = (total + limit - 1) // limit if total > 0 else 0
        
        return {
            "articles": articles,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
        
    except Exception as e:
        print(f"Error fetching news: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch news")


@router.get("/{article_id}")
async def get_news_article(article_id: int, db: Session = Depends(get_db)):
    """Get single news article by id"""
    try:
        article_query = text("""
            SELECT 
                id, title, link, description, content, source_name, 
                source_domain, rss_url, published_at, companies, 
                companies_links, tags, insert_timestamp
            FROM news_articles
            WHERE id = :article_id
        """)
        
        result = db.execute(article_query, {"article_id": article_id}).mappings().first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Article not found")
        
        # Clean HTML from description
        clean_description = result["description"]
        if clean_description:
            soup = BeautifulSoup(clean_description, 'html.parser')
            clean_description = soup.get_text(separator=' ', strip=True)
        
        return {
            "id": result["id"],
            "title": result["title"],
            "link": result["link"],
            "description": clean_description,
            "content": result["content"],
            "source_name": result["source_name"],
            "source_domain": result["source_domain"],
            "rss_url": result["rss_url"],
            "published_at": result["published_at"].isoformat() if result["published_at"] else None,
            "companies": result["companies"] or [],
            "companies_links": result["companies_links"] or [],
            "tags": result["tags"] or [],
            "img_url": None,
            "insert_timestamp": result["insert_timestamp"].isoformat() if result["insert_timestamp"] else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching article: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch article")


@router.get("/sources/list")
async def get_news_sources(db: Session = Depends(get_db)):
    """Get list of all news sources"""
    try:
        sources_query = text("""
            SELECT DISTINCT source_name, source_domain
            FROM news_articles
            ORDER BY source_name
        """)
        
        result = db.execute(sources_query).mappings().all()
        
        return [
            {
                "name": row["source_name"],
                "domain": row["source_domain"]
            }
            for row in result
        ]
        
    except Exception as e:
        print(f"Error fetching sources: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch sources")


@router.get("/tags/list")
async def get_news_tags(db: Session = Depends(get_db)):
    """Get list of all tags"""
    try:
        tags_query = text("""
            SELECT DISTINCT unnest(tags) as tag
            FROM news_articles
            WHERE tags IS NOT NULL
            ORDER BY tag
        """)
        
        result = db.execute(tags_query).fetchall()
        
        return [row[0] for row in result if row[0]]
        
    except Exception as e:
        print(f"Error fetching tags: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch tags")

