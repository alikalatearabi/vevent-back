# Nuxt Frontend Integration Guide

## Quick Start

Your Nuxt server is running on: `http://0.0.0.0:3000/`  
Your Backend API is at: `http://185.149.192.60:3001`

---

## Step 1: Configure Nuxt

Create or update `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://185.149.192.60:3001'
    }
  },
  
  // Optional: Add API proxy for development (alternative approach)
  // nitro: {
  //   devProxy: {
  //     '/api': {
  //       target: 'http://185.149.192.60:3001',
  //       changeOrigin: true
  //     }
  //   }
  // }
})
```

---

## Step 2: Create API Composable

Create `composables/useApi.ts`:

```typescript
export const useApi = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  
  // Token management
  const token = useCookie('accessToken', {
    maxAge: 60 * 15, // 15 minutes
    sameSite: 'lax'
  })
  
  // Generic fetch with auth
  const apiFetch = async <T>(url: string, options: any = {}): Promise<T> => {
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    // Add auth token if available
    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }
    
    try {
      return await $fetch<T>(url, {
        baseURL: apiBase,
        credentials: 'include',
        ...options,
        headers
      })
    } catch (error: any) {
      // Handle common errors
      if (error.statusCode === 401) {
        // Token expired, clear it
        token.value = null
        navigateTo('/login')
      }
      throw error
    }
  }
  
  return {
    // Authentication
    async login(email: string, password: string) {
      const response = await apiFetch<any>('/api/v1/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      
      if (response.accessToken) {
        token.value = response.accessToken
      }
      
      return response
    },
    
    async register(data: { email: string; password: string; firstname: string; lastname: string }) {
      const response = await apiFetch<any>('/api/v1/auth/register', {
        method: 'POST',
        body: data
      })
      
      if (response.accessToken) {
        token.value = response.accessToken
      }
      
      return response
    },
    
    async logout() {
      await apiFetch('/api/v1/auth/logout', { method: 'POST' })
      token.value = null
    },
    
    // User
    getProfile: () => apiFetch<any>('/api/v1/users/me'),
    
    getFavorites: () => apiFetch<any[]>('/api/v1/users/me/favorites'),
    
    addFavorite: (resourceType: string, resourceId: string) =>
      apiFetch('/api/v1/users/me/favorites', {
        method: 'POST',
        body: { resourceType, resourceId }
      }),
    
    removeFavorite: (id: string) =>
      apiFetch(`/api/v1/users/me/favorites/${id}`, { method: 'DELETE' }),
    
    // Events
    getEvents: (params?: any) => apiFetch<any>('/api/v1/events', { params }),
    
    getEvent: (id: string) => apiFetch<any>(`/api/v1/events/${id}`),
    
    createEvent: (data: any) =>
      apiFetch('/api/v1/events', {
        method: 'POST',
        body: data
      }),
    
    registerForEvent: (eventId: string, data: { name: string; email: string; ticketType?: string }) =>
      apiFetch(`/api/v1/events/${eventId}/register`, {
        method: 'POST',
        body: data
      }),
    
    // Exhibitors
    getExhibitors: (params?: any) => apiFetch<any>('/api/v1/exhibitors', { params }),
    
    getExhibitor: (id: string) => apiFetch<any>(`/api/v1/exhibitors/${id}`),
    
    createExhibitor: (data: any) =>
      apiFetch('/api/v1/exhibitors', {
        method: 'POST',
        body: data
      }),
    
    // Products
    getProducts: (params?: any) => apiFetch<any>('/api/v1/products', { params }),
    
    getProduct: (id: string) => apiFetch<any>(`/api/v1/products/${id}`),
    
    // Utilities
    token,
    isAuthenticated: computed(() => !!token.value)
  }
}
```

---

## Step 3: Create Test Page

Create `pages/api-test.vue`:

```vue
<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-8">API Connection Test</h1>
    
    <div class="space-y-4">
      <!-- Connection Test -->
      <div class="card p-4 bg-base-200">
        <h2 class="text-xl font-semibold mb-2">1. Connection Test</h2>
        <button @click="testConnection" class="btn btn-primary">
          Test Connection
        </button>
        <pre v-if="connectionResult" class="mt-2 p-2 bg-base-300 rounded">{{ connectionResult }}</pre>
      </div>
      
      <!-- Register Test -->
      <div class="card p-4 bg-base-200">
        <h2 class="text-xl font-semibold mb-2">2. Register Test</h2>
        <button @click="testRegister" class="btn btn-primary">
          Register Test User
        </button>
        <pre v-if="registerResult" class="mt-2 p-2 bg-base-300 rounded">{{ registerResult }}</pre>
      </div>
      
      <!-- Login Test -->
      <div class="card p-4 bg-base-200">
        <h2 class="text-xl font-semibold mb-2">3. Login Test</h2>
        <button @click="testLogin" class="btn btn-primary" :disabled="!registerResult">
          Login with Test User
        </button>
        <pre v-if="loginResult" class="mt-2 p-2 bg-base-300 rounded">{{ loginResult }}</pre>
      </div>
      
      <!-- Events Test -->
      <div class="card p-4 bg-base-200">
        <h2 class="text-xl font-semibold mb-2">4. Events Test</h2>
        <button @click="testEvents" class="btn btn-primary">
          Get Events
        </button>
        <pre v-if="eventsResult" class="mt-2 p-2 bg-base-300 rounded">{{ eventsResult }}</pre>
      </div>
      
      <!-- Profile Test -->
      <div class="card p-4 bg-base-200">
        <h2 class="text-xl font-semibold mb-2">5. Profile Test (Authenticated)</h2>
        <button @click="testProfile" class="btn btn-primary" :disabled="!loginResult">
          Get My Profile
        </button>
        <pre v-if="profileResult" class="mt-2 p-2 bg-base-300 rounded">{{ profileResult }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi()

const connectionResult = ref(null)
const registerResult = ref(null)
const loginResult = ref(null)
const eventsResult = ref(null)
const profileResult = ref(null)

const testEmail = `test${Date.now()}@example.com`

const testConnection = async () => {
  try {
    const data = await $fetch('/api/v1/events', {
      baseURL: 'http://185.149.192.60:3001',
      credentials: 'include'
    })
    connectionResult.value = { success: true, data }
  } catch (error) {
    connectionResult.value = { success: false, error: error.message }
  }
}

const testRegister = async () => {
  try {
    const data = await api.register({
      email: testEmail,
      password: 'Test123!@#',
      firstname: 'Test',
      lastname: 'User'
    })
    registerResult.value = { success: true, email: testEmail, data }
  } catch (error) {
    registerResult.value = { success: false, error: error.message }
  }
}

const testLogin = async () => {
  try {
    const data = await api.login(testEmail, 'Test123!@#')
    loginResult.value = { success: true, data }
  } catch (error) {
    loginResult.value = { success: false, error: error.message }
  }
}

const testEvents = async () => {
  try {
    const data = await api.getEvents()
    eventsResult.value = { success: true, data }
  } catch (error) {
    eventsResult.value = { success: false, error: error.message }
  }
}

const testProfile = async () => {
  try {
    const data = await api.getProfile()
    profileResult.value = { success: true, data }
  } catch (error) {
    profileResult.value = { success: false, error: error.message }
  }
}
</script>
```

---

## Step 4: Usage Examples

### Login Page Example

```vue
<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Login</h2>
        
        <form @submit.prevent="handleLogin">
          <div class="form-control">
            <label class="label">Email</label>
            <input 
              v-model="email" 
              type="email" 
              class="input input-bordered" 
              required 
            />
          </div>
          
          <div class="form-control">
            <label class="label">Password</label>
            <input 
              v-model="password" 
              type="password" 
              class="input input-bordered" 
              required 
            />
          </div>
          
          <div v-if="error" class="alert alert-error mt-4">
            {{ error }}
          </div>
          
          <div class="card-actions justify-end mt-4">
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="loading"
            >
              {{ loading ? 'Loading...' : 'Login' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  
  try {
    await api.login(email.value, password.value)
    router.push('/dashboard')
  } catch (e) {
    error.value = e.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
```

### Events List Page Example

```vue
<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-8">Events</h1>
    
    <div v-if="pending" class="flex justify-center">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    
    <div v-else-if="error" class="alert alert-error">
      Failed to load events: {{ error }}
    </div>
    
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div 
        v-for="event in events?.data" 
        :key="event.id"
        class="card bg-base-100 shadow-xl"
      >
        <div class="card-body">
          <h2 class="card-title">{{ event.title }}</h2>
          <p>{{ event.description }}</p>
          <p class="text-sm">
            {{ new Date(event.start).toLocaleString() }}
          </p>
          <div class="card-actions justify-end">
            <button 
              @click="() => router.push(`/events/${event.id}`)"
              class="btn btn-primary"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const api = useApi()
const router = useRouter()

const { data: events, pending, error } = await useAsyncData(
  'events',
  () => api.getEvents()
)
</script>
```

### Profile Page with Auth Guard

```vue
<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-8">My Profile</h1>
    
    <div v-if="profile" class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">{{ profile.firstname }} {{ profile.lastname }}</h2>
        <p><strong>Email:</strong> {{ profile.email }}</p>
        <p><strong>Role:</strong> {{ profile.role }}</p>
        <p><strong>Member since:</strong> {{ new Date(profile.createdAt).toLocaleDateString() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth' // Create this middleware
})

const api = useApi()

const { data: profile } = await useAsyncData(
  'profile',
  () => api.getProfile()
)
</script>
```

### Auth Middleware

Create `middleware/auth.ts`:

```typescript
export default defineNuxtRouteMiddleware((to, from) => {
  const api = useApi()
  
  if (!api.isAuthenticated.value) {
    return navigateTo('/login')
  }
})
```

---

## Step 5: Test the Integration

1. **Navigate to test page:**
   ```
   http://localhost:3000/api-test
   ```

2. **Run each test in order:**
   - ✅ Connection Test (should return events list)
   - ✅ Register Test (creates a test user)
   - ✅ Login Test (logs in with test user)
   - ✅ Events Test (gets events list)
   - ✅ Profile Test (gets authenticated user profile)

3. **Check browser console for:**
   - No CORS errors
   - Successful API calls
   - Token storage in cookies

---

## Troubleshooting

### CORS Error Still Appears

**Check the exact error in browser console:**

```javascript
// Open browser console and check the error
// It should tell you which origin is blocked
```

**Verify backend is updated:**

```bash
# On your backend server
cd /home/vevent-back
git pull origin main
docker compose restart backend
docker compose logs -f backend | grep -i cors
```

### Token Not Saved

**Make sure you're using credentials:**

```typescript
$fetch('/api/v1/auth/login', {
  credentials: 'include' // MUST include this
})
```

### 401 Unauthorized

**Check token is being sent:**

```typescript
// In browser console
document.cookie // Should see accessToken
```

---

## Environment Setup

Create `.env` in your Nuxt project:

```bash
NUXT_PUBLIC_API_BASE=http://185.149.192.60:3001
```

---

## Next Steps

1. ✅ Create the `composables/useApi.ts` file
2. ✅ Create the `pages/api-test.vue` page
3. ✅ Visit http://localhost:3000/api-test
4. ✅ Run all tests to verify CORS is working
5. ✅ Build your actual pages using the examples above

---

## API Base URL

Your backend is accessible at:
- **From local machine:** `http://185.149.192.60:3001`
- **From network:** `http://185.149.192.60:3001`

Always use `http://185.149.192.60:3001` as the base URL in your Nuxt app.

---

**Need Help?**

Check the backend logs for CORS-related messages:
```bash
docker compose logs -f backend
```

