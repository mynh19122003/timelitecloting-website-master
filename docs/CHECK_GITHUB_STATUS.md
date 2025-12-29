# 🔍 Hướng dẫn kiểm tra code đã push lên GitHub

## 📋 Các cách kiểm tra

### 1. Kiểm tra trên GitHub Web (Cách đơn giản nhất)

1. Mở trình duyệt và vào: `https://github.com/mynh19122003/timelitecloting-website-master`
2. Kiểm tra:
   - Commit mới nhất có message gì?
   - Thời gian commit là khi nào?
   - Files nào đã được thay đổi?

### 2. Kiểm tra bằng Git Commands

#### Bước 1: Kiểm tra remote repository
```powershell
git remote -v
```
Kết quả sẽ hiển thị:
```
origin  https://github.com/mynh19122003/timelitecloting-website-master.git (fetch)
origin  https://github.com/mynh19122003/timelitecloting-website-master.git (push)
```

#### Bước 2: Fetch thông tin mới nhất từ GitHub
```powershell
git fetch origin
```

#### Bước 3: So sánh local vs remote
```powershell
# Xem commits nào đã push (local ahead of remote)
git log origin/main..HEAD --oneline

# Xem commits nào chưa pull (remote ahead of local)
git log HEAD..origin/main --oneline

# Xem tất cả commits khác biệt
git log HEAD...origin/main --oneline --left-right
```

#### Bước 4: Kiểm tra trạng thái
```powershell
git status
```

**Kết quả mong đợi nếu đã push thành công:**
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

**Nếu chưa push:**
```
On branch main
Your branch is ahead of 'origin/main' by X commits.
```

### 3. Kiểm tra commit history

#### Xem 10 commits gần nhất
```powershell
git log --oneline -10
```

#### Xem commit với thông tin chi tiết
```powershell
git log -5 --pretty=format:"%h - %an, %ar : %s"
```

#### Xem commit cuối cùng
```powershell
git log -1
```

### 4. So sánh với remote branch

```powershell
# Xem sự khác biệt giữa local và remote
git diff origin/main

# Xem danh sách files khác biệt
git diff --name-only origin/main
```

### 5. Kiểm tra branch hiện tại

```powershell
# Xem branch hiện tại
git branch

# Xem branch với thông tin remote
git branch -vv
```

---

## ✅ Checklist kiểm tra

- [ ] `git status` hiển thị "Your branch is up to date with 'origin/main'"
- [ ] `git log origin/main..HEAD` không có commits nào (đã push hết)
- [ ] Trên GitHub web, commit mới nhất khớp với local
- [ ] Files đã thay đổi đều có trên GitHub

---

## 🔧 Các lệnh hữu ích

### Xem commit mới nhất
```powershell
git log -1 --stat
```

### Xem files đã thay đổi trong commit cuối
```powershell
git show --name-status HEAD
```

### Xem URL của remote repository
```powershell
git remote get-url origin
```

### Kiểm tra xem có thay đổi chưa commit không
```powershell
git diff
git diff --staged
```

---

## 🆘 Nếu phát hiện chưa push

### Push code lên GitHub
```powershell
# Kiểm tra lại
git status

# Add files (nếu có)
git add .

# Commit (nếu chưa commit)
git commit -m "Your commit message"

# Push lên GitHub
git push origin main
```

### Force push (CẨN THẬN - chỉ dùng khi cần)
```powershell
git push origin main --force
```

---

## 📝 Ví dụ output

### Khi đã push thành công:
```
PS> git status
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean

PS> git log origin/main..HEAD --oneline
(empty - không có commits nào chưa push)
```

### Khi chưa push:
```
PS> git status
On branch main
Your branch is ahead of 'origin/main' by 2 commits.
  (use "git push" to publish your local commits)

PS> git log origin/main..HEAD --oneline
abc1234 feat: Add bulk delete feature
def5678 fix: Fix CORS configuration
```

