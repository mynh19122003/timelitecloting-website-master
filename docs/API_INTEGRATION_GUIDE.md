# 🔗 Hướng dẫn tích hợp API Frontend với Backend

## ✅ Đã hoàn thành tích hợp

### 🎯 **Các tính năng đã tích hợp:**

#### 1. **API Service Layer** (`src/services/api.ts`)
- ✅ HTTP client với JWT authentication
- ✅ Fallback từ Node.js sang PHP backend
- ✅ Error handling và retry logic
- ✅ TypeScript interfaces cho type safety

#### 2. **Authentication Context** (`src/context/AuthContext.tsx`)
- ✅ Global state management cho user authentication
- ✅ Login/Register/Logout functions
- ✅ JWT token management
- ✅ Error handling và loading states

#### 3. **Auth Utils** (`src/utils/auth.ts`)
- ✅ JWT token validation
- ✅ Local storage management
- ✅ Token expiration checking
- ✅ Auth status broadcasting

#### 4. **Updated Pages:**
- ✅ **LoginPage**: Tích hợp API login với error handling
- ✅ **RegisterPage**: Tích hợp API register với validation
- ✅ **ProfilePage**: Hiển thị thông tin user từ API
- ✅ **AppRoot**: Bao bọc với AuthProvider

## 🚀 Cách sử dụng

### 1. **Khởi động Backend**
```bash
# Chạy backend trước
cd ecommerce-backend
make up
```

### 2. **Khởi động Frontend**
```bash
# Trong thư mục frontend
npm run dev
```

### 3. **Test Authentication**

#### **Đăng ký tài khoản mới:**
1. Truy cập: http://localhost:3000/register
2. Nhập email và password
3. Hệ thống sẽ tự động đăng nhập sau khi đăng ký thành công

#### **Đăng nhập:**
1. Truy cập: http://localhost:3000/login
2. Nhập email và password đã đăng ký
3. Hoặc sử dụng demo credentials: `demo@timelite.com` / `Timelite2025!`

#### **Xem Profile:**
1. Sau khi đăng nhập, truy cập: http://localhost:3000/profile
2. Xem thông tin user từ database
3. Xem lịch sử đơn hàng (nếu có)

## 🔧 Cấu hình API

### **API Configuration** (`src/config/api.ts`)
```typescript
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost',
  ENDPOINTS: {
    LOGIN: '/api/node/users/login',
    REGISTER: '/api/node/users/register',
    PROFILE: '/api/node/users/profile',
    // ... other endpoints
  }
};
```

### **Environment Variables**
Tạo file `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost
```

## 📡 API Endpoints

### **Authentication Endpoints:**
- `POST /api/node/users/login` - Đăng nhập
- `POST /api/node/users/register` - Đăng ký
- `GET /api/node/users/profile` - Lấy thông tin user
- `PUT /api/node/users/change-password` - Đổi mật khẩu

### **Product Endpoints:**
- `GET /api/node/products` - Danh sách sản phẩm
- `GET /api/node/products/:id` - Chi tiết sản phẩm

### **Order Endpoints:**
- `POST /api/node/orders` - Tạo đơn hàng
- `GET /api/node/orders/history` - Lịch sử đơn hàng
- `GET /api/node/orders/:id` - Chi tiết đơn hàng

## 🔄 Fallback Strategy

Hệ thống tự động fallback từ Node.js sang PHP backend nếu Node.js không khả dụng:

```typescript
// Ví dụ trong ApiService.login()
try {
  // Thử Node.js backend trước
  const response = await httpClient.post(API_CONFIG.ENDPOINTS.LOGIN, credentials);
  return response;
} catch (error) {
  // Fallback sang PHP backend
  try {
    const response = await httpClient.post(API_CONFIG.ENDPOINTS.PHP.LOGIN, credentials);
    return response;
  } catch (phpError) {
    throw error; // Throw error gốc
  }
}
```

## 🛡️ Security Features

### **JWT Authentication:**
- ✅ Token được lưu trong localStorage
- ✅ Tự động thêm vào header: `Authorization: Bearer <token>`
- ✅ Token validation và expiration checking
- ✅ Auto-logout khi token hết hạn

### **Error Handling:**
- ✅ Network error handling
- ✅ API error responses
- ✅ User-friendly error messages
- ✅ Loading states

## 🎨 UI/UX Features

### **Loading States:**
- ✅ Button loading indicators
- ✅ Form submission states
- ✅ API call progress

### **Error Display:**
- ✅ Form validation errors
- ✅ API error messages
- ✅ Network error handling

### **Success Feedback:**
- ✅ Success messages
- ✅ Auto-redirect after login/register
- ✅ Profile update confirmations

## 🔍 Debugging

### **Console Logs:**
```javascript
// Xem JWT token
console.log('JWT Token:', localStorage.getItem('timelite:jwt-token'));

// Xem user data
console.log('User Data:', localStorage.getItem('timelite:user-data'));

// Xem auth status
console.log('Auth Status:', localStorage.getItem('timelite:auth-status'));
```

### **Network Tab:**
- Kiểm tra API calls trong Network tab
- Xem request/response headers
- Verify JWT token trong Authorization header

## 🚨 Troubleshooting

### **Lỗi thường gặp:**

#### 1. **"Network error"**
- ✅ Kiểm tra backend có chạy không: `make status`
- ✅ Kiểm tra API URL: `http://localhost`
- ✅ Kiểm tra CORS settings

#### 2. **"Invalid token"**
- ✅ Clear localStorage: `localStorage.clear()`
- ✅ Đăng nhập lại
- ✅ Kiểm tra JWT secret trong backend

#### 3. **"Email already exists"**
- ✅ Sử dụng email khác
- ✅ Hoặc đăng nhập với email đã tồn tại

#### 4. **"User not found"**
- ✅ Kiểm tra email có đúng không
- ✅ Đăng ký tài khoản mới trước

## 📊 Testing

### **Manual Testing:**
1. **Register Flow:**
   - Tạo tài khoản mới
   - Verify auto-login
   - Check profile data

2. **Login Flow:**
   - Đăng nhập với credentials
   - Verify JWT token
   - Check profile access

3. **Logout Flow:**
   - Logout từ profile
   - Verify token cleared
   - Check redirect to login

### **API Testing:**
```bash
# Test login API
curl -X POST http://localhost/api/node/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@timelite.com","password":"Timelite2025!"}'

# Test register API
curl -X POST http://localhost/api/node/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🎯 Next Steps

### **Có thể mở rộng:**
1. **Product Integration:**
   - Tích hợp API products vào ShopPage
   - Product search và filtering
   - Product detail page

2. **Order Integration:**
   - Tích hợp API orders vào CartPage
   - Checkout flow với API
   - Order tracking

3. **Advanced Features:**
   - Password reset
   - Email verification
   - Social login
   - Two-factor authentication

## 📝 Notes

- ✅ **Backend bắt buộc chạy trước** frontend
- ✅ **MySQL database** là bắt buộc
- ✅ **JWT token** có hạn 8 giờ
- ✅ **Auto-fallback** từ Node.js sang PHP
- ✅ **TypeScript** cho type safety
- ✅ **Error handling** đầy đủ

---

**🎉 Tích hợp API hoàn tất!** Frontend đã sẵn sàng kết nối với backend e-commerce system.
