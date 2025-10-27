# VEvent Backend API

NestJS backend for VEvent platform.

## Quick Start

### 1. Start Everything

```bash
docker compose up -d --build
```

That's it! This will:
- Start PostgreSQL database
- Build the backend
- Push database schema automatically
- Start the API server

### 2. Access

- **API:** http://185.149.192.60:3001
- **API Docs:** http://185.149.192.60:3001/api/docs
- **Health:** http://185.149.192.60:3001/health

## Common Commands

```bash
# Start everything
docker compose up -d

# View logs
docker compose logs -f backend

# Restart backend
docker compose restart backend

# Stop everything
docker compose down

# Stop and remove data
docker compose down -v

# Rebuild and restart
docker compose up -d --build
```

## Configuration

Edit environment variables in `docker-compose.yml`:

```yaml
JWT_SECRET: your-secret-key
JWT_REFRESH_SECRET: your-refresh-secret
DATABASE_URL: postgresql://vevent:veventpass@postgres:5432/veventdb
```

## Database

Database schema is automatically pushed on startup using `prisma db push`.

To manually update schema:
```bash
docker compose exec backend npx prisma db push
```

## Development

For local development without Docker:

```bash
npm install
npm run prisma:generate
npm run start:dev
```

## API Documentation

Full API documentation: see `API_QUICK_REFERENCE.md` and `API_CURL_EXAMPLES.md`

## Authentication

```bash
# Register
curl -X POST http://185.149.192.60:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123!","firstname":"John","lastname":"Doe"}'

# Login
curl -X POST http://185.149.192.60:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123!"}'
```

## Tech Stack

- NestJS 10
- PostgreSQL 15
- Prisma ORM
- JWT Authentication
- Docker

## License

Private
