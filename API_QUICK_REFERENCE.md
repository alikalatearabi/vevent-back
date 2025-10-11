# VEvent API - Quick Reference

**Base URL:** `http://185.149.192.60:3001`  
**API Docs:** http://185.149.192.60:3001/api/docs

---

## 🔐 Authentication Flow

### 1️⃣ Register
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstname": "John",
  "lastname": "Doe"
}

# Returns: { user: {...}, accessToken: "..." }
```

### 2️⃣ Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

# Returns: { user: {...}, accessToken: "..." }
```

### 3️⃣ Get Profile (Protected)
```bash
GET /api/v1/users/me
Authorization: Bearer YOUR_TOKEN

# Returns: { id, email, firstname, lastname, role, ... }
```

### 4️⃣ Logout
```bash
POST /api/v1/auth/logout
Authorization: Bearer YOUR_TOKEN

# Returns: { message: "Logged out successfully" }
```

---

## 📋 Quick cURL Examples

**Register:**
```bash
curl -X POST http://185.149.192.60:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123!","firstname":"John","lastname":"Doe"}'
```

**Login:**
```bash
curl -X POST http://185.149.192.60:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123!"}'
```

**Get Profile (with token):**
```bash
curl http://185.149.192.60:3001/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎯 JavaScript/Fetch Examples

**Register:**
```javascript
const data = await fetch('http://185.149.192.60:3001/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Pass123!',
    firstname: 'John',
    lastname: 'Doe'
  })
}).then(r => r.json())

// Save token: localStorage.setItem('accessToken', data.accessToken)
```

**Login:**
```javascript
const data = await fetch('http://185.149.192.60:3001/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Pass123!'
  })
}).then(r => r.json())

localStorage.setItem('accessToken', data.accessToken)
```

**Get Profile:**
```javascript
const profile = await fetch('http://185.149.192.60:3001/api/v1/users/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  },
  credentials: 'include'
}).then(r => r.json())
```

---

## 🎪 Other Endpoints

**Get Events:**
```bash
GET /api/v1/events
# Public, no auth required
```

**Get Exhibitors:**
```bash
GET /api/v1/exhibitors
# Public, no auth required
```

**Get Products:**
```bash
GET /api/v1/products
# Public, no auth required
```

**Get Favorites:**
```bash
GET /api/v1/users/me/favorites
Authorization: Bearer TOKEN
# Protected, requires auth
```

**Add Favorite:**
```bash
POST /api/v1/users/me/favorites
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "resourceType": "EVENT",
  "resourceId": "event-id-here"
}
```

---

## ⚙️ Important Settings

**CORS:** Enabled for:
- `http://localhost:3000`
- `http://185.149.192.60:3000`

**Always include:**
```javascript
credentials: 'include'  // in fetch requests
```

**Token Lifetime:**
- Access Token: 15 minutes
- Refresh Token: 7 days

**Headers Required:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN  // for protected routes
```

---

## 🚨 Error Responses

**400 - Validation Error:**
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

**401 - Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**500 - Server Error:**
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## 📝 Complete Test Flow

```bash
# 1. Register
TOKEN=$(curl -s -X POST http://185.149.192.60:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","firstname":"Test","lastname":"User"}' \
  | jq -r '.accessToken')

# 2. Get profile with token
curl http://185.149.192.60:3001/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"

# 3. Get events
curl http://185.149.192.60:3001/api/v1/events

# 4. Logout
curl -X POST http://185.149.192.60:3001/api/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔗 Links

- **API Documentation:** http://185.149.192.60:3001/api/docs
- **Full Examples:** See `API_CURL_EXAMPLES.md`
- **Nuxt Integration:** See `NUXT_INTEGRATION.md`
- **CORS Setup:** See `CORS_SETUP.md`

