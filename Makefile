.PHONY: help up down restart logs build clean prisma-migrate prisma-push prisma-generate db-shell backend-shell health

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

restart-backend: ## Restart backend service only
	docker-compose restart backend

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs only
	docker-compose logs -f backend

logs-db: ## View database logs only
	docker-compose logs -f postgres

build: ## Build all services
	docker-compose build

build-backend: ## Build backend service only
	docker-compose build backend

clean: ## Stop and remove all containers, networks, and volumes
	docker-compose down -v
	docker system prune -f

clean-all: ## Remove all containers, volumes, and images
	docker-compose down -v --rmi all
	docker system prune -af

ps: ## Show running containers
	docker-compose ps

prisma-migrate: ## Run Prisma migrations
	docker-compose exec backend npm run prisma:migrate

prisma-push: ## Push Prisma schema to database
	docker-compose exec backend npm run prisma:dbpush

prisma-generate: ## Generate Prisma Client
	docker-compose exec backend npm run prisma:generate

db-shell: ## Access PostgreSQL shell
	docker-compose exec postgres psql -U vevent -d veventdb

db-backup: ## Backup database to backup.sql
	docker-compose exec postgres pg_dump -U vevent veventdb > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Database backed up successfully"

db-restore: ## Restore database from backup.sql (Usage: make db-restore FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then echo "Please specify FILE=backup.sql"; exit 1; fi
	docker-compose exec -T postgres psql -U vevent veventdb < $(FILE)
	@echo "Database restored successfully"

backend-shell: ## Access backend container shell
	docker-compose exec backend sh

redis-cli: ## Access Redis CLI
	docker-compose exec redis redis-cli -a redispass

health: ## Check backend health
	@curl -s http://localhost:3001/health || echo "Backend is not responding"

install: ## Install dependencies locally
	npm install

dev: ## Run backend in development mode locally (without Docker)
	npm run start:dev

setup: ## Initial setup - copy .env.example to .env
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo ".env file created. Please update with your configuration."; \
	else \
		echo ".env file already exists"; \
	fi

init: setup up prisma-push ## Initialize project - setup env, start services, and push schema
	@echo "Project initialized successfully!"
	@echo "Backend: http://localhost:3000"
	@echo "API Docs: http://localhost:3000/api/docs"
	@echo "pgAdmin: http://localhost:5050"

