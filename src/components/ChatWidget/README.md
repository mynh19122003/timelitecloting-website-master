# 💬 Chat Widget - WhatsApp, Messenger & Live Chat

## 📋 Tổng Quan

Chat Widget hỗ trợ 3 kênh chat:
1. **WhatsApp** - Link trực tiếp đến WhatsApp Business
2. **Facebook Messenger** - Link đến Facebook Page Messenger
3. **Live Chat** - Real-time chat với Socket.IO (sẵn sàng tích hợp)

---

## 🎨 Components

### 1. **ChatWidget** (`ChatWidget.tsx`)
- Floating button ở góc phải màn hình
- Menu popup với 3 options
- Responsive design

### 2. **LiveChatModal** (`LiveChatModal.tsx`)
- Full-featured chat interface
- Message history
- Real-time typing
- **Ready for Socket.IO integration**

---

## ⚙️ Cấu Hình

### WhatsApp Configuration

**File:** `src/components/ChatWidget/ChatWidget.tsx`

```typescript
const openWhatsApp = () => {
  const phoneNumber = '16692547401'; // ✅ ĐÃ CẤU HÌNH
  const message = encodeURIComponent('Hello! I have a question about Timelite Couture products.');
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
};
```

**Lưu ý:**
- Format: `[country_code][number]` (no spaces, no +)
- Example: `16692547401` = +1 669-254-7401

### Messenger Configuration

**File:** `src/components/ChatWidget/ChatWidget.tsx`

```typescript
const openMessenger = () => {
  const pageId = 'timelitecouture'; // ⚠️ THAY ĐỔI NÀY
  window.open(`https://m.me/${pageId}`, '_blank');
};
```

**Cách lấy Page ID:**
1. Vào Facebook Page của bạn
2. Settings → Messaging
3. Copy **Page Username** hoặc **Page ID**
4. Replace `'timelitecouture'` bằng username của bạn

---

## 🔌 Socket.IO Integration Guide

### Bước 1: Install Dependencies

```bash
npm install socket.io-client
```

### Bước 2: Tạo Socket Service

**File mới:** `src/services/socketService.ts`

```typescript
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  
  connect(token: string) {
    this.socket = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
    });
    
    this.socket.on('connect', () => {
      console.log('✅ Socket.IO Connected');
    });
    
    this.socket.on('disconnect', () => {
      console.log('❌ Socket.IO Disconnected');
    });
    
    return this.socket;
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
```

### Bước 3: Update LiveChatModal

**File:** `src/components/ChatWidget/LiveChatModal.tsx`

Uncomment dòng 29-65:

```typescript
import { io } from 'socket.io-client';

useEffect(() => {
  const socket = io('http://localhost:3001', {
    auth: {
      token: localStorage.getItem('authToken')
    }
  });

  socket.on('connect', () => {
    console.log('✅ Connected to chat server');
    setIsConnected(true);
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from chat server');
    setIsConnected(false);
  });

  socket.on('message', (data) => {
    const newMessage: Message = {
      id: data.id || Date.now().toString(),
      text: data.text,
      sender: 'admin',
      timestamp: new Date(data.timestamp)
    };
    setMessages(prev => [...prev, newMessage]);
  });

  return () => {
    socket.disconnect();
  };
}, []);
```

### Bước 4: Update Send Message

Replace mock response (lines 84-93) với:

```typescript
const handleSendMessage = (e: React.FormEvent) => {
  e.preventDefault();
  if (!inputMessage.trim()) return;

  const newMessage: Message = {
    id: Date.now().toString(),
    text: inputMessage,
    sender: 'user',
    timestamp: new Date(),
  };

  setMessages([...messages, newMessage]);
  
  // 🔌 SEND VIA SOCKET.IO
  socket.emit('message', {
    text: inputMessage,
    timestamp: new Date().toISOString()
  });
  
  setInputMessage('');
};
```

---

## 🚀 Backend Socket.IO Setup

### Node.js Backend

**File:** `ecommerce-backend/backend-node/src/server.js`

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Socket.IO Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.userId}`);
  
  // Join user to their own room
  socket.join(`user_${socket.userId}`);
  
  // Handle incoming messages
  socket.on('message', async (data) => {
    try {
      // Save message to database
      const message = await saveMessageToDb({
        userId: socket.userId,
        text: data.text,
        timestamp: data.timestamp
      });
      
      // Echo back to user
      socket.emit('message', {
        id: message.id,
        text: message.text,
        sender: 'user',
        timestamp: message.timestamp
      });
      
      // Notify admin dashboard
      io.to('admin_room').emit('new_message', {
        userId: socket.userId,
        message: message
      });
      
    } catch (error) {
      console.error('❌ Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.userId}`);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💬 Socket.IO ready`);
});
```

### Database Schema

**File:** `ecommerce-backend/database/add_chat_tables.sql`

```sql
-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  admin_id INT NULL,
  message TEXT NOT NULL,
  sender ENUM('user', 'admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  admin_id INT NULL,
  status ENUM('active', 'closed') DEFAULT 'active',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);
```

---

## 🎯 Features

### ✅ Đã Hoàn Thành

- [x] Floating chat button with animation
- [x] 3 chat options (WhatsApp, Messenger, Live Chat)
- [x] Beautiful UI with gradient colors
- [x] Responsive design (mobile + desktop)
- [x] Live Chat modal with message history
- [x] Message timestamps
- [x] Online/offline status indicator
- [x] Smooth animations
- [x] Accessibility (keyboard navigation, ARIA labels)
- [x] Custom scrollbar styling
- [x] Auto-scroll to latest message

### 🔜 Cần Tích Hợp

- [ ] Socket.IO real-time messaging
- [ ] Message persistence (save to database)
- [ ] File upload support
- [ ] Typing indicator
- [ ] Read receipts
- [ ] Admin dashboard for handling messages
- [ ] Push notifications
- [ ] Message search/filter

---

## 📱 Responsive Design

- **Desktop:** Full-featured chat modal (28rem width)
- **Mobile:** Full-screen chat interface
- **Tablet:** Optimized layout

---

## 🎨 Customization

### Colors

**File:** `ChatWidget.module.css` & `LiveChatModal.module.css`

```css
/* Primary Brand Color */
--brand-red: #dc143c;
--brand-gold: #ffd700;

/* Chat Options */
--whatsapp-green: #25d366;
--messenger-blue: #0084ff;
```

### Positioning

```css
.chatWidget {
  bottom: 2rem;
  right: 2rem;
  /* Change to left: 2rem; for left positioning */
}
```

---

## 🐛 Troubleshooting

### WhatsApp không mở

- **Lỗi:** "Invalid phone number"
- **Fix:** Format `phoneNumber` phải là: `[country_code][number]` (no spaces, no +)
- **Example:** `16692547401` thay vì `+1 669-254-7401`

### Messenger không hoạt động

- **Lỗi:** "Page not found"
- **Fix:** Thay `pageId` bằng **exact Facebook Page username** hoặc Page ID
- **Check:** Truy cập `https://m.me/YOUR_PAGE_ID` trong browser

### Socket.IO không kết nối

- **Lỗi:** "Connection refused"
- **Fix:**
  1. Check backend running: `docker ps | grep backend-node`
  2. Check CORS configuration
  3. Verify port 3001 is accessible
  4. Check authentication token

---

## 📚 API Reference

### Socket.IO Events

#### Client → Server

```typescript
// Send message
socket.emit('message', {
  text: string,
  timestamp: string
});

// User typing
socket.emit('typing', { isTyping: boolean });
```

#### Server → Client

```typescript
// Receive message
socket.on('message', (data: {
  id: string,
  text: string,
  sender: 'user' | 'admin',
  timestamp: string
}) => {});

// Connection status
socket.on('connect', () => {});
socket.on('disconnect', () => {});

// Admin typing
socket.on('admin_typing', (data: { isTyping: boolean }) => {});
```

---

## 🔒 Security Best Practices

1. **Authentication:** Always verify JWT token on Socket.IO connection
2. **Rate Limiting:** Limit messages per user per minute
3. **Input Validation:** Sanitize all message content
4. **XSS Prevention:** Escape HTML in messages
5. **CORS:** Restrict Socket.IO origins

---

## 📦 File Structure

```
src/components/ChatWidget/
├── ChatWidget.tsx           # Main widget component
├── ChatWidget.module.css    # Widget styling
├── LiveChatModal.tsx        # Live chat modal
├── LiveChatModal.module.css # Modal styling
├── index.ts                 # Barrel export
└── README.md               # This file
```

---

## 🎉 Testing

### Manual Test Steps

1. **Refresh browser** (F5)
2. **Check chat button** appears in bottom-right corner
3. **Click button** → menu opens with 3 options
4. **Test WhatsApp:** Opens WhatsApp with pre-filled message
5. **Test Messenger:** Opens Facebook Messenger
6. **Test Live Chat:** Opens chat modal
7. **Send message:** Type and send in live chat
8. **Check auto-reply:** Receives admin response (mock)

### Expected Behavior

- ✅ Chat button animates on hover
- ✅ Menu slides up smoothly
- ✅ WhatsApp opens in new tab
- ✅ Messenger opens in new tab
- ✅ Live chat modal opens with welcome message
- ✅ Messages appear in chat history
- ✅ Timestamps display correctly
- ✅ Online status shows green dot

---

## 📞 Support

Nếu cần hỗ trợ tích hợp Socket.IO hoặc custom features, liên hệ:
- 📧 Email: tim19092016@gmail.com
- 📱 Hotline: 669.254.7401

---

**Version:** 1.0.0  
**Last Updated:** October 28, 2025  
**Author:** Timelite Development Team



