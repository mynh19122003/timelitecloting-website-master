# Hướng Dẫn Deploy Website Lên VPS

## 📦 Build đã hoàn thành!

Website đã được build thành công với Next.js standalone mode. Đây là cách tối ưu nhất để deploy lên VPS.

## 🚀 Các bước deploy lên VPS

### Bước 1: Chuẩn bị files cần upload

Bạn cần upload các thư mục/files sau lên VPS:

```
.next/standalone/          # Ứng dụng chính
.next/static/              # Static assets (CSS, JS)
public/                    # Public assets (images, etc.)
package.json               # Dependencies
```

### Bước 2: Tạo script để chạy trên VPS

Tạo file `server.js` trong thư mục standalone trên VPS:

```javascript
// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ 
  dev: false,
  hostname,
  port
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

### Bước 3: Cài đặt trên VPS

```bash
# 1. Kết nối SSH vào VPS
ssh user@your-vps-ip

# 2. Cài đặt Node.js (nếu chưa có)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Tạo thư mục cho ứng dụng
mkdir -p /var/www/timelitecloting
cd /var/www/timelitecloting

# 4. Upload files (sử dụng SCP hoặc SFTP)
# Trên máy Windows của bạn:
# scp -r .next/standalone/* user@your-vps-ip:/var/www/timelitecloting/
# scp -r .next/static user@your-vps-ip:/var/www/timelitecloting/.next/
# scp -r public user@your-vps-ip:/var/www/timelitecloting/
# scp package.json user@your-vps-ip:/var/www/timelitecloting/

# 5. Cài đặt dependencies (trên VPS)
npm install --production

# 6. Test chạy ứng dụng
node server.js

# 7. Cấu hình PM2 để chạy background
npm install -g pm2
pm2 start server.js --name timelitecloting
pm2 save
pm2 startup
```

### Bước 4: Cấu hình Nginx (reverse proxy)

Tạo file `/etc/nginx/sites-available/timelitecloting`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

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
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/timelitecloting /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Bước 5: Cấu hình SSL (HTTPS) - Khuyến nghị

```bash
# Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx

# Tạo SSL certificate
sudo certbot --nginx -d your-domain.com
```

## 📋 Cách upload files lên VPS

### Option 1: Sử dụng SCP (từ PowerShell)

```powershell
# Nén files trước
Compress-Archive -Path ".next\standalone\*" -DestinationPath "standalone.zip"
Compress-Archive -Path ".next\static" -DestinationPath "static.zip"
Compress-Archive -Path "public" -DestinationPath "public.zip"

# Upload
scp standalone.zip user@your-vps-ip:/var/www/timelitecloting/
scp static.zip user@your-vps-ip:/var/www/timelitecloting/
scp public.zip user@your-vps-ip:/var/www/timelitecloting/
scp package.json user@your-vps-ip:/var/www/timelitecloting/

# Sau đó SSH vào VPS và unzip
ssh user@your-vps-ip
cd /var/www/timelitecloting
unzip standalone.zip
mkdir -p .next
unzip static.zip -d .next/
unzip public.zip
```

### Option 2: Sử dụng FileZilla hoặc WinSCP

1. Download WinSCP: https://winscp.net/
2. Kết nối đến VPS
3. Upload các thư mục theo cấu trúc:
   - `.next/standalone/*` → `/var/www/timelitecloting/`
   - `.next/static/` → `/var/www/timelitecloting/.next/static/`
   - `public/` → `/var/www/timelitecloting/public/`

### Option 3: Sử dụng Git (Khuyến nghị)

```bash
# Trên VPS
git clone your-repository-url /var/www/timelitecloting
cd /var/www/timelitecloting
npm install
npm run build
node server.js
```

## 🔧 Cấu hình Environment Variables

Tạo file `.env.local` trên VPS:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://your-api-url
NEXT_PUBLIC_SOCKET_URL=http://your-socket-url
PORT=3000
NODE_ENV=production
```

## 📊 Monitoring và Logs

```bash
# Xem logs
pm2 logs timelitecloting

# Xem trạng thái
pm2 status

# Restart ứng dụng
pm2 restart timelitecloting

# Stop ứng dụng
pm2 stop timelitecloting
```

## ⚡ Performance Tips

1. **Compression**: Nginx sẽ tự động compress response
2. **Caching**: Static files sẽ được cache 1 năm
3. **CDN**: Xem xét sử dụng Cloudflare để cache và CDN
4. **Database**: Đảm bảo backend API đã được optimize

## 🔍 Troubleshooting

### Lỗi "Cannot find module"
```bash
cd /var/www/timelitecloting
npm install
```

### Port 3000 đã được sử dụng
```bash
# Đổi port trong file .env.local
PORT=3001
```

### Website không load được images
- Kiểm tra thư mục `public` đã được upload chưa
- Kiểm tra quyền: `sudo chown -R www-data:www-data /var/www/timelitecloting`

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Logs của PM2: `pm2 logs`
2. Logs của Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Trạng thái services: `sudo systemctl status nginx`

---

**Chúc bạn deploy thành công! 🎉**




