# Phân tích CORS Configuration

## 🔍 Tổng quan

Sau khi kiểm tra code, tôi đã phát hiện **một vấn đề CORS nghiêm trọng** có thể gây lỗi khi frontend gọi API với credentials (JWT token).

## ⚠️ Vấn đề phát hiện

### 1. **Lỗi CORS: `Access-Control-Allow-Origin: "*"` với `credentials: true`**

**Vị trí:** `ecommerce-backend/gateway/nginx.conf`

**Vấn đề:**
- Nhiều location blocks sử dụng `Access-Control-Allow-Origin "*"` cùng với `Access-Control-Allow-Credentials "true"`
- Browser **KHÔNG cho phép** sử dụng `"*"` khi có `credentials: true`
- Điều này sẽ khiến tất cả requests có JWT token bị browser từ chối

**Các location bị ảnh hưởng:**
- `/admin/` (line 138-141)
- `/api/php/` (line 205-208)
- `/api/orders` (line 240-244)

**Ví dụ lỗi:**
```nginx
# ❌ SAI - Không thể dùng cả hai cùng lúc
add_header Access-Control-Allow-Origin "*" always;
add_header Access-Control-Allow-Credentials "true" always;
```

### 2. **Frontend API Configuration**

**File:** `src/config/api.ts`

**Hiện tại:**
- Development: `http://localhost:3002` (gateway) hoặc `http://localhost:3001` (backend trực tiếp)
- Production: Cần cấu hình qua `NEXT_PUBLIC_API_URL`

**Vấn đề:**
- Khi deploy static export lên VPS, frontend sẽ gọi API từ domain khác
- Cần đảm bảo CORS cho phép origin của frontend

## ✅ Giải pháp

### Giải pháp 1: Sửa nginx.conf để hỗ trợ credentials đúng cách (đã áp dụng cho `https://api.timeliteclothing.com`)

**Option A: Dynamic Origin (Khuyến nghị cho production)**

```nginx
# Thay vì hardcode "*", sử dụng origin từ request
set $cors_origin $http_origin;

# Validate origin (whitelist)
if ($http_origin ~* "^https?://(localhost|127\.0\.0\.1|api\.timeliteclothing\.com)(:[0-9]+)?$") {
    set $cors_origin $http_origin;
}

# Nếu không có origin hoặc không match, dùng "*" (không credentials)
if ($cors_origin = "") {
    set $cors_origin "*";
}

# Location block
location /api/node/ {
    add_header Access-Control-Allow-Origin $cors_origin always;
    add_header Access-Control-Allow-Credentials "true" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, Origin, X-Requested-With" always;
    add_header Access-Control-Max-Age "3600" always;
    
    # Preflight
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin $cors_origin always;
        add_header Access-Control-Allow-Credentials "true" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, Origin, X-Requested-With" always;
        add_header Access-Control-Max-Age "3600" always;
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 204;
    }
    
    # ... proxy config
}
```

**Option B: Environment-based Origin (Đơn giản hơn)**

```nginx
# Set origin từ environment variable
set $cors_origin "http://localhost:3000";  # Default dev
# Trong production, set qua env: CORS_ORIGIN=https://api.timeliteclothing.com

location /api/node/ {
    add_header Access-Control-Allow-Origin $cors_origin always;
    add_header Access-Control-Allow-Credentials "true" always;
    # ... rest of config
}
```

### Giải pháp 2: Tách biệt endpoints có/không credentials

- **Endpoints cần credentials** (có JWT): Dùng origin cụ thể
- **Endpoints public** (không cần JWT): Có thể dùng `"*"`

### Giải pháp 3: Sửa frontend để không dùng credentials khi không cần

**File:** `src/services/api.ts`

Hiện tại frontend luôn gửi credentials. Có thể tối ưu:
- Chỉ gửi credentials cho authenticated endpoints
- Public endpoints (products, health) không cần credentials

## 🧪 Test CORS

Đã tạo script test: `scripts/test-cors.ps1`

**Cách chạy:**
```powershell
# Đảm bảo backend đang chạy
cd ecommerce-backend
docker-compose up -d

# Chạy test
cd ..
powershell -ExecutionPolicy Bypass -File scripts/test-cors.ps1
```

**Kiểm tra thủ công trong browser console:**
```javascript
// Test preflight
fetch('http://localhost:3002/api/node/users/login', {
    method: 'OPTIONS',
    headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
    }
}).then(r => {
    console.log('Status:', r.status);
    console.log('CORS Headers:', {
        origin: r.headers.get('Access-Control-Allow-Origin'),
        credentials: r.headers.get('Access-Control-Allow-Credentials'),
        methods: r.headers.get('Access-Control-Allow-Methods'),
        headers: r.headers.get('Access-Control-Allow-Headers')
    });
});

// Test actual request
fetch('http://localhost:3002/api/node/users/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
    },
    credentials: 'include',
    body: JSON.stringify({ email: 'test@test.com', password: 'test' })
}).then(r => r.json()).then(console.log).catch(console.error);
```

## 📋 Checklist sửa lỗi

- [ ] Sửa nginx.conf: Thay `"*"` bằng origin cụ thể cho endpoints có credentials
- [ ] Cấu hình CORS_ORIGIN environment variable cho production
- [ ] Test CORS với script test-cors.ps1
- [ ] Test trong browser console
- [ ] Cập nhật frontend API config cho production domain
- [ ] Document CORS configuration trong README

## 🔗 Tài liệu tham khảo

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [CORS với credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#requests_with_credentials)
- [Nginx CORS configuration](https://enable-cors.org/server_nginx.html)

