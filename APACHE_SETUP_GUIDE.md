# Hướng dẫn Setup Apache cho api.timeliteclothing.com

## 🔍 Debug - Kiểm tra tại sao không redirect được

### Bước 1: Kiểm tra Apache modules đã enable chưa

```bash
# Kiểm tra modules
apache2ctl -M | grep -E "proxy|rewrite"

# Nếu thiếu, enable:
sudo a2enmod proxy proxy_http rewrite headers
sudo systemctl restart apache2
```

### Bước 2: Kiểm tra file .htaccess có được đọc không

```bash
# Kiểm tra file có tồn tại và đúng tên
ls -la /var/www/api.timeliteclothing.com/.htaccess
# Phải thấy file .htaccess (có dấu chấm ở đầu)

# Kiểm tra quyền
sudo chmod 644 /var/www/api.timeliteclothing.com/.htaccess
sudo chown www-data:www-data /var/www/api.timeliteclothing.com/.htaccess
```

### Bước 3: Kiểm tra VirtualHost có cho phép .htaccess

Tìm file VirtualHost config (thường ở `/etc/apache2/sites-available/api.timeliteclothing.com.conf`):

```bash
sudo nano /etc/apache2/sites-available/api.timeliteclothing.com.conf
```

Đảm bảo có:
```apache
<Directory /var/www/api.timeliteclothing.com>
    AllowOverride All
    Require all granted
</Directory>
```

### Bước 4: Kiểm tra Apache error logs

```bash
# Xem lỗi real-time
sudo tail -f /var/log/apache2/error.log

# Hoặc xem lỗi gần đây
sudo tail -n 50 /var/log/apache2/error.log
```

### Bước 5: Test proxy trực tiếp

```bash
# Test xem port 3001 có accessible không
curl http://127.0.0.1:3001/api/php/products

# Test qua Apache
curl -v http://api.timeliteclothing.com/api/php/products
```

## 📝 Cấu hình VirtualHost mẫu (Nếu .htaccess không hoạt động)

Nếu `.htaccess` không hoạt động, cấu hình trực tiếp trong VirtualHost:

```apache
<VirtualHost *:80>
    ServerName api.timeliteclothing.com
    ServerAlias www.api.timeliteclothing.com
    
    DocumentRoot /var/www/api.timeliteclothing.com
    
    <Directory /var/www/api.timeliteclothing.com>
        AllowOverride All
        Require all granted
        Options -Indexes +FollowSymLinks
    </Directory>
    
    # Enable proxy
    ProxyPreserveHost On
    ProxyRequests Off
    
    # PHP Backend API
    ProxyPass /api/php http://127.0.0.1:3001/api/php
    ProxyPassReverse /api/php http://127.0.0.1:3001/api/php
    
    # Node.js Backend API
    ProxyPass /api/node http://127.0.0.1:3001/api/node
    ProxyPassReverse /api/node http://127.0.0.1:3001/api/node
    
    # CORS Headers (optional, nếu backend chưa có)
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Authorization, Content-Type"
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/api.timeliteclothing.com_error.log
    CustomLog ${APACHE_LOG_DIR}/api.timeliteclothing.com_access.log combined
</VirtualHost>

<VirtualHost *:443>
    ServerName api.timeliteclothing.com
    ServerAlias www.api.timeliteclothing.com
    
    DocumentRoot /var/www/api.timeliteclothing.com
    
    # SSL Configuration (sau khi setup SSL)
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/api.timeliteclothing.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/api.timeliteclothing.com/privkey.pem
    
    <Directory /var/www/api.timeliteclothing.com>
        AllowOverride All
        Require all granted
        Options -Indexes +FollowSymLinks
    </Directory>
    
    # Enable proxy
    ProxyPreserveHost On
    ProxyRequests Off
    
    # PHP Backend API
    ProxyPass /api/php http://127.0.0.1:3001/api/php
    ProxyPassReverse /api/php http://127.0.0.1:3001/api/php
    
    # Node.js Backend API
    ProxyPass /api/node http://127.0.0.1:3001/api/node
    ProxyPassReverse /api/node http://127.0.0.1:3001/api/node
    
    # CORS Headers
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Authorization, Content-Type"
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/api.timeliteclothing.com_ssl_error.log
    CustomLog ${APACHE_LOG_DIR}/api.timeliteclothing.com_ssl_access.log combined
</VirtualHost>
```

## 🚀 Cách apply VirtualHost config

```bash
# 1. Tạo file config
sudo nano /etc/apache2/sites-available/api.timeliteclothing.com.conf
# (Paste config trên vào)

# 2. Enable site
sudo a2ensite api.timeliteclothing.com.conf

# 3. Test config
sudo apache2ctl configtest

# 4. Restart Apache
sudo systemctl restart apache2

# 5. Kiểm tra status
sudo systemctl status apache2
```

## ✅ Checklist

- [ ] Apache modules: `proxy`, `proxy_http`, `rewrite`, `headers` đã enable
- [ ] File `.htaccess` có tên đúng (có dấu chấm ở đầu)
- [ ] File `.htaccess` có quyền đọc (644)
- [ ] VirtualHost có `AllowOverride All`
- [ ] Service trên port 3001 đang chạy
- [ ] Apache error log không có lỗi
- [ ] Test curl trực tiếp đến port 3001 thành công

## 🔧 Nếu vẫn không được

1. **Thử cấu hình trong VirtualHost** thay vì `.htaccess` (xem mẫu trên)
2. **Kiểm tra firewall**: `sudo ufw status`
3. **Kiểm tra SELinux** (nếu có): `getenforce`
4. **Test với curl từ server**: `curl -v http://127.0.0.1:3001/api/php/products`

