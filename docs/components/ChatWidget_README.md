# 💬 Chat Widget - WhatsApp & Messenger

## 📋 Tổng Quan

Chat Widget hỗ trợ 2 kênh chat:
1. **WhatsApp** - Link trực tiếp đến WhatsApp Business
2. **Facebook Messenger** - Link đến Facebook Page Messenger

---

## 🎨 Components

### 1. **ChatWidget** (`ChatWidget.tsx`)
- Floating button ở góc phải màn hình
- Menu popup với 2 options (WhatsApp, Messenger)
- Responsive design

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

## 🎯 Features

### ✅ Đã Hoàn Thành

- [x] Floating chat button with animation
- [x] 2 chat options (WhatsApp, Messenger)
- [x] Beautiful UI with gradient colors
- [x] Responsive design (mobile + desktop)
- [x] Smooth animations
- [x] Accessibility (keyboard navigation, ARIA labels)

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

---

---

## 📦 File Structure

```
src/components/ChatWidget/
├── ChatWidget.tsx           # Main widget component
├── ChatWidget.module.css    # Widget styling
├── index.ts                 # Barrel export
└── README.md               # This file
```

---

## 🎉 Testing

### Manual Test Steps

1. **Refresh browser** (F5)
2. **Check chat button** appears in bottom-right corner
3. **Click button** → menu opens with 2 options
4. **Test WhatsApp:** Opens WhatsApp with pre-filled message
5. **Test Messenger:** Opens Facebook Messenger

### Expected Behavior

- ✅ Chat button animates on hover
- ✅ Menu slides up smoothly
- ✅ WhatsApp opens in new tab
- ✅ Messenger opens in new tab

---

## 📞 Support

Nếu cần hỗ trợ hoặc custom features, liên hệ:
- 📧 Email: tim19092016@gmail.com
- 📱 Hotline: 669.254.7401

---

**Version:** 1.0.0  
**Last Updated:** October 28, 2025  
**Author:** Timelite Development Team



