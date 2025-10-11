#!/bin/bash

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API endpoint
API_URL="http://185.149.192.60:3001/api/v1/auth/login"
# Origin to use for testing
TEST_ORIGIN="http://0.0.0.0:3000"
# Cookie jar for storing cookies
COOKIE_JAR="./cors_test_cookies.txt"

echo -e "${YELLOW}Testing CORS with credentials for origin: ${TEST_ORIGIN}${NC}"
echo -e "${YELLOW}API endpoint: ${API_URL}${NC}"
echo

# Step 1: Test OPTIONS request (preflight)
echo -e "${YELLOW}Step 1: Testing preflight OPTIONS request...${NC}"
echo

OPTIONS_OUTPUT=$(curl -s -i -X OPTIONS \
  -H "Origin: ${TEST_ORIGIN}" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Accept" \
  "${API_URL}")

# Extract CORS headers
ALLOW_ORIGIN=$(echo "$OPTIONS_OUTPUT" | grep -i "Access-Control-Allow-Origin" | head -n 1)
ALLOW_CREDENTIALS=$(echo "$OPTIONS_OUTPUT" | grep -i "Access-Control-Allow-Credentials" | head -n 1)
ALLOW_METHODS=$(echo "$OPTIONS_OUTPUT" | grep -i "Access-Control-Allow-Methods" | head -n 1)
ALLOW_HEADERS=$(echo "$OPTIONS_OUTPUT" | grep -i "Access-Control-Allow-Headers" | head -n 1)

# Check for wildcard with credentials
if [[ "$ALLOW_ORIGIN" == *"*"* ]] && [[ "$ALLOW_CREDENTIALS" == *"true"* ]]; then
  echo -e "${RED}ERROR: Server is using wildcard (*) for Access-Control-Allow-Origin while also setting Access-Control-Allow-Credentials: true${NC}"
  echo -e "${RED}This is not allowed by browsers for security reasons. The server must specify an exact origin.${NC}"
else
  # Check for specific headers
  if [[ -z "$ALLOW_ORIGIN" ]]; then
    echo -e "${RED}ERROR: Missing Access-Control-Allow-Origin header${NC}"
  else
    echo -e "${GREEN}✓ ${ALLOW_ORIGIN}${NC}"
  fi
  
  if [[ -z "$ALLOW_CREDENTIALS" ]]; then
    echo -e "${RED}ERROR: Missing Access-Control-Allow-Credentials header${NC}"
  else
    echo -e "${GREEN}✓ ${ALLOW_CREDENTIALS}${NC}"
  fi
  
  if [[ -z "$ALLOW_METHODS" ]]; then
    echo -e "${RED}ERROR: Missing Access-Control-Allow-Methods header${NC}"
  else
    echo -e "${GREEN}✓ ${ALLOW_METHODS}${NC}"
  fi
  
  if [[ -z "$ALLOW_HEADERS" ]]; then
    echo -e "${RED}ERROR: Missing Access-Control-Allow-Headers header${NC}"
  else
    echo -e "${GREEN}✓ ${ALLOW_HEADERS}${NC}"
  fi
fi

echo
echo -e "${YELLOW}Step 2: Testing actual POST request with credentials...${NC}"
echo

# Clean up any existing cookie jar
rm -f "$COOKIE_JAR"

# Make the actual request
POST_OUTPUT=$(curl -s -i -X POST \
  -H "Origin: ${TEST_ORIGIN}" \
  -H "Content-Type: application/json" \
  -c "$COOKIE_JAR" \
  -d '{"email":"john.doe@example.com","password":"Password123!"}' \
  "${API_URL}")

# Extract CORS headers from the POST response
POST_ALLOW_ORIGIN=$(echo "$POST_OUTPUT" | grep -i "Access-Control-Allow-Origin" | head -n 1)
POST_ALLOW_CREDENTIALS=$(echo "$POST_OUTPUT" | grep -i "Access-Control-Allow-Credentials" | head -n 1)
SET_COOKIE=$(echo "$POST_OUTPUT" | grep -i "Set-Cookie" | head -n 1)

echo -e "${YELLOW}POST Response CORS headers:${NC}"
if [[ -z "$POST_ALLOW_ORIGIN" ]]; then
  echo -e "${RED}ERROR: Missing Access-Control-Allow-Origin header${NC}"
else
  echo -e "${GREEN}✓ ${POST_ALLOW_ORIGIN}${NC}"
fi

if [[ -z "$POST_ALLOW_CREDENTIALS" ]]; then
  echo -e "${RED}ERROR: Missing Access-Control-Allow-Credentials header${NC}"
else
  echo -e "${GREEN}✓ ${POST_ALLOW_CREDENTIALS}${NC}"
fi

if [[ -z "$SET_COOKIE" ]]; then
  echo -e "${RED}ERROR: No cookies were set${NC}"
else
  echo -e "${GREEN}✓ ${SET_COOKIE}${NC}"
fi

echo
echo -e "${YELLOW}Cookies stored in ${COOKIE_JAR}:${NC}"
if [ -f "$COOKIE_JAR" ]; then
  cat "$COOKIE_JAR"
else
  echo -e "${RED}No cookies were saved${NC}"
fi

echo
echo -e "${YELLOW}Response body:${NC}"
echo "$POST_OUTPUT" | sed -n '/^\r$/,$p' | tail -n +2
echo

echo -e "${YELLOW}CORS Test Complete${NC}"
