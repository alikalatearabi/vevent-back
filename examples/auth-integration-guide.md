# Authentication API Integration Guide

This document provides examples of how to integrate with the vevent backend authentication API. All examples include both curl commands and JavaScript/TypeScript code for frontend integration.

## Base URL
```
http://185.149.192.60:3001/api/v1
```

## 1. Authentication Endpoints

### Login
**Endpoint:** `POST /auth/login`

**curl example:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"Password123!"}' \
  http://185.149.192.60:3001/api/v1/auth/login
```

**JavaScript/TypeScript example:**
```typescript
// Using fetch API
async function login(email: string, password: string) {
  try {
    const response = await fetch('http://185.149.192.60:3001/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: to include cookies in the request
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    
    // Store the access token in memory or secure storage
    // Don't store in localStorage for better security
    sessionStorage.setItem('accessToken', data.accessToken);
    
    // Store user data
    sessionStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Using axios
import axios from 'axios';

async function loginWithAxios(email: string, password: string) {
  try {
    const response = await axios.post(
      'http://185.149.192.60:3001/api/v1/auth/login',
      { email, password },
      { 
        withCredentials: true // Important: to include cookies in the request
      }
    );
    
    // Store the access token in memory or secure storage
    sessionStorage.setItem('accessToken', response.data.accessToken);
    
    // Store user data
    sessionStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
```

**Response:**
```json
{
  "user": {
    "id": "f6e0607a-1cb2-4c96-92cc-61e6ceba1073",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "passwordHash": "$argon2id$v=19$m=65536,t=3,p=4$...",
    "role": "USER",
    "avatarAssetId": null,
    "isActive": true,
    "createdAt": "2025-10-11T03:58:45.216Z",
    "updatedAt": "2025-10-11T03:58:45.216Z",
    "deletedAt": null
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

*Note: The server also sets an HTTP-only cookie containing the refresh token.*

### Register
**Endpoint:** `POST /auth/register`

**curl example:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"firstname":"New","lastname":"User","email":"new.user@example.com","password":"Password123!"}' \
  http://185.149.192.60:3001/api/v1/auth/register
```

**JavaScript/TypeScript example:**
```typescript
async function register(userData: { firstname: string; lastname: string; email: string; password: string }) {
  try {
    const response = await fetch('http://185.149.192.60:3001/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();
    
    // After successful registration, we already get an access token and user data
    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}
```

### Refresh Token
**Endpoint:** `POST /auth/refresh`

**curl example:**
```bash
# The refresh token is sent automatically as a cookie
curl -X POST \
  --cookie "refreshToken=your-refresh-token-from-cookie" \
  http://185.149.192.60:3001/api/v1/auth/refresh
```

**JavaScript/TypeScript example:**
```typescript
async function refreshToken() {
  try {
    const response = await fetch('http://185.149.192.60:3001/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Important for sending the HTTP-only cookie
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    // Update the access token
    sessionStorage.setItem('accessToken', data.accessToken);
    
    return data;
  } catch (error) {
    console.error('Token refresh error:', error);
    // If refresh fails, redirect to login
    window.location.href = '/login';
    throw error;
  }
}
```

### Logout
**Endpoint:** `POST /auth/logout`

**curl example:**
```bash
curl -X POST \
  --cookie "refreshToken=your-refresh-token-from-cookie" \
  http://185.149.192.60:3001/api/v1/auth/logout
```

**JavaScript/TypeScript example:**
```typescript
async function logout() {
  try {
    const response = await fetch('http://185.149.192.60:3001/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include', // Important for sending the HTTP-only cookie
    });

    // Clear local storage/session storage
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    
    return response.ok;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}
```

## 2. Making Authenticated Requests

To access protected endpoints, you need to include the access token in the Authorization header:

**curl example:**
```bash
curl -X GET \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://185.149.192.60:3001/api/v1/users/me
```

**JavaScript/TypeScript example:**
```typescript
// Helper function for authenticated requests
async function authFetch(url: string, options: RequestInit = {}) {
  const accessToken = sessionStorage.getItem('accessToken');
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });

    // If unauthorized, try to refresh the token
    if (response.status === 401) {
      try {
        await refreshToken();
        // Retry with new token
        return authFetch(url, options);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/login';
        throw refreshError;
      }
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Example: Get current user profile
async function getCurrentUser() {
  return authFetch('http://185.149.192.60:3001/api/v1/users/me');
}

// Example: Get user favorites
async function getUserFavorites() {
  return authFetch('http://185.149.192.60:3001/api/v1/users/me/favorites');
}
```

## 3. Setting Up Authentication in a React Application

Here's how you might set up authentication in a React application using context:

```tsx
// AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = sessionStorage.getItem('accessToken');
      const storedUser = sessionStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setAccessToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('http://185.149.192.60:3001/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      sessionStorage.setItem('accessToken', data.accessToken);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      
      setAccessToken(data.accessToken);
      setUser(data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      const response = await fetch('http://185.149.192.60:3001/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      sessionStorage.setItem('accessToken', data.accessToken);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      
      setAccessToken(data.accessToken);
      setUser(data.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await fetch('http://185.149.192.60:3001/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
      setAccessToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## 4. CORS Considerations

If your frontend is hosted on a different domain, you may encounter CORS issues. Make sure your backend is configured to allow requests from your frontend domain.

The backend should have a CORS configuration like this:

```typescript
app.enableCors({
  origin: 'https://your-frontend-domain.com',
  credentials: true, // Important for cookies
});
```

For local development, you might need to adjust your frontend code to handle CORS:

```typescript
// For a React app using create-react-app, add to package.json:
"proxy": "http://185.149.192.60:3001"
```
