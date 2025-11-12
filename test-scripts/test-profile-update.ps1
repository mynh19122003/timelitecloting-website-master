# Test script để test Profile API với logging
Write-Host "=== TEST PROFILE API ===" -ForegroundColor Green

# Bước 1: Login để lấy token
Write-Host "`n1. Logging in..." -ForegroundColor Yellow
$loginBody = '{"email":"testprofile@example.com","password":"password123"}'

$loginResponse = curl.exe -X POST "http://localhost:3002/api/php/users/login" `
    -H "Content-Type: application/json" `
    -d $loginBody `
    --silent

Write-Host "Login Response:" -ForegroundColor Cyan
Write-Host $loginResponse

# Parse token từ response
$loginData = $loginResponse | ConvertFrom-Json
$token = $loginData.data.token

if ($token) {
    Write-Host "`nToken: $($token.Substring(0, 20))..." -ForegroundColor Green
    
    # Bước 2: Get Profile
    Write-Host "`n2. Getting profile..." -ForegroundColor Yellow
    $profileResponse = curl.exe -X GET "http://localhost:3002/api/php/users/profile" `
        -H "Authorization: Bearer $token" `
        -H "Content-Type: application/json" `
        --silent
    
    Write-Host "Profile Response:" -ForegroundColor Cyan
    Write-Host $profileResponse
    
    # Bước 3: Update Profile
    Write-Host "`n3. Updating profile..." -ForegroundColor Yellow
    $updateBody = '{"name":"Test User Updated","phone":"+1234567890","address":"123 Test Street, Test City"}'
    
    $updateResponse = curl.exe -X PUT "http://localhost:3002/api/php/users/profile" `
        -H "Authorization: Bearer $token" `
        -H "Content-Type: application/json" `
        -d $updateBody `
        --silent
    
    Write-Host "Update Response:" -ForegroundColor Cyan
    Write-Host $updateResponse
    
    # Bước 4: Get Profile lại để verify
    Write-Host "`n4. Getting updated profile..." -ForegroundColor Yellow
    $updatedProfileResponse = curl.exe -X GET "http://localhost:3002/api/php/users/profile" `
        -H "Authorization: Bearer $token" `
        -H "Content-Type: application/json" `
        --silent
    
    Write-Host "Updated Profile Response:" -ForegroundColor Cyan
    Write-Host $updatedProfileResponse
    
    Write-Host "`n=== CHECK PHP LOGS ===" -ForegroundColor Green
    Write-Host "Run: docker logs ecommerce-backend-php --tail 50" -ForegroundColor Yellow
} else {
    Write-Host "Failed to get token from login response" -ForegroundColor Red
}


