# AgentsPool - AI Agent Marketplace

AI-powered platform for discovering, browsing, and searching AI agents across 20+ categories.

## 🎯 What is AgentsPool?

AgentsPool is a curated marketplace of 1400+ AI agents, tools, and platforms. Users can:
- 🔍 **Search with AI** - Semantic search powered by sentence transformers (384d embeddings)
- 📂 **Browse by category** - 20+ categories from Marketing to DeFi
- ⭐ **Read reviews** - Community ratings and feedback
- 🌐 **Discover agents** - Find the perfect AI tool for any task

## 🏗️ Architecture

### Backend (FastAPI)
- **Language**: Python 3.11+
- **Framework**: FastAPI
- **Database**: PostgreSQL with pgvector extension
- **AI Models**: 
  - Embeddings: `all-MiniLM-L6-v2` (384 dimensions, optimized for CPU)
  - Vector search: HNSW index for fast similarity search
- **Deployment**: Railway (Docker)

**Key Features:**
- REST API with automatic OpenAPI docs
- Semantic AI search (200-900ms response time)
- Vector similarity search with pgvector
- Category-based browsing
- Reviews and ratings system

**Location:** `backend/`

### Frontend (Next.js)
- **Framework**: Next.js 13+ with TypeScript
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Railway (Docker)

**Key Features:**
- Server-side rendering (SSR)
- Responsive design (mobile-first)
- AI-powered search interface
- Category browsing
- Admin moderation panel

**Location:** `frontend/`

### Database (PostgreSQL + pgvector)
- **Database**: PostgreSQL 15+
- **Extension**: pgvector for vector similarity search
- **Hosting**: Railway
- **Schema**: 
  - `agents` - 1400+ AI agents with 384d vectors
  - `categories` - 20+ categories
  - `reviews` - User ratings and feedback
  - `agents_old` - Backup table with 768d vectors

**Key Details:**
- Vector embeddings: 384 dimensions (all-MiniLM-L6-v2)
- HNSW index: m=16, ef_construction=64
- Cosine distance for similarity search
- Production database shared with local development

**Location:** `backend/database/`

## 📂 Project Structure

```
AgentsPool/
├── README.md                          # This file
├── DEVELOPMENT_RULES.md               # Local dev setup (gitignored, use .example)
├── DEVELOPMENT_RULES.example.md       # Template for dev rules
├── ADMIN_SECURITY.md                  # Admin panel documentation
├── DOMAIN_SETUP.md                    # Domain configuration guide
├── DOCKER_OPTIMIZATION.md             # Docker build optimization guide
├── .cursorrules                       # Cursor AI rules
├── railway.toml                       # Railway deployment config
│
├── backend/                           # FastAPI Backend
│   ├── main.py                       # FastAPI app entry point
│   ├── config.py                     # Backend configuration
│   ├── requirements.txt              # Python dependencies
│   ├── Dockerfile                    # Backend container
│   ├── railway.toml                  # Backend Railway config
│   ├── api/                          # API routes
│   │   ├── routes/
│   │   │   ├── agents.py            # Agents endpoints (AI search here)
│   │   │   ├── categories.py        # Categories endpoints
│   │   │   └── health.py            # Health check
│   │   └── dependencies.py           # FastAPI dependencies
│   ├── database/                     # Database layer
│   │   ├── config.py                # DB configuration
│   │   ├── models.py                # SQLAlchemy models
│   │   └── DDL/                     # SQL schema files
│   │       ├── agents.sql           # Agents table (VECTOR(384))
│   │       ├── categories.sql       # Categories table
│   │       └── init.sql             # Full schema init
│   ├── schemas/                      # Pydantic schemas
│   │   ├── agent.py                 # Agent schemas
│   │   └── category.py              # Category schemas
│   ├── utils/                        # Utilities
│   │   └── slug.py                  # URL slug generation
│   ├── test_api.py                   # API integration tests
│   ├── run_tests.py                  # Test runner wrapper
│   └── README.md                     # Backend documentation
│
├── frontend/                          # Next.js Frontend
│   ├── pages/                        # Next.js pages
│   │   ├── index.tsx                # Homepage
│   │   ├── agents.tsx               # Agents list
│   │   ├── categories.tsx           # Categories page
│   │   ├── _internal_moderation.tsx # Admin panel (hidden)
│   │   └── api/                     # API routes (SSR)
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── lib/api.ts               # API client
│   │   └── types/                   # TypeScript types
│   ├── public/                       # Static assets
│   ├── package.json                  # Node dependencies
│   ├── Dockerfile                    # Frontend container
│   └── railway.toml                  # Frontend Railway config
```

## 🚀 How It Works

### AI Search Flow

1. **User Query** → Frontend sends search query to `/api/v1/agents/search-ai`
2. **Embedding Generation** → Backend uses `all-MiniLM-L6-v2` to encode query (50-100ms)
3. **Vector Search** → PostgreSQL finds similar agents using HNSW index + cosine distance
4. **Results** → Top 3 active agents returned to user

**Performance:**
- Query encoding: 50-100ms (CPU-optimized)
- Vector search: 50-100ms (HNSW index)
- Total: 200-900ms (production)

### Category Browsing Flow

1. **User clicks category** → Frontend navigates to `/agents?category=X`
2. **API call** → Backend filters `agents WHERE category_id = X AND is_active = true`
3. **Display** → Grid of agents with name, description, tags

### Admin Moderation Flow

1. **Admin visits** `/_internal_moderation` (hidden URL)
2. **Password check** → `NEXT_PUBLIC_ADMIN_PASSWORD` (24h session)
3. **Moderation** → Approve/reject agents, edit descriptions
4. **Update** → Backend API updates `is_active` status

## 💻 Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL with pgvector (for local DB testing)

### Setup

**1. Clone and configure:**
```bash
git clone <repository>
cd AgentsPool
cp DEVELOPMENT_RULES.example.md DEVELOPMENT_RULES.md
# Edit DEVELOPMENT_RULES.md with DB credentials
```

**2. Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```
Backend runs at: http://localhost:8000
API docs: http://localhost:8000/docs

**3. Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:3000

### Important Notes

⚠️ **Local development connects to PRODUCTION database (Railway)!**
- All changes affect production data
- Be careful with migrations
- Test queries affect real users

See `DEVELOPMENT_RULES.md` for database credentials and testing configuration.

## 🧪 Testing

### Run Tests

```bash
cd backend

# Test production API
python run_tests.py

# Test local API
python run_tests.py local

# Run specific tests
pytest test_api.py -v -k "test_ai_search"
```

### CI/CD Testing

Tests run automatically on GitHub Actions:
- ✅ Every push to main
- ✅ Every Pull Request
- ✅ Backend starts locally → tests run against localhost:8000 → connects to production DB

See `.github/workflows/test-deploy.yml`

## 🚢 Deployment

### Railway (Current)

**Architecture:**
```
agentspool.ai (Frontend) ──→ api.agentspool.ai (Backend) ──→ Railway PostgreSQL
```

**Services:**
- **Frontend**: https://agentspool.ai (Next.js)
- **Backend**: https://api.agentspool.ai (FastAPI)
- **Database**: Railway PostgreSQL (pgvector)

**Environment Variables:**

Backend:
```bash
DATABASE_URL=postgresql://...      # Railway PostgreSQL
PRELOAD_AI_MODELS=true            # Load models on startup
PORT=8000
```

Frontend:
```bash
NEXT_PUBLIC_API_URL=https://api.agentspool.ai
NEXT_PUBLIC_ADMIN_PASSWORD=<secret>
```

**Deployment:**
```bash
git push origin main
# Railway auto-deploys both services
```

See `DOMAIN_SETUP.md` for domain configuration details.

## 📚 Additional Documentation

- **DEVELOPMENT_RULES.md** - Local development setup, DB credentials, testing
- **ADMIN_SECURITY.md** - Admin panel access, password management
- **DOMAIN_SETUP.md** - Domain and DNS configuration for Railway
- **DOCKER_OPTIMIZATION.md** - Docker build optimization guide (BuildKit cache, CPU PyTorch, Base Image)
- **backend/README.md** - Backend API documentation
- **backend/TESTING.md** - Detailed testing guide

## 🔑 Key Technologies

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Backend** | FastAPI | REST API with auto docs |
| **Frontend** | Next.js + TypeScript | SSR React framework |
| **Database** | PostgreSQL + pgvector | Vector similarity search |
| **AI Models** | sentence-transformers | Embeddings (all-MiniLM-L6-v2) |
| **Vector Search** | HNSW index | Fast ANN search |
| **Deployment** | Railway + Docker | Cloud hosting |
| **CI/CD** | GitHub Actions | Automated testing |

## 📊 Database Stats

- **Total agents**: 1400+
- **Categories**: 20+
- **Vector dimensions**: 384 (optimized for CPU)
- **Index type**: HNSW (m=16, ef_construction=64)
- **Search time**: 50-100ms (vector search)
- **Embedding time**: 50-100ms (query encoding)

## 🎯 Performance Metrics

**AI Search (Production):**
- First request: 500-900ms (model load + search)
- Subsequent: 200-300ms (cached model)
- Encoding: 50-100ms (all-MiniLM-L6-v2 on Railway CPU)
- Vector search: 50-100ms (HNSW index)

**Migration History:**
- Old: sentence-t5-base (768d) → 5000ms encoding ❌
- New: all-MiniLM-L6-v2 (384d) → 100ms encoding ✅
- **Result**: 50x faster on CPU!

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Read `DEVELOPMENT_RULES.md` for local setup
4. Make your changes
5. **CRITICAL: Test locally BEFORE committing:**
   ```bash
   cd backend
   python run_tests.py local
   # ✅ All tests must pass!
   ```
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open Pull Request

**⚠️ Never commit without running tests! All tests must pass.**

---

**Last Updated:** November 5, 2025
**Version:** 2.0 (384d embeddings, optimized AI search)
