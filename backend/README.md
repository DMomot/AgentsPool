# AgentsPool Database

This directory contains all database-related files for the AgentsPool project.

## Structure

```
database/
├── DDL/                    # Database schema files
│   ├── 01_categories.sql   # Categories table
│   ├── 02_agents.sql       # Agents table  
│   ├── 03_agent_media.sql  # Agent media table
│   ├── 04_reviews.sql      # Reviews table
│   ├── 05_agent_stats.sql  # Agent statistics table
│   ├── init.sql           # Complete schema initialization
│   └── README.md          # DDL documentation
├── config.py              # Database configuration
├── models.py              # SQLAlchemy models
├── setup.py               # Database setup script
├── init_db.py             # DDL initialization script
├── seed_postgres.py       # Test data seeding script
└── README.md              # This file
```

## Quick Start

### 1. Setup Database
```bash
# Create tables only
python -m database.setup

# Create tables with test data
python -m database.setup --with-data
```

### 2. Environment Variables
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/agentspool"
```

### 3. Manual Operations
```bash
# Initialize schema with DDL files
python -m database.init_db

# Seed test data
python -m database.seed_postgres
```

## Configuration

The database configuration is centralized in `config.py`:

- **DATABASE_URL**: PostgreSQL connection string
- **engine**: SQLAlchemy engine instance
- **SessionLocal**: Session factory
- **Base**: Declarative base for models
- **get_db()**: FastAPI dependency for database sessions

## Models

All database models are defined in `models.py`:

- **Category**: Agent categories
- **Agent**: AI agents
- **AgentMedia**: Media files for agents
- **Review**: User reviews and ratings
- **AgentStats**: Daily statistics

## DDL Files

SQL schema files in `DDL/` directory:

1. **01_categories.sql** - Categories with default data
2. **02_agents.sql** - Agents with indexes and triggers
3. **03_agent_media.sql** - Media files
4. **04_reviews.sql** - Reviews and ratings
5. **05_agent_stats.sql** - Statistics tracking

## Usage in Backend

```python
# Import database components
from database import get_db, Agent, Category, Review

# Use in FastAPI endpoints
@app.get("/agents")
def get_agents(db: Session = Depends(get_db)):
    return db.query(Agent).all()
```

## Production Deployment

For Railway/Docker deployment:

1. Set `DATABASE_URL` environment variable
2. Run `python -m database.setup` in container startup
3. Database will be automatically configured

## Development

For local development:

1. Install PostgreSQL
2. Create database: `createdb agentspool`
3. Run setup: `python -m database.setup --with-data`
4. Start backend server

## Migrations

For schema changes:

1. Update models in `models.py`
2. Create new DDL file in `DDL/`
3. Update `setup.py` if needed
4. Test locally before deploying

## Testing

### Quick Health Check
```bash
# Check production
python quick_check.py

# Check local
python quick_check.py http://localhost:8000
```

### Full Test Suite
```bash
# Test production
python run_tests.py

# Test local
python run_tests.py local

# Run with pytest directly
pytest test_api.py -v
```

### Automated Testing

Tests run automatically via GitHub Actions:
- ✅ On every push to main
- ✅ On every Pull Request
- ✅ Every 6 hours (monitoring)

See `TESTING.md` for detailed testing documentation.
