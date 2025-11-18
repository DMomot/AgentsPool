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


def get_og_image(url: str) -> str | None:
    """Extract og:image from article URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Referer': 'https://www.google.com/'
        }
        response = requests.get(url, headers=headers, timeout=3, allow_redirects=True)
        if response.status_code == 403:
            # Site blocks scraping - return None, frontend will show placeholder
            return None
        if response.status_code != 200:
            return None
            
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Try og:image first
        og_image = soup.find('meta', property='og:image')
        if og_image and og_image.get('content'):
            return og_image['content']
        
        # Try twitter:image
        twitter_image = soup.find('meta', attrs={'name': 'twitter:image'})
        if twitter_image and twitter_image.get('content'):
            return twitter_image['content']
        
        # Try twitter:image with property
        twitter_image_prop = soup.find('meta', property='twitter:image')
        if twitter_image_prop and twitter_image_prop.get('content'):
            return twitter_image_prop['content']
        
        # Try article:image
        article_image = soup.find('meta', property='article:image')
        if article_image and article_image.get('content'):
            return article_image['content']
        
        # Try first image in content
        first_img = soup.find('img', src=True)
        if first_img and first_img.get('src'):
            img_src = first_img['src']
            # Make absolute URL if relative
            if img_src.startswith('//'):
                return 'https:' + img_src
            elif img_src.startswith('/'):
                from urllib.parse import urlparse
                parsed = urlparse(url)
                return f"{parsed.scheme}://{parsed.netloc}{img_src}"
            elif img_src.startswith('http'):
                return img_src
            
        return None
    except Exception as e:
        print(f"Error fetching og:image from {url}: {e}")
        return None


@router.get("")
async def get_news(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    tag: str = Query(None),
    source: str = Query(None),
    search: str = Query(None),
    include_images: bool = Query(True, description="Fetch og:images (slow)"),
    db: Session = Depends(get_db)
):
    """Get news articles with pagination"""
    try:
        offset = (page - 1) * limit
        
        # Build query based on filters
        where_conditions = []
        params = {"limit": limit, "offset": offset}
        
        if tag:
            # Search for tags like "Firm|OpenAI|Score" by prefix "Firm|OpenAI|"
            tag_pattern = f"{tag}|%"
            where_conditions.append("EXISTS (SELECT 1 FROM unnest(tags) AS t WHERE t LIKE :tag)")
            params["tag"] = tag_pattern
            print(f"DEBUG: Searching for tag pattern: {tag_pattern}")
            
        if source:
            where_conditions.append("source_name = :source")
            params["source"] = source
        
        if search:
            where_conditions.append("(title ILIKE :search OR description ILIKE :search)")
            params["search"] = f"%{search}%"
        
        where_clause = f"WHERE {' AND '.join(where_conditions)}" if where_conditions else ""
        
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
        
        # Get og:images in parallel for better performance (if requested)
        og_images = []
        if include_images:
            with ThreadPoolExecutor(max_workers=5) as executor:
                article_links = [article["link"] for article in news_result]
                og_images = list(executor.map(get_og_image, article_links))
        else:
            og_images = [None] * len(news_result)
        
        for idx, article in enumerate(news_result):
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
                "img_url": og_images[idx],
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


@router.get("/by-agent-url")
async def get_news_by_agent_url(
    agent_url: str = Query(..., description="Agent URL to search for"),
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Get news articles related to an agent by URL"""
    try:
        # Generate both www and non-www versions
        from urllib.parse import urlparse, urlunparse
        
        parsed = urlparse(agent_url)
        
        # Always create both variants
        agent_url_variants = []
        
        # Variant 1: Original URL
        agent_url_variants.append(agent_url)
        
        # Variant 2: Toggle www
        if parsed.netloc.startswith('www.'):
            # Remove www
            new_netloc = parsed.netloc[4:]  # Remove 'www.'
            variant = urlunparse((parsed.scheme, new_netloc, parsed.path, parsed.params, parsed.query, parsed.fragment))
            agent_url_variants.append(variant)
        else:
            # Add www
            new_netloc = 'www.' + parsed.netloc
            variant = urlunparse((parsed.scheme, new_netloc, parsed.path, parsed.params, parsed.query, parsed.fragment))
            agent_url_variants.append(variant)
        
        print(f"Searching for agent URLs: {agent_url_variants}")
        
        news_query = text("""
            SELECT 
                id, title, link, description, source_name, 
                source_domain, published_at, tags, insert_timestamp
            FROM news_articles
            WHERE (
                :agent_url1 = ANY(main_links) OR 
                :agent_url2 = ANY(main_links)
            )
            AND tags IS NOT NULL AND array_length(tags, 1) > 0
            ORDER BY insert_timestamp DESC
            LIMIT :limit
        """)
        
        result = db.execute(news_query, {
            "agent_url1": agent_url_variants[0], 
            "agent_url2": agent_url_variants[1],
            "limit": limit
        }).mappings().all()
        
        # Get og:images in parallel
        with ThreadPoolExecutor(max_workers=3) as executor:
            article_links = [article["link"] for article in result]
            og_images = list(executor.map(get_og_image, article_links))
        
        articles = []
        for idx, article in enumerate(result):
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
                "source_name": article["source_name"],
                "source_domain": article["source_domain"],
                "published_at": article["published_at"].isoformat() if article["published_at"] else None,
                "tags": article["tags"] or [],
                "img_url": og_images[idx],
                "insert_timestamp": article["insert_timestamp"].isoformat() if article["insert_timestamp"] else None
            })
        
        return {
            "articles": articles,
            "total": len(articles),
            "agent_url": agent_url
        }
        
    except Exception as e:
        print(f"Error fetching news by agent URL: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch news")


@router.get("/sitemap")
async def get_news_sitemap(db: Session = Depends(get_db)):
    """Get all news for sitemap (ONE query, no images, only with content & tags)"""
    try:
        # ONE QUERY - get all news with tags (content check removed for speed)
        query = text("""
            SELECT id, published_at, insert_timestamp
            FROM news_articles
            WHERE tags IS NOT NULL 
              AND array_length(tags, 1) > 0
            ORDER BY insert_timestamp DESC
        """)
        
        result = db.execute(query).mappings().all()
        
        articles = []
        for row in result:
            articles.append({
                "id": row["id"],
                "published_at": row["published_at"].isoformat() if row["published_at"] else None,
                "insert_timestamp": row["insert_timestamp"].isoformat() if row["insert_timestamp"] else None
            })
        
        return {
            "articles": articles,
            "total": len(articles)
        }
        
    except Exception as e:
        print(f"Error fetching sitemap: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch news sitemap")


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
        
        # Get og:image for the article
        og_image_url = get_og_image(result["link"])
        
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
            "img_url": og_image_url,
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

