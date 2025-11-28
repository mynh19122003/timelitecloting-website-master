# 🚀 Hướng dẫn Deploy Docker và Pull Code từ GitHub

## 📋 Mục lục
1. [Xóa Docker cũ](#1-xóa-docker-cũ)
2. [Pull code từ GitHub](#2-pull-code-từ-github)
3. [Build Docker mới](#3-build-docker-mới)
4. [Kiểm tra và khởi động](#4-kiểm-tra-và-khởi-động)

---

## 1. Xóa Docker cũ

### Bước 1.1: Dừng tất cả containers
```bash
cd ecommerce-backend
docker-compose down
```

### Bước 1.2: Xóa tất cả containers (nếu cần)
```bash
docker-compose rm -f
```

### Bước 1.3: Xóa images cũ (tùy chọn - nếu muốn build lại từ đầu)
```bash
# Xóa images của project
docker rmi ecommerce-backend-mysql ecommerce-backend-backend-php ecommerce-backend-backend-node ecommerce-backend-ecommerce-admin-backend-node ecommerce-backend-gateway phpmyadmin:latest

# Hoặc xóa tất cả images không dùng
docker image prune -a
```

### Bước 1.4: Xóa volumes (CẨN THẬN - sẽ mất dữ liệu database)
```bash
# CHỈ chạy nếu muốn reset hoàn toàn database
docker-compose down -v
```

---

## 2. Pull code từ GitHub

### Bước 2.1: Kiểm tra trạng thái Git
```bash
# Từ thư mục gốc của project
cd ..
git status
```

### Bước 2.2: Stash các thay đổi local (nếu có)
```bash
# Nếu có thay đổi chưa commit, lưu lại
git stash

# Hoặc commit trước khi pull
git add .
git commit -m "Local changes before pull"
```

### Bước 2.3: Pull code mới nhất từ GitHub
```bash
# Pull từ branch main
git pull origin main

# Hoặc nếu muốn force pull (ghi đè local changes)
git fetch origin
git reset --hard origin/main
```

### Bước 2.4: Kiểm tra code đã được pull
```bash
git log --oneline -5
```

---

## 3. Build Docker mới

### Bước 3.1: Di chuyển vào thư mục backend
```bash
cd ecommerce-backend
```

### Bước 3.2: Kiểm tra file docker-compose.yml
```bash
# Xem nội dung để đảm bảo config đúng
cat docker-compose.yml
```

### Bước 3.3: Build lại tất cả images (không dùng cache)
```bash
# Build tất cả services
docker-compose build --no-cache

# Hoặc build từng service cụ thể
docker-compose build --no-cache mysql
docker-compose build --no-cache backend-php
docker-compose build --no-cache backend-node
docker-compose build --no-cache ecommerce-admin-backend-node
docker-compose build --no-cache gateway
```

### Bước 3.4: Kiểm tra images đã được build
```bash
docker images | grep ecommerce-backend
```

---

## 4. Kiểm tra và khởi động

### Bước 4.1: Khởi động tất cả services
```bash
docker-compose up -d
```

### Bước 4.2: Kiểm tra trạng thái containers
```bash
docker-compose ps

# Hoặc
docker ps
```

### Bước 4.3: Xem logs để đảm bảo không có lỗi
```bash
# Xem logs của tất cả services
docker-compose logs -f

# Hoặc xem logs của từng service
docker-compose logs mysql
docker-compose logs ecommerce-admin-backend-node
docker-compose logs gateway
```

### Bước 4.4: Kiểm tra health của services
```bash
# Kiểm tra MySQL
docker exec ecommerce_mysql mysqladmin ping -h localhost -uroot -prootpassword

# Kiểm tra Admin Backend
curl http://localhost:3001/admin/health

# Kiểm tra Gateway
curl http://localhost:3002/health
```

---

## 🔧 Script tự động (Tùy chọn)

Tạo file `rebuild.sh` để tự động hóa:

```bash
#!/bin/bash

echo "🛑 Dừng Docker cũ..."
cd ecommerce-backend
docker-compose down

echo "📥 Pull code từ GitHub..."
cd ..
git pull origin main

echo "🔨 Build Docker mới..."
cd ecommerce-backend
docker-compose build --no-cache

echo "🚀 Khởi động Docker..."
docker-compose up -d

echo "✅ Hoàn thành! Kiểm tra logs:"
docker-compose logs --tail=50
```

Sử dụng:
```bash
chmod +x rebuild.sh
./rebuild.sh
```

---

## 📝 Lưu ý quan trọng

1. **Backup database trước khi xóa volumes:**
   ```bash
   docker exec ecommerce_mysql mysqldump -uroot -prootpassword ecommerce_db > backup.sql
   ```

2. **Kiểm tra environment variables:**
   - Đảm bảo file `.env` có đầy đủ config
   - Copy từ `env.example` nếu chưa có

3. **Port conflicts:**
   - Đảm bảo ports 3001, 3002, 3003, 3306 không bị chiếm bởi process khác

4. **Memory và Disk:**
   - Build Docker cần ~2-3GB disk space
   - Đảm bảo có đủ RAM (ít nhất 4GB)

---

## 🆘 Troubleshooting

### Lỗi: Port already in use
```bash
# Tìm process đang dùng port
netstat -ano | findstr :3001
# Kill process (Windows)
taskkill /PID <PID> /F
```

### Lỗi: Cannot connect to MySQL
```bash
# Đợi MySQL khởi động xong (có thể mất 30-60 giây)
docker-compose logs mysql
# Kiểm tra health
docker-compose ps
```

### Lỗi: Build failed
```bash
# Xóa cache và build lại
docker system prune -a
docker-compose build --no-cache
```

---

## ✅ Checklist hoàn thành

- [ ] Docker cũ đã được dừng và xóa
- [ ] Code đã được pull từ GitHub
- [ ] Docker images đã được build thành công
- [ ] Tất cả containers đang chạy (status: Up)
- [ ] Health checks đều pass
- [ ] Logs không có lỗi
- [ ] API endpoints hoạt động đúng

---

## 📞 Liên hệ

Nếu gặp vấn đề, kiểm tra:
1. Docker logs: `docker-compose logs`
2. Container status: `docker-compose ps`
3. System resources: `docker stats`

