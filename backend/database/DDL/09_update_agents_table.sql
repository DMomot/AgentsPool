-- Update agents table
-- Rename demo_url to url, add a2a and img_url columns

-- Rename demo_url to url
ALTER TABLE agents RENAME COLUMN demo_url TO url;

-- Add a2a column
ALTER TABLE agents ADD COLUMN IF NOT EXISTS a2a VARCHAR(500);

-- Add img_url column
ALTER TABLE agents ADD COLUMN IF NOT EXISTS img_url VARCHAR(500);


