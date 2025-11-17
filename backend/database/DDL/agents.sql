-- Agents table
-- Main table for storing AI agent information

CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(500) UNIQUE,
    description TEXT NOT NULL,
    vector_description VECTOR(384),  -- BAAI/bge-small-en-v1.5 embeddings
    short_description VARCHAR(500),
    category_id INTEGER REFERENCES categories(id),
    keywords TEXT[],
    url VARCHAR(500),
    documentation_url VARCHAR(500),
    github_url VARCHAR(500),
    api_endpoint VARCHAR(500),
    model_info JSONB,
    pricing JSONB,
    interability JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_category_id ON agents(category_id);
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON agents(is_active);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at);
CREATE INDEX IF NOT EXISTS idx_agents_slug ON agents(slug);

-- GIN indexes for array and JSONB columns
CREATE INDEX IF NOT EXISTS idx_agents_keywords ON agents USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_agents_model_info ON agents USING GIN(model_info);
CREATE INDEX IF NOT EXISTS idx_agents_pricing ON agents USING GIN(pricing);

-- HNSW index for vector similarity search (cosine distance)
CREATE INDEX IF NOT EXISTS idx_agents_vector_description 
ON agents 
USING hnsw (vector_description vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Full text search index for text fields
CREATE INDEX IF NOT EXISTS idx_agents_text_search ON agents USING GIN(
    to_tsvector('english', 
        COALESCE(name, '') || ' ' || 
        COALESCE(description, '') || ' ' || 
        COALESCE(short_description, '')
    )
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at 
    BEFORE UPDATE ON agents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
