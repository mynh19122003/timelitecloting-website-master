# Fix CORS và Admin Routing

## Vấn đề:
1. CORS error khi gọi API từ browser
2. Admin pages bị 404

## Giải pháp đã áp dụng:

### 1. CORS Configuration trong Gateway Nginx
- Đã cập nhật CORS headers cho PHP backend
- Đảm bảo OPTIONS preflight requests được handle đúng
- Thêm X-Admin-Token vào allowed headers

### 2. Admin Routing
- Đơn giản hóa .htaccess - tất cả routes fallback về index.html
- React Router sẽ handle routing client-side
- Admin HTML files đã được generate đúng trong out/admin/

## Cần làm trên VPS:

1. **Restart Gateway Docker container:**
```bash
cd ecommerce-backend
docker-compose restart gateway
```

2. **Kiểm tra CORS headers:**
```bash
curl -X OPTIONS https://api.timeliteclothing.com/api/php/products \
  -H "Origin: https://timeliteclothing.com" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

3. **Deploy frontend:**
- Copy toàn bộ `out/` directory lên webroot
- Đảm bảo `.htaccess` được copy đúng

