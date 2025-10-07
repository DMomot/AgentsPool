-- Add slug field to categories table for SEO-friendly URLs
ALTER TABLE categories ADD COLUMN slug VARCHAR(100) UNIQUE;

-- Update existing categories with slugs
UPDATE categories SET slug = 'content-media' WHERE id = 1;
UPDATE categories SET slug = 'business-productivity' WHERE id = 2;
UPDATE categories SET slug = 'development-coding' WHERE id = 3;
UPDATE categories SET slug = 'ai-platforms-infrastructure' WHERE id = 4;
UPDATE categories SET slug = 'education-learning' WHERE id = 5;
UPDATE categories SET slug = 'research-analysis' WHERE id = 6;
UPDATE categories SET slug = 'customer-support-hr' WHERE id = 7;
UPDATE categories SET slug = 'finance-legal' WHERE id = 8;
UPDATE categories SET slug = 'healthcare-wellness' WHERE id = 9;
UPDATE categories SET slug = 'marketing-sales' WHERE id = 10;
UPDATE categories SET slug = 'gaming-entertainment' WHERE id = 11;
UPDATE categories SET slug = 'security-privacy' WHERE id = 12;
UPDATE categories SET slug = 'social-communication' WHERE id = 13;
UPDATE categories SET slug = 'other-miscellaneous' WHERE id = 14;

-- Make slug NOT NULL after updating
ALTER TABLE categories ALTER COLUMN slug SET NOT NULL;
