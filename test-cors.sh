#!/bin/bash

# Script to test CORS configuration for vevent-back

echo "=== CORS Test Script ==="
echo "Testing preflight OPTIONS request..."
echo

# Test preflight request
curl -X OPTIONS -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v http://localhost:3001/auth/login 2>&1 | grep -i "access-control"

echo
echo "Testing actual login request with credentials..."
echo

# Get a temporary cookie file
COOKIE_JAR=/tmp/vevent-cookie-jar.txt

# Test actual login with credentials
curl -X POST -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  -c $COOKIE_JAR \
  -v http://localhost:3001/auth/login 2>&1 | grep -i "set-cookie\|access-control"

echo
echo "Cookies received:"
cat $COOKIE_JAR

echo
echo "=== End of Test ==="
