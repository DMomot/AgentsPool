from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datetime import datetime

class NewsArticleBase(BaseModel):
    title: str
    link: str
    description: Optional[str] = None
    content: Optional[str] = None
    source_name: str
    source_domain: str
    rss_url: str
    published_at: Optional[datetime] = None
    companies: Optional[List[str]] = None
    companies_links: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    main_links: Optional[List[str]] = None

class NewsArticleCreate(NewsArticleBase):
    pass

class NewsArticleResponse(NewsArticleBase):
    id: int
    insert_timestamp: datetime
    
    class Config:
        from_attributes = True

