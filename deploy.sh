#!/bin/bash
set -e

# Define colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====== VEvent Backend Deployment Script ======${NC}"

# 1. Pull latest changes
echo -e "${GREEN}Pulling latest changes from Git...${NC}"
git pull

# 2. Rebuild and restart containers with migrations
echo -e "${GREEN}Rebuilding and restarting containers with database migrations...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 3. Watch logs for a moment to ensure proper startup
echo -e "${GREEN}Watching logs to ensure proper startup (press Ctrl+C to stop watching)...${NC}"
docker-compose logs -f --tail=100 backend

echo -e "${BLUE}====== Deployment Complete ======${NC}"
echo -e "Your VEvent Backend should now be running with the database migrations applied."
