# PrimeAgents Deployment Guide

This guide explains how to deploy PrimeAgents on Railway.

## Prerequisites

1. Railway account ([railway.app](https://railway.app))
2. GitHub repository with your code
3. Railway CLI (optional but recommended)

## Deployment Steps

### 1. Install Railway CLI (Optional)

```bash
npm install -g @railway/cli
railway login
```

### 2. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your PrimeAgents repository

### 3. Set up PostgreSQL Database

1. In your Railway project, click "New Service"
2. Choose "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL instance
4. Note the connection details from the "Variables" tab

### 4. Deploy Backend

1. Create a new service for backend:
   - Click "New Service" → "GitHub Repo"
   - Set root directory to `/backend`
   - Railway will detect the Dockerfile

2. Set environment variables:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   SECRET_KEY=your-super-secret-key-here
   FRONTEND_URL=https://your-frontend-url.railway.app
   PORT=8000
   ```

3. Deploy and wait for build to complete

### 5. Initialize Database

After backend deployment, run database initialization:

1. Go to backend service → "Settings" → "Variables"
2. Add a deploy command or run manually:
   ```bash
   python init_db.py
   ```

### 6. Deploy Frontend

1. Create a new service for frontend:
   - Click "New Service" → "GitHub Repo" 
   - Set root directory to `/frontend`
   - Railway will detect the Dockerfile

2. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```

3. Deploy and wait for build to complete

### 7. Configure Custom Domains (Optional)

1. Go to each service → "Settings" → "Domains"
2. Add custom domains if needed
3. Update CORS settings in backend config

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string (auto-provided by Railway)
- `SECRET_KEY` - JWT secret key for authentication
- `FRONTEND_URL` - Frontend URL for CORS
- `PORT` - Port number (auto-provided by Railway)

### Frontend  
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is correctly set
- Check PostgreSQL service is running
- Verify network connectivity between services

### CORS Issues
- Add frontend URL to `allowed_origins` in backend config
- Ensure FRONTEND_URL environment variable is set

### Build Failures
- Check Dockerfile syntax
- Verify all dependencies are listed in requirements.txt/package.json
- Check build logs for specific errors

## Monitoring

Railway provides built-in monitoring:
- Service metrics in dashboard
- Real-time logs
- Health check status
- Resource usage

## Scaling

Railway automatically handles:
- Horizontal scaling based on traffic
- Load balancing
- SSL certificates
- CDN for static assets

## Support

For issues:
1. Check Railway documentation
2. Review service logs
3. Contact Railway support
4. Check GitHub issues
