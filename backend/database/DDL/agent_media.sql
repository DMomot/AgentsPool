-- Agent Media table
-- Stores media files (images, videos, gifs) associated with agents

CREATE TABLE IF NOT EXISTS agent_media (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    media_type VARCHAR(20) CHECK (media_type IN ('image', 'video', 'gif')),
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_media_agent_id ON agent_media(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_media_type ON agent_media(media_type);
CREATE INDEX IF NOT EXISTS idx_agent_media_primary ON agent_media(is_primary);
CREATE INDEX IF NOT EXISTS idx_agent_media_sort_order ON agent_media(sort_order);

-- Ensure only one primary media per agent
CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_media_unique_primary 
ON agent_media(agent_id) 
WHERE is_primary = TRUE;
