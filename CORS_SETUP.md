# CORS Configuration Guide

## Overview

The VEvent Backend API has been configured to handle Cross-Origin Resource Sharing (CORS) for the Nuxt frontend.

---

## Current CORS Configuration

### Allowed Origins

The backend allows requests from:

1. **Local Development (Nuxt default):**
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`

2. **Backend (for testing):**
   - `http://localhost:3001`

3. **Production Frontend:**
   - `http://185.149.192.60:3000`
   - `http://185.149.192.60`

4. **Environment Variable:**
   - Value of `FRONTEND_URL` in `.env`

### Allowed Methods

- GET
- POST
- PUT
- PATCH
- DELETE
- OPTIONS
- HEAD

### Allowed Headers

- Content-Type
- Authorization
- X-Requested-With
- Accept
- Origin
- Access-Control-Allow-Origin
- Access-Control-Request-Method
- Access-Control-Request-Headers

### Credentials

- **Enabled:** `credentials: true`
- This allows cookies and authentication headers

---

## Setup for Nuxt Frontend

### 1. Update Your Nuxt Config

In your `nuxt.config.ts`, configure the API base URL:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: 'http://185.149.192.60:3001'
    }
  }
})
```

### 2. Making API Calls in Nuxt

**Using $fetch:**

```typescript
// In your component or composable
const { data, error } = await useFetch('/api/v1/events', {
  baseURL: 'http://185.149.192.60:3001',
  credentials: 'include', // Important for cookies
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
```

**Using axios:**

```typescript
// plugins/axios.ts
export default defineNuxtPlugin((nuxtApp) => {
  const axios = $axios.create({
    baseURL: 'http://185.149.192.60:3001',
    withCredentials: true, // Important for cookies
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  return {
    provide: {
      axios
    }
  }
})
```

### 3. Authentication with JWT

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  const token = useCookie('accessToken')
  const apiBase = 'http://185.149.192.60:3001'
  
  const login = async (email: string, password: string) => {
    const { data, error } = await useFetch('/api/v1/auth/login', {
      method: 'POST',
      baseURL: apiBase,
      credentials: 'include',
      body: {
        email,
        password
      }
    })
    
    if (data.value) {
      token.value = data.value.accessToken
    }
    
    return { data, error }
  }
  
  const fetchWithAuth = async (url: string, options = {}) => {
    return await useFetch(url, {
      baseURL: apiBase,
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        ...options.headers
      },
      ...options
    })
  }
  
  return {
    login,
    fetchWithAuth,
    token
  }
}
```

---

## Testing CORS

### Test from Browser Console

Open your Nuxt app and run this in the browser console:

```javascript
// Test GET request
fetch('http://185.149.192.60:3001/api/v1/events', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err))

// Test POST request (login)
fetch('http://185.149.192.60:3001/api/v1/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log('Login:', data))
.catch(err => console.error('Error:', err))
```

---

## Common CORS Issues & Solutions

### Issue 1: "Access-Control-Allow-Origin" header missing

**Solution:** Make sure the backend is running and CORS is enabled.

```bash
# On the server
cd /home/vevent-back
docker compose restart backend
docker compose logs -f backend
```

### Issue 2: Credentials not included

**Error:** `The value of the 'Access-Control-Allow-Credentials' header is '' which must be 'true'`

**Solution:** Add `credentials: 'include'` or `withCredentials: true` to your fetch/axios requests.

**Correct:**
```typescript
useFetch('/api/v1/events', {
  credentials: 'include' // ✅ Correct
})
```

**Incorrect:**
```typescript
useFetch('/api/v1/events') // ❌ Missing credentials
```

### Issue 3: Preflight request failing

**Error:** OPTIONS request returns 404 or 500

**Solution:** The backend automatically handles OPTIONS requests. If this fails, check:

1. Backend is running
2. Route exists
3. Check backend logs for errors

### Issue 4: Custom origin not allowed

**Error:** Origin 'http://your-custom-domain.com' has been blocked by CORS

**Solution:** Add your origin to the allowed list in `src/main.ts`:

```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://your-custom-domain.com', // Add this
  // ... other origins
];
```

Or set environment variable:
```bash
FRONTEND_URL=http://your-custom-domain.com
```

---

## Environment Variables

Update `.env` on your server:

```bash
# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Or for production
FRONTEND_URL=http://your-production-frontend.com
```

Then restart the backend:

```bash
docker compose restart backend
```

---

## Troubleshooting Checklist

When you get CORS errors, check:

- [ ] Backend is running: `docker compose ps`
- [ ] Backend logs: `docker compose logs -f backend`
- [ ] Request includes `credentials: 'include'`
- [ ] Origin is in allowed list
- [ ] Using correct backend URL (http://185.149.192.60:3001)
- [ ] No typos in API endpoints
- [ ] Headers include 'Content-Type': 'application/json'
- [ ] For authenticated requests, include Authorization header

---

## Development vs Production

### Local Development (Nuxt on localhost:3000)

```typescript
// nuxt.config.ts
runtimeConfig: {
  public: {
    apiBase: 'http://185.149.192.60:3001'
  }
}
```

### Production (Both deployed)

Update backend environment:
```bash
FRONTEND_URL=https://your-production-frontend.com
```

Update Nuxt config:
```typescript
runtimeConfig: {
  public: {
    apiBase: 'https://your-backend-api.com'
  }
}
```

---

## Testing the Fix

### 1. Restart Backend

```bash
cd /home/vevent-back
docker compose restart backend
```

### 2. Test from Nuxt

Create a test page in your Nuxt app:

```vue
<template>
  <div>
    <h1>API Test</h1>
    <button @click="testAPI">Test API Connection</button>
    <pre>{{ result }}</pre>
  </div>
</template>

<script setup>
const result = ref(null)

const testAPI = async () => {
  try {
    const data = await $fetch('/api/v1/events', {
      baseURL: 'http://185.149.192.60:3001',
      credentials: 'include'
    })
    result.value = { success: true, data }
  } catch (error) {
    result.value = { success: false, error: error.message }
  }
}
</script>
```

### 3. Check Browser Console

Look for:
- ✅ No CORS errors
- ✅ Request completes successfully
- ✅ Response data received

---

## Example API Service for Nuxt

Create `composables/useApi.ts`:

```typescript
export const useApi = () => {
  const config = useRuntimeConfig()
  const token = useCookie('accessToken')
  
  const apiBase = config.public.apiBase || 'http://185.149.192.60:3001'
  
  const apiFetch = async (url: string, options: any = {}) => {
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }
    
    return await $fetch(url, {
      baseURL: apiBase,
      credentials: 'include',
      ...options,
      headers
    })
  }
  
  return {
    // Auth
    login: (email: string, password: string) =>
      apiFetch('/api/v1/auth/login', {
        method: 'POST',
        body: { email, password }
      }),
    
    register: (data: any) =>
      apiFetch('/api/v1/auth/register', {
        method: 'POST',
        body: data
      }),
    
    // Events
    getEvents: (params?: any) =>
      apiFetch('/api/v1/events', { params }),
    
    getEvent: (id: string) =>
      apiFetch(`/api/v1/events/${id}`),
    
    createEvent: (data: any) =>
      apiFetch('/api/v1/events', {
        method: 'POST',
        body: data
      }),
    
    // Exhibitors
    getExhibitors: (params?: any) =>
      apiFetch('/api/v1/exhibitors', { params }),
    
    // Products
    getProducts: (params?: any) =>
      apiFetch('/api/v1/products', { params }),
    
    // User
    getProfile: () =>
      apiFetch('/api/v1/users/me'),
    
    getFavorites: () =>
      apiFetch('/api/v1/users/me/favorites'),
    
    addFavorite: (resourceType: string, resourceId: string) =>
      apiFetch('/api/v1/users/me/favorites', {
        method: 'POST',
        body: { resourceType, resourceId }
      })
  }
}
```

Usage in components:

```vue
<script setup>
const api = useApi()

// Get events
const { data: events } = await useAsyncData('events', () => api.getEvents())

// Login
const login = async () => {
  try {
    const result = await api.login('user@example.com', 'password')
    console.log('Logged in:', result)
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script>
```

---

## Quick Reference

### Backend CORS Settings
- Location: `src/main.ts`
- Allowed origins: localhost:3000, 185.149.192.60:3000
- Credentials: Enabled
- Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD

### Frontend Setup
- Base URL: `http://185.149.192.60:3001`
- Credentials: `include` or `withCredentials: true`
- Headers: Include `Content-Type` and `Authorization`

### Common Commands
```bash
# Restart backend
docker compose restart backend

# View logs
docker compose logs -f backend

# Test API
curl -X GET http://185.149.192.60:3001/api/v1/events
```

---

**Need more help?** Check the backend logs for specific CORS errors:
```bash
docker compose logs -f backend | grep -i cors
```

