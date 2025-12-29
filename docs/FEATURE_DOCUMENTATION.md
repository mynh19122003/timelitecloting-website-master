# Timelite Clothing - Feature Documentation & Refactoring Plan

> **Ngày tạo:** 2025-12-28  
> **Mục đích:** Tài liệu hóa tất cả tính năng, đánh giá code quality, và kế hoạch refactor

---

## 📊 Tổng quan đánh giá

| Nhóm             | Điểm TB    | Số tính năng |
| ---------------- | ---------- | ------------ |
| Customer Portal  | 7.2/10     | 11           |
| Admin Panel      | 6.8/10     | 4            |
| Backend Services | 7.0/10     | 4            |
| **Tổng**         | **7.0/10** | **19**       |

---

## 🛒 CUSTOMER PORTAL

### 1. Trang chủ (HomePage)

- **File:** `src/views/HomePage/`
- **Điểm:** 8/10

**Chức năng:**

- Hiển thị hero banner với text animation và call-to-action buttons
- Hiển thị 6 collections chính (Ao Dai, Vest, Wedding, Evening, Kidswear, Accessories)
- Featured products section với ProductCard hover effects
- Footer với contact info và social links

**Code cần sửa:** Không cần refactor

---

### 2. Shop/Danh mục (ShopPage)

- **File:** `src/views/ShopPage/`, `src/components/Shop/`
- **Điểm:** 7/10

**Chức năng:**

- Lấy danh sách sản phẩm từ API `/api/php/products`
- Filter theo category (Ao Dai, Vest, Wedding...) qua URL query `?category=`
- Filter theo variant (màu, loại) qua URL query `?variant=`
- Sort theo giá (tăng/giảm) và ngày tạo
- Pagination với page size 12 items
- Hiển thị loading skeleton khi fetch

**Code cần sửa:**

- [ ] Tách filter logic từ component sang custom hook `useProductFilter()`
- [ ] Query params handling nằm rải rác, cần gom vào 1 nơi

---

### 3. Chi tiết sản phẩm (ProductDetailPage)

- **File:** `src/views/ProductDetailPage/`
- **Điểm:** 7/10

**Chức năng:**

- Lấy product detail từ API theo ID hoặc slug
- Image gallery với main image + thumbnails, zoom on hover
- Chọn color từ danh sách có sẵn (hiển thị color swatches)
- Chọn size từ dropdown (S, M, L, XL, One Size)
- Hiển thị giá, mô tả sản phẩm
- "Add to Cart" button → thêm vào CartContext
- "Buy Now" button → direct checkout
- Related products section (cùng category)

**Code cần sửa:**

- [ ] Tách `ImageGallery` component ra file riêng (~150 dòng)
- [ ] Tách `ColorSizeSelector` component ra file riêng
- [ ] File hiện tại ~500 dòng, mục tiêu <250 dòng

---

### 4. Giỏ hàng (Cart)

- **File:** `src/context/CartContext.tsx`, `src/views/CartPage/`
- **Điểm:** 9/10

**Chức năng:**

- `addToCart()`: Thêm item với productId, color, size, quantity. Nếu đã có thì tăng quantity
- `removeFromCart()`: Xóa item khỏi cart theo cartItemId
- `updateQuantity()`: Thay đổi số lượng item
- `clearCart()`: Xóa toàn bộ cart
- Tính `total` và `itemCount` tự động
- Cart drawer sidebar (slide từ phải)
- Cart page full-width view

**Code cần sửa:**

- [ ] Thêm localStorage persistence để cart không mất khi refresh
- [ ] Thêm `syncWithServer()` cho logged-in users

---

### 5. Checkout ⚠️ **CẦN REFACTOR GẤP**

- **File:** `src/views/CheckoutPage/CheckoutPage.tsx`
- **Điểm:** 5/10

**Chức năng:**

- **Form khách hàng:** firstName, lastName, email, phone
- **Form địa chỉ giao hàng:** streetAddress, apartment, city, state, zipCode, country (US/CA only)
- **Shipping method:** Gọi API Shippo `/api/shipping/calculate-rates` khi có đủ city+state+zip
  - Hiển thị loading khi đang fetch rates
  - Hiển thị USPS options: Ground Advantage, Priority Mail, Priority Express
  - Fallback rates nếu API fail
- **Billing address:** Toggle "same as shipping" hoặc nhập riêng
- **Payment method:** Credit card form (card number, expiry, CVC)
- **Order summary:** Hiển thị items, subtotal, shipping cost, total
- **Submit:** Gọi API `/api/php/orders` để tạo đơn hàng

**Vấn đề hiện tại:**

- File **1711 dòng** - quá dài, khó maintain
- Shipping logic, form validation, UI rendering trộn lẫn
- 15+ useState hooks trong 1 component
- useEffect phức tạp với nhiều dependencies

**Code cần sửa:**

```
CheckoutPage.tsx (1711 dòng) → Tách thành:
├── hooks/
│   ├── useCheckoutForm.ts       (~100 dòng) - form state management
│   ├── useShippingRates.ts      (~80 dòng)  - Shippo API logic
│   └── useCheckoutValidation.ts (~100 dòng) - validation rules
├── components/
│   ├── CustomerInfoForm.tsx     (~150 dòng)
│   ├── ShippingAddressForm.tsx  (~150 dòng)
│   ├── ShippingMethodSelector.tsx (~100 dòng)
│   ├── BillingAddressForm.tsx   (~100 dòng)
│   ├── PaymentForm.tsx          (~100 dòng)
│   └── OrderSummary.tsx         (~80 dòng)
└── CheckoutPage.tsx             (~200 dòng) - composition only
```

---

### 6. Shipping Rates (Shippo Integration)

- **File:** Backend: `ecommerce-backend/ecommerce-admin-backend-node/src/services/shippoService.js`
- **Điểm:** 8/10

**Chức năng:**

- Kết nối Shippo API với test key
- `calculateShippingRates(destination, items)`:
  - Tạo shipment từ warehouse (San Jose, CA) đến destination
  - Lấy rates từ USPS carrier
  - Format thành: id, name, price, estimatedDays
- `validateAddress(address)`: Validate địa chỉ qua Shippo
- Fallback rates nếu API fail: $7.49 Ground, $9.99 Priority, $29.99 Express

**Code cần sửa:**

- [ ] Thêm support cho UPS, FedEx carriers
- [ ] Cache rates để tránh gọi API nhiều lần cùng địa chỉ

---

### 7. Authentication

- **File:** `src/views/LoginPage/`, `RegisterPage/`, `context/AuthContext.tsx`
- **Điểm:** 7/10

**Chức năng:**

- **Login:** Email + password → POST `/api/php/users/login` → nhận JWT token
- **Register:** Email + password → POST `/api/php/users/register` → auto login
- **Logout:** Clear token từ localStorage
- **Auto-login:** Check token on mount, fetch profile nếu có
- **Forgot password:** Gửi email reset link
- **Reset password:** Form với token từ URL
- Token lưu ở `localStorage['timelite:jwt-token']`

**Code cần sửa:**

- [ ] Tách `tokenUtils.ts` với `saveToken()`, `getToken()`, `clearToken()`
- [ ] Thêm token refresh logic

---

### 8. Profile & Order History

- **File:** `src/views/ProfilePage/ProfilePage.tsx`
- **Điểm:** 6/10

**Chức năng:**

- **Tab Profile:** Hiển thị/sửa name, email, phone, address
- **Tab Orders:** Lấy order history từ `/api/php/orders/history`
  - Hiển thị order number, date, status, total
  - Expand để xem items trong order
- **Tab Password:** Form đổi mật khẩu (current + new + confirm)

**Vấn đề:** File ~800 dòng, 3 tabs logic trộn lẫn

**Code cần sửa:**

```
ProfilePage.tsx (800 dòng) → Tách thành:
├── ProfileTab.tsx       (~200 dòng)
├── OrderHistoryTab.tsx  (~300 dòng)
├── PasswordTab.tsx      (~150 dòng)
└── ProfilePage.tsx      (~100 dòng) - tab switching only
```

---

### 9. Multi-language (I18n) ⚠️ **CẦN REFACTOR**

- **File:** `src/context/I18nContext.tsx`
- **Điểm:** 7/10

**Chức năng:**

- `t("key")`: Lấy translation theo key, support nested keys `t("checkout.form.email")`
- `setLanguage("en" | "vi")`: Đổi ngôn ngữ
- Auto-detect browser language on mount
- Persist language preference vào localStorage

**Vấn đề:** Translation data hardcoded trong file, **46KB**

**Code cần sửa:**

```
I18nContext.tsx (46KB) → Tách thành:
├── locales/
│   ├── en.json   (~20KB)
│   └── vi.json   (~20KB)
├── I18nContext.tsx (~3KB) - load JSON dynamically
```

---

### 10. Toast Notifications

- **File:** `src/context/ToastContext.tsx`, `src/components/ui/Toast/`
- **Điểm:** 9/10

**Chức năng:**

- `showToast(message, type)`: type = 'success' | 'error' | 'info' | 'warning'
- Auto dismiss sau 3 giây
- Stack multiple toasts
- Animation fade in/out

**Code cần sửa:** Không cần refactor

---

### 11. Error Pages

- **File:** `src/views/Error*Page/`
- **Điểm:** 8/10

**Chức năng:**

- 6 error pages: 400, 401, 403, 404, 500, 503
- Mỗi page có icon, title, message, "Go Home" button
- ErrorBoundary wrapper catch runtime errors

**Code cần sửa:**

- [ ] Gộp thành 1 `GenericErrorPage` component với props `{code, title, message}`

---

## 🔧 ADMIN PANEL

### 12. Dashboard

- **File:** `src/admin/pages/Dashboard/`
- **Điểm:** 7/10

**Chức năng:**

- Cards: Total Orders, Total Revenue, Total Products, Total Customers
- Recent orders table
- Charts (Recharts): Revenue by month, Orders by status

**Code cần sửa:**

- [ ] Kết nối real data từ `/admin/stats` API

---

### 13. Products Management

- **File:** `src/admin/pages/Products/`
- **Điểm:** 6/10

**Chức năng:**

- **List:** Table với columns: Image, Name, Category, Price, Stock, Actions
- **Add:** Form tạo product mới với image upload
- **Edit:** Form sửa product
- **Delete:** Confirm dialog → DELETE API
- **Bulk Upload:** Upload JSON/CSV file → batch create products

**Code cần sửa:**

- [ ] Tách `BulkUploadModal` ra component riêng
- [ ] CSS file 12KB quá lớn, cần optimize

---

### 14. Orders Management

- **File:** `src/admin/pages/Orders/`
- **Điểm:** 7/10

**Chức năng:**

- Table: Order#, Customer, Date, Status, Total
- Filter by status (pending, processing, shipped, delivered, cancelled)
- Update status dropdown

**Code cần sửa:**

- [ ] Thêm order detail modal/page

---

### 15. Customers & Categories

- **File:** `src/admin/pages/Customers/`, `Categories/`
- **Điểm:** 7/10

**Chức năng:**

- CRUD operations cho customers và categories
- Standard table + form pattern

**Code cần sửa:** Không cần refactor

---

## ⚙️ BACKEND SERVICES

### 16. API Service (Frontend) ⚠️ **CẦN REFACTOR GẤP**

- **File:** `src/services/api.ts`
- **Điểm:** 5/10

**Chức năng:**

- `HttpClient` class: GET, POST, PUT, DELETE với headers, timeout, error handling
- Fallback pattern: Try Node.js API → nếu fail thì try PHP API
- `ApiService` static methods:
  - `login()`, `register()`, `getProfile()`, `updateProfile()`
  - `getProducts()`, `getProduct()`, `getRelatedProducts()`
  - `createOrder()`, `getOrderHistory()`
- Caching với `apiCache` utility
- Structured logging

**Vấn đề:** File **970 dòng**, tất cả API calls trong 1 file

**Code cần sửa:**

```
api.ts (970 dòng) → Tách thành:
├── httpClient.ts        (~150 dòng) - base HTTP client
├── authApi.ts           (~150 dòng) - login, register, profile
├── productsApi.ts       (~200 dòng) - products CRUD
├── ordersApi.ts         (~150 dòng) - orders
├── shippingApi.ts       (~50 dòng)  - shipping rates
└── index.ts             (~50 dòng)  - re-export all
```

---

### 17. Node.js Backend

- **File:** `ecommerce-backend/backend-node/src/`
- **Điểm:** 7/10

**Chức năng:**

- Express.js với Helmet security, CORS, rate limiting (100 req/15min)
- Routes: `/api/users`, `/api/products`, `/api/orders`, `/api/contact`, `/api/shipping`
- JWT authentication middleware
- MySQL database connection
- Structured JSON logging

**Code cần sửa:**

- [ ] Migrate từ JavaScript → TypeScript
- [ ] Thêm request validation với Joi/Zod

---

### 18. Nginx Gateway

- **File:** `ecommerce-backend/gateway/nginx.conf`
- **Điểm:** 8/10

**Chức năng:**

- Reverse proxy: Port 3002 → internal services
- Route distribution:
  - `/api/php/*` → backend-php (FastCGI)
  - `/api/shipping/*` → admin-backend-node
  - `/admin/*` → admin-backend-node
  - `/api/*` → backend-node
- CORS headers với whitelist origins
- Security headers (X-Frame-Options, X-XSS-Protection)

**Code cần sửa:**

- [ ] Reduce duplicate CORS config blocks

---

### 19. Docker Setup

- **File:** `ecommerce-backend/docker-compose.yml`
- **Điểm:** 8/10

**Chức năng:**

- 6 containers:
  - `mysql`: Database với volume persistence
  - `backend-php`: PHP-FPM cho legacy API
  - `backend-node`: Node.js API
  - `ecommerce-admin-backend-node`: Admin API + Shippo
  - `gateway`: Nginx reverse proxy
  - `phpmyadmin`: DB admin UI

**Code cần sửa:** Không cần refactor

---

## 🎯 Refactoring Priority

### Ưu tiên CAO (Làm ngay sau khi fix bugs)

| #   | File               | Dòng hiện tại | Mục tiêu  | Thời gian ước tính |
| --- | ------------------ | ------------- | --------- | ------------------ |
| 1   | `CheckoutPage.tsx` | 1711          | <200      | 4-6 giờ            |
| 2   | `api.ts`           | 970           | <200/file | 2-3 giờ            |
| 3   | `I18nContext.tsx`  | 46KB          | <5KB      | 1-2 giờ            |

### Ưu tiên TRUNG BÌNH

| #   | File                    | Dòng    | Mục tiêu | Thời gian |
| --- | ----------------------- | ------- | -------- | --------- |
| 4   | `ProfilePage.tsx`       | 800     | <150/tab | 2 giờ     |
| 5   | `ProductDetailPage.tsx` | 500     | <250     | 1-2 giờ   |
| 6   | Error pages             | 6 files | 1 file   | 1 giờ     |

### Ưu tiên THẤP (Nice to have)

| #   | Task               | Mô tả                       | Thời gian |
| --- | ------------------ | --------------------------- | --------- |
| 7   | Cart localStorage  | Persist cart across refresh | 1 giờ     |
| 8   | TypeScript backend | Migrate Node.js             | 4-6 giờ   |
| 9   | Unit tests         | Jest/Vitest setup           | 4+ giờ    |

---

## ✅ Checklist sau khi sửa bugs

- [ ] Refactor `CheckoutPage.tsx` (ưu tiên 1)
- [ ] Refactor `api.ts` (ưu tiên 2)
- [ ] Extract I18n translations (ưu tiên 3)
- [ ] Refactor `ProfilePage.tsx`
- [ ] Refactor `ProductDetailPage.tsx`
- [ ] Gộp Error pages
- [ ] Thêm cart localStorage
- [ ] TypeScript backend (optional)
- [ ] Unit tests (optional)
