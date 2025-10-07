-- AgentsPool Database Schema Initialization
-- This file creates all tables and initial data for the AgentsPool platform
-- Run this file to set up the complete database schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Execute DDL files in correct order (respecting foreign key dependencies)
\i 01_categories.sql
\i 02_agents.sql
\i 03_agent_media.sql
\i 04_reviews.sql
\i 05_agent_stats.sql

-- Create any additional views or functions
-- View for agent statistics summary
CREATE OR REPLACE VIEW agent_summary AS
SELECT 
    a.id,
    a.name,
    a.short_description,
    a.rating,
    a.downloads_count,
    a.price,
    a.is_free,
    a.featured,
    c.name as category_name,
    c.icon as category_icon,
    COUNT(r.id) as review_count,
    AVG(r.rating) as avg_review_rating
FROM agents a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN reviews r ON a.id = r.agent_id
WHERE a.is_active = TRUE
GROUP BY a.id, c.name, c.icon;

-- Function to update agent rating based on reviews
CREATE OR REPLACE FUNCTION update_agent_rating(agent_id_param INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE agents 
    SET rating = (
        SELECT COALESCE(AVG(rating), 0.0)
        FROM reviews 
        WHERE agent_id = agent_id_param
    )
    WHERE id = agent_id_param;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update agent rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION trigger_update_agent_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM update_agent_rating(OLD.agent_id);
        RETURN OLD;
    ELSE
        PERFORM update_agent_rating(NEW.agent_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_update_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_agent_rating();

-- Grant permissions (adjust as needed for your environment)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO agentspool_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO agentspool_user;
