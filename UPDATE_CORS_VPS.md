# Hướng dẫn cập nhật CORS trên VPS

## Cách 1: Upload file nginx.conf mới

### Bước 1: Upload file

Sử dụng WinSCP, FileZilla, hoặc SCP command để upload file:

```
Local file: C:\Code\timelitecloting-website-master\timelitecloting-website-master\ecommerce-backend\gateway\nginx.conf

Upload đến: /path/to/ecommerce-backend/gateway/nginx.conf trên VPS
```

### Bước 2: Restart Gateway trên VPS

```bash
cd /path/to/ecommerce-backend
docker-compose restart gateway
docker-compose logs gateway --tail=50
```

---

## Cách 2: Edit trực tiếp trên VPS

SSH vào VPS và chạy:

```bash
cd /path/to/ecommerce-backend/gateway
nano nginx.conf
```

### Thay đổi dòng 29-30 từ:

```nginx
set $cors_origin "";
if ($http_origin ~* "^http://localhost:(3000|3002)$") {
    set $cors_origin $http_origin;
}
```

### Thành:

```nginx
set $cors_origin "*";
# Accept all origins
```

### Sau đó tìm và thay thế TẤT CẢ các dòng:

```nginx
add_header Access-Control-Allow-Origin $cors_origin always;
```

### Thành:

```nginx
add_header Access-Control-Allow-Origin "*" always;
```

### Lưu lại và restart:

```bash
# Test config
docker-compose exec gateway nginx -t

# Restart
docker-compose restart gateway

# Check logs
docker-compose logs gateway --tail=50
```

---

## Cách 3: Sử dụng sed command để replace tự động

```bash
cd /path/to/ecommerce-backend/gateway

# Backup
cp nginx.conf nginx.conf.backup

# Replace $cors_origin thành "*"
sed -i 's/$cors_origin/"*"/g' nginx.conf

# Restart
cd ..
docker-compose restart gateway
```

---

## Kiểm tra kết quả

Sau khi restart, test bằng curl:

```bash
curl -I -X OPTIONS \
  -H "Origin: https://timeliteclothing.com" \
  -H "Access-Control-Request-Method: GET" \
  https://api.timeliteclothing.com/api/php/products

# Phải thấy header:
# Access-Control-Allow-Origin: *
```

Hoặc test trong browser:

1. Mở https://timeliteclothing.com/shop
2. Mở DevTools (F12) > Console
3. Không còn lỗi CORS nữa
