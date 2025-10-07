-- Update categories with new structure
-- Clear existing categories and add new ones

-- First, clear existing categories (this will cascade to agents if needed)
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

-- Insert new categories with proper icons and descriptions
INSERT INTO categories (name, description, icon) VALUES
    ('Content & Media', 'AI agents for content creation, video, audio, image generation and media processing', '🎨'),
    ('Business & Productivity', 'Tools for business automation, productivity enhancement and workflow optimization', '💼'),
    ('Development & Coding', 'AI assistants for programming, code generation, debugging and software development', '💻'),
    ('AI Platforms & Infrastructure', 'Core AI platforms, model hosting, infrastructure and development frameworks', '🤖'),
    ('Marketing & Sales', 'AI tools for marketing campaigns, sales automation, lead generation and analytics', '📈'),
    ('Personal & Lifestyle', 'Personal assistants, lifestyle apps, health, fitness and entertainment AI', '🏠'),
    ('Customer Support & HR', 'Customer service automation, HR tools, recruitment and employee management', '🎧'),
    ('Specialized Industries', 'Industry-specific AI solutions for healthcare, finance, legal, education and more', '🏭'),
    ('Web & Mobile', 'Web development tools, mobile app builders and digital platform solutions', '📱'),
    ('LLM & AI Assistants', 'Large language models, conversational AI and general-purpose AI assistants', '🧠'),
    ('Blockchain & Web3', 'Cryptocurrency, NFT, DeFi, smart contracts and blockchain-related AI tools', '⛓️'),
    ('Workflow', 'Workflow automation, process optimization and task management solutions', '⚡'),
    ('Security & Infrastructure', 'Cybersecurity, data protection, infrastructure monitoring and safety tools', '🔒'),
    ('Other & Miscellaneous', 'Unique and experimental AI tools that don\'t fit standard categories', '🔧')
ON CONFLICT (name) DO NOTHING;

-- Verify the insert
SELECT id, name, icon FROM categories ORDER BY id;
