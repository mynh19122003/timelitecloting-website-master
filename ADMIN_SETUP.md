# Admin Dashboard - Setup Guide

## 🎯 Overview

Admin dashboard được tích hợp **trực tiếp vào Next.js app** tại route `/admin`, với middleware bảo vệ authentication.

## 📂 Cấu trúc

```
app/admin/                    # Admin routes (Next.js 13+ app router)
├── layout.tsx               # Admin layout với auth guard
├── AdminProviders.tsx       # Context providers (Auth, Socket)
├── page.tsx                 # Dashboard (/)
├── login/
│   └── page.tsx            # Login page
├── orders/
│   ├── page.tsx            # Orders list
│   └── [orderId]/
│       └── page.tsx        # Order detail
├── products/
│   ├── page.tsx            # Products list
│   └── new/
│       └── page.tsx        # Add product
├── customers/
│   └── page.tsx            # Customers management
├── coupons/
│   └── page.tsx            # Coupons management
├── inbox/
│   └── page.tsx            # Live chat inbox
├── reports/
│   └── page.tsx            # Reports & analytics
└── settings/
    └── page.tsx            # Admin settings

src/admin/                   # Admin components & logic
├── components/              # Reusable components
├── pages/                   # Page components
├── layouts/                 # Dashboard layout
├── context/                 # AuthContext, SocketContext
├── services/               # API services
├── api/                    # API client
└── utils/                  # Utilities

middleware.ts                # Route protection
```

## 🔐 Authentication Flow

### 1. Middleware Protection

**File:** `middleware.ts`

- Protects all `/admin/*` routes (except `/admin/login`)
- Checks for `adminToken` cookie
- Redirects to `/admin/login` if not authenticated
- Returns 401 for API requests

### 2. Client-Side Guard

**File:** `src/admin/components/AdminAuthGuard.tsx`

- Verifies token validity
- Checks admin role
- Calls backend to verify session
- Shows loading spinner during verification

### 3. Login Process

**File:** `app/admin/login/page.tsx`

When user logs in:
1. Calls `/auth/login` API
2. Receives JWT token
3. Stores token in:
   - `localStorage` (for client-side)
   - `cookies` (for middleware)
4. Redirects to `/admin`

### 4. Logout Process

Clears:
- `localStorage` tokens
- `cookies`
- Redirects to `/admin/login`

## 🚀 Usage

### Development

1. **Start backend:**
```bash
cd ecommerce-backend
docker-compose up
# or
npm start
```

2. **Start Next.js:**
```bash
npm run dev
```

3. **Access admin:**
```
http://localhost:3000/admin
```

### Login Credentials

Create admin user in database:
```sql
INSERT INTO users (email, password, role, name, status) 
VALUES (
  'admin@example.com', 
  '$2a$10$...', -- bcrypt hash of password
  'admin',
  'Admin User',
  'active'
);
```

Or use existing backend API:
```bash
curl -X POST http://localhost:3001/api/node/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "name": "Admin",
    "role": "admin"
  }'
```

## 🔧 Configuration

### API Endpoints

**File:** `src/admin/api/config.js`

```javascript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📊 Features

### ✅ Implemented

- **Dashboard** - Overview statistics
- **Orders Management** - View, update, track orders
- **Products Management** - CRUD products
- **Customers Management** - View customer data
- **Coupons Management** - Create/edit discount codes
- **Live Chat Inbox** - Real-time customer support
- **Reports** - Analytics & insights
- **Settings** - Admin preferences

### 🔒 Security Features

- JWT token authentication
- Role-based access control (RBAC)
- Server-side middleware protection
- Client-side auth guard
- Token expiration check
- Secure cookie storage (HttpOnly optional)

## 🛠️ Customization

### Add New Admin Page

1. Create page component:
```tsx
// app/admin/analytics/page.tsx
"use client";

import dynamic from 'next/dynamic';

const Analytics = dynamic(
  () => import('../../../src/admin/pages/Analytics/Analytics'),
  { ssr: false }
);

export default function AnalyticsPage() {
  return <Analytics />;
}
```

2. Add to sidebar:
```jsx
// src/admin/components/Sidebar/Sidebar.jsx
const menuItems = [
  // ...
  { icon: 'chart', label: 'Analytics', href: '/admin/analytics' },
];
```

### Custom Middleware Logic

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Add custom auth verification
  const adminToken = request.cookies.get('adminToken')?.value;
  
  if (adminToken) {
    // Verify with backend
    // Check permissions
    // Log access
  }
  
  // ...
}
```

## 🐛 Troubleshooting

### Issue: "Unauthorized" on /admin

**Solution:**
1. Check if backend is running
2. Verify `adminToken` cookie exists (F12 > Application > Cookies)
3. Check localStorage for `admin:token`
4. Try logging in again

### Issue: Middleware redirect loop

**Solution:**
1. Clear all cookies for localhost
2. Clear localStorage
3. Hard refresh (Ctrl+Shift+R)

### Issue: "Admin not found"

**Solution:**
Create admin user in database with `role='admin'`

## 📝 API Integration

Admin uses these endpoints:

```
POST   /auth/login          - Admin login
GET    /auth/me             - Get current admin
GET    /auth/health         - Health check
GET    /admin/orders        - List orders
GET    /admin/products      - List products
GET    /admin/customers     - List customers
POST   /admin/coupons       - Create coupon
```

## 🔗 Related Files

- `middleware.ts` - Route protection
- `app/admin/layout.tsx` - Admin layout wrapper
- `src/admin/utils/auth.ts` - Auth utilities
- `src/admin/services/authService.js` - Auth API calls
- `src/admin/api/adminApi.ts` - Admin API client

## 📚 References

- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [JWT Authentication](https://jwt.io/)
- [React Context API](https://react.dev/reference/react/useContext)

