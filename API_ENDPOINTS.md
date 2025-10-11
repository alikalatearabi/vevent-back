# All 4 APIs - cURL Commands

## 1. GET /api/v1/exhibitors ✅
**List all exhibitors**

```bash
curl -X GET http://185.149.192.60:3001/api/v1/exhibitors
```

**With pagination and filters:**
```bash
curl -X GET "http://185.149.192.60:3001/api/v1/exhibitors?page=1&limit=10&sponsor=true&q=tech"
```

**Response:**
```json
{
  "data": [
    {
      "id": "exhibitor-id",
      "name": "tech-company",
      "title": "Tech Company Inc.",
      "description": "Leading technology solutions",
      "website": "https://techcompany.com",
      "location": "Hall A, Booth 42",
      "sponsor": false,
      "favoriteCount": 5,
      "createdAt": "2025-10-10T16:02:36.967Z"
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

## 2. GET /api/v1/products ✅
**List all products**

```bash
curl -X GET http://185.149.192.60:3001/api/v1/products
```

**With filters:**
```bash
curl -X GET "http://185.149.192.60:3001/api/v1/products?page=1&limit=10&q=widget&exhibitorId=EXHIBITOR_ID"
```

**Response:**
```json
{
  "data": [
    {
      "id": "product-id",
      "exhibitorId": "exhibitor-id",
      "name": "Smart Widget Pro",
      "description": "Advanced smart widget",
      "price": "299.99",
      "createdAt": "2025-10-10T16:02:37.489Z"
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

## 3. GET /api/v1/events ✅
**List all events (Latest activities)**

```bash
curl -X GET http://185.149.192.60:3001/api/v1/events
```

**With filters:**
```bash
curl -X GET "http://185.149.192.60:3001/api/v1/events?page=1&limit=10&published=true&upcoming=true"
```

**Response:**
```json
{
  "data": [
    {
      "id": "event-id",
      "name": "tech-conference-2025",
      "title": "Tech Conference 2025",
      "description": "Annual technology conference",
      "start": "2025-11-15T10:00:00.000Z",
      "end": "2025-11-15T18:00:00.000Z",
      "location": "Convention Center",
      "timezone": "Asia/Tehran",
      "published": true,
      "color": "#3B82F6"
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

## 4. GET /api/v1/users/me/events ✅ **NEW!**
**User's calendar - events user created or registered for**

```bash
curl -X GET http://185.149.192.60:3001/api/v1/users/me/events \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "data": [
    {
      "id": "event-id-1",
      "name": "my-event",
      "title": "My Event",
      "description": "Event I created",
      "start": "2025-11-15T10:00:00.000Z",
      "end": "2025-11-15T18:00:00.000Z",
      "location": "Convention Center",
      "timezone": "Asia/Tehran",
      "published": true,
      "color": "#3B82F6",
      "userRole": "creator",
      "registrationDate": "2025-10-10T16:02:34.890Z"
    },
    {
      "id": "event-id-2",
      "name": "conference-2025",
      "title": "Conference 2025",
      "description": "Event I registered for",
      "start": "2025-12-01T09:00:00.000Z",
      "end": "2025-12-01T17:00:00.000Z",
      "location": "Hotel Ballroom",
      "timezone": "Asia/Tehran",
      "published": true,
      "color": "#10B981",
      "userRole": "attendee",
      "registrationDate": "2025-10-11T08:30:15.123Z"
    }
  ],
  "meta": {
    "total": 2,
    "created": 1,
    "registered": 1
  }
}
```

---

## Complete Test Flow

### 1. First, login to get a token:

```bash
TOKEN=$(curl -s -X POST http://185.149.192.60:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  | jq -r '.accessToken')

echo "Token: $TOKEN"
```

### 2. Test all 4 endpoints:

```bash
# 1. Get exhibitors
echo "=== EXHIBITORS ==="
curl -s http://185.149.192.60:3001/api/v1/exhibitors | jq .

# 2. Get products
echo "=== PRODUCTS ==="
curl -s http://185.149.192.60:3001/api/v1/products | jq .

# 3. Get events
echo "=== EVENTS ==="
curl -s http://185.149.192.60:3001/api/v1/events | jq .

# 4. Get user calendar (requires auth)
echo "=== USER CALENDAR ==="
curl -s http://185.149.192.60:3001/api/v1/users/me/events \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## API Features

### Public APIs (No Auth Required)
- ✅ `/api/v1/exhibitors` - Browse exhibitors
- ✅ `/api/v1/products` - Browse products  
- ✅ `/api/v1/events` - Browse events

### Protected APIs (Auth Required)
- ✅ `/api/v1/users/me/events` - Personal calendar

### User Calendar Features
- **Events created by user** (userRole: "creator")
- **Events user registered for** (userRole: "attendee")
- **Sorted by start date**
- **Duplicates removed** (if user created and registered)
- **Metadata** with counts of created vs registered events

---

## Deploy to Test

Update your server:

```bash
cd /home/vevent-back
git pull origin main
docker compose up -d --build
```

Then test all 4 APIs! 🚀
