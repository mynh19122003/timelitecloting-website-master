# Test Order Creation API
# PowerShell script to test the order creation endpoint

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ORDER CREATION API TEST" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Test data
$orderData = @{
    items = @(
        @{
            product_id = 1
            quantity = 2
            price = 395
        },
        @{
            product_id = 2
            quantity = 1
            price = 445
        }
    )
    customer_info = @{
        first_name = "John"
        last_name = "Doe"
        email = "john.doe@example.com"
        phone = "(555) 123-4567"
        company = "Test Company"
    }
    shipping_address = @{
        street = "123 Main Street"
        city = "New York"
        state = "NY"
        zip_code = "10001"
        country = "US"
    }
    notes = "Please schedule fitting for next week. Prefer afternoon slots."
    total_amount = 1235
} | ConvertTo-Json -Depth 10

Write-Host "Test Data:" -ForegroundColor Yellow
Write-Host $orderData -ForegroundColor Gray
Write-Host ""

# Test Node.js endpoint
Write-Host "Testing Node.js endpoint..." -ForegroundColor Cyan
Write-Host "POST http://localhost/api/node/orders`n" -ForegroundColor White

try {
    $response = Invoke-RestMethod -Uri "http://localhost/api/node/orders" `
        -Method POST `
        -ContentType "application/json" `
        -Body $orderData `
        -ErrorAction Stop
    
    Write-Host "✓ SUCCESS - Node.js Endpoint" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "✗ FAILED - Node.js Endpoint" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host ""
    
    # Try PHP fallback
    Write-Host "Trying PHP fallback endpoint..." -ForegroundColor Cyan
    Write-Host "POST http://localhost/api/php/orders.php`n" -ForegroundColor White
    
    try {
        $responsePHP = Invoke-RestMethod -Uri "http://localhost/api/php/orders.php" `
            -Method POST `
            -ContentType "application/json" `
            -Body $orderData `
            -ErrorAction Stop
        
        Write-Host "✓ SUCCESS - PHP Fallback Endpoint" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Yellow
        $responsePHP | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Gray
        Write-Host ""
        
    } catch {
        Write-Host "✗ FAILED - PHP Fallback Endpoint" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST COMPLETE" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. If Node.js endpoint works: ✓ Backend is ready" -ForegroundColor White
Write-Host "2. If only PHP works: Implement Node.js endpoint" -ForegroundColor White
Write-Host "3. If both fail: Check backend server is running" -ForegroundColor White
Write-Host ""
Write-Host "To test in browser:" -ForegroundColor Yellow
Write-Host "1. Go to http://localhost:3000/shop" -ForegroundColor White
Write-Host "2. Add products to cart" -ForegroundColor White
Write-Host "3. Checkout and fill the form" -ForegroundColor White
Write-Host "4. Submit order" -ForegroundColor White
Write-Host ""



