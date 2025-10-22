-- Agents table
-- Main table for storing AI agent information

CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    category_id INTEGER REFERENCES categories(id),
    author VARCHAR(100),
    tags TEXT[], -- PostgreSQL array type
    capabilities TEXT[], -- PostgreSQL array type
    use_cases TEXT[], -- PostgreSQL array type
    url VARCHAR(500),
    documentation_url VARCHAR(500),
    github_url VARCHAR(500),
    api_endpoint VARCHAR(500),
    model_info JSONB, -- PostgreSQL JSONB type for flexible metadata
    pricing JSONB, -- Pricing information
    is_active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_category_id ON agents(category_id);
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON agents(is_active);
CREATE INDEX IF NOT EXISTS idx_agents_featured ON agents(featured);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at);

-- GIN indexes for array and JSONB columns for better search performance
CREATE INDEX IF NOT EXISTS idx_agents_tags ON agents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_agents_capabilities ON agents USING GIN(capabilities);
CREATE INDEX IF NOT EXISTS idx_agents_use_cases ON agents USING GIN(use_cases);
CREATE INDEX IF NOT EXISTS idx_agents_model_info ON agents USING GIN(model_info);
CREATE INDEX IF NOT EXISTS idx_agents_pricing ON agents USING GIN(pricing);

-- Full text search index for text fields
CREATE INDEX IF NOT EXISTS idx_agents_text_search ON agents USING GIN(
    to_tsvector('english', 
        COALESCE(name, '') || ' ' || 
        COALESCE(description, '') || ' ' || 
        COALESCE(short_description, '') || ' ' ||
        COALESCE(author, '')
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
