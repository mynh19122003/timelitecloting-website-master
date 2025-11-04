# 🚀 Hướng Dẫn Deploy Nhanh - Frontend Only

## ✅ Build Hoàn Tất!

Website frontend đã được build thành công và sẵn sàng để deploy!  
**Lưu ý:** Đây chỉ là frontend, bạn cần có backend server riêng.

---

## 📦 File Cần Upload

**File ZIP:** `timelitecloting-vps-deploy.zip` (đã được tạo sẵn)

---

## ⚡ Deploy Nhanh 5 Phút

### Bước 1: Upload lên VPS

```bash
# Upload file zip
scp timelitecloting-vps-deploy.zip user@your-vps-ip:/home/user/

# SSH vào VPS
ssh user@your-vps-ip

# Giải nén
cd /home/user
unzip timelitecloting-vps-deploy.zip -d timelitecloting-frontend
cd timelitecloting-frontend
```

### Bước 2: Cấu Hình Backend URL

```bash
# Tạo file .env.production
nano .env.production
```

**Thêm URL backend của bạn:**
```env
NEXT_PUBLIC_API_URL=https://api.your-backend.com
```

### Bước 3: Cài Đặt và Chạy

```bash
# Cài dependencies
npm install --production

# Cài PM2
sudo npm install -g pm2

# Start frontend
pm2 start npm --name "timelitecloting-fe" -- start

# Lưu cấu hình
pm2 save
pm2 startup
```

### Bước 4: Cấu Hình Nginx

```bash
# Cài Nginx
sudo apt update
sudo apt install nginx -y

# Tạo cấu hình
sudo nano /etc/nginx/sites-available/timelitecloting
```

**Paste config này (thay `your-domain.com`):**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable và restart:**

```bash
sudo ln -s /etc/nginx/sites-available/timelitecloting /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Bước 5: Cài SSL (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Bước 6: Firewall

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## 🎯 Lệnh Deploy Siêu Nhanh

Copy toàn bộ và chạy trên VPS:

```bash
# === SAU KHI UPLOAD FILE ===

# Giải nén và cd
unzip timelitecloting-vps-deploy.zip -d timelitecloting-frontend
cd timelitecloting-frontend

# Tạo .env.production (THAY BACKEND_URL)
echo "NEXT_PUBLIC_API_URL=https://your-backend-url.com" > .env.production

# Cài đặt
npm install --production
sudo npm install -g pm2
pm2 start npm --name "timelitecloting-fe" -- start
pm2 save && pm2 startup

# Nginx + SSL (chạy từng lệnh)
sudo apt update && sudo apt install nginx certbot python3-certbot-nginx -y

# Tạo Nginx config (mở editor và paste config ở trên)
sudo nano /etc/nginx/sites-available/timelitecloting

# Enable
sudo ln -s /etc/nginx/sites-available/timelitecloting /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL (thay your-domain.com)
sudo certbot --nginx -d your-domain.com

# Firewall
sudo ufw allow 22,80,443/tcp && sudo ufw enable

# Done! ✅
```

---

## 🔧 Quản Lý

```bash
pm2 status                       # Xem trạng thái
pm2 logs timelitecloting-fe      # Xem logs
pm2 restart timelitecloting-fe   # Restart
pm2 stop timelitecloting-fe      # Stop
```

---

## 🔍 Troubleshooting

### Frontend không kết nối được Backend?

```bash
# Kiểm tra .env.production
cat .env.production

# Restart
pm2 restart timelitecloting-fe
```

**Đảm bảo backend có CORS cho phép frontend domain:**

```javascript
// Backend (Node.js/Express example)
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}));
```

### Port 3000 bị chiếm?

```bash
# Kill process
sudo kill -9 $(sudo lsof -t -i:3000)

# Hoặc đổi port
echo "PORT=3001" >> .env.production
pm2 restart timelitecloting-fe
```

### Nginx 502 Error?

```bash
# Kiểm tra frontend có chạy không
pm2 status

# Xem logs
pm2 logs timelitecloting-fe
sudo tail -f /var/log/nginx/error.log
```

---

## 📊 Kiến Trúc Hệ Thống

```
User Browser
      ↓
  [Internet]
      ↓
[Nginx :80/:443] ← your-domain.com
      ↓
[Frontend Next.js :3000]
      ↓ API Calls
[Backend Server] ← api.your-backend.com (đã có sẵn)
```

---

## ✅ Checklist

- [ ] Upload file zip lên VPS
- [ ] Giải nén
- [ ] Tạo `.env.production` với backend URL
- [ ] `npm install --production`
- [ ] Cài PM2 và start: `pm2 start npm --name "timelitecloting-fe" -- start`
- [ ] `pm2 save && pm2 startup`
- [ ] Cài Nginx
- [ ] Tạo Nginx config
- [ ] `sudo nginx -t && sudo systemctl restart nginx`
- [ ] Cài SSL: `sudo certbot --nginx`
- [ ] Firewall: `sudo ufw allow 80,443/tcp`
- [ ] Test: `https://your-domain.com`
- [ ] Kiểm tra API calls đến backend

---

## 📞 Cần Chi Tiết Hơn?

Xem file `DEPLOY_GUIDE.md` trong deploy package.

---

**Chúc bạn deploy thành công! 🎉**

**Lưu ý quan trọng:**
- Frontend cần `.env.production` với backend URL
- Backend phải cấu hình CORS cho phép frontend domain
- Đảm bảo backend đang chạy và accessible
