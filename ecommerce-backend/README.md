# E-Commerce Backend API

## ✅ Trạng Thái Hiện Tại

Backend đang chạy và sẵn sàng để test với Postman!

### Services Đang Chạy:
- ✅ **PHP Backend**: `http://localhost:3001` (Port 3001 để tránh conflict với frontend port 3000)
- ✅ **MySQL Database**: `localhost:3306`
- ✅ **phpMyAdmin**: `http://localhost:8080`

---

## 🚀 Khởi Động

```bash
cd ecommerce-backend
docker-compose up -d
```

Kiểm tra trạng thái:
```bash
docker-compose ps
```

Dừng services:
```bash
docker-compose down
```

---

## 📚 API Documentation

Xem chi tiết hướng dẫn test trong file: **[POSTMAN_TEST_GUIDE.md](./POSTMAN_TEST_GUIDE.md)**

### Quick Reference:

#### 1. Register (Đăng ký)
```
POST http://localhost:3001/api/users/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test@123",
  "full_name": "Test User"
}
```

#### 2. Login (Đăng nhập)
```
POST http://localhost:3001/api/users/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "Test@123"
}
```

#### 3. Get Profile (Xem profile)
```
GET http://localhost:3001/api/users/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

#### 4. Update Profile (Cập nhật profile)
```
PUT http://localhost:3001/api/users/profile
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "full_name": "Updated Name",
  "phone": "+84901234567",
  "address": "123 Test Street",
  "city": "Ho Chi Minh",
  "country": "Vietnam",
  "postal_code": "700000"
}
```

#### 5. Change Password (Đổi mật khẩu)
```
POST http://localhost:3001/api/users/change-password
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "current_password": "Test@123",
  "new_password": "NewPass@456"
}
```

---

## 🔍 Troubleshooting

### Xem Logs

```bash
# PHP Backend logs
docker logs ecommerce-backend-php

# MySQL logs
docker logs ecommerce_mysql

# Follow logs (real-time)
docker logs -f ecommerce-backend-php
```

### Khởi động lại services

```bash
docker-compose restart
```

### Reset database

```bash
docker-compose down -v
docker-compose up -d
```

---

## 🗄️ Database Access

### phpMyAdmin
- URL: `http://localhost:8080`
- Server: `mysql`
- Username: `root`
- Password: `rootpassword`
- Database: `ecommerce_db`

### MySQL CLI
```bash
docker exec -it ecommerce_mysql mysql -u root -prootpassword ecommerce_db
```

---

## 📝 Khi Gặp Lỗi

Khi test bằng Postman và gặp lỗi, vui lòng gửi thông tin sau:

1. **Request Details:**
   - Method (GET/POST/PUT)
   - URL
   - Headers
   - Body (nếu có)

2. **Response nhận được:**
   - Status Code
   - Response Body
   - Response Headers

3. **Backend Logs:**
```bash
docker logs ecommerce-backend-php --tail 100
```

---

## 🏗️ Cấu Trúc Project

```
ecommerce-backend/
├── backend-php/           # PHP Backend (Laravel-style)
│   ├── src/
│   │   ├── Controllers/   # API Controllers
│   │   ├── Services/      # Business Logic
│   │   ├── Models/        # Database Models
│   │   └── Middleware/    # Authentication, CORS
│   ├── public/            # Entry point
│   └── Dockerfile
├── database/
│   └── init/              # Database initialization
├── docker-compose.yml     # Services configuration
└── POSTMAN_TEST_GUIDE.md  # Chi tiết test APIs
```

---

## ⚙️ Environment Variables

Các biến môi trường được cấu hình trong `docker-compose.yml`:

```yaml
DB_HOST: mysql
DB_PORT: 3306
DB_NAME: ecommerce_db
DB_USER: root
DB_PASSWORD: rootpassword
JWT_SECRET: your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN: 8h
```

**⚠️ Chú ý**: Trong production, hãy thay đổi các giá trị mật khẩu và JWT_SECRET!

---

## 🎯 Test Flow Đề Xuất

1. ✅ Register → Nhận token
2. ✅ Login → Nhận token mới
3. ✅ Get Profile → Xem thông tin
4. ✅ Update Profile → Cập nhật thông tin
5. ✅ Get Profile lại → Kiểm tra đã update
6. ✅ Change Password → Đổi mật khẩu
7. ✅ Login với mật khẩu mới → Verify

---

## 📞 Support

Nếu cần hỗ trợ, vui lòng cung cấp:
- Screenshot Postman request/response
- Backend logs
- Database state (nếu cần)

**Happy Testing! 🚀**
