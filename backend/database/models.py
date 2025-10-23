from sqlalchemy import Column, Integer, String, Text, Boolean, DECIMAL, TIMESTAMP, ForeignKey, ARRAY, Date
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .config import Base

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    icon = Column(String(50))
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    agents = relationship("Agent", back_populates="category")

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    short_description = Column(String(500))
    category_id = Column(Integer, ForeignKey("categories.id"))
    author = Column(String(100))
    tags = Column(ARRAY(String))
    capabilities = Column(ARRAY(String))
    use_cases = Column(ARRAY(String))
    url = Column(String(500))
    documentation_url = Column(String(500))
    github_url = Column(String(500))
    api_endpoint = Column(String(500))
    a2a = Column(String(500))
    img_url = Column(String(500))
    model_info = Column(JSONB)
    pricing = Column(JSONB)
    is_active = Column(Boolean, default=True)
    featured = Column(Boolean, default=False)
    slug = Column(String(200), unique=True, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    category = relationship("Category", back_populates="agents")
    media = relationship("AgentMedia", back_populates="agent", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="agent", cascade="all, delete-orphan")
    stats = relationship("AgentStats", back_populates="agent", cascade="all, delete-orphan")

class AgentMedia(Base):
    __tablename__ = "agent_media"
    
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    media_type = Column(String(20))  # image, video, gif
    url = Column(String(500), nullable=False)
    alt_text = Column(String(200))
    is_primary = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    agent = relationship("Agent", back_populates="media")

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    user_name = Column(String(100))
    user_email = Column(String(200))
    rating = Column(Integer)  # 1-5
    title = Column(String(200))
    comment = Column(Text)
    is_verified = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    agent = relationship("Agent", back_populates="reviews")

class AgentStats(Base):
    __tablename__ = "agent_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    date = Column(Date, server_default=func.current_date())
    views_count = Column(Integer, default=0)
    downloads_count = Column(Integer, default=0)
    api_calls_count = Column(Integer, default=0)
    
    # Relationships
    agent = relationship("Agent", back_populates="stats")

class Fundraising(Base):
    __tablename__ = "fundraising"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    canonical_name = Column(Text)
    website = Column(Text)
    last_funding_date = Column(Date)
    funding_summary = Column(JSONB)
    profile = Column(JSONB)
    social_links = Column(JSONB)
    metrics = Column(JSONB)
    news = Column(JSONB)
    extra_data = Column(JSONB)
    created_at = Column(TIMESTAMP, server_default=func.now())

class NewsArticle(Base):
    __tablename__ = "news_articles"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    link = Column(String(1000), unique=True, nullable=False)
    description = Column(Text)
    content = Column(Text)
    source_name = Column(String(200), nullable=False)
    source_domain = Column(String(200), nullable=False)
    rss_url = Column(String(500), nullable=False)
    published_at = Column(TIMESTAMP)
    companies = Column(ARRAY(String))
    companies_links = Column(ARRAY(String))
    tags = Column(ARRAY(String))
    insert_timestamp = Column(TIMESTAMP, server_default=func.now())
