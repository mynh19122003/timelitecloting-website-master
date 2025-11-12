# Admin Web Integration Guide

## Tổng quan

Admin web đã được tích hợp vào project Next.js và được bảo vệ bởi authentication middleware. Tất cả các route admin đều được bảo vệ và yêu cầu đăng nhập với quyền admin.

## Cấu trúc

### Routes Admin

Tất cả các route admin được đặt trong `app/admin/`:

- `/admin` - Dashboard chính
- `/admin/login` - Trang đăng nhập admin (không yêu cầu auth)
- `/admin/orders` - Quản lý đơn hàng
- `/admin/orders/[orderId]` - Chi tiết đơn hàng
- `/admin/products` - Quản lý sản phẩm
- `/admin/products/new` - Thêm sản phẩm mới
- `/admin/customers` - Quản lý khách hàng
- `/admin/reports` - Báo cáo
- `/admin/coupons` - Quản lý mã giảm giá
- `/admin/inbox` - Hộp thư
- `/admin/settings` - Cài đặt

### Components Admin

Các components admin được đặt trong `src/admin/`:

- `src/admin/components/` - Các component UI
- `src/admin/pages/` - Các trang admin
- `src/admin/layouts/` - Layouts cho admin
- `src/admin/services/` - Services cho admin API
- `src/admin/api/` - API client cho admin
- `src/admin/utils/` - Utilities cho admin (auth, etc.)

### Bảo mật

#### AdminAuthGuard

Component `AdminAuthGuard` (`src/admin/components/AdminAuthGuard.tsx`) bảo vệ tất cả các route admin bằng cách:

1. Kiểm tra authentication token
2. Kiểm tra token expiration
3. Verify với backend API
4. Kiểm tra admin role
5. Redirect về `/admin/login` nếu không đủ quyền

#### Auth Utils

Các utility functions trong `src/admin/utils/auth.ts`:

- `getAdminToken()` - Lấy admin token từ localStorage
- `getAdminUser()` - Lấy thông tin admin user
- `setAdminAuth()` - Set authentication state
- `clearAdminAuth()` - Clear authentication
- `isAdminAuthenticated()` - Kiểm tra authentication status
- `isAdmin()` - Kiểm tra admin role
- `isTokenExpired()` - Kiểm tra token expiration

### API Configuration

Admin API sử dụng base URL từ environment variable:

```env
NEXT_PUBLIC_ADMIN_API_URL=http://132.148.72.10:3002/admin
```

Hoặc fallback về `${API_CONFIG.BASE_URL}/admin` nếu không được set.

### Authentication Flow

1. Admin truy cập `/admin/login`
2. Nhập email và password
3. `signIn()` gọi AdminApi POST `/auth/login`
4. Token được lưu vào localStorage
5. User được redirect về `/admin`
6. `AdminAuthGuard` verify token và role
7. Nếu hợp lệ, hiển thị dashboard
8. Nếu không hợp lệ, redirect về `/admin/login`

### Environment Variables

Thêm các biến sau vào `.env.local`:

```env
# Admin API URL
NEXT_PUBLIC_ADMIN_API_URL=http://132.148.72.10:3002/admin

# Hoặc sử dụng base URL
NEXT_PUBLIC_API_URL=http://132.148.72.10:3001
```

### Dependencies

Đã thêm các dependencies cần thiết:

- `axios`: ^1.13.1 - HTTP client
- `recharts`: ^2.12.7 - Charts library cho reports

### Development

1. Chạy `npm install` để cài đặt dependencies mới
2. Set environment variables
3. Chạy `npm run dev`
4. Truy cập `http://localhost:3000/admin/login`

### Production Build

Admin routes được handle bởi Next.js App Router và sẽ được include trong static export nếu cần.

```bash
npm run build
```

### Notes

- Admin web được tích hợp hoàn toàn vào Next.js structure
- Tất cả components được chuyển đổi từ React Router sang Next.js routing
- Sidebar navigation sử dụng Next.js Link component
- Auth context và services được tích hợp với Next.js auth utils
- Tất cả routes admin đều được bảo vệ bởi AdminAuthGuard

### Troubleshooting

1. **404 khi truy cập admin routes**: Đảm bảo routes được tạo trong `app/admin/`
2. **Authentication không hoạt động**: Kiểm tra AdminApi base URL và token storage
3. **API calls fail**: Kiểm tra `NEXT_PUBLIC_ADMIN_API_URL` và CORS settings trên backend

