# Tích Hợp Admin Backend API Vào UI - Hoàn Thành

## Tổng Quan

Đã tích hợp thành công admin backend API vào UI. Tất cả các endpoints đã được kết nối và sẵn sàng để test.

## Các Thay Đổi Đã Thực Hiện

### 1. Cập Nhật Service Files

#### `src/admin/services/ordersService.js`
- ✅ Sửa `listOrders()` để hỗ trợ cả hai response formats:
  - `{ success: true, items: [...], pagination: {...} }`
  - `{ success: true, data: { orders: [...], pagination: {...} } }`

#### `src/admin/services/customersService.js`
- ✅ Sửa `listCustomers()` để hỗ trợ cả hai response formats:
  - `{ success: true, items: [...], pagination: {...} }`
  - `{ success: true, data: { customers: [...], pagination: {...} } }`

#### `src/admin/services/productsService.js`
- ✅ Cập nhật `normalizeUiProduct()` để hỗ trợ cả hai field name formats:
  - `{ name, price, stock }` (format mới)
  - `{ products_name, products_price, products_stock }` (format cũ từ database)

### 2. Cập Nhật API Client

#### `src/admin/api/config.js`
- ✅ Hỗ trợ cả Next.js (`process.env.NEXT_PUBLIC_*`) và Vite (`import.meta.env.VITE_*`)
- ✅ Tự động detect dev/prod mode
- ✅ Fallback về `http://localhost:3001/admin` trong production

#### `src/admin/api/client.js`
- ✅ Sử dụng `getApiBaseUrl()` để tự động resolve baseURL
- ✅ Trong dev mode: dùng relative path `/admin` để đi qua Next.js rewrites
- ✅ Trong prod mode: dùng absolute URL từ config

### 3. Cấu Hình Next.js

#### `next.config.ts`
- ✅ Thêm `rewrites()` để proxy `/admin/*` requests đến gateway (`http://localhost:3001/admin`)
- ✅ Hỗ trợ environment variable `NEXT_PUBLIC_API_URL` để override gateway URL

## Cách Test

### 1. Khởi Động Services

```bash
# Đảm bảo Docker containers đang chạy
cd ecommerce-backend
docker-compose up -d

# Khởi động Next.js dev server
npm run dev
```

### 2. Test Login

1. Mở browser: `http://localhost:3000/admin/login`
2. Đăng nhập với:
   - Email: `admin@gmail.com`
   - Password: `19122003`
3. Kiểm tra xem có redirect đến `/admin` không

### 3. Test Các Pages

#### Products Page (`/admin/products`)
- ✅ Kiểm tra xem danh sách sản phẩm có load được không
- ✅ Kiểm tra pagination
- ✅ Kiểm tra search và filter

#### Orders Page (`/admin/orders`)
- ✅ Kiểm tra xem danh sách đơn hàng có load được không
- ✅ Kiểm tra pagination
- ✅ Kiểm tra filter theo status

#### Customers Page (`/admin/customers`)
- ✅ Kiểm tra xem danh sách khách hàng có load được không
- ✅ Kiểm tra pagination
- ✅ Kiểm tra search

#### Dashboard (`/admin`)
- ✅ Kiểm tra xem metrics có load được không
- ✅ Kiểm tra xem recent orders có hiển thị không
- ✅ Kiểm tra xem top products có hiển thị không

### 4. Kiểm Tra Console Logs

Mở browser DevTools (F12) và kiểm tra:
- ✅ Không có CORS errors
- ✅ API requests đều thành công (200 OK)
- ✅ Response data được parse đúng
- ✅ Không có lỗi JavaScript

### 5. Kiểm Tra Network Tab

Trong DevTools > Network:
- ✅ Tất cả requests đến `/admin/*` đều đi qua Next.js rewrites
- ✅ Headers có `Authorization: Bearer <token>` đúng
- ✅ Response format đúng như mong đợi

## Troubleshooting

### Lỗi CORS
- ✅ Đã fix bằng cách dùng Next.js rewrites thay vì gọi trực tiếp đến gateway
- ✅ Trong dev mode, tất cả requests đi qua `/admin` và được proxy bởi Next.js

### Lỗi 401 Unauthorized
- Kiểm tra xem token có được lưu trong localStorage không:
  ```javascript
  localStorage.getItem('fastcart:token')
  ```
- Kiểm tra xem token có được gửi trong headers không (xem Network tab)

### Lỗi 404 Not Found
- Kiểm tra xem gateway có đang chạy không: `http://localhost:3001/admin/health`
- Kiểm tra xem Next.js rewrites có hoạt động không (xem Network tab, requests phải đi đến gateway)

### Data Không Hiển Thị
- Kiểm tra console logs để xem response format
- Kiểm tra xem service functions có parse đúng response không
- Kiểm tra xem normalize functions có map đúng fields không

## Files Đã Thay Đổi

1. `src/admin/services/ordersService.js` - Parse response format
2. `src/admin/services/customersService.js` - Parse response format
3. `src/admin/services/productsService.js` - Normalize field names
4. `src/admin/api/config.js` - Hỗ trợ Next.js env vars
5. `src/admin/api/client.js` - Sử dụng getApiBaseUrl()
6. `next.config.ts` - Thêm rewrites cho API proxy

## Kết Luận

Tất cả các thay đổi đã hoàn thành. UI đã được tích hợp với admin backend API và sẵn sàng để test. Nếu có lỗi gì, hãy kiểm tra console logs và network tab để debug.





