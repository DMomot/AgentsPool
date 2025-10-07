# Database DDL (Data Definition Language)

This folder contains SQL files for creating the AgentsPool database schema.

## File Structure

- `01_categories.sql` - Agent categories table
- `02_agents.sql` - Main agents table
- `03_agent_media.sql` - Agent media files (images, videos)
- `04_reviews.sql` - Agent reviews and ratings
- `05_agent_stats.sql` - Agent statistics (views, downloads)
- `init.sql` - Main file for complete schema initialization

## Usage

### Full database initialization
```bash
psql -d agentspool -f init.sql
```

### Creating individual tables
```bash
# Create only categories
psql -d primeagents -f 01_categories.sql

# Create only agents
psql -d primeagents -f 02_agents.sql
```

## Features

- All tables are created with `IF NOT EXISTS` for safe re-execution
- Includes indexes for performance optimization
- Uses PostgreSQL-specific data types (ARRAY, JSONB)
- Configured triggers for automatic rating updates
- Added data integrity constraints

## Dependencies

Files must be executed in the specified order due to foreign keys:
1. categories (base table)
2. agents (references categories)
3. agent_media (references agents)
4. reviews (references agents)
5. agent_stats (references agents)

## Requirements

- PostgreSQL 12+
- uuid-ossp extension (installed automatically in init.sql)
