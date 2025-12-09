# Kiểm tra Routes và CORS Configuration

## ✅ Đã cập nhật Production API

### 1. API Configuration
- ✅ `src/config/api.ts`: Đổi `PROD_API_ORIGIN` và `PROD_ADMIN_ORIGIN` sang `http://api.timeliteclothing.com`
- ✅ `src/admin/api/config.js`: Đổi `PROD_API_ORIGIN` sang `http://api.timeliteclothing.com`

### 2. CORS Configuration
- ✅ `ecommerce-backend/backend-node/src/app.js`: Thêm `http://api.timeliteclothing.com` và `https://api.timeliteclothing.com` vào CORS origins
- ✅ `ecommerce-backend/gateway/nginx.conf`: Đã có CORS cho `api.timeliteclothing.com` (cả http và https)

## 📋 Routes được generate (35 pages)

### Storefront Routes (10):
1. `/` - Home page
2. `/shop` - Shop page
3. `/cart` - Cart page
4. `/checkout` - Checkout page
5. `/profile` - Profile page
6. `/orders` - Orders page
7. `/login` - Login page
8. `/register` - Register page
9. `/forgot-password` - Forgot password page
10. `/reset-password` - Reset password page
11. `/verify-email` - Verify email page

### Error Pages (6):
1. `/400` - Bad Request
2. `/401` - Unauthorized
3. `/403` - Forbidden
4. `/404` - Not Found
5. `/502` - Bad Gateway
6. `/503` - Service Unavailable
(Note: `/500` được handle bởi `public/500.html`)

### Admin Public Routes (5):
1. `/admin/login` - Admin login
2. `/admin/signup` - Admin signup
3. `/admin/reset-password` - Admin reset password
4. `/admin/confirm-email` - Admin confirm email
5. `/admin/check-email` - Admin check email

### Admin Protected Routes (10):
1. `/admin` - Admin dashboard
2. `/admin/orders` - Admin orders list
3. `/admin/products` - Admin products list
4. `/admin/products/new` - Add new product
5. `/admin/customers` - Admin customers list
6. `/admin/customers/new` - Add new customer
7. `/admin/reports` - Admin reports
8. `/admin/coupons` - Admin coupons list
9. `/admin/coupons/new` - Add new coupon
10. `/admin/settings` - Admin settings

**Tổng: 31 routes được định nghĩa trong `app/routes.ts`**

### Dynamic Routes (handled by React Router client-side):
- `/product/:id` - Product detail page
- `/admin/orders/:orderId` - Order detail page
- `/admin/products/:id/edit` - Edit product page
- `/admin/customers/:id/edit` - Edit customer page
- `/admin/coupons/:couponId` - Coupon detail page

## ✅ CORS Configuration

### Backend Node.js (`ecommerce-backend/backend-node/src/app.js`):
```javascript
const defaultCorsOrigins = process.env.NODE_ENV === 'production' 
  ? ['http://api.timeliteclothing.com', 'https://api.timeliteclothing.com'] 
  : ['http://localhost:3000', 'http://localhost:3002'];
```

### Gateway Nginx (`ecommerce-backend/gateway/nginx.conf`):
- ✅ Hỗ trợ `http://api.timeliteclothing.com`
- ✅ Hỗ trợ `https://api.timeliteclothing.com`
- ✅ Hỗ trợ localhost cho development

## 🧪 Test CORS

### Test từ browser console:
```javascript
// Test API call
fetch('http://api.timeliteclothing.com/api/php/products?page=1&limit=10', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include'
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('CORS Error:', err));
```

### Test với curl:
```bash
# Test OPTIONS preflight
curl -X OPTIONS http://api.timeliteclothing.com/api/php/products \
  -H "Origin: http://api.timeliteclothing.com" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Test actual request
curl http://api.timeliteclothing.com/api/php/products?page=1&limit=10 \
  -H "Origin: http://api.timeliteclothing.com" \
  -v
```

## 📝 Notes

1. **Dynamic routes** không cần thêm vào `generateStaticParams()` vì chúng được handle bởi React Router trên client-side.

2. **Build output** hiển thị 35 pages vì Next.js có thể generate thêm một số pages tự động (như `_not-found`).

3. **CORS** đã được cấu hình đúng để hỗ trợ cả `http://` và `https://` cho subdomain `api.timeliteclothing.com`.

4. **Production API** đã được đổi sang `http://api.timeliteclothing.com` trong tất cả các file config.

