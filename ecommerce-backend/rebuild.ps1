# PowerShell script để rebuild Docker và pull code từ GitHub
# Sử dụng: .\rebuild.ps1

Write-Host "🛑 Bước 1: Dừng Docker cũ..." -ForegroundColor Yellow
docker-compose down

Write-Host "`n📥 Bước 2: Pull code từ GitHub..." -ForegroundColor Yellow
cd ..
git pull origin main
cd ecommerce-backend

Write-Host "`n🔨 Bước 3: Build Docker mới (có thể mất 5-10 phút)..." -ForegroundColor Yellow
docker-compose build --no-cache

Write-Host "`n🚀 Bước 4: Khởi động Docker..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "`n⏳ Đợi 10 giây để services khởi động..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`n📊 Kiểm tra trạng thái containers:" -ForegroundColor Green
docker-compose ps

Write-Host "`n📝 Xem logs (50 dòng cuối):" -ForegroundColor Green
docker-compose logs --tail=50

Write-Host "`n✅ Hoàn thành! Kiểm tra các services:" -ForegroundColor Green
Write-Host "  - MySQL: docker exec ecommerce_mysql mysqladmin ping -h localhost -uroot -prootpassword" -ForegroundColor Cyan
Write-Host "  - Admin Backend: http://localhost:3001/admin/health" -ForegroundColor Cyan
Write-Host "  - Gateway: http://localhost:3002/health" -ForegroundColor Cyan
Write-Host "  - phpMyAdmin: http://localhost:3003" -ForegroundColor Cyan




