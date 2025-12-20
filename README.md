# TimeLite Clothing E-Commerce Platform

> Modern e-commerce platform with user management and order processing

---

## Features

| Feature                 | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| **User Authentication** | JWT-based login/register with secure password hashing |
| **Product Catalog**     | Browse products with categories and filtering         |
| **Shopping Cart**       | Add/remove items, update quantities                   |
| **Order Management**    | Create orders, view order history                     |
| **User Profile**        | View and update personal information                  |
| **Admin Dashboard**     | Manage products, orders, and users                    |

---

## Tech Stack

| Layer          | Technology                 |
| -------------- | -------------------------- |
| Frontend       | React, TypeScript          |
| Backend        | Node.js 18, Express.js     |
| Database       | MySQL 8.0                  |
| Auth           | JWT (jsonwebtoken), bcrypt |
| Validation     | Joi                        |
| Infrastructure | Docker, Docker Compose     |

---

## Setup

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

### 1. Clone Repository

```powershell
git clone https://github.com/mynh19122003/timelitecloting-website-master.git
cd timelitecloting-website-master
```

### 2. Start Backend Services

```powershell
cd ecommerce-backend
docker-compose up -d
```

### 3. Verify Services

```powershell
# Check backend health
curl http://localhost:3001/health

# Check containers
docker ps
```

### 4. Start Frontend

```powershell
cd admin-web
npm install
npm run dev
```

---

## API Endpoints

**Base URL**: `http://localhost:3001/api`

### User APIs

| Method | Endpoint                 | Auth     | Description             |
| ------ | ------------------------ | -------- | ----------------------- |
| POST   | `/users/register`        | -        | Register new user       |
| POST   | `/users/login`           | -        | Login and get JWT token |
| GET    | `/users/profile`         | Required | Get user profile        |
| PUT    | `/users/profile`         | Required | Update profile          |
| PUT    | `/users/change-password` | Required | Change password         |

### Order APIs

| Method | Endpoint          | Auth     | Description       |
| ------ | ----------------- | -------- | ----------------- |
| POST   | `/orders`         | Required | Create new order  |
| GET    | `/orders/history` | Required | Get order history |
| GET    | `/orders/:id`     | Required | Get order details |

---

## Common Commands

```powershell
# View logs
docker logs ecommerce-backend-node

# Restart backend
cd ecommerce-backend
docker-compose restart backend-node

# Stop all services
cd ecommerce-backend
docker-compose down
```

---

## Project Structure

```
timelitecloting-website-master/
|-- ecommerce-backend/          # Backend services
|   |-- backend-node/           # Node.js API server
|   |-- database/               # Database schema
|   |-- docker-compose.yml      # Container orchestration
|-- docs/                       # Documentation
|-- admin-web/                  # Admin dashboard
|-- src/                        # Frontend source code
|-- README.md                   # This file
```

---

## Documentation

See [`docs/`](docs/) folder for detailed documentation.

- [Frontend Routes Guide](docs/frontend/ROUTES_GUIDE.md)
- [Backend Setup](docs/backend/SETUP_GUIDE.md)
- [Deployment Guide](docs/deployment/DEPLOY_GUIDE.md)
- [Order API Documentation](docs/ORDER_API_DOCUMENTATION.md)

---

**Status**: Production Ready | **Tests**: 9/9 Passing
