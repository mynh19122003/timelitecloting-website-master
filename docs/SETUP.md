# 🚀 Setup Instructions

## Database Setup

Chạy script này để setup/update database với schema mới:

```powershell
cd ecommerce-backend
.\setup-database.ps1
```

Script này sẽ:
- ✅ Tạo bảng `orders` mới (simplified - 1 bảng duy nhất)
- ✅ Cài đặt trigger tự động generate order number (OD00001, OD00002, ...)
- ⚠️ Xóa orders cũ (nếu có)

## Start Backend

```powershell
cd ecommerce-backend/backend-node
npm start
```

## Test

1. Mở browser: `http://localhost:3000`
2. Login → Add products to cart → Checkout
3. Fill form → Submit
4. Check "Order History" tab

✅ Order sẽ có order number tự động: OD00001, OD00002, ...

## Database Schema

### Orders Table (Simplified)
```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE,      -- OD00001, OD00002, ... (auto)
    user_id INT,                          -- Foreign key to users
    product_names TEXT,                   -- "Product A x2, Product B x1"
    total_amount DECIMAL(10, 2),
    notes TEXT,                           -- Customer info, delivery notes, etc.
    status ENUM(...),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Auto Order Number Trigger
```sql
CREATE TRIGGER before_insert_orders
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    -- Auto-generate: OD00001, OD00002, OD00003, ...
    SET NEW.order_number = CONCAT('OD', LPAD(next_number, 5, '0'));
END;
```

## Features

✅ **1 bảng orders duy nhất** - Không cần JOIN  
✅ **Order number tự động** - OD00001, OD00002, ...  
✅ **Mock data từ cart** - Product names, total amount  
✅ **Customer info trong notes** - Name, email, phone, address  
✅ **Simplified backend** - Ít code hơn, nhanh hơn  
✅ **Frontend tích hợp sẵn** - Checkout và Order History

## Files Changed

### Database
- ✅ `ecommerce-backend/database/migrations.sql` - Updated orders table
- ✅ `ecommerce-backend/database/triggers.sql` - Order number trigger
- ✅ `ecommerce-backend/setup-database.ps1` - Setup script

### Backend
- ✅ `ecommerce-backend/backend-node/src/services/orderService.js` - Simplified

### Frontend
- ✅ `src/pages/CheckoutPage/CheckoutPage.tsx` - Send product_names
- ✅ `src/services/api.ts` - Parse order data

---

**Ready to test!** 🎉



