# 🐳 Docker Database Setup - HOÀN TẤT

## ✅ Tổng Quan

**Database giờ đã 100% match với `src/data/products.ts`!**

Tất cả setup được tự động hóa với Docker - chỉ cần một lệnh!

---

## 📁 Cấu Trúc Files

```
ecommerce-backend/
├── docker-compose.yml                      # Docker setup
├── env.docker.example                      # Environment config
├── DOCKER_SETUP_README.md                  # Quick guide
│
├── database/
│   ├── init/
│   │   ├── 01-schema.sql                  # Schema (auto-run by Docker)
│   │   └── 02-seed-products.sql           # 12 products (auto-run)
│   ├── migrations.sql                      # Base migrations
│   ├── add_order_details.sql              # Order enhancements
│   ├── add_user_profile_fields.sql        # User profile
│   ├── seed.sql                            # Base seed data
│   └── triggers.sql                        # Database triggers
│
└── docs/
    ├── DOCKER_DATABASE_COMPLETE.md         # This file
    ├── DATABASE_PRODUCTS_UPDATE_SUMMARY.md # Summary
    ├── BEFORE_AFTER_COMPARISON.md          # Visual comparison
    ├── COMPLETE_SETUP_GUIDE.md             # Detailed guide
    └── swagger.yml                          # API specs
```

---

## 🚀 Cách Sử Dụng (3 Bước)

### Bước 1: Start Docker

```bash
cd ecommerce-backend
docker-compose up -d
```

**Chờ 30 giây** để MySQL khởi động và chạy init scripts.

### Bước 2: Verify Database

**phpMyAdmin:** http://localhost:8080
- Username: `ecommerce_user`
- Password: `ecommerce_pass`

**hoặc MySQL CLI:**
```bash
docker exec -it ecommerce_mysql mysql -u ecommerce_user -pecommerce_pass ecommerce_db -e "SELECT COUNT(*) FROM products;"
```

**Kết quả:** Should show `12`

### Bước 3: Start Backend API

```bash
# Copy environment config
cp env.docker.example .env

# Start PHP backend
cd backend-php
php -S localhost:8000 index.php
```

**Xong!** API sẵn sàng tại http://localhost:8000

---

## 🎯 Điểm Mới

### ✅ So Với Trước

| Feature | Trước | Sau |
|---------|-------|-----|
| **Setup** | Manual SQL execution | ✅ Docker auto-init |
| **Products** | Generic data | ✅ Exact match với products.ts |
| **Fields** | 6 fields | ✅ 18 fields (complete) |
| **Product IDs** | Numeric only | ✅ String + Numeric |
| **Colors/Sizes** | None | ✅ JSON arrays |
| **Gallery** | 1 image | ✅ Multiple images |
| **Seed Data** | Manual | ✅ Auto-seeded |
| **Time** | ~30 min | ✅ ~30 sec |

### ✅ Schema Changes

**Matching products.ts 100%:**

```typescript
// products.ts
type Product = {
  id: string;                    // → product_id VARCHAR(100)
  name: string;                  // → name VARCHAR(255)
  category: Category;            // → category ENUM
  shortDescription: string;      // → short_description TEXT
  description: string;           // → description TEXT
  price: number;                 // → price DECIMAL
  originalPrice?: number;        // → original_price DECIMAL (nullable)
  colors: string[];              // → colors JSON
  sizes: Array<...>;             // → sizes JSON
  image: string;                 // → image VARCHAR
  gallery: string[];             // → gallery JSON
  rating: number;                // → rating DECIMAL
  reviews: number;               // → reviews INT
  tags: string[];                // → tags JSON
  isFeatured?: boolean;          // → is_featured BOOLEAN
  isNew?: boolean;               // → is_new BOOLEAN
};
```

**Không thiếu field nào!** ✅

---

## 📊 Products Seeded

### Tổng: 12 Products

#### Ao Dai (4)
1. **ao-dai-regal-crimson** - Regal Crimson Ao Dai - $1,890
2. **ao-dai-heritage-gold** - Heritage Gold Ao Dai - $1,790
3. **ao-dai-silk-ivory** - Silk Ivory Ao Dai - $1,260
4. **ao-dai-majestic-pearl** - Majestic Pearl Ao Dai - $2,050

#### Vest (3)
5. **vest-silk-noir** - Silk Noir Vest Suit - $980
6. **vest-cream-tailored** - Cream Tailored Vest - $890
7. **vest-midnight-velvet** - Midnight Velvet Vest - $1,120

#### Wedding (2)
8. **wedding-lotus-bloom** - Lotus Bloom Bridal Gown - $2,980
9. **wedding-aurora** - Aurora Silk Wedding Ao Dai - $2,450

#### Evening (3)
10. **evening-starlight** - Starlight Evening Gown - $1,650
11. **evening-lumina** - Lumina Velvet Gown - $1,380
12. **evening-amber** - Amber Column Dress - $1,520

**Mỗi product có đầy đủ:**
- Colors array (3-4 colors)
- Sizes array (4-5 sizes)
- Gallery images (2-3 images)
- Rating & reviews
- Tags
- Featured/New flags

---

## 🔌 API Examples

### Get All Products

```bash
curl http://localhost:8000/api/products
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 4,
        "product_id": "vest-silk-noir",
        "name": "Silk Noir Vest Suit",
        "category": "vest",
        "price": 980.00,
        "colors": ["Black", "Emerald", "Ruby"],
        "sizes": ["XS", "S", "M", "L", "XL"],
        "gallery": ["/images/image_6.png", "/images/image_2.png"],
        "rating": 4.6,
        "reviews": 27,
        "tags": ["modern", "evening"]
      }
    ]
  }
}
```

### Get by String Product ID

```bash
curl http://localhost:8000/api/products?product_id=vest-silk-noir
```

### Filter by Category

```bash
curl http://localhost:8000/api/products?category=vest
```

### Create Order (with String Product ID)

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

**✅ No more "Product ID not found" errors!**

---

## 🐳 Docker Commands

### Quản Lý Containers

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# View logs
docker-compose logs -f mysql

# Fresh start (removes all data)
docker-compose down -v
docker-compose up -d
```

### Database Access

```bash
# MySQL CLI
docker exec -it ecommerce_mysql mysql -u ecommerce_user -pecommerce_pass ecommerce_db

# Run SQL file
docker exec -i ecommerce_mysql mysql -u ecommerce_user -pecommerce_pass ecommerce_db < query.sql

# Dump database
docker exec ecommerce_mysql mysqldump -u ecommerce_user -pecommerce_pass ecommerce_db > backup.sql
```

---

## 🔧 Configuration

### Docker Services

**MySQL 8.0:**
- Port: `3306`
- Database: `ecommerce_db`
- User: `ecommerce_user`
- Password: `ecommerce_pass`
- Root Password: `rootpassword`

**phpMyAdmin:**
- URL: http://localhost:8080
- User: `ecommerce_user`
- Password: `ecommerce_pass`

### Backend .env

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecommerce_db
DB_USER=ecommerce_user
DB_PASS=ecommerce_pass

JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400

CORS_ORIGIN=http://localhost:3000
```

---

## 🧪 Testing Checklist

### After Starting Docker

- [ ] MySQL container running: `docker ps | grep ecommerce_mysql`
- [ ] phpMyAdmin accessible: http://localhost:8080
- [ ] Database created: Check phpMyAdmin
- [ ] Tables created: `users`, `products`, `orders`, `order_items`
- [ ] Products seeded: 12 rows in `products` table
- [ ] Categories correct: 4 ao-dai, 3 vest, 2 wedding, 3 evening

### After Starting API

- [ ] API running: http://localhost:8000
- [ ] Get products: `curl http://localhost:8000/api/products`
- [ ] Get by string ID: `curl http://localhost:8000/api/products?product_id=vest-silk-noir`
- [ ] Filter by category: `curl http://localhost:8000/api/products?category=vest`
- [ ] JSON arrays parsed correctly (not strings)

### Verify Specific Product

```bash
curl http://localhost:8000/api/products?product_id=vest-silk-noir | jq
```

**Should return:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "product_id": "vest-silk-noir",
    "name": "Silk Noir Vest Suit",
    "category": "vest",
    "short_description": "Black satin longline vest suit...",
    "price": 980.00,
    "colors": ["Black", "Emerald", "Ruby"],
    "sizes": ["XS", "S", "M", "L", "XL"],
    "gallery": [...],
    "rating": 4.6,
    "reviews": 27
  }
}
```

---

## 🐛 Troubleshooting

### Problem: Port 3306 Already in Use

```bash
# Option 1: Stop existing MySQL
sudo systemctl stop mysql

# Option 2: Change port in docker-compose.yml
ports:
  - "3307:3306"

# Then update .env
DB_PORT=3307
```

### Problem: Container Keeps Restarting

```bash
# Check logs
docker-compose logs mysql

# Common issue: Permission denied
# Fix: Remove volume and restart
docker-compose down -v
docker-compose up -d
```

### Problem: Init Scripts Not Running

```bash
# Verify init directory
ls -la ecommerce-backend/database/init/

# Should see:
# 01-schema.sql
# 02-seed-products.sql

# Fresh start
docker-compose down -v
docker-compose up -d

# Wait 30 seconds
sleep 30

# Check products
docker exec -it ecommerce_mysql mysql -u ecommerce_user -pecommerce_pass ecommerce_db -e "SELECT COUNT(*) FROM products;"
```

### Problem: Can't Login to phpMyAdmin

**Credentials:**
- Server: `mysql` (not `localhost`)
- Username: `ecommerce_user`
- Password: `ecommerce_pass`

If still fails:
```bash
# Restart phpMyAdmin
docker-compose restart phpmyadmin
```

---

## 📚 Related Documentation

1. **DOCKER_SETUP_README.md** - Quick start guide
2. **DATABASE_PRODUCTS_UPDATE_SUMMARY.md** - Changes summary
3. **BEFORE_AFTER_COMPARISON.md** - Visual comparison
4. **COMPLETE_SETUP_GUIDE.md** - Detailed documentation

---

## ✨ Key Benefits

### 1. Zero Manual Setup
- No manual SQL execution
- No manual database creation
- Everything automated with Docker

### 2. Exact Data Match
- Database schema matches `products.ts` 100%
- All 12 products from `products.ts` seeded
- Field names converted correctly (camelCase → snake_case)

### 3. Persistent Storage
- Data stored in Docker volume
- Survives container restarts
- Easy backup/restore

### 4. Development Tools
- phpMyAdmin included
- Easy database inspection
- Quick testing

### 5. Reproducible
- Same setup on any machine
- Version controlled (docker-compose.yml)
- Easy to share with team

---

## 🎉 Summary

### ✅ What Was Done

1. **Created Docker Setup**
   - `docker-compose.yml` with MySQL + phpMyAdmin
   - Auto-initialization with init scripts

2. **Database Schema**
   - Complete schema matching `products.ts`
   - All 18 fields with correct types
   - JSON fields for arrays

3. **Seed Data**
   - All 12 products from `products.ts`
   - Exact data with correct formatting
   - Categories, colors, sizes, gallery, etc.

4. **Cleanup**
   - Removed old manual setup scripts
   - Removed old seed files
   - Organized documentation in `docs/`

### ✅ Result

**Before:**
- 🔴 Manual SQL execution (~30 min)
- 🔴 Generic product data
- 🔴 Missing fields
- 🔴 No color/size arrays
- 🔴 Errors with string product IDs

**After:**
- 🟢 Docker one-command setup (~30 sec)
- 🟢 Exact data from `products.ts`
- 🟢 Complete 18 fields
- 🟢 JSON arrays for colors/sizes/gallery
- 🟢 String product IDs work perfectly

---

## 🚀 Next Steps

1. **Start Docker:**
   ```bash
   cd ecommerce-backend
   docker-compose up -d
   ```

2. **Verify Setup:**
   - Visit http://localhost:8080
   - Check products table (should have 12 rows)

3. **Start API:**
   ```bash
   cd backend-php
   php -S localhost:8000 index.php
   ```

4. **Test Endpoints:**
   ```bash
   curl http://localhost:8000/api/products
   curl http://localhost:8000/api/products?product_id=vest-silk-noir
   ```

5. **Start Development!** 🎉

---

## 📞 Support

**Issues?** Check troubleshooting section above.

**Questions?** Read the detailed guides in `docs/` folder.

**Everything Working?** Happy coding! 🚀

---

**✨ Database setup HOÀN TẤT với Docker!**

**🐳 One command to rule them all!**

**📦 100% match với products.ts!**

**🚀 No more manual setup!**



