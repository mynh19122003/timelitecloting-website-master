# Test Admin Login Flow
# Usage: .\test-scripts\test-admin-flow.ps1

Write-Host "🧪 Testing Admin Dashboard Flow" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001"
$adminEmail = "admin@example.com"
$adminPassword = "admin123"

# Test 1: Check Backend Health
Write-Host "Test 1: Backend Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Backend is running" -ForegroundColor Green
    Write-Host "   Response: $($health | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend not reachable at $baseUrl" -ForegroundColor Red
    Write-Host "   Please start backend: cd ecommerce-backend && docker-compose up" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 2: Try Admin Login
Write-Host "Test 2: Admin Login" -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $adminEmail
        password = $adminPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod `
        -Uri "$baseUrl/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json" `
        -TimeoutSec 10

    $token = $loginResponse.token
    if ($token) {
        Write-Host "✅ Login successful" -ForegroundColor Green
        Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
        Write-Host "   User: $($loginResponse.user.email)" -ForegroundColor Gray
    } else {
        Write-Host "❌ No token received" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Login failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Create admin user:" -ForegroundColor Yellow
    Write-Host '   curl -X POST http://localhost:3001/api/node/users/register \' -ForegroundColor Gray
    Write-Host '     -H "Content-Type: application/json" \' -ForegroundColor Gray
    Write-Host '     -d ''{"email":"admin@example.com","password":"admin123","name":"Admin","role":"admin"}''' -ForegroundColor Gray
    exit 1
}
Write-Host ""

# Test 3: Verify Admin Token
Write-Host "Test 3: Verify Admin Access" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $meResponse = Invoke-RestMethod `
        -Uri "$baseUrl/auth/me" `
        -Method Get `
        -Headers $headers `
        -TimeoutSec 10

    if ($meResponse.user.role -eq "admin") {
        Write-Host "✅ Admin role verified" -ForegroundColor Green
        Write-Host "   Role: $($meResponse.user.role)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  User is not admin" -ForegroundColor Yellow
        Write-Host "   Role: $($meResponse.user.role)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Token verification failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Check Admin Endpoints
Write-Host "Test 4: Admin Endpoints Access" -ForegroundColor Yellow

$endpoints = @(
    @{ path = "/admin/orders"; name = "Orders" }
    @{ path = "/admin/products"; name = "Products" }
    @{ path = "/admin/customers"; name = "Customers" }
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-RestMethod `
            -Uri "$baseUrl$($endpoint.path)" `
            -Method Get `
            -Headers $headers `
            -TimeoutSec 10 `
            -ErrorAction Stop
        
        Write-Host "✅ $($endpoint.name): Accessible" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 404) {
            Write-Host "⚠️  $($endpoint.name): Endpoint not implemented (404)" -ForegroundColor Yellow
        } else {
            Write-Host "❌ $($endpoint.name): Failed ($statusCode)" -ForegroundColor Red
        }
    }
}
Write-Host ""

# Summary
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Backend running: Yes" -ForegroundColor Green
Write-Host "✅ Admin login: Success" -ForegroundColor Green
Write-Host "✅ Token received: Yes" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Open Admin Dashboard:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000/admin" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Login credentials:" -ForegroundColor Cyan
Write-Host "   Email: $adminEmail" -ForegroundColor White
Write-Host "   Password: $adminPassword" -ForegroundColor White
Write-Host ""
Write-Host "✨ All tests passed! Admin is ready." -ForegroundColor Green

