# HƯỚNG DẪN CẬP NHẬT CORS TRÊN VPS

## ⚠️ QUAN TRỌNG

File `nginx.conf` trên máy local đã được sửa xong.
Bạn CẦN upload file này lên VPS và restart gateway!

---

## CÁCH 1: Dùng WinSCP/FileZilla (ĐỀ XUẤT - NHANH NHẤT)

### Bước 1: Kết nối VPS

1. Mở **WinSCP** hoặc **FileZilla**
2. Nhập thông tin kết nối:
   - Host: `your-vps-ip` hoặc `timeliteclothing.com`
   - Port: `22`
   - Username: `your-username`
   - Password: `your-password`

### Bước 2: Upload file

1. Trên VPS, tìm thư mục: `/var/www/ecommerce-backend/gateway/`
   (Hoặc `/home/your-user/ecommerce-backend/gateway/`)

2. **Backup file cũ** (quan trọng!):

   - Right-click vào `nginx.conf` → Rename → `nginx.conf.backup`

3. **Upload file mới**:
   - Từ máy local:
     ```
     C:\Code\timelitecloting-website-master\timelitecloting-website-master\ecommerce-backend\gateway\nginx.conf
     ```
   - Upload lên VPS tại thư mục gateway (ghi đè nếu hỏi)

### Bước 3: Restart Gateway

Mở **PuTTY** hoặc SSH terminal:

```bash
cd /var/www/ecommerce-backend
# Hoặc cd /path/to/your/ecommerce-backend

# Test config
docker-compose exec gateway nginx -t

# Restart nếu OK
docker-compose restart gateway

# Xem logs
docker-compose logs gateway --tail=50
```

---

## CÁCH 2: Chạy Script Tự Động trên VPS

### Bước 1: Upload script lên VPS

Upload file này lên VPS:

```
update-cors-vps.sh
```

### Bước 2: Chạy script

```bash
# SSH vào VPS
ssh user@your-vps-ip

# Phân quyền thực thi
chmod +x update-cors-vps.sh

# Chạy script
./update-cors-vps.sh
```

Script sẽ tự động:

- ✓ Tìm thư mục ecommerce-backend
- ✓ Backup file cũ
- ✓ Sửa CORS trong nginx.conf
- ✓ Test cấu hình
- ✓ Restart gateway
- ✓ Kiểm tra logs
- ✓ Test CORS hoạt động

---

## CÁCH 3: Sửa thủ công trên VPS

```bash
# SSH vào VPS
ssh user@your-vps-ip

# Tìm thư mục
cd /var/www/ecommerce-backend/gateway
# Hoặc
cd /home/your-user/ecommerce-backend/gateway

# Backup
cp nginx.conf nginx.conf.backup

# Edit file
nano nginx.conf
```

### Tìm và thay thế:

**Tìm** (Line 29):

```nginx
set $cors_origin "";
if ($http_origin ~* "^http://localhost:(3000|3002)$") {
    set $cors_origin $http_origin;
}
```

**Thay bằng**:

```nginx
set $cors_origin "*";
```

**Sau đó tìm TẤT CẢ dòng này**:

```nginx
add_header Access-Control-Allow-Origin $cors_origin always;
```

**Thay TẤT CẢ thành**:

```nginx
add_header Access-Control-Allow-Origin "*" always;
```

**Xóa TẤT CẢ dòng**:

```nginx
add_header Access-Control-Allow-Credentials "true" always;
```

(Vì wildcard `*` không cho phép credentials)

### Lưu và thoát:

- Nhấn `Ctrl + O` → Enter (save)
- Nhấn `Ctrl + X` (exit)

### Restart:

```bash
cd ..
docker-compose exec gateway nginx -t
docker-compose restart gateway
docker-compose logs gateway --tail=50
```

---

## ✅ Kiểm tra kết quả

### Test CORS bằng curl:

```bash
curl -I -X OPTIONS \
  -H "Origin: https://timeliteclothing.com" \
  -H "Access-Control-Request-Method: GET" \
  https://api.timeliteclothing.com/api/php/products
```

**Phải thấy**:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
```

### Test trên browser:

1. Mở https://timeliteclothing.com/shop
2. Mở DevTools (F12) → Console tab
3. Không còn lỗi CORS màu đỏ nữa!
4. Phải thấy products load thành công

---

## 🔍 Troubleshooting

### Nếu vẫn thấy lỗi CORS:

1. **Xóa cache browser**:

   ```
   Ctrl + Shift + Delete → Clear cache
   ```

2. **Test trong Incognito mode**:

   ```
   Ctrl + Shift + N (Chrome)
   ```

3. **Check logs chi tiết**:

   ```bash
   docker-compose logs gateway --tail=100 -f
   ```

4. **Restart toàn bộ stack**:

   ```bash
   docker-compose down
   docker-compose up -d
   ```

5. **Kiểm tra file đã được mount đúng**:
   ```bash
   docker-compose exec gateway cat /etc/nginx/nginx.conf | head -n 50
   ```
   Phải thấy: `set $cors_origin "*";`

---

## 📞 Cần hỗ trợ?

Nếu vẫn không được, gửi cho tôi:

1. Output của: `docker-compose logs gateway --tail=50`
2. Output của: `curl -I https://api.timeliteclothing.com/api/php/products`
3. Screenshot lỗi CORS từ browser console
