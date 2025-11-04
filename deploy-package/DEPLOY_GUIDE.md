# 🚀 Hướng Dẫn Deploy Frontend TimeLite Clothing lên VPS

## 📋 Mô Tả

Đây là hướng dẫn deploy **FRONTEND ONLY** của TimeLite Clothing. Frontend sẽ kết nối với backend server đã có sẵn.

## 📦 Nội Dung Package

```
deploy-package/
├── .next/              # Next.js build output (production-ready)
├── public/             # Static assets (images, fonts, etc.)
├── package.json        # Dependencies
├── .env.production     # Cấu hình kết nối backend (TẠO FILE NÀY)
└── DEPLOY_GUIDE.md     # File này
```

## ⚙️ Yêu Cầu Hệ Thống

- **VPS/Server** với Ubuntu 20.04+ hoặc CentOS 7+
- **Node.js** >= 18.0.0
- **NPM** >= 9.0.0
- **Nginx** (để serve static files và reverse proxy)
- **PM2** (tùy chọn, để quản lý process)

## 🚀 Các Bước Deploy

### Bước 1: Upload Files lên VPS

#### Option A: Sử dụng SCP (từ Windows)

```bash
# Upload file zip (khuyến nghị)
scp timelitecloting-vps-deploy.zip user@your-vps-ip:/home/user/

# SSH vào VPS
ssh user@your-vps-ip

# Giải nén
cd /home/user
unzip timelitecloting-vps-deploy.zip -d timelitecloting-frontend
cd timelitecloting-frontend
```

#### Option B: Sử dụng WinSCP/FileZilla

1. Mở WinSCP/FileZilla
2. Kết nối tới VPS
3. Upload toàn bộ thư mục `deploy-package` lên `/home/user/timelitecloting-frontend`

### Bước 2: Cấu Hình Backend URL

Tạo file `.env.production` để kết nối với backend:

```bash
cd /home/user/timelitecloting-frontend
nano .env.production
```

Thêm các biến môi trường (thay bằng URL backend thực của bạn):

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://api.timelitecloting.com

# Hoặc nếu backend cùng server:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Các biến khác nếu cần
NEXT_PUBLIC_SOCKET_URL=https://socket.timelitecloting.com
NEXT_PUBLIC_CDN_URL=https://cdn.timelitecloting.com
```

### Bước 3: Cài Đặt Dependencies

```bash
# Cài đặt production dependencies
npm install --production

# Hoặc nếu gặp lỗi, dùng:
npm ci --production
```

### Bước 4: Start Frontend với Next.js

Next.js có standalone mode, chạy trực tiếp:

```bash
# Chạy thử trước
npm start

# Hoặc
node .next/standalone/server.js
```

### Bước 5: Quản Lý với PM2 (Khuyến Nghị)

```bash
# Cài đặt PM2
sudo npm install -g pm2

# Start frontend
pm2 start npm --name "timelitecloting-fe" -- start

# Hoặc nếu có standalone:
# pm2 start .next/standalone/server.js --name "timelitecloting-fe"

# Lưu cấu hình
pm2 save

# Auto start khi reboot
pm2 startup
# (Copy và chạy lệnh mà PM2 suggest)

# Kiểm tra status
pm2 status
```

### Bước 6: Cấu Hình Nginx

#### 6.1 Cài đặt Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

#### 6.2 Tạo cấu hình site

```bash
sudo nano /etc/nginx/sites-available/timelitecloting
```

**Cấu hình cho Frontend + Backend riêng biệt:**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Logs
    access_log /var/log/nginx/timelitecloting-access.log;
    error_log /var/log/nginx/timelitecloting-error.log;

    # Frontend Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files optimization
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    # Public files
    location /public {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Nếu muốn reverse proxy cả Backend:**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (giả sử backend chạy trên port 8000)
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket cho realtime (nếu có)
    location /socket.io/ {
        proxy_pass http://localhost:8000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### 6.3 Enable và Test Nginx

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/timelitecloting /etc/nginx/sites-enabled/

# Test cấu hình
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Bước 7: Cài Đặt SSL (HTTPS)

```bash
# Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx -y

# Tự động cấu hình SSL
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto renew
sudo certbot renew --dry-run
```

### Bước 8: Cấu Hình Firewall

```bash
# UFW Firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

## 🔧 Cấu Hình Nâng Cao

### Kết Nối với Backend Server Riêng

Nếu backend ở server khác, cập nhật `.env.production`:

```env
NEXT_PUBLIC_API_URL=https://backend.your-domain.com
```

Và cấu hình CORS trên backend để accept requests từ frontend domain.

### Tối Ưu Performance

**1. Enable Gzip trong Nginx:**

```bash
sudo nano /etc/nginx/nginx.conf
```

Thêm vào trong `http {}` block:

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

**2. Caching Headers:**

Đã được cấu hình trong Nginx config phía trên.

### Monitoring & Logs

```bash
# PM2 Logs
pm2 logs timelitecloting-fe

# Nginx Logs
sudo tail -f /var/log/nginx/timelitecloting-access.log
sudo tail -f /var/log/nginx/timelitecloting-error.log

# PM2 Monitoring
pm2 monit
```

## 📊 Quản Lý Process

```bash
# PM2 Commands
pm2 status                        # Xem trạng thái
pm2 restart timelitecloting-fe    # Restart
pm2 stop timelitecloting-fe       # Stop
pm2 start timelitecloting-fe      # Start
pm2 delete timelitecloting-fe     # Xóa
pm2 logs timelitecloting-fe       # Xem logs
pm2 monit                         # Monitor realtime
```

## ✅ Checklist Deploy

- [ ] Upload files lên VPS
- [ ] Tạo file `.env.production` với backend URL
- [ ] Cài đặt dependencies: `npm install --production`
- [ ] Test chạy: `npm start`
- [ ] Cài đặt PM2: `sudo npm install -g pm2`
- [ ] Start với PM2: `pm2 start npm --name "timelitecloting-fe" -- start`
- [ ] Lưu PM2: `pm2 save && pm2 startup`
- [ ] Cài đặt Nginx
- [ ] Cấu hình Nginx site
- [ ] Test Nginx: `sudo nginx -t`
- [ ] Restart Nginx: `sudo systemctl restart nginx`
- [ ] Cài đặt SSL: `sudo certbot --nginx -d your-domain.com`
- [ ] Cấu hình Firewall: `sudo ufw allow 80,443/tcp`
- [ ] Test website: `https://your-domain.com`
- [ ] Kiểm tra kết nối với backend API

## 🔍 Troubleshooting

### 1. Frontend không kết nối được Backend

**Triệu chứng:** API calls fail, CORS errors

**Giải pháp:**
```bash
# Kiểm tra .env.production
cat .env.production

# Restart frontend
pm2 restart timelitecloting-fe

# Kiểm tra backend có chạy không
curl http://localhost:8000/api/health
# hoặc
curl https://your-backend-domain.com/api/health
```

**Cấu hình CORS trên Backend (ví dụ Node.js/Express):**
```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:3000'],
  credentials: true
}));
```

### 2. Port 3000 đã bị sử dụng

```bash
# Kiểm tra process
sudo lsof -i :3000

# Hoặc kill process
sudo kill -9 $(sudo lsof -t -i:3000)

# Hoặc đổi port
echo "PORT=3001" >> .env.production
pm2 restart timelitecloting-fe
```

### 3. Images/Static files không load

```bash
# Kiểm tra permissions
ls -la public/
chmod -R 755 public/

# Restart
pm2 restart timelitecloting-fe
```

### 4. Build lỗi hoặc thiếu dependencies

```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install --production

# Restart
pm2 restart timelitecloting-fe
```

### 5. Nginx 502 Bad Gateway

```bash
# Kiểm tra frontend có chạy không
pm2 status

# Kiểm tra port
sudo netstat -tulpn | grep 3000

# Xem logs
pm2 logs timelitecloting-fe
sudo tail -f /var/log/nginx/error.log
```

### 6. SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Restart nginx
sudo systemctl restart nginx
```

## 🔐 Security Best Practices

1. **Environment Variables:**
   - Không commit `.env.production` vào git
   - Sử dụng secrets management nếu có

2. **Firewall:**
   - Chỉ mở ports cần thiết (22, 80, 443)
   - Sử dụng fail2ban để prevent brute force

3. **Updates:**
   ```bash
   # Update dependencies định kỳ
   npm update
   npm audit fix
   ```

4. **Backup:**
   ```bash
   # Backup config
   sudo cp -r /etc/nginx/sites-available /backup/nginx-config
   
   # Backup frontend
   tar -czf frontend-backup.tar.gz /home/user/timelitecloting-frontend
   ```

## 📈 Scaling & Performance

### Load Balancing (Nếu cần)

```bash
# Chạy multiple instances
pm2 start npm --name "timelitecloting-fe" -i max -- start

# Nginx upstream
sudo nano /etc/nginx/sites-available/timelitecloting
```

```nginx
upstream frontend {
    least_conn;
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}

server {
    location / {
        proxy_pass http://frontend;
        # ... other configs
    }
}
```

### CDN Integration

Sử dụng CDN cho static assets:
- Cloudflare
- AWS CloudFront
- BunnyCDN

## 📞 Support

### Logs để Debug

```bash
# Frontend logs
pm2 logs timelitecloting-fe --lines 100

# Nginx access logs
sudo tail -n 100 /var/log/nginx/timelitecloting-access.log

# Nginx error logs
sudo tail -n 100 /var/log/nginx/timelitecloting-error.log

# System logs
journalctl -u nginx -n 50
```

### Kiểm Tra Health

```bash
# Frontend status
curl http://localhost:3000

# Nginx status
sudo systemctl status nginx

# PM2 status
pm2 status
```

## 🎯 Tóm Tắt Lệnh Deploy Nhanh

```bash
# === TRÊN VPS ===

# 1. Upload và giải nén
unzip timelitecloting-vps-deploy.zip -d timelitecloting-frontend
cd timelitecloting-frontend

# 2. Cấu hình backend URL
echo "NEXT_PUBLIC_API_URL=https://your-backend-url.com" > .env.production

# 3. Cài đặt
npm install --production

# 4. PM2
sudo npm install -g pm2
pm2 start npm --name "timelitecloting-fe" -- start
pm2 save && pm2 startup

# 5. Nginx
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/timelitecloting
# (paste config từ hướng dẫn trên)
sudo ln -s /etc/nginx/sites-available/timelitecloting /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 6. SSL
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com

# 7. Firewall
sudo ufw allow 22,80,443/tcp
sudo ufw enable

# Done! 🎉
```

---

## 📋 Kiến Trúc Hệ Thống

```
Internet
    ↓
[Nginx :80/:443]
    ↓
[Frontend :3000] → [Backend API :8000/remote]
```

**Chúc bạn deploy thành công! 🚀**
