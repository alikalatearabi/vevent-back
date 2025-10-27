# HTTPS Setup Guide

## Problem
The frontend is served over HTTPS (`https://veventexpo.ir`) but was trying to make API calls to the backend over HTTP (`http://185.149.192.60:3001`). This is blocked by browsers due to Mixed Content security policy.

## Solution
Configure nginx to proxy API requests from the frontend to the backend, so all requests appear to come from the same HTTPS domain.

## Implementation

### 1. Updated Backend CORS
- Added `https://veventexpo.ir` and `https://www.veventexpo.ir` to allowed origins
- Added `Cache-Control` to allowed headers

### 2. Created nginx Configuration
- Added `/api/` location block that proxies to backend
- Passes full path including `/api` to backend (backend expects `/api/v1/auth/login`)
- Includes proper CORS headers and preflight handling
- Increased `client_max_body_size` to 100M for file uploads

## Deployment Steps

### On Frontend Server (`/home/vevent-front/`)

1. **Update nginx configuration:**
```bash
cd /home/vevent-front
# Copy the new nginx.conf from backend repo
curl -o nginx.conf https://raw.githubusercontent.com/alikalatearabi/vevent-back/main/nginx.conf
```

2. **Restart nginx:**
```bash
docker compose restart nginx
# or
docker restart vevent-nginx
```

### On Backend Server (`/home/vevent-back/`)

3. **Deploy backend changes:**
```bash
cd /home/vevent-back
git pull origin main
docker compose build backend
docker compose up -d backend
```

## Frontend Changes Required

Update your frontend API base URL from:
```javascript
// OLD - HTTP direct to backend
const apiUrl = 'http://185.149.192.60:3001/api/v1'

// NEW - HTTPS through nginx proxy
const apiUrl = 'https://veventexpo.ir/api/v1'
```

## API Endpoints After Setup

All API calls should now use:
- **Base URL:** `https://veventexpo.ir/api/v1`
- **Login:** `https://veventexpo.ir/api/v1/auth/login`
- **Events:** `https://veventexpo.ir/api/v1/events`
- **Products:** `https://veventexpo.ir/api/v1/products`
- **Exhibitors:** `https://veventexpo.ir/api/v1/exhibitors`

## How It Works

1. Frontend makes HTTPS request to `https://veventexpo.ir/api/v1/auth/login`
2. Nginx receives the request and matches `/api/` location
3. Nginx passes full path to backend: `http://185.149.192.60:3001/api/v1/auth/login`
4. Backend processes request and returns response
5. Nginx forwards response back to frontend over HTTPS

## Testing

After deployment, test with:
```bash
# Should work over HTTPS
curl -X POST https://veventexpo.ir/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vevent.com","password":"Admin@123456"}'
```

## Benefits

- ✅ No Mixed Content errors
- ✅ Single domain for frontend and API
- ✅ Proper SSL/TLS encryption for API calls
- ✅ Simplified frontend configuration
- ✅ Better security (no direct backend exposure)
