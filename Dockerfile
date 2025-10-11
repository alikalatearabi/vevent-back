# Multi-stage Dockerfile for NestJS application

# Base stage - common for all stages
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

# Dependencies stage - install all dependencies
FROM base AS dependencies
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --ignore-scripts
RUN npx prisma generate

# Development stage - for local development with hot reload
FROM base AS development
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --ignore-scripts
RUN npx prisma generate
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start:dev"]

# Builder stage - build the application
FROM base AS builder
WORKDIR /app
COPY package*.json ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# Production stage - minimal image for production
FROM base AS production
WORKDIR /app

# Copy necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Copy entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Install PostgreSQL client for health check in entrypoint script
RUN apk add --no-cache postgresql-client

# Generate Prisma Client
RUN npx prisma generate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Make sure the nestjs user can execute the entrypoint script
RUN chown nestjs:nodejs /app/docker-entrypoint.sh

USER nestjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]

