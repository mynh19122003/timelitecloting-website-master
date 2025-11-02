# ==============================================
# E-Commerce Order API Test Script
# ==============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  E-COMMERCE ORDER API TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3001/api"
$testEmail = "testorder@gmail.com"
$testPassword = "password123"

# Test counters
$passed = 0
$failed = 0

function Test-API {
    param($name, $scriptBlock)
    Write-Host "`n--- $name ---" -ForegroundColor Yellow
    try {
        & $scriptBlock
        $script:passed++
        Write-Host "✅ PASSED" -ForegroundColor Green
        return $true
    } catch {
        $script:failed++
        Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Gray
        }
        return $false
    }
}

# ==============================================
# 1. LOGIN
# ==============================================
Write-Host "`n[1/5] Testing User Login..." -ForegroundColor Cyan
$token = $null

Test-API "User Login" {
    $response = Invoke-RestMethod -Uri "$baseUrl/users/login" -Method POST -ContentType "application/json" -Body (@{
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json)
    
    if (-not $response.data.token) {
        throw "No token received"
    }
    
    $script:token = $response.data.token
    Write-Host "   Token: $($token.Substring(0,30))..." -ForegroundColor Gray
}

if (-not $token) {
    Write-Host "`n❌ Cannot proceed without authentication token" -ForegroundColor Red
    exit 1
}

# ==============================================
# 2. CREATE ORDER
# ==============================================
Write-Host "`n[2/5] Testing Order Creation..." -ForegroundColor Cyan
$orderId = $null
$orderNumber = $null

Test-API "Create Single Item Order" {
    $response = Invoke-RestMethod -Uri "$baseUrl/orders" -Method POST -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $token" } `
        -Body (@{
            items = @(
                @{
                    product_id = 1
                    quantity = 2
                }
            )
            product_names = "Premium T-Shirt x2"
            total_amount = 49.98
            notes = "Please pack carefully"
        } | ConvertTo-Json)
    
    if (-not $response.data.order_number) {
        throw "No order number received"
    }
    
    $script:orderId = $response.data.id
    $script:orderNumber = $response.data.order_number
    Write-Host "   Order Number: $orderNumber" -ForegroundColor White
    Write-Host "   Order ID: $orderId" -ForegroundColor Gray
    Write-Host "   Total: `$$($response.data.total_amount)" -ForegroundColor White
    Write-Host "   Status: $($response.data.status)" -ForegroundColor White
}

Test-API "Create Multi-Item Order" {
    $response = Invoke-RestMethod -Uri "$baseUrl/orders" -Method POST -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $token" } `
        -Body (@{
            items = @(
                @{ product_id = 1; quantity = 1 }
                @{ product_id = 2; quantity = 3 }
            )
            product_names = "Premium T-Shirt x1, Classic Jeans x3"
            total_amount = 289.96
        } | ConvertTo-Json)
    
    Write-Host "   Order Number: $($response.data.order_number)" -ForegroundColor White
    Write-Host "   Total: `$$($response.data.total_amount)" -ForegroundColor White
}

# ==============================================
# 3. GET ORDER HISTORY
# ==============================================
Write-Host "`n[3/5] Testing Order History..." -ForegroundColor Cyan

Test-API "Get Order History (Default Pagination)" {
    $response = Invoke-RestMethod -Uri "$baseUrl/orders/history" -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" }
    
    if (-not $response.data.orders) {
        throw "No orders array in response"
    }
    
    Write-Host "   Total Orders: $($response.data.orders.Count)" -ForegroundColor White
    Write-Host "   Page: $($response.data.pagination.page)/$($response.data.pagination.totalPages)" -ForegroundColor Gray
    Write-Host "   Total Records: $($response.data.pagination.total)" -ForegroundColor Gray
    
    if ($response.data.orders.Count -gt 0) {
        Write-Host "`n   Recent Orders:" -ForegroundColor Gray
        $response.data.orders | Select-Object -First 3 | ForEach-Object {
            Write-Host "   • $($_.order_number) - $($_.status) - `$$($_.total_amount)" -ForegroundColor White
        }
    }
}

Test-API "Get Order History (Custom Pagination)" {
    $response = Invoke-RestMethod -Uri "$baseUrl/orders/history?page=1&limit=5" -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" }
    
    if ($response.data.orders.Count -gt 5) {
        throw "Returned more items than limit"
    }
    
    Write-Host "   Returned: $($response.data.orders.Count) orders" -ForegroundColor White
}

# ==============================================
# 4. GET ORDER BY ID
# ==============================================
Write-Host "`n[4/5] Testing Order Details..." -ForegroundColor Cyan

if ($orderId) {
    Test-API "Get Order by ID" {
        $response = Invoke-RestMethod -Uri "$baseUrl/orders/$orderId" -Method GET `
            -Headers @{ "Authorization" = "Bearer $token" }
        
        if ($response.data.id -ne $orderId) {
            throw "Order ID mismatch"
        }
        
        Write-Host "   Order Number: $($response.data.order_number)" -ForegroundColor White
        Write-Host "   Product Names: $($response.data.product_names)" -ForegroundColor White
        Write-Host "   Total Amount: `$$($response.data.total_amount)" -ForegroundColor White
        Write-Host "   Status: $($response.data.status)" -ForegroundColor White
        Write-Host "   Notes: $($response.data.notes)" -ForegroundColor Gray
        Write-Host "   Created: $($response.data.created_at)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ⚠️  Skipping - No order ID available" -ForegroundColor Yellow
    $script:failed++
}

# ==============================================
# 5. ERROR HANDLING
# ==============================================
Write-Host "`n[5/5] Testing Error Handling..." -ForegroundColor Cyan

Test-API "Missing Required Fields" {
    try {
        Invoke-RestMethod -Uri "$baseUrl/orders" -Method POST -ContentType "application/json" `
            -Headers @{ "Authorization" = "Bearer $token" } `
            -Body '{"items":[]}'
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "   Correctly rejected empty items" -ForegroundColor Gray
            return
        }
        throw
    }
    throw "Should have rejected empty items"
}

Test-API "Invalid Order ID" {
    try {
        Invoke-RestMethod -Uri "$baseUrl/orders/999999" -Method GET `
            -Headers @{ "Authorization" = "Bearer $token" }
    } catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "   Correctly returned 404" -ForegroundColor Gray
            return
        }
        throw
    }
    throw "Should have returned 404"
}

Test-API "Missing Authentication" {
    try {
        Invoke-RestMethod -Uri "$baseUrl/orders/history" -Method GET
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "   Correctly rejected unauthenticated request" -ForegroundColor Gray
            return
        }
        throw
    }
    throw "Should have rejected unauthenticated request"
}

# ==============================================
# SUMMARY
# ==============================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
Write-Host "Total Tests: $($passed + $failed)" -ForegroundColor White

if ($failed -eq 0) {
    Write-Host "`n🎉 ALL TESTS PASSED!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️  SOME TESTS FAILED" -ForegroundColor Yellow
    exit 1
}

