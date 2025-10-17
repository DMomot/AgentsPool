-- Fundraising table with JSONB for flexible data storage
CREATE TABLE fundraising (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    canonical_name TEXT,
    website TEXT,
    last_funding_date DATE,
    funding_summary JSONB,
    profile JSONB,  -- Contains ap_description and other profile data
    social_links JSONB,
    metrics JSONB,
    news JSONB,
    extra_data JSONB,  -- Contains crunchbase_url and other extra data
    created_at TIMESTAMP DEFAULT now()
);

-- GIN indexes for JSONB fields
CREATE INDEX idx_fundraising_funding_summary ON fundraising USING GIN (funding_summary);
CREATE INDEX idx_fundraising_profile ON fundraising USING GIN (profile);
CREATE INDEX idx_fundraising_social_links ON fundraising USING GIN (social_links);
CREATE INDEX idx_fundraising_metrics ON fundraising USING GIN (metrics);
CREATE INDEX idx_fundraising_news ON fundraising USING GIN (news);
CREATE INDEX idx_fundraising_extra_data ON fundraising USING GIN (extra_data);

-- Regular indexes for text/date fields
CREATE INDEX idx_fundraising_canonical_name ON fundraising (canonical_name);
CREATE INDEX idx_fundraising_website ON fundraising (website);
CREATE INDEX idx_fundraising_last_funding_date ON fundraising (last_funding_date);

