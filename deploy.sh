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

# 2. Check which docker compose command is available
if command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE="docker-compose"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
  DOCKER_COMPOSE="docker compose"
else
  echo -e "\033[0;31mNeither docker-compose nor docker compose commands are available. Please install Docker Compose.\033[0m"
  exit 1
fi

# 3. Rebuild and restart containers with migrations
echo -e "${GREEN}Rebuilding and restarting containers with database migrations...${NC}"
$DOCKER_COMPOSE -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 4. Watch logs for a moment to ensure proper startup
echo -e "${GREEN}Watching logs to ensure proper startup (press Ctrl+C to stop watching)...${NC}"
$DOCKER_COMPOSE logs -f --tail=100 backend

echo -e "${BLUE}====== Deployment Complete ======${NC}"
echo -e "Your VEvent Backend should now be running with the database migrations applied."
