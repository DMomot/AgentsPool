-- News articles table for storing news content from various sources
CREATE TABLE news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    link VARCHAR(1000) NOT NULL UNIQUE,
    description TEXT,
    content TEXT,
    source_name VARCHAR(200) NOT NULL,
    source_domain VARCHAR(200) NOT NULL,
    rss_url VARCHAR(500) NOT NULL,
    published_at TIMESTAMP,
    companies TEXT[],
    companies_links TEXT[],
    tags TEXT[],
    insert_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    main_links TEXT[] DEFAULT '{}'::text[],
    scraped BOOLEAN DEFAULT false,
    
    CONSTRAINT unique_article_link UNIQUE(link)
);

-- Index for faster queries by published date
CREATE INDEX idx_news_published_at ON news_articles(published_at DESC);

-- Index for source queries
CREATE INDEX idx_news_source_name ON news_articles(source_name);

-- Index for main_links queries
CREATE INDEX idx_news_articles_main_links ON news_articles(main_links);

