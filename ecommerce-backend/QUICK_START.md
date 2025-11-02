# ⚡ Quick Start - Docker Database

## 🚀 3 Lệnh Setup

```bash
# 1. Start Docker
cd ecommerce-backend
docker-compose up -d

# 2. Wait for init (30 seconds)
# ...

# 3. Start API
cd backend-php
php -S localhost:8000 index.php
```

## ✅ Verify

**phpMyAdmin:** http://localhost:8080
- User: `ecommerce_user`
- Pass: `ecommerce_pass`
- Check: 12 products in `products` table

**API Test:**
```bash
curl http://localhost:8000/api/products?product_id=vest-silk-noir
```

## 📊 What You Get

- ✅ MySQL 8.0 in Docker
- ✅ 12 products from `products.ts`
- ✅ Complete schema (18 fields)
- ✅ String product IDs work
- ✅ Colors, sizes, gallery as JSON arrays
- ✅ phpMyAdmin for inspection

## 🔑 Credentials

**Database:**
- Host: `localhost:3306`
- User: `ecommerce_user`
- Pass: `ecommerce_pass`
- DB: `ecommerce_db`

**phpMyAdmin:**
- URL: http://localhost:8080
- User: `ecommerce_user`
- Pass: `ecommerce_pass`

## 📚 Full Docs

- **Docker Setup:** `DOCKER_SETUP_README.md`
- **Complete Guide:** `docs/DOCKER_DATABASE_COMPLETE.md`
- **Summary:** `docs/DATABASE_PRODUCTS_UPDATE_SUMMARY.md`
- **Comparison:** `docs/BEFORE_AFTER_COMPARISON.md`

## 🐛 Issues?

**Port 3306 in use:**
```bash
sudo systemctl stop mysql
docker-compose up -d
```

**Fresh start:**
```bash
docker-compose down -v
docker-compose up -d
```

**Check logs:**
```bash
docker-compose logs -f mysql
```

## 🎉 Done!

Database sẵn sàng với 12 products từ `products.ts`!

**No more manual setup!** 🚀



