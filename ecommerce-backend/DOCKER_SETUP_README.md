# 🐳 Docker Database Setup Guide

## ✅ Complete - Ready to Use!

This setup provides a complete Docker-based MySQL database with **automatic initialization** from `products.ts`.

---

## 📁 Files Created

### Docker Configuration
- ✅ `docker-compose.yml` - Docker Compose setup with MySQL + phpMyAdmin
- ✅ `database/init/01-schema.sql` - Complete database schema matching `products.ts`
- ✅ `database/init/02-seed-products.sql` - All 12 products from `products.ts`

### Documentation (in `docs/` folder)
- ✅ `docs/DATABASE_PRODUCTS_UPDATE_SUMMARY.md` - Quick summary
- ✅ `docs/BEFORE_AFTER_COMPARISON.md` - Visual comparison
- ✅ `docs/COMPLETE_SETUP_GUIDE.md` - Detailed guide

---

## 🚀 Quick Start

### 1. Start Docker Containers

```powershell
cd ecommerce-backend
docker-compose up -d
```

**What happens:**
- ✅ Creates MySQL 8.0 container
- ✅ Creates phpMyAdmin container
- ✅ Automatically runs `init/01-schema.sql` (creates tables)
- ✅ Automatically runs `init/02-seed-products.sql` (seeds 12 products)

### 2. Verify Database

**Option A: Using phpMyAdmin**
- URL: http://localhost:8080
- Username: `ecommerce_user`
- Password: `ecommerce_pass`
- Database: `ecommerce_db`

**Option B: Using MySQL CLI**
```bash
docker exec -it ecommerce_mysql mysql -u ecommerce_user -pecommerce_pass ecommerce_db
```

Then run:
```sql
-- Check products
SELECT COUNT(*) FROM products;  -- Should return 12

-- Check by category
SELECT category, COUNT(*) 
FROM products 
GROUP BY category;

-- Get specific product
SELECT * FROM products WHERE product_id = 'vest-silk-noir';
```

### 3. Update Backend .env

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecommerce_db
DB_USER=ecommerce_user
DB_PASS=ecommerce_pass

JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=86400

CORS_ORIGIN=http://localhost:3000
```

### 4. Start Backend API

**PHP Backend:**
```bash
cd backend-php
php -S localhost:8000 index.php
```

**Node Backend (alternative):**
```bash
cd backend-node
npm install
npm start
```

---

## 🔧 Docker Commands

### Start Containers
```bash
docker-compose up -d
```

### Stop Containers
```bash
docker-compose down
```

### Stop & Remove Data (Fresh Start)
```bash
docker-compose down -v
```

### View Logs
```bash
docker-compose logs -f mysql
```

### Restart Containers
```bash
docker-compose restart
```

---

## 📊 Database Schema

### Products Table (matches `products.ts` exactly)

```sql
CREATE TABLE products (
    id INT PRIMARY KEY,
    product_id VARCHAR(100) UNIQUE,     -- "vest-silk-noir"
    name VARCHAR(255),
    category ENUM('ao-dai', 'vest', 'wedding', 'evening'),
    short_description TEXT,             -- shortDescription
    description TEXT,
    price DECIMAL(10, 2),
    original_price DECIMAL(10, 2),      -- originalPrice (optional)
    stock INT DEFAULT 100,
    image VARCHAR(500),
    gallery JSON,                        -- ["img1.png", "img2.png"]
    colors JSON,                         -- ["Black", "Red"]
    sizes JSON,                          -- ["XS", "S", "M"]
    rating DECIMAL(2, 1),
    reviews INT,
    tags JSON,                           -- ["bridal", "luxury"]
    is_featured BOOLEAN,                 -- isFeatured
    is_new BOOLEAN,                      -- isNew
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## 🗂️ Products Seeded (12 Total)

| ID | Product ID | Category | Price |
|----|------------|----------|-------|
| 1 | ao-dai-regal-crimson | ao-dai | $1,890 |
| 2 | ao-dai-heritage-gold | ao-dai | $1,790 |
| 3 | ao-dai-silk-ivory | ao-dai | $1,260 |
| 4 | vest-silk-noir | vest | $980 |
| 5 | vest-cream-tailored | vest | $890 |
| 6 | wedding-lotus-bloom | wedding | $2,980 |
| 7 | wedding-aurora | wedding | $2,450 |
| 8 | evening-starlight | evening | $1,650 |
| 9 | evening-lumina | evening | $1,380 |
| 10 | ao-dai-majestic-pearl | ao-dai | $2,050 |
| 11 | vest-midnight-velvet | vest | $1,120 |
| 12 | evening-amber | evening | $1,520 |

**Breakdown:**
- 🔴 Ao Dai: 4 products
- 🔵 Vest: 3 products
- 💍 Wedding: 2 products
- ✨ Evening: 3 products

---

## 🧪 Test APIs

### Get All Products
```bash
curl http://localhost:8000/api/products
```

### Get by String Product ID
```bash
curl http://localhost:8000/api/products?product_id=vest-silk-noir
```

### Get by Category
```bash
curl http://localhost:8000/api/products?category=vest
```

### Create Order (with auth token)
```bash
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
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
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

## 🔑 Database Credentials

### Root Access
- Host: `localhost:3306`
- Username: `root`
- Password: `rootpassword`
- Database: `ecommerce_db`

### Application Access
- Host: `localhost:3306`
- Username: `ecommerce_user`
- Password: `ecommerce_pass`
- Database: `ecommerce_db`

### phpMyAdmin Access
- URL: http://localhost:8080
- Username: `ecommerce_user`
- Password: `ecommerce_pass`

---

## 🎯 Key Features

### 1. Automatic Initialization
- Init scripts run automatically on first start
- No manual SQL execution needed
- Schema + Data ready immediately

### 2. Exact Match with products.ts
- All field names match (camelCase → snake_case)
- All 12 products seeded
- JSON arrays properly formatted

### 3. Dual ID Support
- String IDs: `"vest-silk-noir"`
- Numeric IDs: `4`
- API accepts both!

### 4. Persistent Data
- Data stored in Docker volume
- Survives container restarts
- Only deleted with `docker-compose down -v`

---

## 🐛 Troubleshooting

### Port Already in Use

**Problem:** Port 3306 or 8080 already in use

**Solution:**
```bash
# Change ports in docker-compose.yml
ports:
  - "3307:3306"  # MySQL
  - "8081:80"    # phpMyAdmin
```

### Container Won't Start

**Problem:** MySQL container fails to start

**Solution:**
```bash
# Check logs
docker-compose logs mysql

# Fresh start
docker-compose down -v
docker-compose up -d
```

### Init Scripts Not Running

**Problem:** Tables empty after start

**Solution:**
```bash
# Remove volume and restart
docker-compose down -v
docker-compose up -d

# Wait 30 seconds for initialization
sleep 30

# Verify
docker exec -it ecommerce_mysql mysql -u ecommerce_user -pecommerce_pass ecommerce_db -e "SELECT COUNT(*) FROM products;"
```

### Can't Connect from Backend

**Problem:** Backend can't connect to MySQL

**Solution:**
```bash
# Check container is running
docker ps | grep ecommerce_mysql

# Check backend .env
DB_HOST=localhost  # or 'mysql' if backend is also in Docker
DB_PORT=3306
```

---

## 📚 Documentation

- **Quick Summary:** `docs/DATABASE_PRODUCTS_UPDATE_SUMMARY.md`
- **Complete Guide:** `docs/COMPLETE_SETUP_GUIDE.md`
- **Before/After:** `docs/BEFORE_AFTER_COMPARISON.md`

---

## ✅ Checklist

After running `docker-compose up -d`:

- [ ] Containers running: `docker ps`
- [ ] Database accessible: `docker exec -it ecommerce_mysql mysql -u root -prootpassword -e "SHOW DATABASES;"`
- [ ] Products seeded: Visit http://localhost:8080 and check products table
- [ ] 12 products total
- [ ] Categories: 4 ao-dai, 3 vest, 2 wedding, 3 evening
- [ ] Backend .env updated
- [ ] API server started
- [ ] APIs tested with curl

---

## 🎉 Done!

**Docker database setup complete!**

**Database:** 100% synced with `src/data/products.ts`  
**No more manual SQL execution!**  
**No more "Product ID not found" errors!**

**Next Steps:**
1. `docker-compose up -d`
2. Update backend `.env`
3. Start API server
4. Test endpoints

**Happy Coding!** 🚀



