#!/bin/bash
# Script để cập nhật CORS trên VPS - Chạy script này trên VPS

# Màu sắc cho output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Cập nhật CORS Configuration ===${NC}\n"

# 1. Tìm thư mục ecommerce-backend
echo -e "${YELLOW}[1/7] Tìm thư mục ecommerce-backend...${NC}"
if [ -d "/var/www/ecommerce-backend" ]; then
    BACKEND_DIR="/var/www/ecommerce-backend"
elif [ -d "/home/$(whoami)/ecommerce-backend" ]; then
    BACKEND_DIR="/home/$(whoami)/ecommerce-backend"
elif [ -d "/opt/ecommerce-backend" ]; then
    BACKEND_DIR="/opt/ecommerce-backend"
else
    echo -e "${RED}Không tìm thấy thư mục ecommerce-backend!${NC}"
    echo "Vui lòng nhập đường dẫn thủ công:"
    read -p "Đường dẫn: " BACKEND_DIR
fi

echo -e "${GREEN}✓ Tìm thấy: $BACKEND_DIR${NC}\n"
cd "$BACKEND_DIR" || exit 1

# 2. Backup file cũ
echo -e "${YELLOW}[2/7] Backup file nginx.conf cũ...${NC}"
BACKUP_FILE="gateway/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)"
cp gateway/nginx.conf "$BACKUP_FILE"
echo -e "${GREEN}✓ Đã backup tại: $BACKUP_FILE${NC}\n"

# 3. Thay thế $cors_origin thành "*" 
echo -e "${YELLOW}[3/7] Cập nhật CORS headers...${NC}"
cd gateway

# Xóa các dòng check localhost
sed -i '/if (\$http_origin ~\* "^http:\/\/localhost/,+2d' nginx.conf

# Thay tất cả $cors_origin thành "*"
sed -i 's/\$cors_origin/"\*"/g' nginx.conf

# Xóa dòng Access-Control-Allow-Credentials khi dùng wildcard *
sed -i '/Access-Control-Allow-Credentials/d' nginx.conf

echo -e "${GREEN}✓ Đã cập nhật CORS configuration${NC}\n"

# 4. Kiểm tra syntax
echo -e "${YELLOW}[4/7] Kiểm tra cấu hình Nginx...${NC}"
cd ..
if docker-compose exec gateway nginx -t 2>&1 | grep -q "syntax is ok"; then
    echo -e "${GREEN}✓ Cấu hình Nginx hợp lệ${NC}\n"
else
    echo -e "${RED}✗ Lỗi cấu hình Nginx!${NC}"
    echo "Khôi phục file backup..."
    cp "$BACKUP_FILE" gateway/nginx.conf
    exit 1
fi

# 5. Restart gateway
echo -e "${YELLOW}[5/7] Restart gateway container...${NC}"
docker-compose restart gateway
sleep 3
echo -e "${GREEN}✓ Gateway đã được restart${NC}\n"

# 6. Kiểm tra logs
echo -e "${YELLOW}[6/7] Kiểm tra logs...${NC}"
docker-compose logs gateway --tail=20
echo ""

# 7. Test CORS
echo -e "${YELLOW}[7/7] Test CORS policy...${NC}"
echo "Testing với domain timeliteclothing.com..."

CORS_TEST=$(curl -s -I -X OPTIONS \
  -H "Origin: https://timeliteclothing.com" \
  -H "Access-Control-Request-Method: GET" \
  https://api.timeliteclothing.com/api/php/products 2>&1)

if echo "$CORS_TEST" | grep -q "Access-Control-Allow-Origin: \*"; then
    echo -e "${GREEN}✓ CORS đã được cấu hình đúng!${NC}"
    echo -e "${GREEN}✓ Header: Access-Control-Allow-Origin: *${NC}\n"
else
    echo -e "${RED}✗ Vẫn chưa thấy CORS header!${NC}"
    echo "Response headers:"
    echo "$CORS_TEST"
    echo ""
fi

echo -e "${GREEN}=== Hoàn tất! ===${NC}"
echo -e "Backup file: ${YELLOW}$BACKEND_DIR/$BACKUP_FILE${NC}"
echo -e "\nTest website tại: ${YELLOW}https://timeliteclothing.com/shop${NC}"
