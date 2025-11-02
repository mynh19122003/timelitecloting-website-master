# 📦 Order Management API Documentation

Complete guide for the E-Commerce Order Management APIs.

## 🎯 Overview

The Order API provides endpoints for creating orders, viewing order history, and retrieving order details. All endpoints require authentication via JWT token.

---

## 🔐 Authentication

All order endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Get your token by logging in via `/api/users/login`.

---

## 📋 API Endpoints

### 1. Create Order

**POST** `/api/orders`

Creates a new order for the authenticated user.

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Request Body
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ],
  "product_names": "Premium T-Shirt x2, Classic Jeans x1",
  "total_amount": 149.97,
  "notes": "Please pack carefully" // Optional
}
```

#### Field Requirements

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `items` | Array | ✅ Yes | 1-50 items | Array of products to order |
| `items[].product_id` | Number | ✅ Yes | - | Valid product ID |
| `items[].quantity` | Number | ✅ Yes | 1-99 | Quantity per item |
| `product_names` | String | ✅ Yes | 1000 chars | Display names for products |
| `total_amount` | Number | ✅ Yes | Max $1,000,000 | Order total amount |
| `notes` | String | ❌ No | 2000 chars | Additional order notes |

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "order_number": "OD00001",
    "user_id": 5,
    "product_names": "Premium T-Shirt x2, Classic Jeans x1",
    "total_amount": 149.97,
    "notes": "Please pack carefully",
    "status": "pending",
    "created_at": "2025-10-27T16:45:30.000Z"
  }
}
```

#### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | `ERR_VALIDATION_FAILED` | Invalid request data |
| 404 | `ERR_PRODUCT_NOT_FOUND` | One or more products not found |
| 400 | `ERR_INSUFFICIENT_STOCK` | Not enough stock available |
| 429 | `ERR_TOO_MANY_REQUESTS` | Rate limit exceeded (max 5 orders/minute) |
| 500 | `ERR_CREATE_ORDER_FAILED` | Server error creating order |

---

### 2. Get Order History

**GET** `/api/orders/history`

Retrieves the authenticated user's order history with pagination.

#### Request Headers
```
Authorization: Bearer <token>
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Number | 1 | Page number |
| `limit` | Number | 10 | Items per page |

#### Example Request
```
GET /api/orders/history?page=1&limit=10
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "order_number": "OD00001",
        "user_id": 5,
        "product_names": "Premium T-Shirt x2",
        "total_amount": 49.98,
        "notes": "Please pack carefully",
        "status": "pending",
        "created_at": "2025-10-27T16:45:30.000Z"
      },
      {
        "id": 2,
        "order_number": "OD00002",
        "user_id": 5,
        "product_names": "Classic Jeans x1",
        "total_amount": 79.99,
        "notes": null,
        "status": "completed",
        "created_at": "2025-10-26T14:20:15.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

#### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 401 | `ERR_UNAUTHORIZED` | Missing or invalid token |
| 500 | `ERR_GET_ORDER_HISTORY_FAILED` | Server error retrieving history |

---

### 3. Get Order by ID

**GET** `/api/orders/:id`

Retrieves detailed information about a specific order.

#### Request Headers
```
Authorization: Bearer <token>
```

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Number | Order ID |

#### Example Request
```
GET /api/orders/1
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_number": "OD00001",
    "user_id": 5,
    "product_names": "Premium T-Shirt x2, Classic Jeans x1",
    "total_amount": 149.97,
    "notes": "Please pack carefully",
    "status": "pending",
    "created_at": "2025-10-27T16:45:30.000Z"
  }
}
```

#### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 401 | `ERR_UNAUTHORIZED` | Missing or invalid token |
| 404 | `ERR_ORDER_NOT_FOUND` | Order not found or doesn't belong to user |
| 500 | `ERR_GET_ORDER_FAILED` | Server error retrieving order |

---

## 📊 Order Status Values

| Status | Description |
|--------|-------------|
| `pending` | Order created, awaiting processing |
| `processing` | Order is being prepared |
| `shipped` | Order has been shipped |
| `delivered` | Order delivered to customer |
| `cancelled` | Order cancelled |

---

## 🧪 Testing the APIs

### Using PowerShell

Run the comprehensive test script:

```powershell
.\test-order-apis.ps1
```

### Using cURL (Linux/Mac)

#### Create Order
```bash
# Login first
TOKEN=$(curl -s -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testorder@gmail.com","password":"password123"}' \
  | jq -r '.data.token')

# Create order
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [{"product_id": 1, "quantity": 2}],
    "product_names": "Premium T-Shirt x2",
    "total_amount": 49.98,
    "notes": "Please pack carefully"
  }'
```

#### Get Order History
```bash
curl -X GET "http://localhost:3001/api/orders/history?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

#### Get Order by ID
```bash
curl -X GET http://localhost:3001/api/orders/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Using JavaScript/Fetch

```javascript
// Login
const loginResponse = await fetch('http://localhost:3001/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'testorder@gmail.com',
    password: 'password123'
  })
});
const { data: { token } } = await loginResponse.json();

// Create Order
const orderResponse = await fetch('http://localhost:3001/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    items: [
      { product_id: 1, quantity: 2 }
    ],
    product_names: "Premium T-Shirt x2",
    total_amount: 49.98,
    notes: "Please pack carefully"
  })
});

// Get Order History
const historyResponse = await fetch('http://localhost:3001/api/orders/history', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Get Order by ID
const detailResponse = await fetch('http://localhost:3001/api/orders/1', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 🔒 Security Features

### 1. Authentication Required
All endpoints require a valid JWT token from a logged-in user.

### 2. Rate Limiting
- **Create Order**: Maximum 5 orders per minute per user
- Prevents order spam and abuse

### 3. Input Validation
- All inputs validated with Joi schema
- Maximum limits enforced on all fields
- SQL injection protection via parameterized queries

### 4. Authorization
- Users can only access their own orders
- Order queries filtered by `user_id`

---

## 💡 Best Practices

### 1. Calculate Total on Frontend
The frontend should calculate `total_amount` based on current product prices to ensure accuracy:

```javascript
const total = items.reduce((sum, item) => {
  return sum + (item.price * item.quantity);
}, 0);
```

### 2. Build Product Names String
Create a human-readable product summary:

```javascript
const productNames = items.map(item => 
  `${item.name} x${item.quantity}`
).join(', ');
```

### 3. Handle Rate Limiting
Implement frontend logic to prevent rapid order submissions:

```javascript
let lastOrderTime = 0;
const MIN_ORDER_INTERVAL = 12000; // 12 seconds

async function createOrder(orderData) {
  const now = Date.now();
  if (now - lastOrderTime < MIN_ORDER_INTERVAL) {
    throw new Error('Please wait before creating another order');
  }
  
  lastOrderTime = now;
  // Make API call...
}
```

### 4. Error Handling
Always handle errors gracefully:

```javascript
try {
  const response = await createOrder(orderData);
  showSuccess('Order created successfully!');
} catch (error) {
  if (error.error === 'ERR_TOO_MANY_REQUESTS') {
    showError('Too many orders. Please wait a moment.');
  } else if (error.error === 'ERR_INSUFFICIENT_STOCK') {
    showError('Some items are out of stock.');
  } else {
    showError('Failed to create order. Please try again.');
  }
}
```

---

## 🐛 Troubleshooting

### Issue: "ERR_VALIDATION_FAILED"
**Cause**: Request body doesn't match schema requirements  
**Solution**: Ensure all required fields are present and within limits

### Issue: "ERR_TOO_MANY_REQUESTS"
**Cause**: Exceeded rate limit (5 orders/minute)  
**Solution**: Wait 60 seconds before creating another order

### Issue: "ERR_UNAUTHORIZED"
**Cause**: Missing or invalid JWT token  
**Solution**: Login again to get a fresh token

### Issue: "ERR_ORDER_NOT_FOUND"
**Cause**: Order doesn't exist or belongs to another user  
**Solution**: Verify order ID and ensure it belongs to the authenticated user

---

## 📝 Database Schema

```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  product_names VARCHAR(1000) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🎨 Frontend Integration Example

### React Component

```jsx
import { useState, useEffect } from 'react';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/orders/history?page=${page}&limit=10`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setOrders(data.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Order History</h2>
      {orders.map(order => (
        <div key={order.id} className="order-card">
          <h3>{order.order_number}</h3>
          <p>{order.product_names}</p>
          <p>${order.total_amount}</p>
          <span className={`status ${order.status}`}>{order.status}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## ✅ Summary

All Order Management APIs are fully functional with:
- ✅ Order creation with validation
- ✅ Paginated order history
- ✅ Order detail retrieval
- ✅ Rate limiting protection
- ✅ Comprehensive error handling
- ✅ Full authentication/authorization
- ✅ Production-ready security measures

For any issues or questions, refer to the troubleshooting section or check the backend logs.

