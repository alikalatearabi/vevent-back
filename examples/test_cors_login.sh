#!/bin/bash

# This script tests CORS handling for the login endpoint by simulating
# both the preflight OPTIONS request and the actual POST login request

# API base URL 
API_BASE="http://185.149.192.60:3001/api"

# User credentials
EMAIL="john.doe@example.com"
PASSWORD="Password123!"

# Cookie jar file
COOKIE_JAR="./cookies.txt"

# Test origin (change this to match your frontend origin)
TEST_ORIGIN="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== CORS TEST FOR LOGIN ENDPOINT =====${NC}"
echo -e "Testing API endpoint: ${GREEN}$API_BASE/auth/login${NC}"
echo -e "From origin: ${GREEN}$TEST_ORIGIN${NC}"
echo

# Step 1: Test preflight OPTIONS request
echo -e "${YELLOW}STEP 1: Testing preflight OPTIONS request...${NC}"
echo "This simulates the browser's preflight check before the actual login request"
echo

# Storing full response headers to examine
PREFLIGHT_RESP="/tmp/cors_preflight_resp.txt"

curl -i -X OPTIONS \
  -H "Origin: $TEST_ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Accept" \
  "$API_BASE/auth/login" > $PREFLIGHT_RESP 2>&1

# Check for CORS headers in response
echo
echo -e "${YELLOW}Checking preflight response headers:${NC}"
ALLOW_ORIGIN=$(grep -i "Access-Control-Allow-Origin" $PREFLIGHT_RESP)
ALLOW_METHODS=$(grep -i "Access-Control-Allow-Methods" $PREFLIGHT_RESP)
ALLOW_HEADERS=$(grep -i "Access-Control-Allow-Headers" $PREFLIGHT_RESP)
ALLOW_CREDENTIALS=$(grep -i "Access-Control-Allow-Credentials" $PREFLIGHT_RESP)

if [ -n "$ALLOW_ORIGIN" ]; then
    echo -e "${GREEN}✓${NC} $ALLOW_ORIGIN"
else
    echo -e "${RED}✗ Missing Access-Control-Allow-Origin header${NC}"
fi

if [ -n "$ALLOW_METHODS" ]; then
    echo -e "${GREEN}✓${NC} $ALLOW_METHODS"
else
    echo -e "${RED}✗ Missing Access-Control-Allow-Methods header${NC}"
fi

if [ -n "$ALLOW_HEADERS" ]; then
    echo -e "${GREEN}✓${NC} $ALLOW_HEADERS"
else
    echo -e "${RED}✗ Missing Access-Control-Allow-Headers header${NC}"
fi

if [ -n "$ALLOW_CREDENTIALS" ]; then
    echo -e "${GREEN}✓${NC} $ALLOW_CREDENTIALS"
else
    echo -e "${RED}✗ Missing Access-Control-Allow-Credentials header${NC}"
fi

echo
echo -e "${YELLOW}STEP 2: Testing actual login POST request...${NC}"
echo "This simulates the actual login request with credentials"
echo

# Storing full response headers to examine
LOGIN_RESP="/tmp/cors_login_resp.txt"

# Delete cookie jar if exists
rm -f $COOKIE_JAR

# Make the actual login request
curl -i -v \
  -H "Origin: $TEST_ORIGIN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -c $COOKIE_JAR \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  "$API_BASE/auth/login" > $LOGIN_RESP 2>&1

# Check for CORS headers and cookies
echo
echo -e "${YELLOW}Checking login response:${NC}"
ALLOW_ORIGIN=$(grep -i "Access-Control-Allow-Origin" $LOGIN_RESP)
ALLOW_CREDENTIALS=$(grep -i "Access-Control-Allow-Credentials" $LOGIN_RESP)
SET_COOKIE=$(grep -i "Set-Cookie" $LOGIN_RESP)

if [ -n "$ALLOW_ORIGIN" ]; then
    echo -e "${GREEN}✓${NC} $ALLOW_ORIGIN"
else
    echo -e "${RED}✗ Missing Access-Control-Allow-Origin header${NC}"
fi

if [ -n "$ALLOW_CREDENTIALS" ]; then
    echo -e "${GREEN}✓${NC} $ALLOW_CREDENTIALS"
else
    echo -e "${RED}✗ Missing Access-Control-Allow-Credentials header${NC}"
fi

if [ -n "$SET_COOKIE" ]; then
    echo -e "${GREEN}✓${NC} Cookie received: $SET_COOKIE"
else
    echo -e "${RED}✗ No cookies were set${NC}"
fi

# Check if any cookies were saved
if [ -f "$COOKIE_JAR" ]; then
    echo
    echo -e "${YELLOW}Cookies saved to $COOKIE_JAR:${NC}"
    cat $COOKIE_JAR
else
    echo
    echo -e "${RED}No cookies were saved to the cookie jar${NC}"
fi

echo
echo -e "${YELLOW}Full response body:${NC}"
sed -n '/^\r$/,$p' $LOGIN_RESP | tail -n +2

echo
echo -e "${YELLOW}===== END OF TEST =====${NC}"
echo "For detailed debug information, check:"
echo "- Preflight response: $PREFLIGHT_RESP"
echo "- Login response: $LOGIN_RESP"
