# Admin API Endpoints - Danh sách đầy đủ để test trên Postman

## Base URL
- **Local (qua Gateway):** `http://localhost:3001/admin`
- **Direct (nếu chạy riêng):** `http://localhost:3002/admin`

## Authentication

Tất cả các endpoints (trừ `/admin/auth/login` và `/admin/health`) yêu cầu:
- **Header:** `Authorization: Bearer <token>`
- Token được lấy từ response của `/admin/auth/login`

---

## 1. Authentication Endpoints

### POST `/admin/auth/login`
Đăng nhập admin

**Request Body:**
```json
{
  "email": "admin@gmail.com",
  "password": "19122003"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": {
      "id": 1,
      "admin_id": "ADMIN001",
      "email": "admin@gmail.com",
      "name": "Admin Name",
      "role": "super_admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "ERR_INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

---

### GET `/admin/auth/me`
Lấy thông tin admin hiện tại (yêu cầu token)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "admin_id": "ADMIN001",
    "email": "admin@gmail.com",
    "name": "Admin Name",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### PUT `/admin/auth/profile`
Cập nhật profile admin (yêu cầu token)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "New Admin Name"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "admin_id": "ADMIN001",
    "email": "admin@gmail.com",
    "name": "New Admin Name",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### PUT `/admin/auth/password`
Đổi mật khẩu (yêu cầu token)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error (400 Bad Request):**
```json
{
  "error": "ERR_INVALID_CURRENT_PASSWORD",
  "message": "Current password is incorrect"
}
```

---

## 2. Products Endpoints

### GET `/admin/products`
Lấy danh sách sản phẩm

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số items mỗi trang (default: 20)
- `search` (optional): Tìm kiếm theo tên sản phẩm
- `category` (optional): Lọc theo category

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "items": [
    {
      "id": 1,
      "products_id": "PID001",
      "products_name": "Product Name",
      "products_price": 100000,
      "products_image": "/admin/media/image.jpg",
      "products_description": "Description",
      "products_category": "Category",
      "products_status": "active",
      "products_stock": 100,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

### POST `/admin/products`
Tạo sản phẩm mới (yêu cầu ADMIN_API_TOKEN)

**Headers:**
```
Authorization: Bearer <admin_api_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `name`: Tên sản phẩm (required)
- `price`: Giá (required, number)
- `description`: Mô tả (optional)
- `category`: Danh mục (optional)
- `stock`: Số lượng tồn kho (optional, default: 0)
- `image`: File ảnh (optional)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "products_id": "PID001",
    "products_name": "Product Name",
    "products_price": 100000,
    "products_image": "/admin/media/image.jpg",
    ...
  }
}
```

---

### GET `/admin/products/:id`
Lấy chi tiết sản phẩm theo ID hoặc products_id

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "products_id": "PID001",
    "products_name": "Product Name",
    "products_price": 100000,
    "products_image": "/admin/media/image.jpg",
    "products_description": "Description",
    "products_category": "Category",
    "products_status": "active",
    "products_stock": 100,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### PATCH `/admin/products/:id`
Cập nhật sản phẩm (yêu cầu ADMIN_API_TOKEN)

**Headers:**
```
Authorization: Bearer <admin_api_token>
Content-Type: application/json hoặc multipart/form-data
```

**Request Body (JSON hoặc Form Data):**
```json
{
  "name": "Updated Product Name",
  "price": 150000,
  "description": "Updated description",
  "category": "Updated Category",
  "stock": 50,
  "status": "active"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 1,
    "products_id": "PID001",
    "products_name": "Updated Product Name",
    ...
  }
}
```

---

## 3. Orders Endpoints

### GET `/admin/orders`
Lấy danh sách đơn hàng

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số items mỗi trang (default: 20)
- `status` (optional): Lọc theo trạng thái (pending, processing, shipped, delivered, cancelled)
- `search` (optional): Tìm kiếm theo order_id hoặc customer name
- `startDate` (optional): Ngày bắt đầu (YYYY-MM-DD)
- `endDate` (optional): Ngày kết thúc (YYYY-MM-DD)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "order_id": "ORD001",
        "user_id": 1,
        "user_name": "Customer Name",
        "user_email": "customer@example.com",
        "user_phone": "0123456789",
        "user_address": "123 Street, City",
        "total_amount": 200000,
        "status": "pending",
        "payment_method": "cod",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "items": [
          {
            "product_id": 1,
            "product_name": "Product Name",
            "quantity": 2,
            "price": 100000
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

### POST `/admin/orders/list`
Lấy danh sách đơn hàng (POST method với body filters)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "page": 1,
  "limit": 20,
  "status": "pending",
  "search": "ORD001",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Response:** Giống như GET `/admin/orders`

---

### GET `/admin/orders/:id`
Lấy chi tiết đơn hàng theo order_id

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_id": "ORD001",
    "user_id": 1,
    "user_name": "Customer Name",
    "user_email": "customer@example.com",
    "user_phone": "0123456789",
    "user_address": "123 Street, City",
    "total_amount": 200000,
    "status": "pending",
    "payment_method": "cod",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "items": [
      {
        "product_id": 1,
        "product_name": "Product Name",
        "quantity": 2,
        "price": 100000,
        "subtotal": 200000
      }
    ]
  }
}
```

---

### PATCH `/admin/orders/:id/status`
Cập nhật trạng thái đơn hàng (yêu cầu ADMIN_API_TOKEN)

**Headers:**
```
Authorization: Bearer <admin_api_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "processing"
}
```

**Status values:** `pending`, `processing`, `shipped`, `delivered`, `cancelled`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": 1,
    "order_id": "ORD001",
    "status": "processing",
    ...
  }
}
```

---

## 4. Customers Endpoints

### GET `/admin/customers`
Lấy danh sách khách hàng

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số items mỗi trang (default: 20)
- `search` (optional): Tìm kiếm theo name, email, phone, user_code

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": 1,
        "user_code": "USR001",
        "user_name": "Customer Name",
        "user_email": "customer@example.com",
        "user_phone": "0123456789",
        "user_address": "123 Street, City",
        "user_status": "active",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

### POST `/admin/customers/list`
Lấy danh sách khách hàng (POST method với body filters)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "page": 1,
  "limit": 20,
  "search": "customer@example.com"
}
```

**Response:** Giống như GET `/admin/customers`

---

### GET `/admin/customers/:id`
Lấy chi tiết khách hàng theo id, user_code, hoặc email

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_code": "USR001",
    "user_name": "Customer Name",
    "user_email": "customer@example.com",
    "user_phone": "0123456789",
    "user_address": "123 Street, City",
    "user_status": "active",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### PATCH `/admin/customers/:id`
Cập nhật thông tin khách hàng (yêu cầu ADMIN_API_TOKEN)

**Headers:**
```
Authorization: Bearer <admin_api_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Customer Name",
  "user_phone": "0987654321",
  "user_address": "456 New Street, City"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    "id": 1,
    "user_code": "USR001",
    "user_name": "Updated Customer Name",
    "user_phone": "0987654321",
    "user_address": "456 New Street, City",
    ...
  }
}
```

---

## 5. Conversations Endpoints

Tất cả endpoints conversations yêu cầu authentication token.

### GET `/admin/conversations`
Lấy danh sách conversations

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "conversation_id": "conv_123456789",
      "user_id": 1,
      "customer_name": "Customer Name",
      "customer_email": "customer@example.com",
      "last_message": "Hello",
      "last_message_at": "2024-01-01T00:00:00.000Z",
      "unread_count": 2,
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET `/admin/conversations/:conversationId`
Lấy chi tiết một conversation

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "conversation_id": "conv_123456789",
    "user_id": 1,
    "customer_name": "Customer Name",
    "customer_email": "customer@example.com",
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### GET `/admin/conversations/:conversationId/messages`
Lấy danh sách messages trong conversation

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "message_id": "msg_123456789",
      "conversation_id": "conv_123456789",
      "from_type": "customer",
      "from_id": "customer-1",
      "from_name": "Customer Name",
      "message": "Hello, I need help",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "message_id": "msg_987654321",
      "conversation_id": "conv_123456789",
      "from_type": "admin",
      "from_id": "1",
      "from_name": "Admin Name",
      "message": "How can I help you?",
      "created_at": "2024-01-01T00:01:00.000Z"
    }
  ]
}
```

---

## 6. Health Check

### GET `/admin/health`
Kiểm tra trạng thái service

**No authentication required**

**Response (200 OK):**
```json
{
  "status": "OK",
  "service": "admin-backend-node",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 7. Media Endpoints

### GET `/admin/media/:filename`
Lấy file media (ảnh sản phẩm)

**No authentication required**

**Example:**
```
GET http://localhost:3001/admin/media/product_123.jpg
```

---

## Error Responses

Tất cả các endpoints có thể trả về các lỗi sau:

### 400 Bad Request
```json
{
  "error": "ERR_VALIDATION_ERROR",
  "message": "Validation error details"
}
```

### 401 Unauthorized
```json
{
  "error": "ERR_INVALID_TOKEN",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "ERR_FORBIDDEN",
  "message": "Invalid admin token"
}
```

### 404 Not Found
```json
{
  "error": "ERR_NOT_FOUND",
  "message": "Endpoint not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "ERR_INTERNAL_SERVER_ERROR",
  "message": "Internal server error"
}
```

---

## Notes

1. **ADMIN_API_TOKEN**: Một số endpoints (POST products, PATCH products, PATCH orders, PATCH customers) yêu cầu `ADMIN_API_TOKEN` trong header `Authorization: Bearer <admin_api_token>`. Token này được cấu hình trong environment variable `ADMIN_API_TOKEN` của backend.

2. **Authentication Token**: Token từ `/admin/auth/login` được dùng cho các endpoints yêu cầu authentication. Token này có thời hạn (mặc định 8h).

3. **Pagination**: Các endpoints list hỗ trợ pagination với `page` và `limit`.

4. **Search**: Nhiều endpoints hỗ trợ tìm kiếm qua query parameter `search`.

5. **Base URL**: Khi test qua gateway, sử dụng `http://localhost:3001/admin`. Nếu test trực tiếp với admin-backend-node, sử dụng `http://localhost:3002/admin`.

---

## Postman Collection Setup

### Environment Variables trong Postman:
- `base_url`: `http://localhost:3001`
- `admin_token`: (sẽ được set sau khi login)
- `admin_api_token`: `admin-api-token-secret-change-in-production` (từ docker-compose.yml)

### Pre-request Script cho các requests cần token:
```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('admin_token')
});
```

### Test Script cho login để tự động lưu token:
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.token) {
        pm.environment.set('admin_token', jsonData.data.token);
    }
}
```





