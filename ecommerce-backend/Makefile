# E-commerce Backend Makefile
# BẮT BUỘC sử dụng MySQL - KHÔNG được thay thế bởi engine khác

.PHONY: help build up down logs clean test test-node test-php deploy scale status

# Default target
help: ## Show this help message
	@echo "E-commerce Backend Management"
	@echo "============================="
	@echo ""
	@echo "⚠️  BẮT BUỘC sử dụng MySQL - KHÔNG được thay thế bởi engine khác"
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development commands
build: ## Build all Docker images
	@echo "🔨 Building Docker images..."
	docker-compose build

up: ## Start all services
	@echo "🚀 Starting services..."
	docker-compose up -d
	@echo "⏳ Waiting for services to be ready..."
	@sleep 30
	@echo "✅ Services started successfully!"
	@echo ""
	@echo "🌐 Services available at:"
	@echo "  - Gateway: http://localhost"
	@echo "  - phpMyAdmin: http://localhost:8080"
	@echo "  - Node.js API: http://localhost/api/node/"
	@echo "  - PHP API: http://localhost/api/php/"

down: ## Stop all services
	@echo "🛑 Stopping services..."
	docker-compose down

restart: down up ## Restart all services

logs: ## Show logs for all services
	docker-compose logs -f

logs-node: ## Show Node.js backend logs
	docker-compose logs -f backend-node

logs-php: ## Show PHP backend logs
	docker-compose logs -f backend-php

logs-mysql: ## Show MySQL logs
	docker-compose logs -f mysql

logs-gateway: ## Show Gateway logs
	docker-compose logs -f gateway

# Database commands
db-reset: ## Reset database (WARNING: This will delete all data)
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	docker-compose down -v
	docker-compose up -d mysql
	@sleep 30
	docker-compose up -d

db-backup: ## Backup database
	@echo "💾 Creating database backup..."
	docker-compose exec mysql mysqldump -u root -prootpassword ecommerce_db > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created successfully!"

db-restore: ## Restore database from backup
	@echo "📥 Available backups:"
	@ls -la *.sql 2>/dev/null || echo "No backups found"
	@read -p "Enter backup filename: " backup && \
	docker-compose exec -T mysql mysql -u root -prootpassword ecommerce_db < $$backup
	@echo "✅ Database restored successfully!"

# Testing commands
test: test-node test-php ## Run all tests

test-node: ## Run Node.js tests
	@echo "🧪 Running Node.js tests..."
	cd backend-node && npm test

test-php: ## Run PHP tests
	@echo "🧪 Running PHP tests..."
	cd backend-php && composer test

test-coverage: ## Run tests with coverage
	@echo "📊 Running tests with coverage..."
	cd backend-node && npm run test:coverage
	cd backend-php && composer test-coverage

# Production deployment commands
deploy: ## Deploy to Docker Swarm
	@echo "🚀 Deploying to Docker Swarm..."
	chmod +x deploy/deploy.sh
	./deploy/deploy.sh

scale: ## Scale services interactively
	@echo "📈 Scaling services..."
	chmod +x deploy/scale.sh
	./deploy/scale.sh

scale-node: ## Scale Node.js backend
	@read -p "Enter number of Node.js replicas: " replicas && \
	docker service scale ecommerce_backend-node=$$replicas

scale-php: ## Scale PHP backend
	@read -p "Enter number of PHP replicas: " replicas && \
	docker service scale ecommerce_backend-php=$$replicas

scale-gateway: ## Scale Gateway
	@read -p "Enter number of Gateway replicas: " replicas && \
	docker service scale ecommerce_gateway=$$replicas

# Monitoring commands
status: ## Show service status
	@echo "📊 Service Status:"
	@echo "=================="
	@docker-compose ps

status-swarm: ## Show Docker Swarm service status
	@echo "📊 Docker Swarm Service Status:"
	@echo "==============================="
	@docker service ls

health: ## Check service health
	@echo "🏥 Health Check:"
	@echo "================"
	@echo "Gateway: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost/health || echo 'DOWN')"
	@echo "Node.js: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/health || echo 'DOWN')"
	@echo "MySQL: $$(docker-compose exec mysql mysqladmin ping -h localhost 2>/dev/null && echo 'UP' || echo 'DOWN')"

# Development setup
setup: ## Initial setup for development
	@echo "⚙️  Setting up development environment..."
	@echo "📦 Installing Node.js dependencies..."
	cd backend-node && npm install
	@echo "📦 Installing PHP dependencies..."
	cd backend-php && composer install
	@echo "🐳 Building Docker images..."
	docker-compose build
	@echo "✅ Setup completed!"

# Cleanup commands
clean: ## Clean up Docker resources
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose down -v --remove-orphans
	docker system prune -f

clean-all: ## Clean up all Docker resources (WARNING: This will remove all unused containers, networks, images)
	@echo "⚠️  WARNING: This will remove all unused Docker resources!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	docker-compose down -v --remove-orphans
	docker system prune -af
	docker volume prune -f

# Documentation commands
docs: ## Generate API documentation
	@echo "📚 API Documentation available at:"
	@echo "  - Swagger UI: http://localhost/docs (if configured)"
	@echo "  - OpenAPI Spec: docs/swagger.yml"

# Environment commands
env: ## Show environment variables
	@echo "🔧 Environment Variables:"
	@echo "========================="
	@cat env.example

env-copy: ## Copy environment example to .env
	@cp env.example .env
	@echo "✅ Environment file created from example"

# Quick commands
quick-start: env-copy build up ## Quick start (copy env, build, and start)
	@echo "🚀 Quick start completed!"

quick-test: up test ## Quick test (start services and run tests)

quick-deploy: build deploy ## Quick deploy (build and deploy to swarm)

# Help for specific commands
help-build: ## Show build help
	@echo "Build Commands:"
	@echo "  make build        - Build all Docker images"
	@echo "  make build-node   - Build only Node.js backend"
	@echo "  make build-php    - Build only PHP backend"
	@echo "  make build-gateway - Build only Gateway"

help-deploy: ## Show deployment help
	@echo "Deployment Commands:"
	@echo "  make deploy       - Deploy to Docker Swarm"
	@echo "  make scale        - Scale services interactively"
	@echo "  make scale-node   - Scale Node.js backend"
	@echo "  make scale-php    - Scale PHP backend"
	@echo "  make scale-gateway - Scale Gateway"

help-test: ## Show testing help
	@echo "Testing Commands:"
	@echo "  make test         - Run all tests"
	@echo "  make test-node    - Run Node.js tests"
	@echo "  make test-php     - Run PHP tests"
	@echo "  make test-coverage - Run tests with coverage"
