# Fix Lỗi Connection API Client - ERR_CONNECTION_REFUSED

## Vấn Đề

Frontend client đang gọi API với prefix `/user/api/php/` và `/user/api/node/`, nhưng gateway nginx không có routes cho các prefix này, dẫn đến lỗi `ERR_CONNECTION_REFUSED`.

**Lỗi cụ thể:**
```
GET http://localhost/user/api/php/products?limit=1000 net::ERR_CONNECTION_REFUSED
```

## Nguyên Nhân

1. **Frontend config** (`src/config/api.ts`):
   - Endpoints được định nghĩa với prefix `/user/api/php/` và `/user/api/node/`
   - BASE_URL: `http://localhost` (port 3001 - gateway)

2. **Gateway nginx** (`ecommerce-backend/gateway/nginx.conf`):
   - Chỉ có routes cho `/api/php/` và `/api/node/`
   - **Thiếu routes cho `/user/api/php/` và `/user/api/node/`**

## Giải Pháp Đã Áp Dụng

### 1. Thêm Routes vào Nginx Gateway

Đã thêm 2 routes mới vào `ecommerce-backend/gateway/nginx.conf`:

#### a) User API PHP Routes (dòng 118-131)
```nginx
# User API PHP routes (for client frontend)
location ~ ^/user/api/php/(.*)$ {
    set $php_uri /api/$1;
    include fastcgi_params;
    fastcgi_pass backend_php;
    fastcgi_param SCRIPT_FILENAME /var/www/html/index.php;
    fastcgi_param REQUEST_URI $php_uri;
    fastcgi_param SCRIPT_NAME /index.php;
    fastcgi_param DOCUMENT_URI $php_uri;
    fastcgi_param DOCUMENT_ROOT /var/www/html;
    fastcgi_connect_timeout 30s;
    fastcgi_send_timeout 30s;
    fastcgi_read_timeout 30s;
}
```

#### b) User API Node Routes (dòng 54-69)
```nginx
# User API Node routes (for client frontend)
location /user/api/node/ {
    rewrite ^/user/api/node/(.*) /api/$1 break;
    proxy_pass http://backend_node;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_connect_timeout 30s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;
}
```

### 2. Cách Hoạt Động

- **Request:** `GET http://localhost/user/api/php/products?limit=1000`
- **Gateway nhận:** `/user/api/php/products`
- **Rewrite:** `/api/products` (bỏ prefix `/user/api/php/`)
- **Forward đến:** PHP backend (`backend-php:9000`)
- **PHP xử lý:** `/api/products` endpoint

Tương tự cho Node.js routes:
- **Request:** `GET http://localhost/user/api/node/users/profile`
- **Gateway nhận:** `/user/api/node/users/profile`
- **Rewrite:** `/api/users/profile` (bỏ prefix `/user/api/node/`)
- **Forward đến:** Node.js backend (`backend-node:3001`)

## Cách Test

### 1. Restart Gateway Service

```bash
cd ecommerce-backend
docker-compose restart gateway
```

Hoặc rebuild nếu cần:
```bash
docker-compose up -d --build gateway
```

### 2. Kiểm Tra Services Đang Chạy

```bash
docker-compose ps
```

Đảm bảo các services sau đang chạy:
- ✅ `ecommerce-gateway` (port 3001)
- ✅ `ecommerce-backend-php` (port 9000 internal)
- ✅ `ecommerce-backend-node` (port 3001 internal)
- ✅ `ecommerce_mysql` (port 3306)

### 3. Test API Endpoints

#### Test PHP Products API:
```bash
curl http://localhost:3001/user/api/php/products?limit=10
```

#### Test Node.js Users API:
```bash
curl http://localhost:3001/user/api/node/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test Trên Frontend

1. Mở browser: `http://localhost:3000`
2. Mở DevTools Console
3. Kiểm tra xem còn lỗi `ERR_CONNECTION_REFUSED` không
4. Products page sẽ load được danh sách sản phẩm

## Routes Hiện Có Trong Gateway

### PHP Backend Routes:
- `/api/php/*` → PHP backend (cho admin/internal)
- `/user/api/php/*` → PHP backend (cho client frontend) ✅ **MỚI**

### Node.js Backend Routes:
- `/api/node/*` → Node.js backend (cho admin/internal)
- `/user/api/node/*` → Node.js backend (cho client frontend) ✅ **MỚI**
- `/api/users` → Node.js backend (legacy)
- `/api/orders` → Node.js backend (legacy)

### Admin Backend Routes:
- `/admin/*` → Admin Node.js backend (port 3002)
- `/socket.io/*` → Admin Node.js backend (WebSocket)

## Files Đã Thay Đổi

1. ✅ `ecommerce-backend/gateway/nginx.conf`
   - Thêm route `/user/api/php/` (dòng 118-131)
   - Thêm route `/user/api/node/` (dòng 54-69)

## Lưu Ý

- Gateway chạy trên port **3001** (mapped từ container port 80)
- Frontend gọi `http://localhost` (port 3001) thông qua `NEXT_PUBLIC_API_URL`
- Tất cả requests đều đi qua gateway trước khi đến backend services
- Routes được match theo thứ tự trong nginx.conf (specific routes trước, generic sau)

## Troubleshooting

### Nếu vẫn còn lỗi connection:

1. **Kiểm tra gateway logs:**
   ```bash
   docker-compose logs gateway
   ```

2. **Kiểm tra PHP backend logs:**
   ```bash
   docker-compose logs backend-php
   ```

3. **Kiểm tra nginx config syntax:**
   ```bash
   docker-compose exec gateway nginx -t
   ```

4. **Kiểm tra network connectivity:**
   ```bash
   docker-compose exec gateway ping backend-php
   docker-compose exec gateway ping backend-node
   ```

5. **Kiểm tra PHP backend đang chạy:**
   ```bash
   docker-compose exec backend-php ps aux | grep php-fpm
   ```

## Next Steps

1. ✅ Restart gateway service
2. ✅ Test API endpoints
3. ✅ Verify frontend có thể load products
4. ✅ Monitor logs để đảm bảo không có lỗi



