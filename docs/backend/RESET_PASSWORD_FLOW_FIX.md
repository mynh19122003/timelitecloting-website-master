# Hướng dẫn khôi phục Reset Password Flow

## Tổng quan
Flow reset password đã được tích hợp nhưng database và backend đã mất các cột cần thiết. File này hướng dẫn cách khôi phục.

## Các thay đổi đã thực hiện

### 1. Backend Node.js
- ✅ Đã xóa các hàm `resetPassword` và `requestPasswordReset` trùng lặp
- ✅ Giữ lại hàm `forgotPassword` và `resetPassword` sử dụng cột trong bảng `users`
- ✅ Routes đã được định nghĩa trong `userRoutes.js`

### 2. Frontend
- ✅ Đã cập nhật `ForgotPasswordPage` để sử dụng `API_CONFIG` thay vì hardcode URL
- ✅ Đã cập nhật `ResetPasswordPage` để sử dụng `API_CONFIG` thay vì hardcode URL
- ✅ Đã thêm các endpoint `FORGOT_PASSWORD` và `RESET_PASSWORD` vào `API_CONFIG`

### 3. Database Migration
- ✅ Đã tạo migration script: `2025-01-15-ensure-reset-password-fields.sql`

## Cách chạy migration

### Option 1: Chạy trực tiếp với MySQL
```bash
mysql -u root -p ecommerce_db < ecommerce-backend/database/migrations/2025-01-15-ensure-reset-password-fields.sql
```

### Option 2: Chạy trong Docker
```bash
# Nếu database đang chạy trong Docker
docker exec -i <mysql_container_name> mysql -u root -p ecommerce_db < ecommerce-backend/database/migrations/2025-01-15-ensure-reset-password-fields.sql
```

### Option 3: Chạy từ MySQL CLI
```sql
USE ecommerce_db;
SOURCE ecommerce-backend/database/migrations/2025-01-15-ensure-reset-password-fields.sql;
```

## Kiểm tra migration thành công

Chạy query sau để kiểm tra:
```sql
DESCRIBE users;
```

Bạn nên thấy các cột:
- `reset_token` VARCHAR(255) NULL
- `reset_token_expiry` DATETIME NULL

Và index:
- `idx_reset_token` trên cột `reset_token`

## Flow hoạt động

1. **Forgot Password**: User nhập email tại `/forgot-password`
   - Backend tạo token và lưu vào `reset_token` và `reset_token_expiry`
   - Token có hiệu lực 15 phút
   - Token được log ra console (vì chưa có email service)

2. **Reset Password**: User truy cập `/reset-password?token=<token>`
   - User nhập mật khẩu mới
   - Backend kiểm tra token hợp lệ và chưa hết hạn
   - Cập nhật mật khẩu mới và xóa token

## Endpoints

### Node.js Backend
- `POST /api/node/users/forgot-password` - Yêu cầu reset password
- `POST /api/node/users/reset-password` - Reset password với token

### PHP Backend (Fallback)
- `POST /api/php/users/forgot-password` - Yêu cầu reset password
- `POST /api/php/users/reset-password` - Reset password với token

## Lưu ý

- Migration script được thiết kế để chạy nhiều lần an toàn (idempotent)
- Nếu các cột đã tồn tại, script sẽ không tạo lại
- Token reset password có thời hạn 15 phút
- Hiện tại token được log ra console vì chưa có email service




