# Hướng Dẫn Test API Bằng Postman

## 🚀 Khởi Động Backend

```bash
cd ecommerce-backend
docker-compose up -d
```

Kiểm tra trạng thái:
```bash
docker-compose ps
```

## 📍 API Endpoints

### Base URL
- **Node.js Backend**: `http://localhost:3001/api/node`
- **PHP Backend**: `http://localhost:3001/api/php`

> **Lưu ý**: Cả 2 backend đều chạy qua Nginx gateway ở port 3001

---

## 🔐 AUTHENTICATION APIs

### 1️⃣ REGISTER - Đăng Ký Tài Khoản

**Endpoint**: `POST http://localhost:3001/api/users/register`

**Headers**:
```
Content-Type: application/json
```

**Body (raw JSON)**:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test@123",
  "full_name": "Test User"
}
```

**Response Success (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "full_name": "Test User"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

---

## 2️⃣ LOGIN - Đăng Nhập

**Endpoint**: `POST http://localhost:3001/api/users/login`

**Headers**:
```
Content-Type: application/json
```

**Body (raw JSON)**:
```json
{
  "username": "testuser",
  "password": "Test@123"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "full_name": "Test User"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

**⚠️ LƯU Ý**: Copy token từ response để sử dụng cho các API sau!

---

## 3️⃣ GET PROFILE - Lấy Thông Tin Profile

**Endpoint**: `GET http://localhost:3001/api/users/profile`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "full_name": "Test User",
    "phone": null,
    "address": null,
    "city": null,
    "country": null,
    "postal_code": null,
    "created_at": "2025-10-28T12:00:00Z"
  }
}
```

---

## 4️⃣ UPDATE PROFILE - Cập Nhật Profile

**Endpoint**: `PUT http://localhost:3001/api/users/profile`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (raw JSON)**:
```json
{
  "full_name": "Updated Name",
  "phone": "+84901234567",
  "address": "123 Test Street",
  "city": "Ho Chi Minh",
  "country": "Vietnam",
  "postal_code": "700000"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "full_name": "Updated Name",
    "phone": "+84901234567",
    "address": "123 Test Street",
    "city": "Ho Chi Minh",
    "country": "Vietnam",
    "postal_code": "700000"
  }
}
```

---

## 5️⃣ CHANGE PASSWORD - Đổi Mật Khẩu

**Endpoint**: `POST http://localhost:3001/api/users/change-password`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (raw JSON)**:
```json
{
  "current_password": "Test@123",
  "new_password": "NewPass@456"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 6️⃣ FORGOT PASSWORD - Yêu Cầu Reset Mật Khẩu

**Endpoint**: `POST http://localhost:3001/api/node/users/forgot-password`

**Headers**:
```
Content-Type: application/json
```

**Body (raw JSON)**:
```json
{
  "email": "test@example.com"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Password reset token generated. Check console logs for token.",
  "data": {
    "email": "test@example.com"
  }
}
```

**⚠️ LƯU Ý**: Token sẽ được log ra console backend. Kiểm tra bằng lệnh:
```bash
docker logs ecommerce-backend-node --tail 50
```

Token có hiệu lực trong **15 phút**.

---

## 7️⃣ RESET PASSWORD - Đặt Lại Mật Khẩu

**Endpoint**: `POST http://localhost:3001/api/node/users/reset-password`

**Headers**:
```
Content-Type: application/json
```

**Body (raw JSON)**:
```json
{
  "token": "abc123def456...",
  "newPassword": "NewPass@789"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Password has been reset successfully.",
  "data": {
    "email": "test@example.com"
  }
}
```

**Response Error (400)** - Token hết hạn:
```json
{
  "error": "ERR_INVALID_OR_EXPIRED_TOKEN",
  "message": "Invalid or expired reset token. Please request a new one."
}
```

---

## 8️⃣ VERIFY EMAIL - Xác Thực Email

**Endpoint**: `POST http://localhost:3001/api/node/users/verify-email`

**Headers**:
```
Content-Type: application/json
```

**Body (raw JSON)**:
```json
{
  "token": "verification_token_here"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Email has been verified successfully.",
  "data": {
    "email": "test@example.com"
  }
}
```

---

## 9️⃣ RESEND VERIFICATION - Gửi Lại Email Xác Thực

**Endpoint**: `POST http://localhost:3001/api/node/users/resend-verification`

**Headers**:
```
Content-Type: application/json
```

**Body (raw JSON)**:
```json
{
  "email": "test@example.com"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Verification token generated. Check console logs for token.",
  "data": {
    "email": "test@example.com"
  }
}
```

**Response Error (400)** - Email đã xác thực:
```json
{
  "error": "ERR_EMAIL_ALREADY_VERIFIED",
  "message": "Email is already verified"
}
```

**⚠️ LƯU Ý**: Token xác thực sẽ được log ra console backend:
```bash
docker logs ecommerce-backend-node --tail 50
```

---

## 🔍 Kiểm Tra Logs Khi Có Lỗi

### PHP Backend Logs:
```bash
docker logs ecommerce-backend-php
```

### MySQL Logs:
```bash
docker logs ecommerce_mysql
```

### Kiểm tra database:
- Truy cập phpMyAdmin: `http://localhost:3003`
- Server: `mysql`
- Username: `root`
- Password: `rootpassword`

---

## ⚠️ Xử Lý Lỗi Thường Gặp

### Lỗi: "Connection refused"
```bash
# Kiểm tra container đang chạy
docker-compose ps

# Khởi động lại
docker-compose restart
```

### Lỗi: "Unauthorized" (401)
- Kiểm tra token đã copy đúng chưa
- Token có thể đã hết hạn (8 giờ), cần login lại

### Lỗi: "Validation failed"
- Kiểm tra lại format JSON
- Đảm bảo các trường bắt buộc đã điền đầy đủ

---

## 📝 Ghi Chú

1. **Token**: Lưu token sau khi login/register để sử dụng cho các API cần authentication
2. **Headers**: Nhớ thêm `Authorization: Bearer {token}` vào header
3. **Content-Type**: Luôn set `Content-Type: application/json`
4. **Port**: PHP backend chạy ở port 8000

---

## 🎯 Test Flow Đầy Đủ

1. **REGISTER** → Lấy token
2. **LOGIN** → Lấy token mới
3. **GET PROFILE** → Xem thông tin
4. **UPDATE PROFILE** → Cập nhật thông tin
5. **GET PROFILE** → Kiểm tra đã update chưa
6. **CHANGE PASSWORD** → Đổi mật khẩu
7. **LOGIN** → Login với mật khẩu mới

---

**Khi gặp lỗi, hãy gửi cho tôi:**
1. Request URL
2. Request Headers
3. Request Body
4. Response nhận được
5. Logs từ `docker logs ecommerce-backend-php`

