#!/bin/bash

# E-commerce Backend Deployment Script for Docker Swarm
# BẮT BUỘC sử dụng MySQL - KHÔNG được thay thế bởi engine khác

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="ecommerce"
NETWORK_NAME="app_net"
REGISTRY_URL="your-registry.com"  # Change this to your registry

echo -e "${BLUE}🚀 Starting E-commerce Backend Deployment${NC}"

# Check if Docker Swarm is initialized
if ! docker info | grep -q "Swarm: active"; then
    echo -e "${YELLOW}⚠️  Docker Swarm not initialized. Initializing...${NC}"
    docker swarm init
fi

# Create overlay network
echo -e "${BLUE}📡 Creating overlay network...${NC}"
docker network create --driver overlay --attachable $NETWORK_NAME 2>/dev/null || echo "Network already exists"

# Build and push images
echo -e "${BLUE}🔨 Building and pushing images...${NC}"

# Build Node.js backend
echo -e "${YELLOW}Building Node.js backend...${NC}"
docker build -t $REGISTRY_URL/ecommerce-backend-node:latest ./backend-node/
docker push $REGISTRY_URL/ecommerce-backend-node:latest

# Build PHP backend
echo -e "${YELLOW}Building PHP backend...${NC}"
docker build -t $REGISTRY_URL/ecommerce-backend-php:latest ./backend-php/
docker push $REGISTRY_URL/ecommerce-backend-php:latest

# Build Gateway
echo -e "${YELLOW}Building Gateway...${NC}"
docker build -t $REGISTRY_URL/ecommerce-gateway:latest ./gateway/
docker push $REGISTRY_URL/ecommerce-gateway:latest

# Deploy stack
echo -e "${BLUE}🚀 Deploying stack...${NC}"
docker stack deploy -c docker-stack.yml $STACK_NAME

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Check service status
echo -e "${BLUE}📊 Checking service status...${NC}"
docker service ls

# Show service logs
echo -e "${BLUE}📋 Service logs:${NC}"
docker service logs ${STACK_NAME}_gateway --tail 10
docker service logs ${STACK_NAME}_backend-node --tail 10
docker service logs ${STACK_NAME}_backend-php --tail 10

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${BLUE}🌐 Services available at:${NC}"
echo -e "  - Gateway: http://localhost"
echo -e "  - phpMyAdmin: http://localhost:8080"
echo -e "  - Node.js API: http://localhost/api/node/"
echo -e "  - PHP API: http://localhost/api/php/"

echo -e "${BLUE}📝 Useful commands:${NC}"
echo -e "  - Scale services: docker service scale ${STACK_NAME}_backend-node=5"
echo -e "  - View logs: docker service logs ${STACK_NAME}_gateway"
echo -e "  - Remove stack: docker stack rm $STACK_NAME"
echo -e "  - Update service: docker service update ${STACK_NAME}_backend-node"
