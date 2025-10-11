#!/bin/bash

echo "🚀 VEvent Backend Deployment Script"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Stop containers
echo -e "${YELLOW}📦 Stopping existing containers...${NC}"
docker compose down

# Pull latest code
echo -e "${YELLOW}🔄 Pulling latest code from git...${NC}"
git pull origin main

# Rebuild containers
echo -e "${YELLOW}🔨 Building Docker images (this may take a few minutes)...${NC}"
docker compose build --no-cache backend

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker compose up -d

# Wait for backend to be healthy
echo -e "${YELLOW}⏳ Waiting for backend to be healthy...${NC}"
sleep 10

# Check backend status
if docker compose ps | grep -q "vevent-backend.*running"; then
    echo -e "${GREEN}✅ Backend is running!${NC}"
    
    # Check if backend is responding
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend health check passed!${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend is running but health check failed. Checking logs...${NC}"
        docker compose logs --tail=50 backend
    fi
else
    echo -e "${RED}❌ Backend failed to start. Showing logs:${NC}"
    docker compose logs --tail=100 backend
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "📊 Service URLs:"
echo "  - Backend API:    http://localhost:3001"
echo "  - API Docs:       http://localhost:3001/api/docs"
echo "  - Health Check:   http://localhost:3001/health"
echo "  - MinIO Console:  http://localhost:9001"
echo ""
echo "📝 Useful commands:"
echo "  - View logs:      docker compose logs -f backend"
echo "  - Restart:        docker compose restart backend"
echo "  - Stop all:       docker compose down"
echo ""
