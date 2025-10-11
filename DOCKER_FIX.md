# Fix: Docker Container "Cannot find module '/app/dist/main.js'"

## ✅ Problem Fixed!

The issue was that the application wasn't being properly built in the Docker container. I've fixed this with a **multi-stage Docker build**.

## 🚀 How to Deploy the Fix

On your server, run these commands:

```bash
cd /home/vevent-back

# Pull the latest code
git pull origin main

# Rebuild and restart (option 1: manual)
docker compose down
docker compose build --no-cache backend
docker compose up -d

# OR use the automated deployment script (option 2: recommended)
./deploy.sh
```

## 🔧 What Was Fixed

### **Old Dockerfile (Single-stage)**
- Build happened in one stage
- Sometimes build artifacts weren't properly copied
- Mixing build and production dependencies

### **New Dockerfile (Multi-stage) ✅**
```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --ignore-scripts
RUN npx prisma generate
COPY . .
RUN npm run build  # ✅ Explicit build step

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
RUN npm ci --only=production
RUN npx prisma generate
COPY --from=builder /app/dist ./dist  # ✅ Copy built files
CMD ["node", "dist/main.js"]
```

## ✅ Benefits of Multi-stage Build

1. **Guaranteed Build** - Build happens in isolated stage
2. **Smaller Image** - Production image doesn't include build tools
3. **Faster Deploys** - Better layer caching
4. **Clean Separation** - Build vs runtime dependencies

## 📊 Verify It's Working

After deploying, check:

```bash
# Check containers are running
docker compose ps

# Check backend logs
docker compose logs backend

# Test health endpoint
curl http://localhost:3001/health

# Test API
curl http://localhost:3001/api/v1/products
```

Expected response from health endpoint:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

## 🆘 If Still Having Issues

### Check if build completed:
```bash
docker compose logs backend | grep "Build"
```

### Rebuild from scratch:
```bash
docker compose down -v  # ⚠️ This removes volumes too
docker compose build --no-cache
docker compose up -d
```

### Check dist folder exists:
```bash
docker compose exec backend ls -la dist/
```

You should see:
```
-rw-r--r-- 1 node node  main.js
-rw-r--r-- 1 node node  main.js.map
drwxr-xr-x 2 node node  auth/
drwxr-xr-x 2 node node  products/
... etc
```

## 🎉 Your Backend is Now Fixed!

The multi-stage Docker build ensures your application is properly compiled before deployment. The `/app/dist/main.js` file will always exist in the production container.

**Use `./deploy.sh` for all future deployments!**
