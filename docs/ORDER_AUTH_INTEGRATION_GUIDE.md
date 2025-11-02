# Order Flow with Authentication - Integration Guide

## 🎯 Overview

Complete integration of **authenticated order flow** with:
- ✅ Auto-fill checkout form from user profile
- ✅ Token-based authentication for all order operations
- ✅ Customer info & shipping address stored with orders
- ✅ Secure API calls with JWT tokens

---

## 🔐 Authentication Flow

### 1. **Token Management**

All API calls automatically include authentication token:

```typescript
// HttpClient automatically adds token to headers
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

**Token storage:**
- Key: `timelite:jwt-token`
- Location: `localStorage`
- Auto-attached to all authenticated endpoints

---

## 📝 Checkout Form Auto-Fill

### **How It Works**

When user navigates to `/checkout`:

1. **Check if authenticated** - `ApiService.isAuthenticated()`
2. **Load profile** - `GET /api/php/users/profile` (with token)
3. **Parse profile data**:
   - `name` → split into `firstName` + `lastName`
   - `address` → parse into `street`, `city`, `state`, `zipCode`
   - `email` → auto-fill email field
   - `phone` → auto-fill phone field
4. **Populate form** - Set all form fields with profile data

### **Code Implementation**

```typescript
// CheckoutPage.tsx
useEffect(() => {
  const loadUserProfile = async () => {
    if (!ApiService.isAuthenticated()) {
      setIsLoadingProfile(false);
      return;
    }

    const profile = await ApiService.getProfile();
    
    // Parse name
    const nameParts = (profile.name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Parse address: "123 Main St, New York, NY 10001"
    const addressParts = (profile.address || '').split(',');
    const streetAddress = addressParts[0]?.trim() || '';
    const city = addressParts[1]?.trim() || '';
    const stateZip = addressParts[2]?.trim() || '';
    
    setFormData({ firstName, lastName, email, phone, ... });
  };

  loadUserProfile();
}, []);
```

### **Profile Address Format**

Expected format: `Street, City, STATE ZIP`

**Example:**
```
123 Main Street, New York, NY 10001
```

**Parsing:**
- `addressParts[0]` = "123 Main Street"
- `addressParts[1]` = "New York"
- `addressParts[2]` = "NY 10001" → Extract state & ZIP with regex

---

## 🛒 Order Creation with Authentication

### **Request Format**

```http
POST /api/node/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 1890
    }
  ],
  "customer_info": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@test.com",
    "phone": "1234567890",
    "company": "Optional Company"
  },
  "shipping_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "country": "US"
  },
  "notes": "Please handle with care",
  "total_amount": 3780
}
```

### **Response Format**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 42,
    "user_id": 1,
    "total_amount": 3780,
    "status": "pending",
    "customer_first_name": "John",
    "customer_last_name": "Doe",
    "customer_email": "john@test.com",
    "customer_phone": "1234567890",
    "shipping_street": "123 Main St",
    "shipping_city": "New York",
    "shipping_state": "NY",
    "shipping_zip_code": "10001",
    "notes": "Please handle with care",
    "created_at": "2025-10-27T10:30:00Z",
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "Regal Crimson Ao Dai",
        "quantity": 2,
        "price": 1890
      }
    ]
  }
}
```

---

## 🗄️ Database Changes

### **Migration Required**

**File:** `ecommerce-backend/database/add_order_details.sql`

**New fields added to `orders` table:**

| Field | Type | Description |
|-------|------|-------------|
| `customer_first_name` | VARCHAR(100) | Customer's first name |
| `customer_last_name` | VARCHAR(100) | Customer's last name |
| `customer_email` | VARCHAR(255) | Customer's email |
| `customer_phone` | VARCHAR(20) | Customer's phone |
| `customer_company` | VARCHAR(255) | Company name (optional) |
| `shipping_street` | VARCHAR(255) | Street address |
| `shipping_city` | VARCHAR(100) | City |
| `shipping_state` | VARCHAR(50) | State/Province |
| `shipping_zip_code` | VARCHAR(20) | ZIP/Postal code |
| `shipping_country` | VARCHAR(100) | Country (default: US) |
| `notes` | TEXT | Special instructions |

### **Apply Migration**

```powershell
cd ecommerce-backend
.\apply-order-migration.ps1
```

Or manually:
```bash
mysql -u root timelite_ecommerce < database/add_order_details.sql
```

---

## 🔧 Backend Changes

### **PHP Backend**

#### 1. **OrderController.php**
- Receives `customer_info`, `shipping_address`, `notes`, `total_amount`
- Passes to `OrderService::createOrder()`

#### 2. **OrderService.php**
- Updated signature: `createOrder(userId, items, orderDetails)`
- Passes details to `Order::create()`

#### 3. **Order.php (Model)**
- Updated `create()` method to accept `orderDetails`
- Inserts all customer & shipping fields

### **Node.js Backend**

#### 1. **orderController.js**
- Extracts all order details from `req.body`
- Passes to `orderService.createOrder()`

#### 2. **orderService.js**
- Updated to accept `orderDetails` parameter
- Builds SQL INSERT with all new fields

---

## 🧪 Testing

### **1. Apply Migration**

```powershell
cd ecommerce-backend
.\apply-order-migration.ps1
```

### **2. Test API with Script**

```powershell
.\test-order-with-auth.ps1
```

**What it tests:**
1. Login → Get token
2. Load profile with token
3. Create order with customer info & shipping address
4. Verify order in history

### **3. Test Browser Flow**

1. **Start backends:**
   ```bash
   # PHP (Terminal 1)
   cd ecommerce-backend
   php -S localhost:80 -t backend-php/public
   
   # Node.js (Terminal 2)
   cd ecommerce-backend/backend-node
   npm start
   
   # Frontend (Terminal 3)
   npm run dev
   ```

2. **Create account / Login:**
   - Go to `http://localhost:3000/login`
   - Login or register

3. **Update profile:**
   - Go to `/profile`
   - Fill in: Name, Phone, Address
   - Address format: `123 Main St, New York, NY 10001`
   - Save

4. **Test checkout:**
   - Go to `/shop`
   - Add products to cart
   - Click "Proceed to checkout"
   - ✅ **Verify form is auto-filled** with profile data
   - Modify if needed
   - Submit order
   - ✅ **Verify redirect** to `/profile?tab=orders`
   - ✅ **Verify success message**

5. **Check database:**
   ```sql
   SELECT * FROM orders ORDER BY id DESC LIMIT 1;
   ```
   - ✅ Verify `customer_*` and `shipping_*` fields are populated

---

## 🔑 Key Features

### **1. Security**

- ✅ All order operations require valid JWT token
- ✅ User can only see/create their own orders
- ✅ Token validated on every request
- ✅ Auto-logout on invalid/expired token

### **2. User Experience**

- ✅ Form auto-fills from profile (no re-typing)
- ✅ Loading indicator while fetching profile
- ✅ Can still fill manually if not logged in
- ✅ Validates all required fields
- ✅ Shows errors clearly

### **3. Data Integrity**

- ✅ Customer info stored with each order
- ✅ Shipping address preserved for fulfillment
- ✅ Notes captured for special instructions
- ✅ Transaction safe (rollback on failure)

---

## 📊 API Endpoints

### **GET /api/php/users/profile**

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_code": "USR001",
    "name": "John Doe",
    "email": "john@test.com",
    "phone": "1234567890",
    "address": "123 Main St, New York, NY 10001"
  }
}
```

### **POST /api/node/orders**

**Headers:** `Authorization: Bearer {token}`

**Body:** See "Order Creation with Authentication" above

**Response:** See response format above

### **GET /api/node/orders/history**

**Headers:** `Authorization: Bearer {token}`

**Query params:** `?page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

## 🚨 Troubleshooting

### **Form not auto-filling?**

1. Check if user is logged in
2. Check browser console for errors
3. Verify profile has data (go to `/profile`)
4. Check network tab - is `GET /api/php/users/profile` succeeding?

### **Order creation fails with 401?**

- Token expired or invalid
- User needs to log in again
- Check `localStorage` has `timelite:jwt-token`

### **Order creation fails with 500?**

- Database migration not applied
- Run: `.\ecommerce-backend\apply-order-migration.ps1`
- Check backend logs for SQL errors

### **Customer info not saved?**

- Check frontend is sending `customer_info` object
- Check backend is receiving it
- Check database has new columns
- Verify migration was applied

---

## ✅ Checklist

Before going live:

- [ ] Migration applied to production database
- [ ] Profile update working (users can set address)
- [ ] Checkout form auto-fills correctly
- [ ] Orders created with customer info
- [ ] Order history shows all orders
- [ ] Token authentication working
- [ ] Error handling tested
- [ ] Address parsing works for various formats

---

## 📝 Notes

### **Address Format Flexibility**

Current implementation expects: `Street, City, STATE ZIP`

**To support other formats**, update parsing logic in `CheckoutPage.tsx`:

```typescript
// More flexible parsing
const parseAddress = (address: string) => {
  // Try comma-separated
  if (address.includes(',')) {
    const parts = address.split(',').map(s => s.trim());
    return { street: parts[0], city: parts[1], ... };
  }
  
  // Try newline-separated
  if (address.includes('\n')) {
    const parts = address.split('\n').map(s => s.trim());
    return { street: parts[0], city: parts[1], ... };
  }
  
  // Fallback: entire string as street
  return { street: address, city: '', state: '', zipCode: '' };
};
```

### **Future Enhancements**

1. **Saved addresses** - Multiple shipping addresses per user
2. **Address validation** - Integrate with Google Maps API
3. **Auto-complete** - Address suggestions
4. **International** - Support non-US addresses
5. **Order tracking** - Email notifications with tracking

---

**Done! Order flow is now fully authenticated and auto-fills from profile.** 🎉



