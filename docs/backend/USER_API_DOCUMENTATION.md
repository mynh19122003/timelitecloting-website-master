# 📘 User API Documentation

## Tổng Quan

API quản lý người dùng được xây dựng theo cấu trúc đơn giản nhất, chỉ bao gồm các chức năng cơ bản:
- **Đăng ký** (Register)
- **Đăng nhập** (Login)  
- **Đổi mật khẩu** (Change Password)

## 🔒 Bảo Mật

- **Hash mật khẩu**: Bcrypt với cost factor = 10
- **JWT Token**: Hết hạn chính xác sau **8 giờ**
- **Algorithm**: HS256

## 🗄️ Database Schema

### Bảng `users`

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_code VARCHAR(16) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Code Format

- **Format**: `UID00001`, `UID00002`, `UID00003`, ...
- **Logic**: `UID` + `{id}` padded với 5 chữ số
- **Auto-generated**: Tự động tạo sau khi insert user

---

## 📡 API Endpoints

### Base URLs

- **PHP Backend**: `http://localhost:8000/api/users`
- **Node.js Backend**: `http://localhost:3000/api/node/users`

---

## 1️⃣ Đăng Ký (Register)

### Endpoint
```
POST /api/users/register        (PHP)
POST /api/node/users/register   (Node.js)
```

### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Validation Rules
- `email`: Bắt buộc, định dạng email hợp lệ
- `password`: Bắt buộc, tối thiểu 6 ký tự

### Response (201 Created)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "user_code": "UID00001",
      "email": "user@example.com",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses

**Email đã tồn tại (409 Conflict)**
```json
{
  "error": "ERR_EMAIL_EXISTS",
  "message": "Email already exists"
}
```

**Validation failed (400 Bad Request)**
```json
{
  "error": "ERR_VALIDATION_FAILED",
  "message": "Email and password are required"
}
```

```json
{
  "error": "ERR_VALIDATION_FAILED",
  "message": "Invalid email format"
}
```

```json
{
  "error": "ERR_VALIDATION_FAILED",
  "message": "Password must be at least 6 characters"
}
```

---

## 2️⃣ Đăng Nhập (Login)

### Endpoint
```
POST /api/users/login        (PHP)
POST /api/node/users/login   (Node.js)
```

### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Validation Rules
- `email`: Bắt buộc
- `password`: Bắt buộc

### Response (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "user_code": "UID00001",
      "email": "user@example.com",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses

**Sai email hoặc mật khẩu (401 Unauthorized)**
```json
{
  "error": "ERR_INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

---

## 3️⃣ Đổi Mật Khẩu (Change Password)

### Endpoint
```
PUT /api/users/change-password        (PHP)
PUT /api/node/users/change-password   (Node.js)
```

### Headers
```
Authorization: Bearer {token}
```

### Request Body
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

### Validation Rules
- `currentPassword`: Bắt buộc
- `newPassword`: Bắt buộc, tối thiểu 6 ký tự

### Response (200 OK)
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "message": "Password changed successfully"
  }
}
```

### Error Responses

**Token không hợp lệ hoặc hết hạn (401 Unauthorized)**
```json
{
  "error": "ERR_UNAUTHORIZED",
  "message": "Unauthorized"
}
```

**Mật khẩu hiện tại sai (400 Bad Request)**
```json
{
  "error": "ERR_INVALID_CURRENT_PASSWORD",
  "message": "Current password is incorrect"
}
```

**Validation failed (400 Bad Request)**
```json
{
  "error": "ERR_VALIDATION_FAILED",
  "message": "New password must be at least 6 characters"
}
```

---

## 🧪 Testing Examples

### Using cURL

#### 1. Register
```bash
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:8000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

#### 3. Change Password
```bash
curl -X PUT http://localhost:8000/api/users/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "currentPassword": "test123",
    "newPassword": "newtest456"
  }'
```

### Using PowerShell

#### 1. Register
```powershell
$body = @{
    email = "test@example.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/users/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

#### 2. Login
```powershell
$body = @{
    email = "test@example.com"
    password = "test123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/users/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$token = $response.data.token
Write-Host "Token: $token"
```

#### 3. Change Password
```powershell
$body = @{
    currentPassword = "test123"
    newPassword = "newtest456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/users/change-password" `
    -Method PUT `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $token" } `
    -Body $body
```

---

## 🔐 JWT Token Details

### Token Payload
```json
{
  "userId": 1,
  "userCode": "UID00001",
  "email": "user@example.com",
  "iat": 1640995200,
  "exp": 1641024000
}
```

### Token Properties
- **Algorithm**: HS256
- **Expiration**: 8 giờ (28800 giây)
- **Claims**:
  - `userId`: ID của user
  - `userCode`: Mã user (UID00001, UID00002, ...)
  - `email`: Email của user
  - `iat`: Issued at (thời gian tạo)
  - `exp`: Expiration time (thời gian hết hạn)

---

## 📊 Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `ERR_VALIDATION_FAILED` | 400 | Dữ liệu không hợp lệ |
| `ERR_INVALID_CURRENT_PASSWORD` | 400 | Mật khẩu hiện tại sai |
| `ERR_UNAUTHORIZED` | 401 | Token không hợp lệ hoặc hết hạn |
| `ERR_INVALID_CREDENTIALS` | 401 | Email hoặc mật khẩu sai |
| `ERR_EMAIL_EXISTS` | 409 | Email đã tồn tại |
| `ERR_REGISTRATION_FAILED` | 500 | Lỗi đăng ký |
| `ERR_LOGIN_FAILED` | 500 | Lỗi đăng nhập |
| `ERR_PASSWORD_CHANGE_FAILED` | 500 | Lỗi đổi mật khẩu |

---

## 🏗️ Architecture

### PHP Backend
- **Framework**: Pure PHP 8.2 (no framework)
- **Database**: MySQL with PDO
- **JWT Library**: Firebase PHP-JWT
- **Password Hashing**: `password_hash()` with bcrypt

### Node.js Backend
- **Framework**: Express.js
- **Database**: MySQL with mysql2
- **JWT Library**: jsonwebtoken
- **Password Hashing**: bcrypt

---

## ✅ Completed Features

- ✅ User registration với auto-generated user_code
- ✅ User login với JWT authentication
- ✅ Change password với verification
- ✅ Bcrypt password hashing (cost = 10)
- ✅ JWT token expiration = 8 giờ chính xác
- ✅ Input validation
- ✅ Error handling với error codes rõ ràng
- ✅ CORS enabled
- ✅ Both PHP và Node.js implementations

---

## 🚀 Quick Start

### 1. Start Docker Containers
```bash
cd ecommerce-backend
docker-compose up -d
```

### 2. Check Services
- **PHP Backend**: http://localhost:8000/health
- **Node.js Backend**: http://localhost:3000/health
- **phpMyAdmin**: http://localhost:3003 (root/rootpassword)

### 3. Test Register API
```bash
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 4. Test Login API
```bash
curl -X POST http://localhost:8000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 📝 Notes

1. **Database được reset về trạng thái ban đầu** - chỉ có 4 cột trong bảng users
2. **Không còn các endpoints**: `/profile` (GET/PUT)
3. **User code tự động generate** khi đăng ký
4. **JWT token expire sau đúng 8 giờ**
5. **Password được hash bằng bcrypt** với cost factor = 10

