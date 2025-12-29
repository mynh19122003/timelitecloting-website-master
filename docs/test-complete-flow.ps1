# Complete test for Profile API
Write-Host "=== COMPLETE PROFILE API TEST ===" -ForegroundColor Green

# Step 1: Login
Write-Host "`n[1/4] Login..." -ForegroundColor Yellow
$loginResponse = curl.exe -X POST "http://localhost:3002/api/php/users/login" `
    -H "Content-Type: application/json" `
    --data-binary "@login-data.json" `
    --silent

$loginData = $loginResponse | ConvertFrom-Json
if ($loginData.success) {
    Write-Host "OK Login successful" -ForegroundColor Green
    $token = $loginData.data.token
} else {
    Write-Host "FAIL Login failed: $($loginData.message)" -ForegroundColor Red
    exit 1
}

# Step 2: Get initial profile
Write-Host "`n[2/4] Get initial profile..." -ForegroundColor Yellow
$profileResponse = curl.exe -X GET "http://localhost:3002/api/php/users/profile" `
    -H "Authorization: Bearer $token" `
    -H "Content-Type: application/json" `
    --silent

$profileData = $profileResponse | ConvertFrom-Json
if ($profileData.success) {
    Write-Host "OK Profile retrieved" -ForegroundColor Green
    Write-Host "  Email: $($profileData.data.email)" -ForegroundColor Cyan
    Write-Host "  Name: $($profileData.data.name)" -ForegroundColor Cyan
    Write-Host "  Phone: $($profileData.data.phone)" -ForegroundColor Cyan
    Write-Host "  Address: $($profileData.data.address)" -ForegroundColor Cyan
} else {
    Write-Host "FAIL Get profile failed: $($profileData.message)" -ForegroundColor Red
    exit 1
}

# Step 3: Update profile
Write-Host "`n[3/4] Update profile..." -ForegroundColor Yellow
$updateResponse = curl.exe -X PUT "http://localhost:3002/api/php/users/profile" `
    -H "Authorization: Bearer $token" `
    -H "Content-Type: application/json" `
    --data-binary "@update-profile.json" `
    --silent

$updateData = $updateResponse | ConvertFrom-Json
if ($updateData.success) {
    Write-Host "OK Profile updated successfully" -ForegroundColor Green
    Write-Host "  New Name: $($updateData.data.name)" -ForegroundColor Cyan
    Write-Host "  New Phone: $($updateData.data.phone)" -ForegroundColor Cyan
    Write-Host "  New Address: $($updateData.data.address)" -ForegroundColor Cyan
} else {
    Write-Host "FAIL Update failed: $($updateData.message)" -ForegroundColor Red
    exit 1
}

# Step 4: Verify updated profile
Write-Host "`n[4/4] Verify updated profile..." -ForegroundColor Yellow
$verifyResponse = curl.exe -X GET "http://localhost:3002/api/php/users/profile" `
    -H "Authorization: Bearer $token" `
    -H "Content-Type: application/json" `
    --silent

$verifyData = $verifyResponse | ConvertFrom-Json
if ($verifyData.success) {
    Write-Host "OK Verification successful" -ForegroundColor Green
    
    # Check if data was actually saved
    $nameMatch = $verifyData.data.name -eq $updateData.data.name
    $phoneMatch = $verifyData.data.phone -eq $updateData.data.phone
    $addressMatch = $verifyData.data.address -eq $updateData.data.address
    
    if ($nameMatch -and $phoneMatch -and $addressMatch) {
        Write-Host "OK Data persistence verified!" -ForegroundColor Green
    } else {
        Write-Host "FAIL Data mismatch!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "FAIL Verification failed: $($verifyData.message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== ALL TESTS PASSED ===" -ForegroundColor Green
Write-Host "Backend PHP Profile API is working correctly!" -ForegroundColor Green

