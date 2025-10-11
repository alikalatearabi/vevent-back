#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get Redis password from .env or use default
if [ -f .env ]; then
  REDIS_PASSWORD=$(grep REDIS_PASSWORD .env | cut -d= -f2)
fi
REDIS_PASSWORD=${REDIS_PASSWORD:-redispass}

echo -e "${YELLOW}Testing Redis connection...${NC}"
echo "Using password: $REDIS_PASSWORD"

# Test Redis connection
if docker-compose ps redis | grep -q "Up"; then
  echo -e "${GREEN}Redis container is running${NC}"
  
  echo -e "${YELLOW}Testing Redis ping...${NC}"
  if docker-compose exec -T redis redis-cli -a "$REDIS_PASSWORD" ping | grep -q "PONG"; then
    echo -e "${GREEN}Redis ping successful!${NC}"
    
    # Test setting and getting a value
    echo -e "${YELLOW}Testing Redis set/get...${NC}"
    docker-compose exec -T redis redis-cli -a "$REDIS_PASSWORD" set test_key "It works!"
    TEST_VALUE=$(docker-compose exec -T redis redis-cli -a "$REDIS_PASSWORD" get test_key)
    
    if [[ "$TEST_VALUE" == "It works!" ]]; then
      echo -e "${GREEN}Redis set/get successful!${NC}"
      echo -e "${GREEN}Redis is working correctly.${NC}"
    else
      echo -e "${RED}Redis set/get failed. Got: $TEST_VALUE${NC}"
    fi
  else
    echo -e "${RED}Redis ping failed. Check Redis logs:${NC}"
    docker-compose logs redis
  fi
else
  echo -e "${RED}Redis container is not running${NC}"
  
  echo -e "${YELLOW}Starting Redis container...${NC}"
  docker-compose up -d redis
  
  sleep 5
  
  if docker-compose ps redis | grep -q "Up"; then
    echo -e "${GREEN}Redis started successfully. Run this script again to test connection.${NC}"
  else
    echo -e "${RED}Failed to start Redis. Check logs:${NC}"
    docker-compose logs redis
  fi
fi
