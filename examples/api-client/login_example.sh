#!/bin/bash

# API base URL
API_BASE="http://185.149.192.60:3001/api/v1"

# User credentials
EMAIL="john.doe@example.com"
PASSWORD="Password123!"

# Login request
echo "Logging in as $EMAIL..."
curl -v -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  $API_BASE/auth/login

echo ""
echo "For your frontend integration, this endpoint returns:"
echo "1. User object with profile information"
echo "2. Access token for API requests"
echo "3. Sets a HTTP-only cookie with refresh token"
