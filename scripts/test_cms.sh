#!/bin/bash

# CMS系统完整测试脚本
CMS_HOST="${CMS_HOST:-localhost}"
API_PORT="${API_PORT:-3003}"
FRONTEND_PORT="${FRONTEND_PORT:-3001}"
API_URL="${API_URL:-http://${CMS_HOST}:${API_PORT}}"
FRONTEND_URL="${FRONTEND_URL:-http://${CMS_HOST}:${FRONTEND_PORT}}"

echo "🚀 开始CMS系统完整测试..."

# 1. 健康检查
echo -e "\n🔍 测试 1: 健康检查"
curl -s "$API_URL/api/health" | jq .

# 2. 获取验证码
echo -e "\n🔐 测试 2: 获取验证码"
CAPTCHA=$(curl -s "$API_URL/api/captcha")
CAPTCHA_ID=$(echo "$CAPTCHA" | jq -r '.captchaId')
CAPTCHA_TEXT=$(echo "$CAPTCHA" | jq -r '.captcha')

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
  }" | jq .

# 4. 用户登录
echo -e "\n🔐 测试 4: 用户登录"
LOGIN_RESULT=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"test123\",
    \"captchaId\": \"$CAPTCHA_ID\",
    \"captcha\": \"$CAPTCHA_TEXT\"
  }")
echo "$LOGIN_RESULT" | jq .
TOKEN=$(echo "$LOGIN_RESULT" | jq -r '.token')

# 5. 获取用户信息
echo -e "\n👤 测试 5: 获取用户信息"
curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/auth/me" | jq .

# 6. 文章列表
echo -e "\n📝 测试 6: 获取文章列表"
curl -s "$API_URL/api/articles?page=1&pageSize=5" | jq .

# 7. 获取分类
echo -e "\n📂 测试 7: 获取分类"
curl -s "$API_URL/api/categories" | jq .

# 8. 获取标签
echo -e "\n🏷️ 测试 8: 获取标签"
curl -s "$API_URL/api/tags" | jq .

# 9. 搜索功能
echo -e "\n🔍 测试 9: 搜索功能"
curl -s "$API_URL/api/search?q=测试" | jq .

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
curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/admin/stats" | jq .

# 12. 媒体上传测试
echo -e "\n🖼️ 测试 12: 媒体上传"
# 创建测试文件
echo "测试文件内容" > /tmp/test_upload.txt
UPLOAD_RESULT=$(curl -s -X POST "$API_URL/api/admin/media/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test_upload.txt")
echo "$UPLOAD_RESULT" | jq .
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
echo "$CREATE_ARTICLE" | jq .
ARTICLE_ID=$(echo "$CREATE_ARTICLE" | jq -r '.id')

# 发布文章
curl -s -X POST "$API_URL/api/admin/articles/$ARTICLE_ID/publish" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 删除文章
curl -s -X DELETE "$API_URL/api/admin/articles/$ARTICLE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n🎉 所有API测试通过！"
echo -e "\n🌐 访问地址:"
echo "  - 前端: $FRONTEND_URL"
echo "  - 后端API: $API_URL"
echo "  - 管理员账号: admin@example.com / admin123"
echo "  - 测试账号: $TEST_EMAIL / test123"
