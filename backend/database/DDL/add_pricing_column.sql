-- Migration: Add pricing column to agents table
-- Date: 2025-10-22

-- Add pricing column
ALTER TABLE agents ADD COLUMN IF NOT EXISTS pricing JSONB;

-- Add GIN index for pricing
CREATE INDEX IF NOT EXISTS idx_agents_pricing ON agents USING GIN(pricing);

