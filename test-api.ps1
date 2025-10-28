# ISP Management System API Test Script (PowerShell)
# Author: Edwin Yordan Laksono

$BaseUrl = "http://localhost:3000/api"
$Token = ""

Write-Host "🚀 ISP Management System API Testing Script" -ForegroundColor Blue
Write-Host "===========================================" -ForegroundColor Blue
Write-Host ""

# Function to print colored output
function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

# Test Health Check
function Test-Health {
    Write-Status "Testing Health Check..."
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get
        Write-Success "Health Check - OK"
        Write-Host "Response: $($response | ConvertTo-Json -Compress)"
    }
    catch {
        Write-Error "Health Check - Failed"
        Write-Host "Error: $($_.Exception.Message)"
    }
    Write-Host ""
}

# Test Login
function Test-Login {
    Write-Status "Testing Login..."
    $loginData = @{
        email = "admin@ispmanagement.com"
        password = "admin123456"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -Body $loginData -ContentType "application/json"
        Write-Success "Login - OK"
        $script:Token = $response.data.token
        Write-Host "Token extracted: $($Token.Substring(0, [Math]::Min(20, $Token.Length)))..."
    }
    catch {
        Write-Error "Login - Failed"
        Write-Host "Error: $($_.Exception.Message)"
    }
    Write-Host ""
}

# Test Get Profile
function Test-Profile {
    if ([string]::IsNullOrEmpty($Token)) {
        Write-Warning "Skipping Profile test - No token available"
        return
    }
    
    Write-Status "Testing Get Profile..."
    $headers = @{
        "Authorization" = "Bearer $Token"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/auth/me" -Method Get -Headers $headers
        Write-Success "Get Profile - OK"
        Write-Host "User: $($response.data.full_name) ($($response.data.email))"
        Write-Host "Roles: $($response.data.roles -join ', ')"
    }
    catch {
        Write-Error "Get Profile - Failed"
        Write-Host "Error: $($_.Exception.Message)"
    }
    Write-Host ""
}

# Test Get Customers
function Test-Customers {
    if ([string]::IsNullOrEmpty($Token)) {
        Write-Warning "Skipping Customers test - No token available"
        return
    }
    
    Write-Status "Testing Get Customers..."
    $headers = @{
        "Authorization" = "Bearer $Token"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/customers" -Method Get -Headers $headers
        Write-Success "Get Customers - OK"
        Write-Host "Total customers: $($response.data.Count)"
        if ($response.data.Count -gt 0) {
            Write-Host "First customer: $($response.data[0].full_name) - $($response.data[0].customer_code)"
        }
    }
    catch {
        Write-Error "Get Customers - Failed"
        Write-Host "Error: $($_.Exception.Message)"
    }
    Write-Host ""
}

# Test Create Customer
function Test-CreateCustomer {
    if ([string]::IsNullOrEmpty($Token)) {
        Write-Warning "Skipping Create Customer test - No token available"
        return
    }
    
    Write-Status "Testing Create Customer..."
    $headers = @{
        "Authorization" = "Bearer $Token"
    }
    
    $customerData = @{
        full_name = "Test Customer PowerShell"
        email = "testps@example.com"
        phone = "+628123456888"
        address = "Jl. PowerShell Test No. 456, Jakarta"
        id_number = "3171012345678888"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/customers" -Method Post -Headers $headers -Body $customerData -ContentType "application/json"
        Write-Success "Create Customer - OK"
        Write-Host "Created customer: $($response.data.full_name) - $($response.data.customer_code)"
    }
    catch {
        Write-Error "Create Customer - Failed"
        Write-Host "Error: $($_.Exception.Message)"
    }
    Write-Host ""
}

# Test Get Tickets
function Test-Tickets {
    if ([string]::IsNullOrEmpty($Token)) {
        Write-Warning "Skipping Tickets test - No token available"
        return
    }
    
    Write-Status "Testing Get Tickets..."
    $headers = @{
        "Authorization" = "Bearer $Token"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/tickets" -Method Get -Headers $headers
        Write-Success "Get Tickets - OK"
        Write-Host "Total tickets: $($response.data.Count)"
    }
    catch {
        Write-Error "Get Tickets - Failed"
        Write-Host "Error: $($_.Exception.Message)"
    }
    Write-Host ""
}

# Test Ticket Stats
function Test-TicketStats {
    if ([string]::IsNullOrEmpty($Token)) {
        Write-Warning "Skipping Ticket Stats test - No token available"
        return
    }
    
    Write-Status "Testing Ticket Statistics..."
    $headers = @{
        "Authorization" = "Bearer $Token"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/tickets/stats" -Method Get -Headers $headers
        Write-Success "Ticket Stats - OK"
        Write-Host "Open: $($response.data.open), In Progress: $($response.data.in_progress), Resolved: $($response.data.resolved), Closed: $($response.data.closed)"
    }
    catch {
        Write-Error "Ticket Stats - Failed"
        Write-Host "Error: $($_.Exception.Message)"
    }
    Write-Host ""
}

# Test API Documentation
function Test-Docs {
    Write-Status "Testing API Documentation..."
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/docs" -Method Get
        Write-Success "API Documentation - OK"
        Write-Host "Available endpoints: $($response.endpoints.Keys.Count) categories"
    }
    catch {
        Write-Error "API Documentation - Failed"
        Write-Host "Error: $($_.Exception.Message)"
    }
    Write-Host ""
}

# Main execution
function Main {
    Write-Host "Starting API tests..." -ForegroundColor Blue
    Write-Host ""
    
    Test-Health
    Test-Docs
    Test-Login
    Test-Profile
    Test-Customers
    Test-CreateCustomer
    Test-Tickets
    Test-TicketStats
    
    Write-Host "===========================================" -ForegroundColor Blue
    Write-Host "🏁 API Testing Complete!" -ForegroundColor Blue
    Write-Host ""
    
    if (![string]::IsNullOrEmpty($Token)) {
        Write-Success "Authentication successful - All protected endpoints accessible"
        Write-Host "Your token: $Token"
    }
    else {
        Write-Warning "Authentication failed - Some tests were skipped"
        Write-Host "Please check if:"
        Write-Host "1. Server is running on $BaseUrl"
        Write-Host "2. Database is properly configured"
        Write-Host "3. Default admin user exists (run: npm run seed)"
    }
    
    Write-Host ""
    Write-Host "🌐 Access API Documentation: http://localhost:3000/api/docs" -ForegroundColor Cyan
    Write-Host "❤️  Health Check: http://localhost:3000/api/health" -ForegroundColor Cyan
}

# Run main function
Main