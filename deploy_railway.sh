#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║         🚀 AgentsPool - Railway CLI Deploy Script               ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found!${NC}"
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 1: Login to Railway${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
railway login

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 2: Initialize Railway Project${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
railway init

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 3: Add PostgreSQL Database${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Please add PostgreSQL in Railway Dashboard:${NC}"
echo "   1. Open: https://railway.app/dashboard"
echo "   2. Select your project"
echo "   3. Click: + New → Database → Add PostgreSQL"
echo ""
read -p "Press Enter after you've added PostgreSQL..."

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 4: Deploy Backend${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Deploy Backend
cd backend
echo -e "${GREEN}Deploying Backend service...${NC}"
railway up --service backend

# Set Backend environment variables
echo -e "${GREEN}Setting Backend environment variables...${NC}"
railway variables --set DATABASE_URL='${{Postgres.DATABASE_URL}}'
railway variables --set SECRET_KEY='agentspool-production-secret-key-2024'
railway variables --set PORT='8000'

echo ""
echo -e "${GREEN}✅ Backend deployed!${NC}"
echo -e "${YELLOW}Get Backend URL from dashboard and save it${NC}"
echo ""
read -p "Enter your Backend URL: " BACKEND_URL

cd ..

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 5: Deploy Frontend${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Deploy Frontend
cd frontend
echo -e "${GREEN}Deploying Frontend service...${NC}"
railway up --service frontend

# Set Frontend environment variables
echo -e "${GREEN}Setting Frontend environment variables...${NC}"
railway variables --set NEXT_PUBLIC_API_URL="$BACKEND_URL"

cd ..

echo ""
echo -e "${GREEN}✅ Frontend deployed!${NC}"
echo -e "${YELLOW}Get Frontend URL from dashboard${NC}"
echo ""
read -p "Enter your Frontend URL: " FRONTEND_URL

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 6: Update Backend CORS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd backend
echo -e "${GREEN}Setting FRONTEND_URL for CORS...${NC}"
railway variables --set FRONTEND_URL="$FRONTEND_URL"
cd ..

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 7: Import Database Schema${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${GREEN}Importing database schema...${NC}"
railway run psql \$DATABASE_URL < database_backup_20251007_151635.sql

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ DEPLOYMENT COMPLETE! ✅                     ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🎉 Your AgentsPool is now live!${NC}"
echo ""
echo -e "${BLUE}Backend API:${NC} $BACKEND_URL"
echo -e "${BLUE}Frontend:${NC} $FRONTEND_URL"
echo ""
echo -e "${YELLOW}Test your deployment:${NC}"
echo "  • Backend Health: $BACKEND_URL/health"
echo "  • API Docs: $BACKEND_URL/docs"
echo "  • Frontend: $FRONTEND_URL"
echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║  Next: Configure domain agentspool.ai (see DOMAIN_SETUP.md)     ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
