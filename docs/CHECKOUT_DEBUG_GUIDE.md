# 🔍 Checkout Debug Guide

## ✅ Debug Logging Added

Đã thêm comprehensive logging vào checkout flow để debug lỗi order creation.

---

## 📍 Where to Check Logs

### 1. **Browser Console**

Mở DevTools (F12) → Console tab để xem:

```
=== CHECKOUT DEBUG ===
Cart items: [...]
Product ID Map: {...}
Checking item: Regal Crimson Ao Dai with ID: ao-dai-regal-crimson
✅ Mapped ao-dai-regal-crimson → product_id: 1
📦 Order Data to be sent:
{
  "items": [
    {
      "product_id": 1,
      "quantity": 1,
      "price": 1890
    }
  ],
  "product_names": "Regal Crimson Ao Dai x1",
  "total_amount": 1890,
  "notes": "Customer: Dat Pham, Email: demo@gmail.com..."
}
======================
[ApiService] createOrder called with data: {...}
[HttpClient] REQUEST: {...}
[HttpClient] RESPONSE: {...}
✅ API Response: {...}
```

---

## 🔍 What Gets Logged

### **Step 1: Cart Items Check**
```javascript
console.log('Cart items:', items);
console.log('Product ID Map:', productIdMap);
```

**Purpose:** Verify cart items have correct IDs

**Look For:**
- ✅ `item.id` matches keys in `productIdMap`
- ❌ `item.id` không tồn tại trong `productIdMap`

---

### **Step 2: ID Mapping**
```javascript
console.log(`Checking item: ${item.name} with ID: ${item.id}`);
console.log(`✅ Mapped ${item.id} → product_id: ${productId}`);
```

**Purpose:** Verify each product ID được map đúng

**Look For:**
- ✅ Mỗi item được map thành công
- ❌ Lỗi: "Product ID not found in map for: [ID]"

---

### **Step 3: Order Data**
```javascript
console.log('📦 Order Data to be sent:');
console.log(JSON.stringify(orderData, null, 2));
```

**Purpose:** Xem chính xác data gửi lên API

**Check:**
- ✅ `items[]` có đầy đủ: `product_id`, `quantity`, `price`
- ✅ `product_names` string format đúng
- ✅ `total_amount` là number
- ✅ `notes` chứa customer info

---

### **Step 4: API Request**
```javascript
[HttpClient] REQUEST: {
  url: "http://localhost:3001/api/orders",
  method: "POST",
  hasToken: true,
  body: { ... }
}
```

**Purpose:** Verify request được gửi đúng

**Check:**
- ✅ URL đúng (Node.js hoặc PHP backend)
- ✅ `hasToken: true` (có authentication)
- ✅ Body chứa đầy đủ data

---

### **Step 5: API Response**
```javascript
[HttpClient] RESPONSE: {
  status: 201,
  ok: true,
  data: {
    success: true,
    message: "Order created successfully",
    data: { id: 1, order_number: "ORD-20231027-001", ... }
  }
}
```

**Purpose:** Xem kết quả từ backend

**Check:**
- ✅ Status: 201 (Created)
- ✅ `success: true`
- ✅ Có `order_id` hoặc `id`
- ❌ Error response với message chi tiết

---

## 🐛 Common Errors & Solutions

### **Error 1: Product ID Not Found**

**Lỗi:**
```
❌ Product ID not found in map for: [some-id]
```

**Nguyên nhân:**
- Cart item có ID không tồn tại trong `productIdMap`
- Có thể do cart lưu product cũ chưa có trong map

**Solution:**
1. Kiểm tra `productIdMap` trong `src/data/products.ts`
2. Thêm mapping cho product thiếu:
```typescript
export const productIdMap: Record<string, number> = {
  "ao-dai-regal-crimson": 1,
  "missing-product-id": 17,  // ← Thêm dòng này
  // ...
};
```

---

### **Error 2: 401 Unauthorized**

**Lỗi:**
```
[HttpClient] RESPONSE: { status: 401, error: "Unauthorized" }
```

**Nguyên nhân:**
- JWT token expired hoặc không valid
- User chưa đăng nhập

**Solution:**
1. Đăng nhập lại
2. Check token trong localStorage:
```javascript
console.log('Token:', localStorage.getItem('token'));
```

---

### **Error 3: 400 Bad Request**

**Lỗi:**
```
[HttpClient] RESPONSE: { 
  status: 400, 
  error: "Missing required field: items" 
}
```

**Nguyên nhân:**
- Request thiếu field required
- Field format không đúng

**Solution:**
1. Kiểm tra Order Data log
2. Verify tất cả required fields có mặt:
   - `items[]` (array)
   - `product_names` (string)
   - `total_amount` (number)

---

### **Error 4: 500 Internal Server Error**

**Lỗi:**
```
[HttpClient] RESPONSE: { 
  status: 500, 
  error: "ERR_CREATE_ORDER_FAILED" 
}
```

**Nguyên nhân:**
- Backend error (database, logic, etc.)

**Solution:**
1. Check backend logs:
```bash
cd ecommerce-backend
docker-compose logs backend-node
```

2. Verify database connection
3. Check database schema có đúng không

---

## 📋 Debug Checklist

Khi gặp lỗi checkout, check theo thứ tự:

### ✅ Step 1: Cart Items
- [ ] Cart có items không?
- [ ] Mỗi item có đầy đủ: `id`, `name`, `price`, `quantity`
- [ ] Item IDs có trong console log

### ✅ Step 2: Product ID Mapping
- [ ] Tất cả items được map thành công
- [ ] Không có error "Product ID not found"
- [ ] Console log có "✅ Mapped..." cho mỗi item

### ✅ Step 3: Order Data
- [ ] Order data structure đúng format
- [ ] `items` array có đầy đủ `product_id`, `quantity`, `price`
- [ ] `total_amount` là number (không phải string)
- [ ] `product_names` là string

### ✅ Step 4: Authentication
- [ ] Console log có `hasToken: true`
- [ ] Token không expired
- [ ] User đã đăng nhập

### ✅ Step 5: API Call
- [ ] Request được gửi đến đúng endpoint
- [ ] Request có Authorization header
- [ ] Backend đang chạy (check port 3001 hoặc 8000)

### ✅ Step 6: Response
- [ ] Status code 201 (success) hoặc 4xx/5xx (error)
- [ ] Response có message chi tiết
- [ ] Nếu success: có `order_id` hoặc `id`

---

## 🧪 How to Test

### **Test 1: Verify Logging Works**

1. Thêm 1 product vào cart
2. Go to Checkout page
3. Fill form và click "Place order"
4. Mở Console (F12) → Console tab
5. Verify các logs xuất hiện theo đúng thứ tự

### **Test 2: Check Product Mapping**

1. Trong console, sau khi click Place Order
2. Tìm dòng: `Checking item: [Product Name] with ID: [id]`
3. Verify ID match với ID trong `products.ts`
4. Tìm dòng: `✅ Mapped [id] → product_id: [number]`

### **Test 3: Inspect Order Data**

1. Tìm section `📦 Order Data to be sent:`
2. Copy JSON object
3. Verify structure:
```json
{
  "items": [
    {
      "product_id": 1,      // ← Must be number
      "quantity": 1,        // ← Must be number
      "price": 1890         // ← Must be number
    }
  ],
  "product_names": "Product Name x1",  // ← String
  "total_amount": 1890,                // ← Number
  "notes": "Customer: ..."             // ← String
}
```

### **Test 4: Check API Response**

1. Tìm section `[HttpClient] RESPONSE:`
2. Check `status` code:
   - `201` = Success
   - `400` = Bad request (check order data)
   - `401` = Unauthorized (login again)
   - `500` = Server error (check backend)
3. Check response `data`:
   - Success: có `order_id`, `order_number`
   - Error: có `error` message

---

## 💡 Tips

### **Enable Detailed Logging**

Nếu cần more details, thêm vào CheckoutPage.tsx:

```typescript
console.log('Full order data:', JSON.stringify(orderData, null, 2));
console.log('Request headers:', {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});
```

### **Check Backend is Running**

```bash
# Check Node.js backend
curl http://localhost:3001/health

# Check PHP backend  
curl http://localhost:8000/health.php
```

### **Test API Directly**

```powershell
# Test order creation
.\docs\test-order-apis.ps1
```

### **Clear Cart & Retry**

Nếu cart có data cũ/corrupt:
```javascript
// In browser console
localStorage.removeItem('cart');
location.reload();
```

---

## 🔧 Files with Logging

### **1. CheckoutPage.tsx** (lines 222-260)
- Cart items log
- ID mapping log  
- Order data log
- API response log

### **2. api.ts** (lines 339-359)
- API call log
- Node.js/PHP fallback log
- Error handling log

### **3. httpClient** (lines 94-114)
- HTTP request details
- Response status & data
- Token presence check

---

## 📞 Next Steps

1. **Thử checkout lại** với debug logging
2. **Copy toàn bộ console output** và paste vào đây
3. **Tìm dòng có ❌** (lỗi) hoặc error message
4. **Check solution** trong "Common Errors" section trên

---

## 📊 Example: Successful Flow

```
=== CHECKOUT DEBUG ===
Cart items: [
  {
    id: "ao-dai-regal-crimson",
    name: "Regal Crimson Ao Dai",
    price: 1890,
    quantity: 1
  }
]

Checking item: Regal Crimson Ao Dai with ID: ao-dai-regal-crimson
✅ Mapped ao-dai-regal-crimson → product_id: 1

📦 Order Data to be sent:
{
  "items": [
    {
      "product_id": 1,
      "quantity": 1,
      "price": 1890
    }
  ],
  "product_names": "Regal Crimson Ao Dai x1",
  "total_amount": 1890,
  "notes": "Customer: Dat Pham, Email: demo@gmail.com, Phone: 84914285963..."
}

[ApiService] createOrder called with data: {...}

[HttpClient] REQUEST: {
  url: "http://localhost:3001/api/orders",
  method: "POST",
  hasToken: true,
  body: { items: [...], product_names: "...", ... }
}

[HttpClient] RESPONSE: {
  status: 201,
  ok: true,
  data: {
    success: true,
    message: "Order created successfully",
    data: {
      id: 1,
      order_number: "ORD-20231027-001",
      user_id: 1,
      product_names: "Regal Crimson Ao Dai x1",
      total_amount: 1890,
      status: "pending",
      created_at: "2023-10-27T10:30:00.000Z"
    }
  }
}

✅ API Response: { success: true, data: {...} }
```

---

**Status:** ✅ Debug logging active  
**Next:** Test checkout và check console logs  
**Date:** October 27, 2025

