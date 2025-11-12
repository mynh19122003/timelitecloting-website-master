# Fix Lỗi 500 Khi Đăng Nhập - Debug Logging

## Vấn Đề

Khi đăng nhập thành công, frontend gọi `/admin/auth/me` để lấy thông tin user, nhưng nhận được lỗi 500 Internal Server Error.

## Các Thay Đổi Đã Thực Hiện

### 1. Thêm Debug Logging vào `authController.js`

- ✅ Log `req.admin` để xem token được decode như thế nào
- ✅ Check `req.admin.adminId` trước khi gọi service
- ✅ Enhanced error logging với stack trace
- ✅ Trả về error details trong dev mode

### 2. Thêm Error Handling vào `adminUserService.js`

- ✅ Validate `adminId` trước khi query
- ✅ Log chi tiết khi admin không tìm thấy
- ✅ Log database errors với stack trace
- ✅ Wrap database errors với message rõ ràng

## Cách Test và Debug

### 1. Restart Backend Services

```bash
cd ecommerce-backend
docker-compose restart admin-backend-node
# Hoặc nếu chạy local:
cd admin-backend-node
npm start
```

### 2. Test Login

1. Mở browser: `http://localhost:3000/admin/login`
2. Đăng nhập với:
   - Email: `admin@gmail.com`
   - Password: `19122003`
3. Mở DevTools Console để xem frontend logs
4. Kiểm tra backend logs để xem error chi tiết

### 3. Kiểm Tra Backend Logs

Backend sẽ log ra:
- `[AuthController.me] req.admin:` - Token được decode như thế nào
- `[AuthController.me] Error:` - Lỗi cụ thể nếu có
- `[AdminUserService.getProfile] Admin not found for id: X` - Nếu admin không tìm thấy
- `[AdminUserService.getProfile] Database error:` - Nếu có lỗi database

### 4. Các Nguyên Nhân Có Thể

#### a) Token không có `adminId`
- **Triệu chứng:** Log sẽ hiển thị `req.admin` không có `adminId`
- **Giải pháp:** Kiểm tra cách token được tạo trong `adminUserService.login()`

#### b) Admin không tồn tại trong database
- **Triệu chứng:** Log sẽ hiển thị `Admin not found for id: X`
- **Giải pháp:** Kiểm tra database xem admin có tồn tại không:
  ```sql
  SELECT id, admin_id, admin_email, admin_name FROM admin;
  ```

#### c) Database connection issue
- **Triệu chứng:** Log sẽ hiển thị database error
- **Giải pháp:** Kiểm tra database connection trong `config/database.js`

#### d) Query syntax error
- **Triệu chứng:** Log sẽ hiển thị SQL error
- **Giải pháp:** Kiểm tra query trong `adminUserService.getProfile()`

## Files Đã Thay Đổi

1. `ecommerce-backend/admin-backend-node/src/controllers/authController.js`
   - Thêm debug logging
   - Thêm validation cho `req.admin.adminId`
   - Enhanced error handling

2. `ecommerce-backend/admin-backend-node/src/services/adminUserService.js`
   - Thêm validation cho `adminId`
   - Thêm error logging chi tiết
   - Wrap database errors

## Next Steps

1. **Test lại login** và xem backend logs
2. **Kiểm tra logs** để xác định nguyên nhân cụ thể
3. **Fix lỗi** dựa trên logs (có thể cần thêm fixes sau khi xem logs)

## Lưu Ý

- Error details chỉ hiển thị trong dev mode (`NODE_ENV !== 'production'`)
- Trong production, chỉ trả về generic error message
- Tất cả sensitive information đã được mask trong logs





