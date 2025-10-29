# Development & Testing Rules

## Local Development Setup

### Environment Configuration
- **Frontend**: Runs locally (localhost:3000)
- **Backend**: Runs locally (localhost:8000)
- **Database**: PRODUCTION database (Railway PostgreSQL)

### Important Notes
⚠️ **Local development connects to PRODUCTION database!**
- All local changes affect production data
- Be careful with migrations and data modifications
- Test queries are executed against production DB

### Testing
- Tests run against PRODUCTION database
- Backend must be running locally: `python3 main.py`
- Tests connect to `http://localhost:8000`
- Database is shared with production

## Running Tests

### Quick Test (Recommended)
```bash
cd backend
python run_tests.py local  # Starts backend + runs tests + cleanup
```

### Manual Test
```bash
cd backend
source venv/bin/activate
python3 main.py &  # Start backend locally
pytest test_api.py -v
```

### ⚠️ IMPORTANT: Pre-Commit Testing
**ALWAYS run tests before committing:**

```bash
cd backend
python run_tests.py local
# ✅ Wait for all tests to pass
# ❌ Never commit if tests fail!
```

This ensures:
- All endpoints work correctly
- No breaking changes
- Production API remains stable

## Database Migrations

When creating new tables:
1. Create DDL file in `backend/database/DDL/`
2. Run migration script connecting to PRODUCTION DB
3. The same DB is used by local backend

Database URL is in `backend/.env`:
```
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:PORT/railway
```
(See actual credentials in Railway dashboard or ask team lead)

## Setup Instructions

1. Copy this file to `DEVELOPMENT_RULES.md`
2. Update `DEVELOPMENT_RULES.md` with actual database credentials
3. Never commit `DEVELOPMENT_RULES.md` (it's in .gitignore)

