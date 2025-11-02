# 🚀 Hướng dẫn khởi động E-commerce Backend

## ✅ Backend đã được fix và sẵn sàng!

### 📦 Các services đã được cài đặt:

1. **MySQL Database** (Port 3306)
2. **Node.js Backend** (Port 3001)
3. **PHP Backend** (Port 9000 - internal)
4. **Nginx Gateway** (Port 80)
5. **phpMyAdmin** (Port 8080)

---

## 🔧 Cách khởi động Backend

### 1. Khởi động tất cả services

```powershell
cd ecommerce-backend
docker-compose up -d
```

### 2. Kiểm tra trạng thái

```powershell
docker ps
```

Tất cả containers phải có status `Up` và `healthy`.

### 3. Kiểm tra health

```powershell
# Kiểm tra Gateway
Invoke-WebRequest -Uri http://localhost/health -UseBasicParsing

# Kiểm tra Node.js backend
Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing
```

---

## 🌐 Truy cập các services

### 🔗 URLs chính:

- **Gateway**: http://localhost
- **Node.js API**: http://localhost:3001/api
- **phpMyAdmin**: http://localhost:8080
  - Username: `root`
  - Password: `rootpassword`

### 📝 API Endpoints (qua Gateway):

#### Node.js Backend:
- `POST http://localhost/api/node/users/register` - Đăng ký
- `POST http://localhost/api/node/users/login` - Đăng nhập
- `GET http://localhost/api/node/products` - Danh sách sản phẩm
- `POST http://localhost/api/node/orders` - Tạo đơn hàng

#### PHP Backend:
- `POST http://localhost/api/php/users/register` - Đăng ký
- `POST http://localhost/api/php/users/login` - Đăng nhập
- `GET http://localhost/api/php/products` - Danh sách sản phẩm

---

## 🛑 Dừng services

```powershell
docker-compose down
```

### Xóa toàn bộ data (reset database):

```powershell
docker-compose down -v
```

---

## 🧪 Test API với PowerShell

### Đăng ký user mới:

```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost/api/node/users/register `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing
```

### Đăng nhập:

```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost/api/node/users/login `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing

$response.Content | ConvertFrom-Json
```

### Lấy danh sách sản phẩm:

```powershell
Invoke-WebRequest -Uri "http://localhost/api/node/products?page=1&limit=10" `
    -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

---

## 📊 Sample Data

Database đã được seed với dữ liệu mẫu:

### Products:
- Áo thun nam - 150,000đ
- Quần jean nữ - 350,000đ
- Giày sneaker - 500,000đ
- Túi xách da - 800,000đ
- Đồng hồ nam - 1,200,000đ
- Váy dạ hội - 600,000đ
- Áo khoác nữ - 400,000đ
- Quần short nam - 200,000đ

### Users (mật khẩu: `password123`):
- admin@example.com
- user1@example.com
- user2@example.com

---

## 🔍 Troubleshooting

### 1. Docker Desktop chưa chạy

**Lỗi**: `error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine...`

**Giải pháp**: Khởi động Docker Desktop từ Start Menu

### 2. Port đã được sử dụng

**Lỗi**: `Bind for 0.0.0.0:80 failed: port is already allocated`

**Giải pháp**: Dừng service đang dùng port hoặc thay đổi port trong `docker-compose.yml`

### 3. Container restarting

**Kiểm tra logs**:
```powershell
docker logs ecommerce-gateway --tail 50
docker logs ecommerce-backend-node --tail 50
docker logs ecommerce-mysql --tail 50
```

### 4. Database connection failed

**Kiểm tra MySQL**:
```powershell
docker logs ecommerce-mysql --tail 20
```

**Restart MySQL**:
```powershell
docker-compose restart mysql
```

---

## 📝 Các thay đổi đã fix

### 1. ✅ Dockerfile - Node.js
- Đổi từ `npm ci` sang `npm install` (không có package-lock.json)

### 2. ✅ Dockerfile - Gateway
- Bỏ tạo user `nginx` (đã tồn tại sẵn)

### 3. ✅ Triggers.sql
- Thêm BEFORE INSERT trigger để set giá trị tạm cho `user_code`
- Fix lỗi "Field 'user_code' doesn't have a default value"

### 4. ✅ nginx.conf
- Bỏ `limit_req_zone` (không hợp lệ trong server context)
- Bỏ authentication routes phức tạp (không thể dùng proxy_* trong if)

---

## 🎯 Bước tiếp theo

1. ✅ Backend đã chạy thành công
2. 📱 Tích hợp với Frontend
3. 🧪 Test các API endpoints
4. 🚀 Deploy lên production (nếu cần)

---

## 💡 Tips

- Sử dụng **phpMyAdmin** (http://localhost:8080) để xem database
- Check logs thường xuyên: `docker-compose logs -f`
- Restart individual service: `docker-compose restart <service-name>`
- View resource usage: `docker stats`

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Docker Desktop đang chạy
2. Không có service nào dùng ports: 80, 3001, 3306, 8080
3. Đủ dung lượng disk (Docker cần ít nhất 10GB)
4. Logs của containers: `docker logs <container-name>`

