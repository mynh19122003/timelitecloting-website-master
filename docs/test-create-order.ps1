# Test Create Order API with Mock Product Data
# Usage: .\test-create-order.ps1

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST CREATE ORDER API" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# API Configuration
$API_URL = "http://localhost:3001"
$AUTH_TOKEN = ""

# Step 1: Login to get token
Write-Host "[Step 1] Login to get auth token..." -ForegroundColor Yellow
try {
    $loginPayload = @{
        email = "testorder@gmail.com"
        password = "password123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$API_URL/api/users/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginPayload

    $AUTH_TOKEN = $loginResponse.data.token
    Write-Host "✅ Login successful! Token: $($AUTH_TOKEN.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n⚠️  Please make sure:" -ForegroundColor Yellow
    Write-Host "   - Backend is running: docker ps" -ForegroundColor Yellow
    Write-Host "   - User exists in database (email: testorder@gmail.com, password: password123)" -ForegroundColor Yellow
    exit 1
}

# Mock Product Data from UI (src/data/products.ts)
$mockProducts = @(
    @{
        id = "ao-dai-regal-crimson"
        product_id = 1
        name = "Regal Crimson Ao Dai"
        price = 1890
        category = "ao-dai"
    },
    @{
        id = "ao-dai-heritage-gold"
        product_id = 2
        name = "Heritage Gold Ao Dai"
        price = 1790
        category = "ao-dai"
    },
    @{
        id = "ao-dai-majestic-pearl"
        product_id = 3
        name = "Majestic Pearl Ao Dai"
        price = 2050
        category = "ao-dai"
    },
    @{
        id = "vest-executive-navy"
        product_id = 5
        name = "Executive Navy Vest"
        price = 920
        category = "vest"
    },
    @{
        id = "vest-sovereign-charcoal"
        product_id = 6
        name = "Sovereign Charcoal Vest"
        price = 890
        category = "vest"
    },
    @{
        id = "wedding-eternal-grace"
        product_id = 9
        name = "Eternal Grace Bridal Gown"
        price = 3280
        category = "wedding"
    },
    @{
        id = "evening-midnight-glamour"
        product_id = 13
        name = "Midnight Glamour Evening Dress"
        price = 1650
        category = "evening"
    }
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  MOCK PRODUCTS AVAILABLE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

for ($i = 0; $i -lt $mockProducts.Count; $i++) {
    $p = $mockProducts[$i]
    Write-Host "[$($i + 1)] $($p.name)" -ForegroundColor White
    Write-Host "    ID: $($p.product_id) | Price: `$$($p.price) | Category: $($p.category)" -ForegroundColor Gray
}

# Test Case 1: Single Item Order
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST 1: Single Item Order" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$product1 = $mockProducts[0]  # Regal Crimson Ao Dai
Write-Host "Creating order with: 1x $($product1.name) ($`$$($product1.price))" -ForegroundColor Yellow

$order1 = @{
    items = @(
        @{
            product_id = $product1.product_id
            quantity = 1
        }
    )
    product_names = "$($product1.name) x1"
    total_amount = $product1.price
    notes = "Customer: John Doe`nEmail: john.doe@example.com`nPhone: (555) 123-4567`nAddress: 123 Main Street, Los Angeles, CA 90001"
} | ConvertTo-Json -Depth 10

try {
    $response1 = Invoke-RestMethod -Uri "$API_URL/api/orders" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $AUTH_TOKEN" } `
        -Body $order1

    Write-Host "✅ Order created successfully!" -ForegroundColor Green
    Write-Host "   Order Number: $($response1.order.order_number)" -ForegroundColor White
    Write-Host "   Order ID: $($response1.order.id)" -ForegroundColor Gray
    Write-Host "   Total: `$$($response1.order.total_amount)" -ForegroundColor White
    Write-Host "   Status: $($response1.order.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Order creation failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test Case 2: Multiple Items Order
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST 2: Multiple Items Order" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$product2 = $mockProducts[1]  # Heritage Gold Ao Dai
$product3 = $mockProducts[3]  # Executive Navy Vest
$total2 = ($product2.price * 2) + $product3.price

Write-Host "Creating order with:" -ForegroundColor Yellow
Write-Host "  - 2x $($product2.name) (@`$$($product2.price))" -ForegroundColor White
Write-Host "  - 1x $($product3.name) (@`$$($product3.price))" -ForegroundColor White
Write-Host "  Total: `$$total2" -ForegroundColor Cyan

$order2 = @{
    items = @(
        @{
            product_id = $product2.product_id
            quantity = 2
        },
        @{
            product_id = $product3.product_id
            quantity = 1
        }
    )
    product_names = "$($product2.name) x2, $($product3.name) x1"
    total_amount = $total2
    notes = "Customer: Jane Smith`nEmail: jane.smith@example.com`nPhone: (555) 987-6543`nAddress: 456 Oak Avenue, San Francisco, CA 94102`nNote: Gift wrapping requested"
} | ConvertTo-Json -Depth 10

Start-Sleep -Seconds 2  # Avoid rate limit

try {
    $response2 = Invoke-RestMethod -Uri "$API_URL/api/orders" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $AUTH_TOKEN" } `
        -Body $order2

    Write-Host "✅ Order created successfully!" -ForegroundColor Green
    Write-Host "   Order Number: $($response2.order.order_number)" -ForegroundColor White
    Write-Host "   Order ID: $($response2.order.id)" -ForegroundColor Gray
    Write-Host "   Total: `$$($response2.order.total_amount)" -ForegroundColor White
    Write-Host "   Status: $($response2.order.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Order creation failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test Case 3: Wedding Collection Order
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST 3: Wedding Collection Order" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$product4 = $mockProducts[5]  # Wedding Eternal Grace
Write-Host "Creating order with: 1x $($product4.name) (`$$($product4.price))" -ForegroundColor Yellow

$order3 = @{
    items = @(
        @{
            product_id = $product4.product_id
            quantity = 1
        }
    )
    product_names = "$($product4.name) x1"
    total_amount = $product4.price
    notes = "Customer: Emily Chen`nEmail: emily.chen@example.com`nPhone: (555) 456-7890`nAddress: 789 Wedding Lane, New York, NY 10001`nNote: Rush order for wedding on June 15th"
} | ConvertTo-Json -Depth 10

Start-Sleep -Seconds 2  # Avoid rate limit

try {
    $response3 = Invoke-RestMethod -Uri "$API_URL/api/orders" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $AUTH_TOKEN" } `
        -Body $order3

    Write-Host "✅ Order created successfully!" -ForegroundColor Green
    Write-Host "   Order Number: $($response3.order.order_number)" -ForegroundColor White
    Write-Host "   Order ID: $($response3.order.id)" -ForegroundColor Gray
    Write-Host "   Total: `$$($response3.order.total_amount)" -ForegroundColor White
    Write-Host "   Status: $($response3.order.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Order creation failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test Case 4: Mixed Collection Order
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST 4: Mixed Collection Order" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$product5 = $mockProducts[2]  # Ao Dai Majestic Pearl
$product6 = $mockProducts[6]  # Evening Midnight Glamour
$total4 = $product5.price + $product6.price

Write-Host "Creating order with:" -ForegroundColor Yellow
Write-Host "  - 1x $($product5.name) (@`$$($product5.price))" -ForegroundColor White
Write-Host "  - 1x $($product6.name) (@`$$($product6.price))" -ForegroundColor White
Write-Host "  Total: `$$total4" -ForegroundColor Cyan

$order4 = @{
    items = @(
        @{
            product_id = $product5.product_id
            quantity = 1
        },
        @{
            product_id = $product6.product_id
            quantity = 1
        }
    )
    product_names = "$($product5.name) x1, $($product6.name) x1"
    total_amount = $total4
    notes = "Customer: Sarah Williams`nEmail: sarah.williams@example.com`nPhone: (555) 234-5678`nAddress: 321 Fashion Blvd, Miami, FL 33101"
} | ConvertTo-Json -Depth 10

Start-Sleep -Seconds 2  # Avoid rate limit

try {
    $response4 = Invoke-RestMethod -Uri "$API_URL/api/orders" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $AUTH_TOKEN" } `
        -Body $order4

    Write-Host "✅ Order created successfully!" -ForegroundColor Green
    Write-Host "   Order Number: $($response4.order.order_number)" -ForegroundColor White
    Write-Host "   Order ID: $($response4.order.id)" -ForegroundColor Gray
    Write-Host "   Total: `$$($response4.order.total_amount)" -ForegroundColor White
    Write-Host "   Status: $($response4.order.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Order creation failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test Case 5: Large Quantity Order
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST 5: Large Quantity Order" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$product7 = $mockProducts[4]  # Cream Tailored Vest
$quantity5 = 5
$total5 = $product7.price * $quantity5

Write-Host "Creating order with: ${quantity5}x $($product7.name) (@`$$($product7.price))" -ForegroundColor Yellow
Write-Host "Total: `$$total5" -ForegroundColor Cyan

$order5 = @{
    items = @(
        @{
            product_id = $product7.product_id
            quantity = $quantity5
        }
    )
    product_names = "$($product7.name) x$quantity5"
    total_amount = $total5
    notes = "Customer: Corporate Event Planner`nEmail: events@company.com`nPhone: (555) 345-6789`nAddress: 555 Business Park, Chicago, IL 60601`nNote: Bulk order for corporate event"
} | ConvertTo-Json -Depth 10

Start-Sleep -Seconds 2  # Avoid rate limit

try {
    $response5 = Invoke-RestMethod -Uri "$API_URL/api/orders" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $AUTH_TOKEN" } `
        -Body $order5

    Write-Host "✅ Order created successfully!" -ForegroundColor Green
    Write-Host "   Order Number: $($response5.order.order_number)" -ForegroundColor White
    Write-Host "   Order ID: $($response5.order.id)" -ForegroundColor Gray
    Write-Host "   Total: `$$($response5.order.total_amount)" -ForegroundColor White
    Write-Host "   Status: $($response5.order.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Order creation failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✅ All tests completed!" -ForegroundColor Green
Write-Host "`nTo verify orders in database:" -ForegroundColor Yellow
Write-Host "  docker exec -it ecommerce-mysql mysql -uroot -prootpassword ecommerce_db" -ForegroundColor Gray
Write-Host "  SELECT order_number, product_names, total_amount, status FROM orders ORDER BY created_at DESC LIMIT 10;" -ForegroundColor Gray

Write-Host "`nTo view orders via API:" -ForegroundColor Yellow
Write-Host "  GET http://localhost:3001/api/orders (with Authorization header)" -ForegroundColor Gray

Write-Host "`n" -ForegroundColor White

