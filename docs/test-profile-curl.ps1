# Test Profile API using curl with JSON files
Write-Host "=== TEST PROFILE API ===" -ForegroundColor Green

# Step 1: Login
Write-Host "`n1. Logging in..." -ForegroundColor Yellow
$loginResponse = curl.exe -X POST "http://localhost:3002/api/php/users/login" `
    -H "Content-Type: application/json" `
    --data-binary "@login-data.json" `
    --silent

Write-Host "Login Response:" -ForegroundColor Cyan
Write-Host $loginResponse

# Parse token
try {
    $loginData = $loginResponse | ConvertFrom-Json
    $token = $loginData.data.token
    
    if ($token) {
        Write-Host "`nToken received: $($token.Substring(0, 30))..." -ForegroundColor Green
        
        # Step 2: Get Profile
        Write-Host "`n2. Getting profile..." -ForegroundColor Yellow
        $profileResponse = curl.exe -X GET "http://localhost:3002/api/php/users/profile" `
            -H "Authorization: Bearer $token" `
            -H "Content-Type: application/json" `
            --silent
        
        Write-Host "Profile Response:" -ForegroundColor Cyan
        Write-Host $profileResponse
        
        # Step 3: Update Profile
        Write-Host "`n3. Updating profile..." -ForegroundColor Yellow
        
        # Create update JSON file
        @{
            name = "John Doe Updated"
            phone = "+84987654321"
            address = "123 Main Street, Hanoi, Vietnam"
        } | ConvertTo-Json | Out-File -FilePath "update-data.json" -Encoding UTF8 -NoNewline
        
        $updateResponse = curl.exe -X PUT "http://localhost:3002/api/php/users/profile" `
            -H "Authorization: Bearer $token" `
            -H "Content-Type: application/json" `
            --data-binary "@update-data.json" `
            --silent
        
        Write-Host "Update Response:" -ForegroundColor Cyan
        Write-Host $updateResponse
        
        # Step 4: Get updated profile
        Write-Host "`n4. Getting updated profile..." -ForegroundColor Yellow
        $updatedProfileResponse = curl.exe -X GET "http://localhost:3002/api/php/users/profile" `
            -H "Authorization: Bearer $token" `
            -H "Content-Type: application/json" `
            --silent
        
        Write-Host "Updated Profile Response:" -ForegroundColor Cyan
        Write-Host $updatedProfileResponse
        
        Write-Host "`n=== TEST COMPLETED ===" -ForegroundColor Green
        
    } else {
        Write-Host "Failed to extract token from response" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

