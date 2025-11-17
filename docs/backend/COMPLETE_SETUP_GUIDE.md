# 🚀 Complete Database & API Setup Guide

## ✅ Hoàn Thành

Tất cả database schema và API đã được cập nhật để **match 100% với `src/data/products.ts`**!

---

## 📋 Overview

### ✨ What's New

1. **Database Schema** - Hoàn toàn mới với tất cả fields từ `products.ts`:
   - ✅ `product_id` (string): `vest-silk-noir`, `ao-dai-regal-crimson`
   - ✅ `category` (enum): `ao-dai`, `vest`, `wedding`, `evening`
   - ✅ `short_description` & `description`
   - ✅ `original_price` (nullable)
   - ✅ `colors` (JSON array): `["Black", "Emerald", "Ruby"]`
   - ✅ `sizes` (JSON array): `["XS", "S", "M", "L", "XL"]`
   - ✅ `gallery` (JSON array): Multiple product images
   - ✅ `tags` (JSON array): `["bridal", "luxury", "limited"]`
   - ✅ `rating` & `reviews`
   - ✅ `is_featured` & `is_new` flags

2. **Seeded 12 Products** - Tất cả products từ `products.ts`:
   - 4 Ao Dai products
   - 3 Vest products
   - 2 Wedding Gown products
   - 3 Evening Dress products

3. **Updated APIs** - Support cả numeric ID và string product_id:
   - ✅ `GET /api/products` - Trả về complete product data
   - ✅ `GET /api/products?category=vest` - Filter by category
   - ✅ `GET /api/products?product_id=vest-silk-noir` - Get by string ID
   - ✅ `GET /api/products?id=4` - Get by numeric ID
   - ✅ `POST /api/orders` - Accept string product_id trong items

4. **Order API Enhanced**:
   - ✅ Support string product_id: `"vest-silk-noir"`
   - ✅ Auto-convert string ID → numeric ID internally
   - ✅ Store color & size selection
   - ✅ Return product details in order history

---

## 🗂️ Files Created/Modified

### ✅ New Files (4)

```
ecommerce-backend/
├── database/
│   ├── complete_products_schema.sql      # New schema matching products.ts
│   └── seed_complete_products.sql        # All 12 products data
├── setup-complete-database.ps1           # PowerShell setup script
├── setup-complete-database.sh            # Bash setup script (Linux/Mac)
└── COMPLETE_SETUP_GUIDE.md              # This file
```

### ✅ Modified Files (5)

```
ecommerce-backend/backend-php/src/
├── Models/
│   ├── Product.php          # Added: findByProductId(), parseProductJson()
│   └── Order.php            # Added: color/size fields, product_string_id
├── Controllers/
│   ├── ProductController.php   # Support product_id & category filter
│   └── OrderController.php     # Accept string product_id
└── Services/
    └── OrderService.php        # Convert string → numeric ID
```

---

## 🚀 Quick Setup

### Option 1: PowerShell (Windows)

```powershell
cd ecommerce-backend

# With default settings (localhost, root, no password)
.\setup-complete-database.ps1

# With custom credentials
.\setup-complete-database.ps1 -MySQLUser "myuser" -MySQLPassword "mypass" -DatabaseName "ecommerce_db"
```

### Option 2: Bash (Linux/Mac)

```bash
cd ecommerce-backend

# Make script executable
chmod +x setup-complete-database.sh

# With default settings
./setup-complete-database.sh

# With custom credentials (using environment variables)
MYSQL_USER=myuser MYSQL_PASSWORD=mypass ./setup-complete-database.sh
```

### Option 3: Manual SQL

```bash
cd ecommerce-backend

# Execute SQL files in order
mysql -u root -p < database/migrations.sql
mysql -u root -p < database/add_order_details.sql
mysql -u root -p < database/complete_products_schema.sql
mysql -u root -p < database/seed_complete_products.sql
```

---

## 📊 Database Schema

### Products Table

```sql
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Core fields
    product_id VARCHAR(100) UNIQUE NOT NULL,  -- 'vest-silk-noir'
    name VARCHAR(255) NOT NULL,
    category ENUM('ao-dai', 'vest', 'wedding', 'evening') NOT NULL,
    
    -- Descriptions
    short_description TEXT,
    description TEXT,
    
    -- Pricing
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) NULL,
    
    -- Inventory
    stock INT NOT NULL DEFAULT 100,
    
    -- Images
    image VARCHAR(500) NOT NULL,
    gallery JSON,                              -- ["img1.png", "img2.png"]
    
    -- Attributes
    colors JSON NOT NULL,                      -- ["Black", "Red", "Gold"]
    sizes JSON NOT NULL,                       -- ["XS", "S", "M", "L"]
    
    -- Ratings
    rating DECIMAL(2, 1) DEFAULT 0.0,
    reviews INT DEFAULT 0,
    
    -- Tags & Flags
    tags JSON,                                 -- ["bridal", "luxury"]
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_product_id (product_id),
    INDEX idx_category (category),
    INDEX idx_price (price)
);
```

### Order Items Table (Enhanced)

```sql
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,        -- Numeric ID (references products.id)
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    color VARCHAR(100),             -- Selected color (NEW)
    size VARCHAR(10),               -- Selected size (NEW)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## 🔌 API Endpoints

### Products API

#### Get All Products

```http
GET /api/products?page=1&limit=10
GET /api/products?category=vest
GET /api/products?search=silk
GET /api/products?sortBy=price&sortOrder=ASC
```

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "id": 4,
        "product_id": "vest-silk-noir",
        "name": "Silk Noir Vest Suit",
        "category": "vest",
        "short_description": "Black satin longline vest...",
        "description": "Silk Noir features...",
        "price": 980.00,
        "original_price": null,
        "stock": 100,
        "image": "/images/image_6.png",
        "gallery": ["/images/image_6.png", "/images/image_2.png"],
        "colors": ["Black", "Emerald", "Ruby"],
        "sizes": ["XS", "S", "M", "L", "XL"],
        "rating": 4.6,
        "reviews": 27,
        "tags": ["modern", "evening"],
        "is_featured": false,
        "is_new": false,
        "created_at": "2025-10-28T...",
        "updated_at": "2025-10-28T..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 12,
      "totalPages": 2
    }
  }
}
```

#### Get Product by String ID

```http
GET /api/products?product_id=vest-silk-noir
```

#### Get Product by Numeric ID

```http
GET /api/products?id=4
```

---

### Orders API

#### Create Order (with String Product IDs)

```http
POST /api/orders
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "items": [
    {
      "product_id": "vest-silk-noir",
      "quantity": 1,
      "color": "Black",
      "size": "M"
    },
    {
      "product_id": "ao-dai-regal-crimson",
      "quantity": 2,
      "color": "Crimson",
      "size": "S"
    }
  ],
  "customer_info": {
    "first_name": "Demo",
    "last_name": "Doe",
    "email": "demo_2@gmail.com",
    "phone": "84914285963",
    "company": ""
  },
  "shipping_address": {
    "street": "abc",
    "city": "Cali",
    "state": "SJ",
    "zip_code": "12345",
    "country": "US"
  },
  "notes": "Please wrap as gift",
  "total_amount": 1870.00
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 123,
    "user_id": 1,
    "total_amount": 1870.00,
    "status": "pending",
    "created_at": "2025-10-28T...",
    "items": [
      {
        "id": 1,
        "product_id": 4,
        "product_name": "Silk Noir Vest Suit",
        "product_string_id": "vest-silk-noir",
        "quantity": 1,
        "price": 980.00,
        "color": "Black",
        "size": "M",
        "image": "/images/image_6.png"
      }
    ]
  }
}
```

---

## 🧪 Testing

### Test Products API

```bash
# Get all products
curl http://localhost:8000/api/products

# Filter by category
curl http://localhost:8000/api/products?category=vest

# Get by string product_id
curl http://localhost:8000/api/products?product_id=vest-silk-noir

# Get by numeric ID
curl http://localhost:8000/api/products?id=4

# Search
curl http://localhost:8000/api/products?search=silk
```

### Test Orders API

```bash
# Create order (needs authentication)
curl -X POST http://localhost:8000/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product_id": "vest-silk-noir",
        "quantity": 1,
        "color": "Black",
        "size": "M"
      }
    ],
    "customer_info": {
      "first_name": "Test",
      "last_name": "User",
      "email": "test@example.com",
      "phone": "1234567890"
    },
    "shipping_address": {
      "street": "123 Main St",
      "city": "San Jose",
      "state": "CA",
      "zip_code": "95127",
      "country": "US"
    }
  }'
```

---

## 🗺️ Product ID Mapping

Frontend uses **string IDs**, database uses **numeric IDs**. API auto-converts!

| Numeric ID | String ID | Name | Category |
|------------|-----------|------|----------|
| 1 | ao-dai-regal-crimson | Regal Crimson Ao Dai | ao-dai |
| 2 | ao-dai-heritage-gold | Heritage Gold Ao Dai | ao-dai |
| 3 | ao-dai-silk-ivory | Silk Ivory Ao Dai | ao-dai |
| 4 | vest-silk-noir | Silk Noir Vest Suit | vest |
| 5 | vest-cream-tailored | Cream Tailored Vest | vest |
| 6 | wedding-lotus-bloom | Lotus Bloom Bridal Gown | wedding |
| 7 | wedding-aurora | Aurora Silk Wedding Ao Dai | wedding |
| 8 | evening-starlight | Starlight Evening Gown | evening |
| 9 | evening-lumina | Lumina Velvet Gown | evening |
| 10 | ao-dai-majestic-pearl | Majestic Pearl Ao Dai | ao-dai |
| 11 | vest-midnight-velvet | Midnight Velvet Vest | vest |
| 12 | evening-amber | Amber Column Dress | evening |

---

## 🔧 Configuration

### Backend .env

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecommerce_db
DB_USER=root
DB_PASS=

# JWT
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRATION=86400

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 📝 Migration Path

If you have **existing orders** with old product IDs:

```sql
-- Update old product references (if needed)
-- This maps old numeric IDs to new structure

-- Example: If product ID 1 was "Regal Crimson" before
UPDATE order_items 
SET product_id = 1 
WHERE product_id = <OLD_ID>;
```

---

## ⚡ Performance

### Indexes Created

- `idx_product_id` - Fast lookup by string ID
- `idx_category` - Fast category filtering
- `idx_price` - Fast price sorting
- `idx_is_featured` - Fast featured products query
- `idx_created_at` - Fast date-based queries

### JSON Field Handling

All JSON fields are **automatically parsed** by PHP backend:
- `colors` → PHP array
- `sizes` → PHP array
- `gallery` → PHP array
- `tags` → PHP array

No frontend changes needed!

---

## 🐛 Troubleshooting

### Error: "Product ID not found for item: Silk Noir Vest Suit"

**Cause:** Frontend is sending product **name** instead of **product_id**

**Solution:** Frontend should send:
```javascript
{
  "product_id": "vest-silk-noir",  // ✅ Correct
  "quantity": 1
}
```

NOT:
```javascript
{
  "product_id": "Silk Noir Vest Suit",  // ❌ Wrong
  "quantity": 1
}
```

### Error: "Column 'product_id' cannot be null"

**Cause:** Old database schema

**Solution:** Run setup script again:
```bash
.\setup-complete-database.ps1
```

### JSON fields returning as strings

**Cause:** PHP not parsing JSON

**Solution:** Check `Product.php` has `parseProductJson()` method and it's being called.

---

## 📚 Additional Resources

### Related Files

- **Frontend Product Data:** `src/data/products.ts`
- **Database Schema:** `ecommerce-backend/database/complete_products_schema.sql`
- **Seed Data:** `ecommerce-backend/database/seed_complete_products.sql`
- **Product Model:** `ecommerce-backend/backend-php/src/Models/Product.php`
- **Order Service:** `ecommerce-backend/backend-php/src/Services/OrderService.php`

### Key Changes Summary

1. **Database:**
   - Added `product_id` VARCHAR field (unique string ID)
   - Changed fields to JSON: `colors`, `sizes`, `gallery`, `tags`
   - Added: `category`, `short_description`, `rating`, `reviews`, `is_featured`, `is_new`

2. **API:**
   - `Product::findByProductId($stringId)` - New method
   - `Product::parseProductJson($product)` - Parse JSON fields
   - `OrderService::createOrder()` - Auto-convert string → numeric ID
   - `Order::addOrderItem()` - Added `color` & `size` params

3. **Frontend:**
   - No changes needed! API accepts string IDs now.

---

## ✅ Checklist

After running setup, verify:

- [ ] Database `ecommerce_db` exists
- [ ] Products table has 12 rows
- [ ] Each category has products:
  - [ ] ao-dai: 4 products
  - [ ] vest: 3 products
  - [ ] wedding: 2 products
  - [ ] evening: 3 products
- [ ] `SELECT * FROM products WHERE product_id = 'vest-silk-noir'` returns 1 row
- [ ] API `/api/products` returns complete data with arrays
- [ ] API `/api/products?product_id=vest-silk-noir` works
- [ ] Can create order with string product_id

---

## 🎉 Done!

Database và API giờ đã **100% sync với `products.ts`**!

**No more "Product ID not found" errors!** 🚀

---

**Questions?** Check the code comments or open an issue.

**Happy Coding!** 💻✨



