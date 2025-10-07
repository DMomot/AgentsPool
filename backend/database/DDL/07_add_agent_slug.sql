-- Add slug field to agents table for SEO-friendly URLs
ALTER TABLE agents ADD COLUMN slug VARCHAR(200) UNIQUE;

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_agent_slug(agent_name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                TRIM(agent_name), 
                '[^a-zA-Z0-9\s-]', '', 'g'
            ), 
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Update existing agents with slugs based on their names
UPDATE agents 
SET slug = generate_agent_slug(name) 
WHERE slug IS NULL;

-- Handle potential duplicates by adding ID suffix
UPDATE agents 
SET slug = slug || '-' || id::text 
WHERE id IN (
    SELECT id FROM (
        SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY id) as rn
        FROM agents 
        WHERE slug IS NOT NULL
    ) t WHERE t.rn > 1
);

-- Make slug NOT NULL after updating
ALTER TABLE agents ALTER COLUMN slug SET NOT NULL;

-- Create index for slug
CREATE INDEX IF NOT EXISTS idx_agents_slug ON agents(slug);

-- Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION trigger_generate_agent_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = generate_agent_slug(NEW.name);
        
        -- Check for duplicates and add ID suffix if needed
        WHILE EXISTS (SELECT 1 FROM agents WHERE slug = NEW.slug AND id != COALESCE(NEW.id, 0)) LOOP
            NEW.slug = generate_agent_slug(NEW.name) || '-' || COALESCE(NEW.id, nextval('agents_id_seq'))::text;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_generate_slug
    BEFORE INSERT OR UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_agent_slug();
