# 🚀 Hướng dẫn nhanh: Pull code từ GitHub xuống VPS

## 📍 BƯỚC 1: Kiểm tra trên GitHub (Web)

1. Mở trình duyệt: https://github.com/mynh19122003/timelitecloting-website-master
2. Kiểm tra:
   - ✅ Branch `main` có commit mới không?
   - ✅ Có Pull Request nào đang mở không?

---

## 💻 BƯỚC 2: Trên máy local (Windows) - Commit & Push code hiện tại

```bash
# Kiểm tra thay đổi
git status

# Thêm tất cả file
git add .

# Commit
git commit -m "Fix: Cập nhật API config"

# Push lên GitHub
git push origin main
```

---

## 🖥️ BƯỚC 3: Trên VPS (Linux) - Pull code

### Cách 1: Dùng script tự động (Khuyên dùng)

```bash
# Kết nối VPS
ssh username@vps-ip

# Vào thư mục project
cd /var/www/timelitecloting-website-master
# hoặc
cd /home/username/timelitecloting-website-master

# Chạy script kiểm tra
bash check-github-status.sh

# Chạy script pull
bash pull-from-github.sh
```

### Cách 2: Lệnh thủ công

```bash
# 1. Kết nối VPS
ssh username@vps-ip

# 2. Vào thư mục project
cd /path/to/timelitecloting-website-master

# 3. Kiểm tra trạng thái
git status

# 4. Fetch code mới
git fetch origin

# 5. Xem commit mới
git log HEAD..origin/main --oneline

# 6. Pull code
git pull origin main

# 7. Rebuild (nếu cần)
npm install
npm run build
```

---

## ⚠️ XỬ LÝ LỖI

### Nếu có thay đổi chưa commit trên VPS:
```bash
# Stash thay đổi
git stash

# Pull code
git pull origin main

# Apply lại thay đổi (nếu cần)
git stash pop
```

### Nếu có conflict:
```bash
# Xem file bị conflict
git status

# Sửa file thủ công, sau đó:
git add <file>
git commit -m "Resolve conflict"
```

---

## 📸 Sau khi làm xong, chụp ảnh:

1. ✅ Màn hình GitHub (trang repository)
2. ✅ Kết quả `git status` trên VPS
3. ✅ Kết quả `git pull` trên VPS
4. ✅ Kết quả `git log --oneline -5` trên VPS

**Gửi ảnh cho tôi để tôi kiểm tra!** 📸






