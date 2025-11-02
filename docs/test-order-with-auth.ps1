# Test Order Creation with Authentication
# Tests the complete flow: Login -> Load Profile -> Create Order

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "   Test Order Flow with Authentication" -ForegroundColor Green
Write-Host "================================================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost"

# Step 1: Login to get token
Write-Host "Step 1: Login..." -ForegroundColor Yellow
$loginData = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/php/users/login" `
        -Method POST `
        -Body $loginData `
        -ContentType "application/json"
    
    $token = $loginResponse.data.token
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0, 20))...`n" -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    Write-Host "`nTry creating a user first:" -ForegroundColor Yellow
    Write-Host "  POST $baseUrl/api/php/users/register" -ForegroundColor Gray
    Write-Host "  Body: { `"email`": `"test@example.com`", `"password`": `"password123`", `"name`": `"Test User`" }`n" -ForegroundColor Gray
    exit 1
}

# Step 2: Get Profile
Write-Host "Step 2: Get Profile..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/api/php/users/profile" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✓ Profile loaded!" -ForegroundColor Green
    Write-Host "  Name: $($profileResponse.data.name)" -ForegroundColor Gray
    Write-Host "  Email: $($profileResponse.data.email)" -ForegroundColor Gray
    Write-Host "  Phone: $($profileResponse.data.phone)" -ForegroundColor Gray
    Write-Host "  Address: $($profileResponse.data.address)`n" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to load profile: $_`n" -ForegroundColor Red
}

# Step 3: Create Order with Customer Info
Write-Host "Step 3: Create Order..." -ForegroundColor Yellow

$orderData = @{
    items = @(
        @{
            product_id = 1
            quantity = 2
            price = 1890
        }
    )
    customer_info = @{
        first_name = "John"
        last_name = "Doe"
        email = "john@example.com"
        phone = "1234567890"
        company = "Test Company"
    }
    shipping_address = @{
        street = "123 Main St"
        city = "New York"
        state = "NY"
        zip_code = "10001"
        country = "US"
    }
    notes = "Please handle with care"
    total_amount = 3780
} | ConvertTo-Json -Depth 10

try {
    # Try Node.js backend first
    try {
        $orderResponse = Invoke-RestMethod -Uri "$baseUrl/api/node/orders" `
            -Method POST `
            -Headers $headers `
            -Body $orderData
        
        Write-Host "✓ Order created successfully (Node.js)!" -ForegroundColor Green
    } catch {
        # Fallback to PHP
        Write-Host "  Node.js failed, trying PHP..." -ForegroundColor Yellow
        $orderResponse = Invoke-RestMethod -Uri "$baseUrl/api/php/orders" `
            -Method POST `
            -Headers $headers `
            -Body $orderData
        
        Write-Host "✓ Order created successfully (PHP)!" -ForegroundColor Green
    }
    
    Write-Host "`nOrder Details:" -ForegroundColor Cyan
    Write-Host "  Order ID: $($orderResponse.data.id)" -ForegroundColor White
    Write-Host "  Total: `$$($orderResponse.data.total_amount)" -ForegroundColor White
    Write-Host "  Status: $($orderResponse.data.status)" -ForegroundColor White
    Write-Host "  Items: $($orderResponse.data.items.Count)" -ForegroundColor White
    
} catch {
    Write-Host "✗ Order creation failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    Write-Host "`nPossible issues:" -ForegroundColor Yellow
    Write-Host "  1. Database migration not applied (run: .\ecommerce-backend\apply-order-migration.ps1)" -ForegroundColor Gray
    Write-Host "  2. Product ID 1 doesn't exist in database" -ForegroundColor Gray
    Write-Host "  3. Backend server not running`n" -ForegroundColor Gray
    exit 1
}

# Step 4: Get Order History
Write-Host "`nStep 4: Get Order History..." -ForegroundColor Yellow
try {
    try {
        $historyResponse = Invoke-RestMethod -Uri "$baseUrl/api/node/orders/history" `
            -Method GET `
            -Headers $headers
        Write-Host "✓ Order history retrieved (Node.js)!" -ForegroundColor Green
    } catch {
        $historyResponse = Invoke-RestMethod -Uri "$baseUrl/api/php/orders/history" `
            -Method GET `
            -Headers $headers
        Write-Host "✓ Order history retrieved (PHP)!" -ForegroundColor Green
    }
    
    Write-Host "  Total orders: $($historyResponse.data.orders.Count)`n" -ForegroundColor White
    
} catch {
    Write-Host "✗ Failed to get order history: $_`n" -ForegroundColor Red
}

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "✓ All tests completed!" -ForegroundColor Green
Write-Host "================================================================`n" -ForegroundColor Cyan



