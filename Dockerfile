FROM node:20-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache openssl postgresql-client

# Copy package files
COPY package*.json ./
COPY prisma ./prisma

# Install all dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD node -e "require('http').get('http://localhost:3001/health',(r)=>{process.exit(r.statusCode===200?0:1)})"

# Start command (db push happens in docker-compose command)
CMD ["node", "dist/main.js"]
