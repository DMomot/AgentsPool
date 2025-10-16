-- Agent Stats table
-- Stores daily statistics for agents (views, downloads, API calls)

CREATE TABLE IF NOT EXISTS agent_stats (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    views_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    api_calls_count INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_stats_agent_id ON agent_stats(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_stats_date ON agent_stats(date);
CREATE INDEX IF NOT EXISTS idx_agent_stats_agent_date ON agent_stats(agent_id, date);

-- Ensure unique stats per agent per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_stats_unique_agent_date 
ON agent_stats(agent_id, date);
