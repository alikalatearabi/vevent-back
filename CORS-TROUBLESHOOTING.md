# CORS and Cookie Troubleshooting Guide

## Backend Configuration Checklist

- ✅ Set proper CORS headers in main.ts
- ✅ Configure cookie options correctly for cross-origin requests
- ✅ Allow credentials in CORS configuration
- ✅ Handle preflight OPTIONS requests properly
- ✅ Set environment variables correctly

## Frontend Configuration Checklist

- Include 'credentials: "include"' in fetch requests
- Set axios.defaults.withCredentials = true for Axios
- Check that frontend origin is in the allowed CORS origins
- Ensure requests are made to the correct backend URL

## Common Issues and Solutions

### No 'Access-Control-Allow-Origin' header

If you see this error:
```
Access to fetch at 'http://localhost:3001/auth/login' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

Solution:
1. Make sure your frontend origin is included in the CORS_ORIGINS environment variable
2. Check that the CORS middleware in main.ts is working correctly
3. Try setting a specific origin instead of '*'

### Cookies not being set

If authentication works but cookies aren't being saved:
1. Check that your auth.service.ts cookie configuration is correct
2. Make sure SameSite=none and Secure=true for cross-origin contexts
3. Verify that credentials are being included in the frontend request
4. Check if your browser blocks third-party cookies

### OPTIONS preflight issues

If preflight OPTIONS requests are failing:
1. Ensure the backend correctly handles OPTIONS requests
2. Check that allowed methods and headers are properly configured
3. Add explicit handling for preflight requests

## Testing CORS Configuration

Run this command to test your CORS setup from terminal:

```bash
curl -X OPTIONS -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v http://localhost:3001/auth/login
```

You should see appropriate Access-Control headers in the response.
