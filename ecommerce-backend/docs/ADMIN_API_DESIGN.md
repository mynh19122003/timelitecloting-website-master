## Admin Web API Design (Node.js) – Aligned with existing ecommerce-backend

This document specifies the Admin API for the webadmin, mirroring the structure and conventions of `backend-node` in `src/ecommerce-backend`.

### Goals
- Consistent Express architecture: routes → controllers → services → MySQL via `mysql2` pool, JWT auth, Joi validation.
- Uniform response shape and error codes (ERR_*), same pagination and sorting patterns.
- Clear separation between user-facing APIs and admin APIs: base path `/api/admin`.

### Tech & Conventions
- Node.js ≥ 18, Express 4, mysql2/promise, jsonwebtoken HS256.
- Security middleware: helmet, CORS, express-rate-limit.
- Auth: Bearer JWT with 8h expiry; separate `ADMIN_JWT_SECRET` recommended.
- Validation: Joi schemas, `validate(schema)` middleware.
- Error shape:
  - 4xx/5xx with `{ error: 'ERR_CODE', message: '...' }`.
  - Success `{ success: true, message?, data? }`.

### Base Paths
- Admin API base: `/api/admin`
- Health: `/api/admin/health`

### Authentication & Admin Profile
- POST `/api/admin/auth/login`
  - Body: `{ email, password }`
  - 200: `{ success, message: 'Login successful', data: { admin: { id, email, name, role, status }, token } }`
  - 400: `ERR_VALIDATION_FAILED`; 401: `ERR_INVALID_CREDENTIALS`

- GET `/api/admin/auth/me` (Bearer)
  - 200: `{ success, data: { id, email, name, role, status, created_at, updated_at } }`
  - 401: `ERR_INVALID_TOKEN`

- PUT `/api/admin/auth/password` (Bearer)
  - Body: `{ currentPassword, newPassword }`
  - 200: `{ success, message: 'Password changed successfully' }`
  - 400: `ERR_VALIDATION_FAILED` or `ERR_INVALID_CURRENT_PASSWORD`

- PUT `/api/admin/auth/profile` (Bearer)
  - Body: `{ name? }`
  - 200: `{ success, message: 'Profile updated successfully', data: { id, email, name, role, status } }`

### Admin Users Management (optional, if multi-admin)
- GET `/api/admin/admin-users` (Bearer, role: super_admin)
  - Query: `page, limit, search, sortBy, sortOrder`
  - 200: `{ success, data: { admins: [...], pagination: { page, limit, total, totalPages } } }`

- POST `/api/admin/admin-users` (super_admin)
  - Body: `{ email, name, password, role }` with roles: `super_admin, manager, staff`
  - 201: `{ success, message: 'Admin created', data: { id, email, name, role, status } }`

- GET `/api/admin/admin-users/:id` (super_admin)
  - 200: `{ success, data: { id, email, name, role, status, created_at } }`

- PUT `/api/admin/admin-users/:id` (super_admin)
  - Body: `{ name?, role?, status? }`
  - 200: `{ success, message: 'Admin updated', data: {...} }`

- DELETE `/api/admin/admin-users/:id` (super_admin)
  - 200: `{ success, message: 'Admin deleted' }`

### Products (Admin)
- GET `/api/admin/products` (Bearer)
  - Query: `page=1, limit=10, search, sortBy in [name, price, created_at], sortOrder in [ASC, DESC]`
  - 200: `{ success, data: { products: [...], pagination: {...} } }`

- GET `/api/admin/products/:id` (Bearer)
  - 200: `{ success, data: { id, products_id, slug, name, description, price, stock, ... } }`
  - 404: `ERR_PRODUCT_NOT_FOUND`

- POST `/api/admin/products` (Bearer)
  - Body: `{ slug, name, description?, price, stock, image_url?, category?, ... }`
  - 201: `{ success, message: 'Product created', data: { id, products_id, ... } }`

- PUT `/api/admin/products/:id` (Bearer)
  - Body: any editable fields
  - 200: `{ success, message: 'Product updated', data: {...} }`

- DELETE `/api/admin/products/:id` (Bearer)
  - 200: `{ success, message: 'Product deleted' }`

- PATCH `/api/admin/products/:id/stock` (Bearer)
  - Body: `{ stock }`
  - 200: `{ success, message: 'Stock updated', data: { id, stock } }`

### Orders (Admin)
- GET `/api/admin/orders` (Bearer)
  - Query: `page, limit, status?, user_id?, order_id?, date_from?, date_to?`
  - 200: `{ success, data: { orders: [...], pagination } }`

- GET `/api/admin/orders/:id` (Bearer)
  - 200: `{ success, data: { id, order_id, user_id, user_name, user_address, products_name, products_items, products_price, total_price, payment_method, status, create_date, update_date } }`
  - 404: `ERR_ORDER_NOT_FOUND`

- PATCH `/api/admin/orders/:id/status` (Bearer)
  - Body: `{ status }` with allowed transitions: `pending → paid → shipped → completed` or `pending/paid → cancelled`
  - 200: `{ success, message: 'Order status updated', data: { id, status } }`

### Common Pagination
Query params:
- `page` integer ≥1 (default 1)
- `limit` integer 1..100 (default 10)
- `search` string (optional)
- `sortBy` in allowlist; `sortOrder` in `ASC|DESC`

### JWT & Roles
- Token claims: `{ adminId, email, role }`
- Roles: `super_admin`, `manager`, `staff`
- Middlewares: `authenticateToken`, `authorizeRoles('super_admin', ...)`

### Database
- Reuse existing MySQL.
- New table `admin_users`:
  - `id` INT PK AI
  - `email` VARCHAR(255) UNIQUE NOT NULL
  - `password_hash` VARCHAR(255) NOT NULL
  - `name` VARCHAR(255) NULL
  - `role` ENUM('super_admin','manager','staff') DEFAULT 'staff'
  - `status` ENUM('active','inactive') DEFAULT 'active'
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  - `reset_token` VARCHAR(128) NULL
  - `reset_token_expiry` TIMESTAMP NULL

### Service Structure (to be scaffolded)
```
admin-backend-node/
  package.json
  src/
    app.js
    config/
      database.js
      jwt.js
    middleware/
      auth.js
      validation.js
      roles.js
    controllers/
      authController.js
      productAdminController.js
      orderAdminController.js
      adminUserController.js
    services/
      adminUserService.js
      productAdminService.js
      orderAdminService.js
    routes/
      authRoutes.js
      productRoutes.js
      orderRoutes.js
      adminUserRoutes.js
```

### OpenAPI
- New spec file: `docs/admin-swagger.yml` with the endpoints above.

### Security, CORS, Rate Limiting
- Same as existing backend-node with reasonable limits.

### Gateway & Docker (follow-up)
- Gateway: route `/api/admin` → admin-backend-node service.
- Docker Compose: add `admin-backend-node` service similar to `backend-node` with shared `.env`.


