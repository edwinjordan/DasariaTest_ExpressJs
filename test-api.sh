#!/bin/bash

# ISP Management System API Test Script
# Author: Oskar Pra Andrea Sussetyo

BASE_URL="http://localhost:3000/api"
TOKEN=""

echo "🚀 ISP Management System API Testing Script"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Test Health Check
test_health() {
    print_status "Testing Health Check..."
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$BASE_URL/health")
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS\:.*//g')
    
    if [ $http_code -eq 200 ]; then
        print_success "Health Check - OK"
        echo "Response: $body"
    else
        print_error "Health Check - Failed (HTTP: $http_code)"
    fi
    echo ""
}

# Test Login
test_login() {
    print_status "Testing Login..."
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "admin@ispmanagement.com",
            "password": "admin123456"
        }')
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS\:.*//g')
    
    if [ $http_code -eq 200 ]; then
        print_success "Login - OK"
        # Extract token (basic extraction, might need jq for better parsing)
        TOKEN=$(echo $body | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
        echo "Token extracted: ${TOKEN:0:20}..."
    else
        print_error "Login - Failed (HTTP: $http_code)"
        echo "Response: $body"
    fi
    echo ""
}

# Test Get Profile
test_profile() {
    if [ -z "$TOKEN" ]; then
        print_warning "Skipping Profile test - No token available"
        return
    fi
    
    print_status "Testing Get Profile..."
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X GET "$BASE_URL/auth/me" \
        -H "Authorization: Bearer $TOKEN")
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS\:.*//g')
    
    if [ $http_code -eq 200 ]; then
        print_success "Get Profile - OK"
        echo "Response: $body"
    else
        print_error "Get Profile - Failed (HTTP: $http_code)"
        echo "Response: $body"
    fi
    echo ""
}

# Test Get Customers
test_customers() {
    if [ -z "$TOKEN" ]; then
        print_warning "Skipping Customers test - No token available"
        return
    fi
    
    print_status "Testing Get Customers..."
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X GET "$BASE_URL/customers" \
        -H "Authorization: Bearer $TOKEN")
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS\:.*//g')
    
    if [ $http_code -eq 200 ]; then
        print_success "Get Customers - OK"
        echo "Response: $body"
    else
        print_error "Get Customers - Failed (HTTP: $http_code)"
        echo "Response: $body"
    fi
    echo ""
}

# Test Create Customer
test_create_customer() {
    if [ -z "$TOKEN" ]; then
        print_warning "Skipping Create Customer test - No token available"
        return
    fi
    
    print_status "Testing Create Customer..."
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST "$BASE_URL/customers" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "full_name": "Test Customer API",
            "email": "testapi@example.com",
            "phone": "+628123456999",
            "address": "Jl. API Test No. 123, Jakarta",
            "id_number": "3171012345678999"
        }')
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS\:.*//g')
    
    if [ $http_code -eq 201 ]; then
        print_success "Create Customer - OK"
        echo "Response: $body"
    else
        print_error "Create Customer - Failed (HTTP: $http_code)"
        echo "Response: $body"
    fi
    echo ""
}

# Test Get Tickets
test_tickets() {
    if [ -z "$TOKEN" ]; then
        print_warning "Skipping Tickets test - No token available"
        return
    fi
    
    print_status "Testing Get Tickets..."
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X GET "$BASE_URL/tickets" \
        -H "Authorization: Bearer $TOKEN")
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS\:.*//g')
    
    if [ $http_code -eq 200 ]; then
        print_success "Get Tickets - OK"
        echo "Response: $body"
    else
        print_error "Get Tickets - Failed (HTTP: $http_code)"
        echo "Response: $body"
    fi
    echo ""
}

# Test API Documentation
test_docs() {
    print_status "Testing API Documentation..."
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$BASE_URL/docs")
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS\:.*//g')
    
    if [ $http_code -eq 200 ]; then
        print_success "API Documentation - OK"
        echo "Documentation available at: $BASE_URL/docs"
    else
        print_error "API Documentation - Failed (HTTP: $http_code)"
    fi
    echo ""
}

# Main execution
main() {
    echo "Starting API tests..."
    echo ""
    
    test_health
    test_docs
    test_login
    test_profile
    test_customers
    test_create_customer
    test_tickets
    
    echo "==========================================="
    echo "🏁 API Testing Complete!"
    echo ""
    if [ ! -z "$TOKEN" ]; then
        print_success "Authentication successful - All protected endpoints can be tested"
        echo "Your token: $TOKEN"
    else
        print_warning "Authentication failed - Some tests were skipped"
        echo "Please check if:"
        echo "1. Server is running on $BASE_URL"
        echo "2. Database is properly configured"
        echo "3. Default admin user exists (run: npm run seed)"
    fi
}

# Run main function
main