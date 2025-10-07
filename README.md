# PrimeAgents

AI Agent Marketplace - A platform for discovering and sharing AI agents.

## Project Structure

```
PrimeAgents/
├── backend/                # FastAPI backend
│   ├── main.py            # Main application file
│   ├── config.py          # Configuration settings
│   ├── Dockerfile         # Backend container
│   ├── requirements.txt   # Python dependencies
│   └── railway.toml       # Railway config for backend
├── frontend/              # Next.js frontend
│   ├── pages/             # Next.js pages
│   ├── src/               # Components and utilities
│   ├── Dockerfile         # Frontend container
│   ├── package.json       # Node.js dependencies
│   └── railway.toml       # Railway config for frontend
├── database/              # Database files
│   ├── DDL/               # SQL schema files
│   ├── models.py          # SQLAlchemy models
│   ├── config.py          # Database configuration
│   ├── setup.py           # Database setup script
│   └── README.md          # Database documentation
├── docker-compose.yml     # Local development setup
├── railway.json           # Railway project config
├── DEPLOY.md              # Detailed deployment guide
└── RAILWAY_DEPLOY.md      # Quick Railway deployment
```

## Quick Start

### Local Development

1. **Clone and setup**:
   ```bash
   git clone <repository>
   cd PrimeAgents
   ```

2. **Start with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Manual Setup

1. **Database Setup**:
   ```bash
   cd database
   python setup.py --with-data
   ```

2. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```

3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Deployment

### Railway (Recommended)

Follow the [Railway Deployment Guide](RAILWAY_DEPLOY.md) for quick deployment.

### Docker

Each service has its own Dockerfile for containerized deployment.

## Features

- 🤖 **AI Agent Catalog** - Browse and discover AI agents
- 🏷️ **Categories** - Organized by use case
- ⭐ **Reviews & Ratings** - Community feedback
- 🔍 **Search & Filters** - Find the perfect agent
- 📱 **Responsive Design** - Works on all devices
- 🚀 **Easy Deployment** - Ready for Railway/Docker

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: Next.js, React, Tailwind CSS
- **Database**: PostgreSQL
- **Deployment**: Railway, Docker
- **Development**: Docker Compose

## API Documentation

When running locally, visit http://localhost:8000/docs for interactive API documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with Docker Compose
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
