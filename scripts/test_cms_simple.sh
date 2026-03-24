#!/bin/bash

# CMS系统完整测试脚本
API_URL="http://192.168.31.185:3002"
FRONTEND_URL="http://192.168.31.185:3001"

echo "🚀 开始CMS系统完整测试..."

# 1. 健康检查
echo -e "\n🔍 测试 1: 健康检查"
curl -s "$API_URL/api/health"

# 2. 获取验证码
echo -e "\n🔐 测试 2: 获取验证码"
CAPTCHA_RESPONSE=$(curl -s "$API_URL/api/captcha")
echo "验证码响应: $CAPTCHA_RESPONSE"
CAPTCHA_ID=$(echo "$CAPTCHA_RESPONSE" | grep -o '"captchaId":"[^"]*' | cut -d'"' -f4)
CAPTCHA_TEXT=$(echo "$CAPTCHA_RESPONSE" | grep -o '"captcha":"[^"]*' | cut -d'"' -f4)

# 3. 用户注册
echo -e "\n👤 测试 3: 用户注册"
TEST_EMAIL="test$(date +%s)@example.com"
curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"test123\",
    \"name\": \"测试用户\",
    \"captchaId\": \"$CAPTCHA_ID\",
    \"captcha\": \"$CAPTCHA_TEXT\"
  }"

# 4. 用户登录
echo -e "\n🔐 测试 4: 用户登录"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"test123\",
    \"captchaId\": \"$CAPTCHA_ID\",
    \"captcha\": \"$CAPTCHA_TEXT\"
  }")
echo "登录响应: $LOGIN_RESPONSE"
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 5. 获取用户信息
echo -e "\n👤 测试 5: 获取用户信息"
curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/auth/me"

# 6. 文章列表
echo -e "\n📝 测试 6: 获取文章列表"
curl -s "$API_URL/api/articles?page=1&pageSize=5"

# 7. 获取分类
echo -e "\n📂 测试 7: 获取分类"
curl -s "$API_URL/api/categories"

# 8. 获取标签
echo -e "\n🏷️ 测试 8: 获取标签"
curl -s "$API_URL/api/tags"

# 9. 搜索功能
echo -e "\n🔍 测试 9: 搜索功能"
curl -s "$API_URL/api/search?q=测试"

# 10. SEO功能
echo -e "\n🔍 测试 10: SEO功能"
curl -s "$API_URL/api/sitemap.xml" > /tmp/sitemap.xml
echo "✅ Sitemap生成成功"
curl -s "$API_URL/api/robots.txt" > /tmp/robots.txt
echo "✅ Robots.txt生成成功"
curl -s "$API_URL/api/rss.xml" > /tmp/rss.xml
echo "✅ RSS Feed生成成功"

# 11. 统计数据
echo -e "\n📊 测试 11: 获取统计数据"
curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/admin/stats"

# 12. 媒体上传测试
echo -e "\n🖼️ 测试 12: 媒体上传"
# 创建测试文件
echo "测试文件内容" > /tmp/test_upload.txt
UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/api/admin/media/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test_upload.txt")
echo "上传响应: $UPLOAD_RESPONSE"
rm /tmp/test_upload.txt

# 13. 文章CRUD操作
echo -e "\n📝 测试 13: 文章CRUD操作"
# 创建文章
CREATE_ARTICLE=$(curl -s -X POST "$API_URL/api/admin/articles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试文章-CURL",
    "content": "# 测试文章\n\n这是通过CURL创建的文章。",
    "excerpt": "测试摘要",
    "category_id": "54bd1bb4-8a04-4097-a4e2-1b07e9f469bc"
  }')
echo "创建文章响应: $CREATE_ARTICLE"
ARTICLE_ID=$(echo "$CREATE_ARTICLE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

# 发布文章
curl -s -X POST "$API_URL/api/admin/articles/$ARTICLE_ID/publish" \
  -H "Authorization: Bearer $TOKEN"

# 删除文章
curl -s -X DELETE "$API_URL/api/admin/articles/$ARTICLE_ID" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n🎉 所有测试完成！"
echo -e "\n🌐 访问地址:"
echo "  - 前端: $FRONTEND_URL"
echo "  - 后端API: $API_URL"
echo "  - 管理员账号: admin@example.com / admin123"
echo "  - 测试账号: $TEST_EMAIL / test123"