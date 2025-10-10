# VEvent Backend API

NestJS-based backend API for the VEvent platform - an event management system with exhibitors, products, and attendee management.

## Features

- 🎫 **Event Management**: Create, manage, and track events with speakers and attendees
- 🏢 **Exhibitor Management**: Manage exhibitors, sponsors, and their products
- 📦 **Product Catalog**: Product listings with assets and metadata
- 👥 **User Management**: Authentication, authorization, and user profiles
- ⭐ **Favorites & Recents**: User engagement tracking
- 🔔 **Notifications**: User notification system
- 🏷️ **Tagging System**: Tag events and exhibitors for better organization
- 📊 **Audit Logging**: Track user actions and system events
- 🔐 **JWT Authentication**: Secure authentication with access and refresh tokens
- 📚 **API Documentation**: Auto-generated Swagger/OpenAPI docs

## Tech Stack

- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **Database**: PostgreSQL 15
- **ORM**: Prisma 5
- **Cache**: Redis 7
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js 20+ (for local development)
- Docker & Docker Compose (recommended)
- PostgreSQL 15+ (if running without Docker)
- Redis 7+ (optional, for caching)

## Quick Start

### Option 1: Using Docker (Recommended)

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd vevent-back
   ```

2. **Initialize the project:**
   ```bash
   make init
   ```
   This will:
   - Copy `.env.example` to `.env`
   - Start all Docker services
   - Push database schema

3. **Access the application:**
   - API: http://localhost:3001
   - API Documentation: http://localhost:3001/api/docs
   - pgAdmin: http://localhost:5050

### Option 2: Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start PostgreSQL** (either via Docker or locally)

4. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

5. **Push database schema:**
   ```bash
   npm run prisma:dbpush
   ```

6. **Start development server:**
   ```bash
   npm run start:dev
   ```

## Available Scripts

### NPM Scripts

```bash
npm run start          # Start production server
npm run start:dev      # Start development server with hot reload
npm run build          # Build for production
npm run prisma:generate    # Generate Prisma Client
npm run prisma:dbpush      # Push schema to database
npm run prisma:migrate     # Run database migrations
```

### Make Commands (with Docker)

```bash
make help              # Show all available commands
make up                # Start all services
make down              # Stop all services
make logs              # View logs
make logs-backend      # View backend logs only
make restart           # Restart all services
make build             # Build Docker images
make clean             # Remove all containers and volumes
make prisma-migrate    # Run Prisma migrations
make prisma-push       # Push schema to database
make db-shell          # Access PostgreSQL shell
make backend-shell     # Access backend container
make health            # Check backend health
```

See [DOCKER.md](./DOCKER.md) for detailed Docker documentation.

## API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:3001/api/docs

The API documentation is automatically generated from the code and includes:
- All available endpoints
- Request/response schemas
- Authentication requirements
- Try-it-out functionality

## Project Structure

```
vevent-back/
├── src/
│   ├── auth/                 # Authentication & authorization
│   │   ├── dto/              # Login/register DTOs
│   │   ├── auth.service.ts
│   │   └── jwt.strategy.ts
│   ├── events/               # Event management
│   │   ├── dto/
│   │   ├── events.controller.ts
│   │   └── events.service.ts
│   ├── exhibitors/           # Exhibitor management
│   │   ├── dto/
│   │   ├── exhibitors.controller.ts
│   │   └── exhibitors.service.ts
│   ├── products/             # Product catalog
│   │   ├── dto/
│   │   ├── products.controller.ts
│   │   └── products.service.ts
│   ├── users/                # User management
│   │   ├── dto/
│   │   ├── users.controller.ts
│   │   └── users.service.ts
│   ├── attendees/            # Attendee management
│   ├── common/               # Shared utilities
│   │   └── guards/
│   ├── prisma/               # Prisma module
│   ├── app.module.ts         # Root module
│   └── main.ts               # Application entry point
├── prisma/
│   └── schema.prisma         # Database schema
├── docker-compose.yml        # Docker services configuration
├── Dockerfile                # Multi-stage Docker build
├── Makefile                  # Development shortcuts
└── package.json
```

## Database Schema

The application uses Prisma ORM with PostgreSQL. Key models include:

- **User**: User accounts with roles (USER/ADMIN)
- **Event**: Events with schedule, location, and speakers
- **Exhibitor**: Exhibitors and sponsors
- **Product**: Products associated with exhibitors
- **Attendee**: Event attendees and registrations
- **Favorite**: User favorites tracking
- **Recent**: Recently viewed items
- **Notification**: User notifications
- **Asset**: Media assets (images, videos, documents)
- **Tag**: Tagging system for events and exhibitors
- **RefreshToken**: JWT refresh token management
- **AuditLog**: System audit trail

See `prisma/schema.prisma` for the complete schema.

## Authentication

The API uses JWT-based authentication with access and refresh tokens:

1. **Register**: `POST /auth/register`
2. **Login**: `POST /auth/login` - Returns access token (short-lived) and refresh token (long-lived)
3. **Refresh**: `POST /auth/refresh` - Get new access token using refresh token
4. **Protected Routes**: Include `Authorization: Bearer <access_token>` header

## Environment Variables

Key environment variables (see `.env.example`):

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
```

## Docker Services

The Docker Compose setup includes:

1. **Backend (NestJS)**: Port 3001
2. **PostgreSQL**: Port 5432
3. **pgAdmin**: Port 5050 (Database management UI)
4. **Redis**: Port 6379 (Cache and session store)

## Development Workflow

1. **Make changes** to source code in `src/`
2. **Hot reload** automatically reflects changes (in dev mode)
3. **Test endpoints** using Swagger UI or API client
4. **Check logs** with `make logs-backend`
5. **Database changes**:
   - Update `prisma/schema.prisma`
   - Run `make prisma-push` (dev) or `make prisma-migrate` (production)

## Production Deployment

1. **Build production image:**
   ```bash
   docker-compose build --build-arg BUILD_TARGET=production
   ```

2. **Update environment:**
   - Set `NODE_ENV=production`
   - Update JWT secrets
   - Configure production database

3. **Run migrations:**
   ```bash
   docker-compose exec backend npm run prisma:migrate
   ```

4. **Start services:**
   ```bash
   BUILD_TARGET=production docker-compose up -d
   ```

## Troubleshooting

### Port already in use
Change ports in `.env`:
```env
PORT=3001
POSTGRES_PORT=5433
```

### Database connection failed
1. Check PostgreSQL is running: `make ps`
2. Verify DATABASE_URL in `.env`
3. Check logs: `make logs-db`

### Prisma Client not generated
```bash
make prisma-generate
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Private/Proprietary

## Support

For issues or questions, please contact the development team.

