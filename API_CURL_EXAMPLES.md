# VEvent API - cURL Examples

## Base URL
```
http://185.149.192.60:3001
```

---

## Authentication Flow

### 1. User Registration

**Endpoint:** `POST /api/v1/auth/register`

**cURL Command:**
```bash
curl -X POST http://185.149.192.60:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "firstname": "John",
    "lastname": "Doe"
  }'
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstname": "John",
  "lastname": "Doe"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "f0edbc2c-e88a-44e3-9c19-8946f66052c9",
    "firstname": "John",
    "lastname": "Doe",
    "email": "user@example.com",
    "passwordHash": "$argon2id$v=19$m=65536,t=3,p=4$...",
    "role": "USER",
    "avatarAssetId": null,
    "isActive": true,
    "createdAt": "2025-10-10T16:02:31.021Z",
    "updatedAt": "2025-10-10T16:02:31.021Z",
    "deletedAt": null
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. User Login

**Endpoint:** `POST /api/v1/auth/login`

**cURL Command:**
```bash
curl -X POST http://185.149.192.60:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "f0edbc2c-e88a-44e3-9c19-8946f66052c9",
    "firstname": "John",
    "lastname": "Doe",
    "email": "user@example.com",
    "role": "USER",
    "avatarAssetId": null,
    "isActive": true,
    "createdAt": "2025-10-10T16:02:31.021Z",
    "updatedAt": "2025-10-10T16:02:31.021Z",
    "deletedAt": null
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

---

### 3. Get Current User Profile

**Endpoint:** `GET /api/v1/users/me`  
**Authentication:** Required (Bearer Token)

**cURL Command:**
```bash
curl -X GET http://185.149.192.60:3001/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Response (200 OK):**
```json
{
  "id": "f0edbc2c-e88a-44e3-9c19-8946f66052c9",
  "firstname": "John",
  "lastname": "Doe",
  "email": "user@example.com",
  "role": "USER",
  "avatarAssetId": null,
  "isActive": true,
  "createdAt": "2025-10-10T16:02:31.021Z",
  "updatedAt": "2025-10-10T16:02:31.021Z",
  "deletedAt": null
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

### 4. Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`  
**Authentication:** Required (Refresh Token via Cookie)

**cURL Command:**
```bash
curl -X POST http://185.149.192.60:3001/api/v1/auth/refresh \
  -H "Cookie: refreshToken=YOUR_REFRESH_TOKEN" \
  -c cookies.txt
```

**Response (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 5. Logout

**Endpoint:** `POST /api/v1/auth/logout`  
**Authentication:** Required (Bearer Token)

**cURL Command:**
```bash
curl -X POST http://185.149.192.60:3001/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Response (201 Created):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Complete Authentication Flow Example

### Step 1: Register a New User

```bash
curl -X POST http://185.149.192.60:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "firstname": "Jane",
    "lastname": "Smith"
  }' \
  | jq .
```

**Save the access token from response:**
```bash
# Extract token (requires jq)
TOKEN=$(curl -s -X POST http://185.149.192.60:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user'$(date +%s)'@example.com",
    "password": "SecurePass123!",
    "firstname": "Jane",
    "lastname": "Smith"
  }' | jq -r '.accessToken')

echo "Token: $TOKEN"
```

---

### Step 2: Use Token to Access Protected Endpoints

```bash
# Get user profile
curl -X GET http://185.149.192.60:3001/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN" \
  | jq .
```

---

### Step 3: Get User Favorites

```bash
curl -X GET http://185.149.192.60:3001/api/v1/users/me/favorites \
  -H "Authorization: Bearer $TOKEN" \
  | jq .
```

---

## Events API

### Get All Events (Public)

```bash
curl -X GET http://185.149.192.60:3001/api/v1/events \
  | jq .
```

**With Pagination:**
```bash
curl -X GET "http://185.149.192.60:3001/api/v1/events?page=1&limit=10" \
  | jq .
```

**Response:**
```json
{
  "data": [
    {
      "id": "fb5bab1c-9203-4eff-aef4-d0a9f4c35658",
      "name": "test-event-1760112150",
      "title": "Test Event 1760112150",
      "description": "A test event",
      "start": "2025-10-11T16:02:34.000Z",
      "end": "2025-10-11T18:02:34.000Z",
      "location": "Test Location",
      "timezone": "Asia/Tehran",
      "published": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

---

### Get Single Event by ID

```bash
curl -X GET http://185.149.192.60:3001/api/v1/events/EVENT_ID_HERE \
  | jq .
```

---

### Create Event (Authenticated)

```bash
curl -X POST http://185.149.192.60:3001/api/v1/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-awesome-event",
    "title": "My Awesome Event",
    "description": "This is an amazing event",
    "start": "2025-11-15T10:00:00Z",
    "end": "2025-11-15T18:00:00Z",
    "location": "Convention Center, Hall A",
    "timezone": "Asia/Tehran",
    "timed": true,
    "published": true
  }' \
  | jq .
```

---

### Register for Event

```bash
curl -X POST http://185.149.192.60:3001/api/v1/events/EVENT_ID/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "attendee@example.com",
    "ticketType": "VIP"
  }' \
  | jq .
```

---

## Exhibitors API

### Get All Exhibitors

```bash
curl -X GET http://185.149.192.60:3001/api/v1/exhibitors \
  | jq .
```

---

### Get Single Exhibitor

```bash
curl -X GET http://185.149.192.60:3001/api/v1/exhibitors/EXHIBITOR_ID \
  | jq .
```

---

### Create Exhibitor (Authenticated)

```bash
curl -X POST http://185.149.192.60:3001/api/v1/exhibitors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "tech-company",
    "title": "Tech Company Inc.",
    "description": "Leading technology solutions provider",
    "website": "https://techcompany.com",
    "location": "Hall B, Booth 42",
    "sponsor": false
  }' \
  | jq .
```

---

## Products API

### Get All Products

```bash
curl -X GET http://185.149.192.60:3001/api/v1/products \
  | jq .
```

---

### Create Product (Authenticated)

```bash
curl -X POST http://185.149.192.60:3001/api/v1/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "exhibitorId": "EXHIBITOR_ID_HERE",
    "name": "Smart Widget Pro",
    "description": "Advanced smart widget with AI capabilities",
    "price": 299.99
  }' \
  | jq .
```

---

## Favorites API

### Get User Favorites

```bash
curl -X GET http://185.149.192.60:3001/api/v1/users/me/favorites \
  -H "Authorization: Bearer $TOKEN" \
  | jq .
```

---

### Add Favorite

```bash
curl -X POST http://185.149.192.60:3001/api/v1/users/me/favorites \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "EVENT",
    "resourceId": "EVENT_ID_HERE"
  }' \
  | jq .
```

**Resource Types:**
- `EVENT`
- `EXHIBITOR`
- `PRODUCT`

---

### Remove Favorite

```bash
curl -X DELETE http://185.149.192.60:3001/api/v1/users/me/favorites/FAVORITE_ID \
  -H "Authorization: Bearer $TOKEN" \
  | jq .
```

---

## JavaScript/Fetch Examples for Frontend

### Register

```javascript
const register = async (email, password, firstname, lastname) => {
  const response = await fetch('http://185.149.192.60:3001/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ email, password, firstname, lastname })
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed')
  }
  
  // Save token
  localStorage.setItem('accessToken', data.accessToken)
  
  return data
}
```

---

### Login

```javascript
const login = async (email, password) => {
  const response = await fetch('http://185.149.192.60:3001/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'Login failed')
  }
  
  // Save token
  localStorage.setItem('accessToken', data.accessToken)
  
  return data
}
```

---

### Authenticated Request

```javascript
const getProfile = async () => {
  const token = localStorage.getItem('accessToken')
  
  const response = await fetch('http://185.149.192.60:3001/api/v1/users/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include'
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    throw new Error(data.message || 'Failed to get profile')
  }
  
  return data
}
```

---

### Logout

```javascript
const logout = async () => {
  const token = localStorage.getItem('accessToken')
  
  await fetch('http://185.149.192.60:3001/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include'
  })
  
  // Clear token
  localStorage.removeItem('accessToken')
  
  // Redirect to login
  window.location.href = '/login'
}
```

---

## Testing with Variables

### Complete Test Script

```bash
#!/bin/bash

API_BASE="http://185.149.192.60:3001"
EMAIL="testuser$(date +%s)@example.com"
PASSWORD="SecurePass123!"

echo "=== VEvent API Test ==="
echo ""

# 1. Register
echo "1. Registering user: $EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstname\": \"Test\",
    \"lastname\": \"User\"
  }")

echo "$REGISTER_RESPONSE" | jq .
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.accessToken')
echo ""
echo "Token: $TOKEN"
echo ""

# 2. Get Profile
echo "2. Getting user profile..."
curl -s -X GET "$API_BASE/api/v1/users/me" \
  -H "Authorization: Bearer $TOKEN" \
  | jq .
echo ""

# 3. Get Events
echo "3. Getting events..."
curl -s -X GET "$API_BASE/api/v1/events" | jq .
echo ""

# 4. Login
echo "4. Logging in..."
curl -s -X POST "$API_BASE/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }" | jq .
echo ""

echo "=== Test Complete ==="
```

---

## Important Notes

### Token Management

- **Access Token:** Valid for 15 minutes
- **Store in:** `localStorage` or secure cookie
- **Include in:** `Authorization: Bearer {token}` header
- **Refresh:** When you get 401 error

### CORS

- **Always include:** `credentials: 'include'`
- **Allowed origins:** localhost:3000, 185.149.192.60:3000

### Error Handling

**Common Status Codes:**
- `200` - OK (GET requests)
- `201` - Created (POST requests)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/expired token)
- `404` - Not Found
- `500` - Internal Server Error

---

## Postman Collection

You can import these cURL commands directly into Postman:
1. Open Postman
2. Click "Import"
3. Select "Raw text"
4. Paste any cURL command
5. Click "Import"

---

## API Documentation

Interactive API docs available at:
**http://185.149.192.60:3001/api/docs**

You can test all endpoints directly from the Swagger UI!

