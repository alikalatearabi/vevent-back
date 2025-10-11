#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fixing Redis configuration issue...${NC}"

# Check if the docker-compose service is running
if ! docker-compose ps redis | grep -q "Up"; then
    echo -e "${RED}Redis service is not running. Starting it...${NC}"
fi

# Stop the Redis container
echo -e "${YELLOW}Stopping the Redis container...${NC}"
docker-compose stop redis

# Optional: Clear any corrupt data
echo -e "${YELLOW}Do you want to clear Redis data to ensure clean restart? (y/n)${NC}"
read -r clear_data
if [[ "$clear_data" == "y" || "$clear_data" == "Y" ]]; then
    echo -e "${YELLOW}Clearing Redis data volume...${NC}"
    docker-compose down -v redis
    # Re-create the volume
    docker volume create vevent-back_redis-data
fi

# Start the Redis container
echo -e "${YELLOW}Starting Redis with fixed configuration...${NC}"
docker-compose up -d redis

# Check if it started successfully
sleep 5
if docker-compose ps redis | grep -q "Up"; then
    echo -e "${GREEN}Redis is now running with the fixed configuration!${NC}"
    
    # Test connection
    echo -e "${YELLOW}Testing Redis connection...${NC}"
    if docker-compose exec redis redis-cli -a "$(grep REDIS_PASSWORD .env | cut -d= -f2)" ping | grep -q "PONG"; then
        echo -e "${GREEN}Redis connection test successful!${NC}"
    else
        echo -e "${RED}Redis connection test failed. Check logs for details.${NC}"
        docker-compose logs redis
    fi
else
    echo -e "${RED}Redis failed to start. Checking logs...${NC}"
    docker-compose logs redis
fi
