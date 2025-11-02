#!/bin/bash

# E-commerce Backend Scaling Script for Docker Swarm

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="ecommerce"

echo -e "${BLUE}📈 E-commerce Backend Scaling Script${NC}"

# Function to scale service
scale_service() {
    local service_name=$1
    local replicas=$2
    
    echo -e "${YELLOW}Scaling ${service_name} to ${replicas} replicas...${NC}"
    docker service scale ${STACK_NAME}_${service_name}=${replicas}
    
    # Wait for service to be ready
    echo -e "${BLUE}⏳ Waiting for service to be ready...${NC}"
    docker service wait ${STACK_NAME}_${service_name}
    
    echo -e "${GREEN}✅ ${service_name} scaled to ${replicas} replicas${NC}"
}

# Function to show current status
show_status() {
    echo -e "${BLUE}📊 Current service status:${NC}"
    docker service ls | grep $STACK_NAME
}

# Main menu
while true; do
    echo -e "\n${BLUE}Choose an option:${NC}"
    echo "1. Scale Node.js backend"
    echo "2. Scale PHP backend"
    echo "3. Scale Gateway"
    echo "4. Show current status"
    echo "5. Scale all services"
    echo "6. Exit"
    
    read -p "Enter your choice (1-6): " choice
    
    case $choice in
        1)
            read -p "Enter number of Node.js replicas: " replicas
            if [[ $replicas =~ ^[0-9]+$ ]] && [ $replicas -gt 0 ]; then
                scale_service "backend-node" $replicas
            else
                echo -e "${RED}❌ Invalid number of replicas${NC}"
            fi
            ;;
        2)
            read -p "Enter number of PHP replicas: " replicas
            if [[ $replicas =~ ^[0-9]+$ ]] && [ $replicas -gt 0 ]; then
                scale_service "backend-php" $replicas
            else
                echo -e "${RED}❌ Invalid number of replicas${NC}"
            fi
            ;;
        3)
            read -p "Enter number of Gateway replicas: " replicas
            if [[ $replicas =~ ^[0-9]+$ ]] && [ $replicas -gt 0 ]; then
                scale_service "gateway" $replicas
            else
                echo -e "${RED}❌ Invalid number of replicas${NC}"
            fi
            ;;
        4)
            show_status
            ;;
        5)
            read -p "Enter number of replicas for all services: " replicas
            if [[ $replicas =~ ^[0-9]+$ ]] && [ $replicas -gt 0 ]; then
                scale_service "backend-node" $replicas
                scale_service "backend-php" $replicas
                scale_service "gateway" $replicas
            else
                echo -e "${RED}❌ Invalid number of replicas${NC}"
            fi
            ;;
        6)
            echo -e "${GREEN}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option${NC}"
            ;;
    esac
done
