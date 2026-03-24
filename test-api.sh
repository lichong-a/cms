#!/bin/bash

# CMS Frontend API Integration Test Script
# Run this script to verify API integration

echo "🧪 CMS Frontend API Integration Test"
echo "======================================"
echo ""

API_URL="http://localhost:3003/api/v1"

# 颜色代码
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 测试函数
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL$endpoint")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d '{"email":"test@example.com","password":"test123"}')
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ] || [ "$response" = "401" ] || [ "$response" = "400" ]; then
        echo -e "${GREEN}✓${NC} (Status: $response)"
        return 0
    else
        echo -e "${RED}✗${NC} (Status: $response)"
        return 1
    fi
}

echo "📡 Testing API Endpoints:"
echo ""

# 测试认证相关
echo "🔐 Authentication:"
test_endpoint "POST" "/auth/login" "Login endpoint"
test_endpoint "POST" "/auth/register" "Register endpoint"
test_endpoint "GET" "/auth/profile" "Get profile (requires auth)"

echo ""

# 测试文章相关
echo "📝 Articles:"
test_endpoint "GET" "/articles" "Get articles list"
test_endpoint "GET" "/articles/1" "Get single article"

echo ""

# 测试分类相关
echo "📁 Categories:"
test_endpoint "GET" "/categories" "Get categories list"

echo ""

# 测试标签相关
echo "🏷️  Tags:"
test_endpoint "GET" "/tags" "Get tags list"

echo ""

echo "======================================"
echo "✨ API Integration Test Complete"
echo ""
echo "📋 Next Steps:"
echo "1. Start the API server: cd apps/api && npm run dev"
echo "2. Start the frontend: cd apps/web-admin && npm run dev"
echo "3. Visit http://localhost:3000/login"
echo "4. Login with valid credentials"
echo "5. Test CRUD operations for articles, categories, and tags"
echo ""
