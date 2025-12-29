# Test CORS Configuration
# This script tests CORS headers for all API endpoints

Write-Host "=== Testing CORS Configuration ===" -ForegroundColor Cyan
Write-Host ""

$baseUrls = @(
    "http://localhost:3002",  # Gateway
    "http://localhost:3001"   # Direct backend
)

$endpoints = @(
    "/api/node/users/login",
    "/api/php/users/login",
    "/api/php/products",
    "/admin/auth/login",
    "/health"
)

function Test-CORS {
    param(
        [string]$BaseUrl,
        [string]$Endpoint,
        [string]$Origin = "http://localhost:3000"
    )
    
    $url = "$BaseUrl$Endpoint"
    
    Write-Host "Testing: $url" -ForegroundColor Yellow
    Write-Host "  Origin: $Origin" -ForegroundColor Gray
    
    try {
        # Test OPTIONS (preflight)
        Write-Host "  [OPTIONS] Preflight request..." -ForegroundColor Gray
        $optionsResponse = Invoke-WebRequest -Uri $url -Method OPTIONS -Headers @{
            "Origin" = $Origin
            "Access-Control-Request-Method" = "POST"
            "Access-Control-Request-Headers" = "Content-Type, Authorization"
        } -ErrorAction SilentlyContinue
        
        Write-Host "    Status: $($optionsResponse.StatusCode)" -ForegroundColor $(if ($optionsResponse.StatusCode -eq 204) { "Green" } else { "Red" })
        Write-Host "    CORS Headers:" -ForegroundColor Gray
        $corsHeaders = @(
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Methods",
            "Access-Control-Allow-Headers",
            "Access-Control-Allow-Credentials",
            "Access-Control-Max-Age"
        )
        
        foreach ($header in $corsHeaders) {
            $value = $optionsResponse.Headers[$header]
            if ($value) {
                $color = if ($header -eq "Access-Control-Allow-Origin" -and $value -eq "*") { "Yellow" } else { "Green" }
                Write-Host "      $header`: $value" -ForegroundColor $color
            } else {
                Write-Host "      $header`: (missing)" -ForegroundColor Red
            }
        }
        
        # Check for CORS issues
        $allowOrigin = $optionsResponse.Headers["Access-Control-Allow-Origin"]
        $allowCredentials = $optionsResponse.Headers["Access-Control-Allow-Credentials"]
        
        if ($allowOrigin -eq "*" -and $allowCredentials -eq "true") {
            Write-Host "    [WARNING] Cannot use '*' with credentials=true" -ForegroundColor Red
        }
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "    [ERROR] OPTIONS failed: $statusCode" -ForegroundColor Red
        if ($_.Exception.Response) {
            $headers = $_.Exception.Response.Headers
            $corsOrigin = $headers["Access-Control-Allow-Origin"]
            if ($corsOrigin) {
                Write-Host "      Access-Control-Allow-Origin: $corsOrigin" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host ""
}

# Test each base URL and endpoint
foreach ($baseUrl in $baseUrls) {
    Write-Host "`n=== Testing Base URL: $baseUrl ===" -ForegroundColor Cyan
    
    # First check if server is reachable
    try {
        $healthCheck = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
        Write-Host "[OK] Server is reachable" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Server is NOT reachable at $baseUrl" -ForegroundColor Red
        Write-Host "  Skipping tests for this base URL...`n" -ForegroundColor Yellow
        continue
    }
    
    foreach ($endpoint in $endpoints) {
        Test-CORS -BaseUrl $baseUrl -Endpoint $endpoint
    }
}

Write-Host "`n=== CORS Test Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Common CORS Issues:" -ForegroundColor Yellow
Write-Host "1. Access-Control-Allow-Origin: '*' cannot be used with credentials" -ForegroundColor Gray
Write-Host "2. Missing Access-Control-Allow-Headers for Authorization" -ForegroundColor Gray
Write-Host "3. Missing Access-Control-Allow-Methods" -ForegroundColor Gray
Write-Host "4. Preflight (OPTIONS) requests must return 204" -ForegroundColor Gray
Write-Host ""

