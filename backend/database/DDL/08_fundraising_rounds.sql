-- Fundraising rounds table
CREATE TABLE IF NOT EXISTS fundraising_rounds (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    round_name VARCHAR(100) NOT NULL, -- e.g., "Seed", "Series A", "Series B"
    amount_raised DECIMAL(15, 2) NOT NULL, -- Amount in USD
    valuation DECIMAL(15, 2), -- Company valuation
    currency VARCHAR(10) DEFAULT 'USD',
    stage VARCHAR(50), -- "Pre-Seed", "Seed", "Series A", etc.
    announced_date DATE NOT NULL,
    investors TEXT[], -- Array of investor names
    lead_investors TEXT[], -- Lead investor names
    press_release_url TEXT,
    description TEXT,
    is_disclosed BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investors table
CREATE TABLE IF NOT EXISTS investors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50), -- "VC", "Angel", "Corporate", "Accelerator"
    tier INTEGER, -- 1 = Tier 1 (top investors), 2 = Tier 2, 3 = Tier 3
    website_url TEXT,
    logo_url TEXT,
    description TEXT,
    total_investments INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many relationship between fundraising rounds and investors
CREATE TABLE IF NOT EXISTS round_investors (
    id SERIAL PRIMARY KEY,
    round_id INTEGER NOT NULL REFERENCES fundraising_rounds(id) ON DELETE CASCADE,
    investor_id INTEGER NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    is_lead BOOLEAN DEFAULT false,
    investment_amount DECIMAL(15, 2), -- Optional: specific amount from this investor
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(round_id, investor_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fundraising_agent_id ON fundraising_rounds(agent_id);
CREATE INDEX IF NOT EXISTS idx_fundraising_announced_date ON fundraising_rounds(announced_date DESC);
CREATE INDEX IF NOT EXISTS idx_fundraising_stage ON fundraising_rounds(stage);
CREATE INDEX IF NOT EXISTS idx_round_investors_round ON round_investors(round_id);
CREATE INDEX IF NOT EXISTS idx_round_investors_investor ON round_investors(investor_id);
CREATE INDEX IF NOT EXISTS idx_investors_tier ON investors(tier);
CREATE INDEX IF NOT EXISTS idx_investors_name ON investors(name);

