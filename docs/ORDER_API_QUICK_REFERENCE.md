# 📋 Order API Quick Reference

Quick reference card for E-Commerce Order APIs.

---

## 🔐 Authentication

```javascript
// Login first
const { data: { token } } = await fetch('/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
}).then(r => r.json());

// Use token in all requests
headers: { 'Authorization': `Bearer ${token}` }
```

---

## 📦 1. Create Order

**POST** `/api/orders`

```javascript
// Request
{
  "items": [
    { "product_id": 1, "quantity": 2 }
  ],
  "product_names": "T-Shirt x2",  // ✅ Required
  "total_amount": 49.98,           // ✅ Required
  "notes": "Pack carefully"        // ❌ Optional
}

// Response (201)
{
  "success": true,
  "data": {
    "id": 1,
    "order_number": "OD00001",
    "status": "pending",
    "total_amount": 49.98,
    "created_at": "2025-10-27T16:57:48.000Z"
  }
}
```

**Limits:**
- Max 50 items per order
- Max 99 quantity per item
- Max $1,000,000 total
- Max 5 orders/minute

---

## 📜 2. Get Order History

**GET** `/api/orders/history?page=1&limit=10`

```javascript
// Response (200)
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "order_number": "OD00001",
        "product_names": "T-Shirt x2",
        "total_amount": 49.98,
        "status": "pending",
        "created_at": "2025-10-27T16:57:48.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

## 🔍 3. Get Order Detail

**GET** `/api/orders/:id`

```javascript
// Response (200)
{
  "success": true,
  "data": {
    "id": 1,
    "order_number": "OD00001",
    "product_names": "T-Shirt x2",
    "total_amount": 49.98,
    "notes": "Pack carefully",
    "status": "pending",
    "created_at": "2025-10-27T16:57:48.000Z"
  }
}
```

---

## ⚠️ Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `ERR_VALIDATION_FAILED` | 400 | Invalid request data |
| `ERR_UNAUTHORIZED` | 401 | Missing/invalid token |
| `ERR_ORDER_NOT_FOUND` | 404 | Order doesn't exist |
| `ERR_TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |
| `ERR_CREATE_ORDER_FAILED` | 500 | Server error |

---

## 🧪 Quick Test (PowerShell)

```powershell
# Run all tests
.\test-order-apis.ps1

# Manual test
$token = (Invoke-RestMethod -Uri "http://localhost:3001/api/users/login" -Method POST -ContentType "application/json" -Body '{"email":"testorder@gmail.com","password":"password123"}').data.token

Invoke-RestMethod -Uri "http://localhost:3001/api/orders" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"} -Body '{"items":[{"product_id":1,"quantity":2}],"product_names":"T-Shirt x2","total_amount":49.98}'
```

---

## 📊 Order Status

| Status | Description |
|--------|-------------|
| `pending` | Just created |
| `processing` | Being prepared |
| `shipped` | On the way |
| `delivered` | Completed |
| `cancelled` | Cancelled |

---

## 💡 Frontend Tips

```javascript
// Calculate total
const total = cart.items.reduce((sum, item) => 
  sum + (item.price * item.quantity), 0
);

// Build product names
const productNames = cart.items.map(item => 
  `${item.name} x${item.quantity}`
).join(', ');

// Create order
const orderData = {
  items: cart.items.map(item => ({
    product_id: item.id,
    quantity: item.quantity
  })),
  product_names: productNames,
  total_amount: total,
  notes: deliveryNotes
};
```

---

## 🔗 Quick Links

- Full docs: `ORDER_API_DOCUMENTATION.md`
- Test script: `test-order-apis.ps1`
- Summary: `ORDER_SYSTEM_COMPLETE.md`

**Base URL**: `http://localhost:3001/api`  
**Test User**: `testorder@gmail.com` / `password123`

