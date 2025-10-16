-- Categories table
-- Stores AI agent categories with icons and descriptions

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Insert default categories
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
