# 💬 Socket.IO Chat Integration Guide

## 📋 Tổng Quan

Tính năng chat real-time đã được tích hợp vào hệ thống sử dụng Socket.IO:
- ✅ Backend: Socket.IO server trong Node.js
- ✅ Frontend: Socket.IO client tích hợp trong LiveChatModal
- ✅ Database: Bảng `chat_messages` và `chat_sessions`
- ✅ Docker: Cấu hình Nginx proxy WebSocket

---

## 🚀 Cách Khởi Động

### 1. Rebuild Docker Containers

```powershell
cd ecommerce-backend
docker-compose down
docker-compose build --no-cache backend-node
docker-compose up -d
```

### 2. Kiểm tra Database Migration

Chat tables đã được tạo tự động khi khởi động MySQL. Nếu chưa có, chạy:

```powershell
Get-Content .\database\migrations\2025-01-15-create-chat-tables.sql | docker exec -i ecommerce_mysql mysql -uroot -prootpassword ecommerce_db
```

### 3. Kiểm tra Socket.IO Server

```powershell
# Xem logs của backend-node
docker logs ecommerce-backend-node

# Bạn sẽ thấy:
# 💬 Socket.IO server ready on port 3001
```

---

## 🔧 Cấu Hình

### Backend (ecommerce-backend/backend-node/src/app.js)

Socket.IO server đã được cấu hình với:
- CORS cho phép frontend kết nối
- Authentication middleware (JWT token từ localStorage)
- Message persistence vào database
- Session management

### Frontend (src/components/ChatWidget/LiveChatModal.tsx)

Socket.IO client tự động:
- Kết nối khi mở modal
- Gửi token authentication nếu user đã login
- Load message history khi kết nối
- Tự động reconnect khi disconnect

### Nginx Gateway (ecommerce-backend/gateway/nginx.conf)

Đã cấu hình WebSocket proxy:
```
location /socket.io/ {
    proxy_pass http://backend_node;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    ...
}
```

---

## 📡 Socket.IO Events

### Client → Server

#### `message`
Gửi tin nhắn từ user:
```javascript
socket.emit('message', {
  text: 'Hello!'
});
```

#### `adminMessage`
Gửi tin nhắn từ admin (future feature):
```javascript
socket.emit('adminMessage', {
  text: 'Hello from admin',
  targetUserId: 123,
  targetUserEmail: 'user@example.com'
});
```

#### `typing`
Gửi typing indicator:
```javascript
socket.emit('typing', {
  isTyping: true
});
```

### Server → Client

#### `connected`
Xác nhận kết nối thành công:
```javascript
socket.on('connected', (data) => {
  console.log(data); // { message, sessionId, userId, userEmail, userName }
});
```

#### `messageHistory`
Nhận lịch sử tin nhắn:
```javascript
socket.on('messageHistory', (history) => {
  // history là array các messages
});
```

#### `message`
Nhận tin nhắn mới:
```javascript
socket.on('message', (data) => {
  console.log(data); // { id, text, sender, userId, userEmail, userName, timestamp }
});
```

#### `error`
Nhận lỗi:
```javascript
socket.on('error', (error) => {
  console.error(error);
});
```

---

## 🗄️ Database Schema

### `chat_messages`
Lưu trữ tất cả tin nhắn:
- `id`: Primary key
- `user_id`: ID của user (NULL nếu guest)
- `user_email`: Email của user/guest
- `user_name`: Tên của user/guest
- `message`: Nội dung tin nhắn
- `sender_type`: 'user' hoặc 'admin'
- `is_read`: Đã đọc chưa
- `created_at`, `updated_at`: Timestamps

### `chat_sessions`
Quản lý phiên chat Socket.IO:
- `id`: Primary key
- `session_id`: Socket.IO session ID
- `user_id`: ID của user (NULL nếu guest)
- `user_email`: Email của user/guest
- `user_name`: Tên của user/guest
- `is_active`: Phiên có đang active không
- `last_activity`: Lần hoạt động cuối
- `created_at`: Thời gian tạo

---

## 🧪 Testing

### 1. Test Socket.IO Connection

Mở browser console và kiểm tra:
```
✅ Connected to chat server
📡 Server confirmed connection: {...}
📜 Message history received: [...]
```

### 2. Test Gửi Tin Nhắn

1. Mở Live Chat modal
2. Gửi một tin nhắn
3. Kiểm tra database:
```sql
SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 10;
```

### 3. Test Multiple Users

Mở nhiều browser tabs/windows để test chat real-time giữa nhiều users.

---

## 🔒 Authentication

Socket.IO tự động authenticate user nếu có token trong localStorage:
- Authenticated users: Lưu với `user_id`
- Guest users: Lưu với `user_email` và `user_name`

---

## 🐛 Troubleshooting

### Socket.IO không kết nối được

1. Kiểm tra Nginx logs:
```powershell
docker logs ecommerce-gateway
```

2. Kiểm tra backend-node logs:
```powershell
docker logs ecommerce-backend-node
```

3. Kiểm tra CORS settings trong `app.js`

4. Kiểm tra URL trong frontend:
```typescript
// src/components/ChatWidget/LiveChatModal.tsx
const socketUrl = API_CONFIG.BASE_URL.replace('/api', '');
```

### WebSocket không hoạt động qua Nginx

Đảm bảo Nginx đã được rebuild:
```powershell
docker-compose build gateway
docker-compose up -d gateway
```

### Messages không được lưu vào database

Kiểm tra database connection và table existence:
```sql
SHOW TABLES LIKE 'chat%';
SELECT COUNT(*) FROM chat_messages;
```

---

## 📝 Future Enhancements

- [ ] Admin panel để trả lời tin nhắn
- [ ] Typing indicators
- [ ] File/image sharing
- [ ] Read receipts
- [ ] Notification system
- [ ] Chat rooms/group chat

---

## ✅ Checklist Hoàn Thành

- [x] Socket.IO server trong backend
- [x] Socket.IO client trong frontend
- [x] Database schema cho chat
- [x] Nginx WebSocket proxy
- [x] Authentication integration
- [x] Message persistence
- [x] Session management
- [x] Error handling
- [x] Auto-reconnection

---

**Tính năng chat đã sẵn sàng sử dụng! 🎉**




