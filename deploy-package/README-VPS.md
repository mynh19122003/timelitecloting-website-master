# Deploy TimeLite Clothing Website lên VPS

## 📦 Package này chứa gì?

- `server.js` - File chạy ứng dụng Next.js
- `package.json` - Danh sách dependencies
- `.next/` - Build output của Next.js
- `public/` - Static assets (images, fonts, etc.)
- `start.sh` - Script tự động cài đặt và chạy
- `.env.production` - File cấu hình (cần chỉnh sửa)

## 🚀 Cách deploy nhanh (3 bước)

### Bước 1: Upload files lên VPS

**Option A: Sử dụng SCP (từ máy Windows)**
```powershell
# Nén folder này
Compress-Archive -Path "deploy-package" -DestinationPath "deploy-package.zip"

# Upload lên VPS
scp deploy-package.zip user@your-vps-ip:/home/user/
```

**Option B: Sử dụng WinSCP/FileZilla**
- Upload toàn bộ thư mục `deploy-package` lên VPS

### Bước 2: SSH vào VPS và giải nén

```bash
ssh user@your-vps-ip
cd /home/user
unzip deploy-package.zip
cd deploy-package
```

### Bước 3: Chạy script tự động

```bash
# Cho phép execute script
chmod +x start.sh

# Chạy script
./start.sh
```

**Xong! Website đã chạy trên port 3000** 🎉

## ⚙️ Cấu hình trước khi chạy

### 1. Sửa file `.env.production`

```bash
nano .env.production
```

Thay đổi các giá trị sau:
- `NEXT_PUBLIC_API_URL` - URL backend API của bạn
- `NEXT_PUBLIC_SOCKET_URL` - URL Socket.IO server của bạn

### 2. (Tùy chọn) Thay đổi port

Nếu port 3000 đã được sử dụng, sửa `PORT=3001` trong `.env.production`

## 🌐 Cấu hình Nginx (để truy cập từ domain)

### 1. Cài đặt Nginx (nếu chưa có)

```bash
sudo apt update
sudo apt install nginx
```

### 2. Tạo file cấu hình Nginx

```bash
sudo nano /etc/nginx/sites-available/timelitecloting
```

Paste nội dung sau (thay `your-domain.com` bằng domain của bạn):

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
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    # Cache images
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Enable site và restart Nginx

```bash
sudo ln -s /etc/nginx/sites-available/timelitecloting /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Cài đặt SSL (HTTPS) - Khuyến nghị

```bash
# Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx

# Tạo SSL certificate (thay your-domain.com)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certbot sẽ tự động cấu hình HTTPS
```

## 📊 Quản lý ứng dụng với PM2

```bash
# Xem trạng thái
pm2 status

# Xem logs
pm2 logs timelitecloting

# Restart ứng dụng
pm2 restart timelitecloting

# Stop ứng dụng
pm2 stop timelitecloting

# Start lại
pm2 start timelitecloting

# Xóa khỏi PM2
pm2 delete timelitecloting
```

## 🔧 Troubleshooting

### Lỗi "Cannot find module"
```bash
npm install --production
pm2 restart timelitecloting
```

### Website không load được
```bash
# Kiểm tra logs
pm2 logs timelitecloting

# Kiểm tra port
sudo netstat -tulpn | grep :3000

# Kiểm tra firewall
sudo ufw status
sudo ufw allow 3000
sudo ufw allow 80
sudo ufw allow 443
```

### Images không hiển thị
```bash
# Kiểm tra quyền
chmod -R 755 public/
```

### Update code mới
```bash
# Upload code mới
# Sau đó:
pm2 restart timelitecloting
```

## 📈 Performance Tips

1. **Bật Gzip compression trong Nginx**
```nginx
# Thêm vào file nginx config
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

2. **Tăng PM2 instances** (nếu VPS có nhiều CPU cores)
```bash
pm2 delete timelitecloting
pm2 start server.js --name timelitecloting -i max
```

3. **Monitor resource usage**
```bash
pm2 monit
```

## 🆘 Support

Nếu gặp vấn đề:

1. Kiểm tra logs: `pm2 logs timelitecloting`
2. Kiểm tra Node.js version: `node --version` (cần >= 18.x)
3. Kiểm tra Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Kiểm tra port: `sudo netstat -tulpn | grep :3000`

---

**Chúc bạn deploy thành công! 🎉**




