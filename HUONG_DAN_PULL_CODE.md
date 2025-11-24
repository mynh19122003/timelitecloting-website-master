# Hướng dẫn kiểm tra GitHub và Pull code xuống VPS

## 📋 BƯỚC 1: Kiểm tra trạng thái trên GitHub

### 1.1. Kiểm tra qua trình duyệt web
1. Mở trình duyệt và truy cập: `https://github.com/mynh19122003/timelitecloting-website-master`
2. Kiểm tra:
   - Branch nào đang active (thường là `main`)
   - Commit mới nhất là gì
   - Có Pull Request nào đang mở không
   - Có thay đổi nào chưa được push lên không

### 1.2. Kiểm tra qua Git commands (trên máy local)
```bash
# Xem các commit mới nhất trên GitHub
git fetch origin
git log origin/main --oneline -10

# So sánh code local với GitHub
git fetch origin
git log HEAD..origin/main --oneline

# Xem tất cả branches trên GitHub
git fetch origin
git branch -r
```

---

## 📤 BƯỚC 2: Commit và Push code hiện tại (nếu có thay đổi)

**⚠️ QUAN TRỌNG:** Trước khi pull code từ GitHub, bạn cần commit và push các thay đổi hiện tại (nếu có).

### 2.1. Kiểm tra thay đổi
```bash
git status
```

### 2.2. Xem chi tiết thay đổi
```bash
git diff
```

### 2.3. Commit các thay đổi
```bash
# Thêm tất cả file đã thay đổi
git add .

# Hoặc thêm từng file cụ thể
git add src/admin/api/config.js
git add ecommerce-backend/backend-php/src/Models/Product.php
# ... các file khác

# Commit với message
git commit -m "Fix: Cập nhật API config để tự động dùng production API khi deploy"
```

### 2.4. Push lên GitHub
```bash
git push origin main
```

---

## 🔽 BƯỚC 3: Pull code từ GitHub xuống VPS

### 3.1. Kết nối vào VPS
```bash
# Sử dụng SSH để kết nối vào VPS
ssh username@your-vps-ip

# Ví dụ:
# ssh root@123.456.789.0
# hoặc
# ssh ubuntu@your-domain.com
```

### 3.2. Di chuyển đến thư mục project trên VPS
```bash
# Tìm thư mục project (thường là trong /var/www hoặc /home/username)
cd /var/www/timelitecloting-website-master
# hoặc
cd /home/username/timelitecloting-website-master

# Kiểm tra xem có phải là git repository không
git status
```

### 3.3. Kiểm tra trạng thái hiện tại trên VPS
```bash
# Xem branch hiện tại
git branch

# Xem các thay đổi chưa commit
git status

# Xem commit mới nhất
git log --oneline -5
```

### 3.4. Fetch code mới từ GitHub (không merge)
```bash
# Lấy thông tin mới nhất từ GitHub nhưng chưa merge
git fetch origin

# Xem các commit mới trên GitHub
git log HEAD..origin/main --oneline
```

### 3.5. Pull code từ GitHub
```bash
# Cách 1: Pull trực tiếp (nếu không có conflict)
git pull origin main

# Cách 2: Pull với rebase (giữ lịch sử commit sạch hơn)
git pull --rebase origin main

# Cách 3: Reset về đúng với GitHub (⚠️ MẤT TẤT CẢ THAY ĐỔI CHƯA COMMIT)
# CHỈ DÙNG KHI CHẮC CHẮN MUỐN XÓA TẤT CẢ THAY ĐỔI LOCAL
git fetch origin
git reset --hard origin/main
```

### 3.6. Xử lý conflict (nếu có)
Nếu có conflict, Git sẽ báo lỗi. Làm theo các bước sau:

```bash
# Xem các file bị conflict
git status

# Mở file bị conflict và sửa thủ công
# Tìm các dòng có <<<<<<< HEAD, =======, >>>>>>>
# Xóa các marker và giữ lại code đúng

# Sau khi sửa xong:
git add <file-bị-conflict>
git commit -m "Resolve merge conflict"
```

---

## 🔄 BƯỚC 4: Kiểm tra sau khi pull

### 4.1. Xác nhận code đã được cập nhật
```bash
# Xem commit mới nhất
git log --oneline -5

# Kiểm tra trạng thái
git status

# So sánh với GitHub
git fetch origin
git log HEAD..origin/main --oneline
# (Nếu không có output nghĩa là đã đồng bộ)
```

### 4.2. Rebuild Docker containers (SAU KHI PULL CODE)

**⚠️ QUAN TRỌNG:** Sau khi pull code mới, bạn CẦN rebuild Docker containers để code mới được áp dụng.

#### 4.2.1. Di chuyển vào thư mục backend
```bash
cd ecommerce-backend
```

#### 4.2.2. Rebuild và restart containers
```bash
# Cách 1: Rebuild tất cả containers (khuyến nghị - đảm bảo code mới được áp dụng)
docker-compose build --no-cache
docker-compose up -d

# Cách 2: Rebuild và restart trong một lệnh
docker-compose up -d --build

# Cách 3: Chỉ rebuild một service cụ thể (nhanh hơn)
docker-compose build --no-cache backend-node
docker-compose up -d backend-node
```

#### 4.2.3. Kiểm tra trạng thái containers
```bash
# Xem trạng thái tất cả containers
docker-compose ps

# Xem logs của containers
docker-compose logs --tail=50

# Xem logs của một service cụ thể
docker-compose logs --tail=50 backend-node
docker-compose logs --tail=50 ecommerce-admin-backend-node
```

#### 4.2.4. Restart nhanh (không rebuild - chỉ dùng khi không có thay đổi code)
```bash
# Chỉ restart containers (không rebuild image)
docker-compose restart

# Restart một service cụ thể
docker-compose restart backend-node
```

#### 4.2.5. Xử lý lỗi khi rebuild
```bash
# Nếu có lỗi, xem logs chi tiết
docker-compose logs

# Dừng tất cả containers
docker-compose down

# Xóa images cũ và rebuild lại
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 4.3. Rebuild frontend (nếu có thay đổi)
```bash
# Nếu là Next.js project
cd src
npm install
npm run build
```

---

## 📝 CÁC LỆNH TÓM TẮT

### Trên máy local (Windows):
```bash
# 1. Kiểm tra trạng thái
git status

# 2. Commit thay đổi
git add .
git commit -m "Your commit message"

# 3. Push lên GitHub
git push origin main

# 4. Kiểm tra trên GitHub
git fetch origin
git log origin/main --oneline -10
```

### Trên VPS (Linux):
```bash
# 1. Kết nối VPS
ssh username@vps-ip

# 2. Vào thư mục project
cd /path/to/project

# 3. Kiểm tra trạng thái
git status

# 4. Pull code mới
git pull origin main

# 5. Rebuild Docker containers (BẮT BUỘC sau khi pull)
cd ecommerce-backend
docker-compose build --no-cache
docker-compose up -d

# 6. Kiểm tra containers đang chạy
docker-compose ps

# 7. Xem logs để đảm bảo không có lỗi
docker-compose logs --tail=50
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Luôn backup trước khi pull:** Nếu có thay đổi quan trọng trên VPS, hãy backup trước
2. **Kiểm tra branch:** Đảm bảo đang ở đúng branch (thường là `main`)
3. **Xử lý conflict cẩn thận:** Đọc kỹ code trước khi quyết định giữ phần nào
4. **REBUILD DOCKER SAU KHI PULL:** ⚠️ **BẮT BUỘC** - Sau khi pull code, phải rebuild Docker containers để code mới được áp dụng
5. **Test sau khi pull:** Luôn test lại ứng dụng sau khi pull code mới và rebuild Docker
6. **Không dùng `git reset --hard`** trừ khi chắc chắn muốn xóa tất cả thay đổi local
7. **Kiểm tra logs:** Sau khi rebuild, luôn kiểm tra logs để đảm bảo không có lỗi

---

## 🆘 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi: "Your local changes would be overwritten"
```bash
# Cách 1: Stash thay đổi local
git stash
git pull origin main
git stash pop

# Cách 2: Commit thay đổi local trước
git add .
git commit -m "Local changes"
git pull origin main
```

### Lỗi: "Permission denied"
```bash
# Kiểm tra quyền truy cập SSH key
ssh-add ~/.ssh/id_rsa

# Hoặc cấu hình lại remote URL với token
git remote set-url origin https://YOUR_TOKEN@github.com/mynh19122003/timelitecloting-website-master.git
```

### Lỗi: "Repository not found"
- Kiểm tra URL remote: `git remote -v`
- Đảm bảo có quyền truy cập repository trên GitHub
- Kiểm tra authentication (SSH key hoặc token)

---

## 🐳 QUY TRÌNH HOÀN CHỈNH: PULL CODE + REBUILD DOCKER

### Tóm tắt các bước cần làm sau khi pull code:

```bash
# 1. Pull code từ GitHub
git pull origin main

# 2. Vào thư mục backend
cd ecommerce-backend

# 3. Rebuild Docker containers
docker-compose build --no-cache
docker-compose up -d

# 4. Kiểm tra trạng thái
docker-compose ps

# 5. Xem logs để đảm bảo không có lỗi
docker-compose logs --tail=50

# 6. Test ứng dụng
# Truy cập http://localhost:3002 để kiểm tra
```

### Các lệnh Docker hữu ích:

```bash
# Xem tất cả containers đang chạy
docker-compose ps

# Xem logs real-time
docker-compose logs -f

# Xem logs của một service cụ thể
docker-compose logs -f backend-node

# Restart một service
docker-compose restart backend-node

# Dừng tất cả containers
docker-compose down

# Dừng và xóa volumes (⚠️ XÓA DỮ LIỆU)
docker-compose down -v

# Xem dung lượng Docker đang sử dụng
docker system df

# Dọn dẹp images không dùng
docker image prune -a
```

---

**Sau khi làm xong các bước trên, hãy chụp ảnh màn hình và gửi cho tôi để tôi kiểm tra! 📸**

