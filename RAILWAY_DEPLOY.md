# 🚀 Quick Railway Deployment Guide

## Step-by-Step Deployment

### 1. Prepare Repository
```bash
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

### 2. Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your AgentsPool repository

### 3. Add PostgreSQL Database
1. In Railway dashboard: "New Service" → "Database" → "PostgreSQL"
2. Railway auto-generates connection string

### 4. Deploy Backend Service
1. "New Service" → "GitHub Repo"
2. Set **Root Directory**: `backend`
3. Add environment variables:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   SECRET_KEY=your-secret-key-here
   FRONTEND_URL=https://your-frontend.railway.app
   ```
4. Deploy automatically starts

### 5. Initialize Database
After backend deploys successfully:
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Link project: `railway link`
4. Run database setup:
   ```bash
   railway run --service backend python database/setup.py
   ```

### 6. Deploy Frontend Service  
1. "New Service" → "GitHub Repo"
2. Set **Root Directory**: `frontend`
3. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```
4. Deploy automatically starts

### 7. Update CORS Settings
After frontend deploys:
1. Copy frontend URL from Railway dashboard
2. Update backend `FRONTEND_URL` environment variable
3. Redeploy backend service

## ✅ Verification

1. **Backend Health**: Visit `https://your-backend.railway.app/health`
2. **Frontend**: Visit `https://your-frontend.railway.app`
3. **API**: Test API endpoints work correctly

## 🔧 Local Testing (Optional)

Test with Docker Compose before deploying:
```bash
docker-compose up --build
```

Visit:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📝 Important Notes

- Railway automatically handles SSL certificates
- Services auto-scale based on traffic
- Database backups are automatic
- Monitor logs in Railway dashboard
- Each service gets a unique railway.app subdomain

## 🚨 Troubleshooting

**Build Fails**: Check service logs in Railway dashboard
**CORS Errors**: Verify FRONTEND_URL is set correctly
**Database Issues**: Ensure DATABASE_URL is connected
**404 Errors**: Check root directory settings

## 💡 Pro Tips

- Use Railway CLI for faster deployments
- Set up custom domains in service settings
- Monitor resource usage in dashboard
- Use Railway's built-in metrics for optimization
