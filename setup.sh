#!/bin/bash

# VEvent Backend Setup Script
# This script helps you get started with the VEvent backend

set -e

echo "🚀 VEvent Backend Setup"
echo "======================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please update .env with your configuration (especially JWT secrets in production)${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping...${NC}"
    echo ""
fi

# Ask user if they want to start services
read -p "Do you want to start all Docker services now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🐳 Starting Docker services..."
    docker-compose up -d
    
    echo ""
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    echo ""
    echo "📦 Pushing database schema..."
    docker-compose exec -T backend npx prisma db push --accept-data-loss
    
    echo ""
    echo -e "${GREEN}✅ Setup complete!${NC}"
    echo ""
    echo "📍 Your services are running at:"
    echo "   🔹 Backend API:      http://localhost:3000"
    echo "   🔹 API Docs:         http://localhost:3000/api/docs"
    echo "   🔹 pgAdmin:          http://localhost:5050"
    echo "   🔹 PostgreSQL:       localhost:5432"
    echo "   🔹 Redis:            localhost:6379"
    echo ""
    echo "🔧 Useful commands:"
    echo "   make logs          # View all logs"
    echo "   make logs-backend  # View backend logs"
    echo "   make down          # Stop all services"
    echo "   make help          # Show all available commands"
    echo ""
    
    # Check health
    echo "🏥 Checking backend health..."
    sleep 5
    if curl -s http://localhost:3000/health > /dev/null; then
        echo -e "${GREEN}✓ Backend is healthy!${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend health check failed. Check logs with: make logs-backend${NC}"
    fi
else
    echo ""
    echo -e "${YELLOW}Skipped starting services.${NC}"
    echo ""
    echo "To start services manually, run:"
    echo "   make up"
    echo "   make prisma-push"
fi

echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"

