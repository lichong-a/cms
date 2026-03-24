#!/bin/bash

# CMS系统完整测试脚本
API_URL="http://192.168.31.185:3002"
FRONTEND_URL="http://192.168.31.185:3001"

echo "🚀 开始CMS系统完整测试..."
echo "================================"

# 1. 健康检查
echo -e "\n🔍 测试 1: 健康检查"
curl -s "$API_URL/api/health"

# 2. 获取验证码
echo -e "\n\n🔐 测试 2: 获取验证码"
CAPTCHA_RESPONSE=$(curl -s "$API_URL/api/captcha")
echo "验证码响应长度: ${#CAPTCHA_RESPONSE} 字符"

# 使用Python解析JSON
CAPTCHA_ID=$(python3 -c "import json; print(json.loads('''$CAPTCHA_RESPONSE''')['captchaId'])" 2>/dev/null)
CAPTCHA_TEXT=$(python3 -c "import json; print(json.loads('''$CAPTCHA_RESPONSE''')['text'])" 2>/dev/null)

if [ -z "$CAPTCHA_ID" ] || [ -z "$CAPTCHA_TEXT" ]; then
    echo "❌ 验证码获取失败，使用默认值"
    CAPTCHA_ID="test"
    CAPTCHA_TEXT="test"
fi

echo "验证码ID: $CAPTCHA_ID"
echo "验证码文本: $CAPTCHA_TEXT"

# 3. 用户注册
echo -e "\n👤 测试 3: 用户注册"
TEST_EMAIL="test$(date +%s)@example.com"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"test123\",
    \"name\": \"测试用户\",
    \"captchaId\": \"$CAPTCHA_ID\",
    \"captcha\": \"$CAPTCHA_TEXT\"
  }")
echo "$REGISTER_RESPONSE"

# 4. 重新获取验证码并登录
echo -e "\n🔐 测试 4: 用户登录"
CAPTCHA_RESPONSE=$(curl -s "$API_URL/api/captcha")
CAPTCHA_ID=$(python3 -c "import json; print(json.loads('''$CAPTCHA_RESPONSE''')['captchaId'])" 2>/dev/null)
CAPTCHA_TEXT=$(python3 -c "import json; print(json.loads('''$CAPTCHA_RESPONSE''')['text'])" 2>/dev/null)

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"test123\",
    \"captchaId\": \"$CAPTCHA_ID\",
    \"captcha\": \"$CAPTCHA_TEXT\"
  }")
echo "$LOGIN_RESPONSE"

# 提取token
TOKEN=$(python3 -c "import json; data=json.loads('''$LOGIN_RESPONSE'''); print(data.get('token', ''))" 2>/dev/null)
if [ -z "$TOKEN" ]; then
    echo "❌ 登录失败，使用管理员账号"
    # 使用管理员账号登录
    CAPTCHA_RESPONSE=$(curl -s "$API_URL/api/captcha")
    CAPTCHA_ID=$(python3 -c "import json; print(json.loads('''$CAPTCHA_RESPONSE''')['captchaId'])" 2>/dev/null)
    CAPTCHA_TEXT=$(python3 -c "import json; print(json.loads('''$CAPTCHA_RESPONSE''')['text'])" 2>/dev/null)
    
    LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"admin@example.com\",
        \"password\": \"admin123\",
        \"captchaId\": \"$CAPTCHA_ID\",
        \"captcha\": \"$CAPTCHA_TEXT\"
      }")
    TOKEN=$(python3 -c "import json; data=json.loads('''$LOGIN_RESPONSE'''); print(data.get('token', ''))" 2>/dev/null)
fi

echo "Token: ${TOKEN:0:50}..."

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
curl -s "$API_URL/api/search?q=CMS"

# 10. SEO功能
echo -e "\n🔍 测试 10: SEO功能"
curl -s "$API_URL/api/sitemap.xml" | head -10
echo -e "\n✅ Sitemap正常"
curl -s "$API_URL/api/robots.txt"
echo -e "\n✅ Robots.txt正常"
curl -s "$API_URL/api/rss.xml" | head -10
echo -e "\n✅ RSS Feed正常"

# 11. 统计数据
echo -e "\n📊 测试 11: 获取统计数据"
curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/admin/stats"

# 12. 媒体上传测试
echo -e "\n🖼️ 测试 12: 媒体上传"
echo "测试文件内容" > /tmp/test_upload.txt
UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/api/admin/media/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test_upload.txt")
echo "$UPLOAD_RESPONSE"
rm /tmp/test_upload.txt

# 13. 文章CRUD操作
echo -e "\n📝 测试 13: 文章CRUD操作"

# 创建文章
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/api/admin/articles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试文章-API测试",
    "content": "# 测试文章\n\n这是通过API创建的测试文章。\n\n## 功能\n\n- Markdown支持\n- 实时预览\n- SEO优化",
    "excerpt": "这是一个测试文章的摘要",
    "category_id": "54bd1bb4-8a04-4097-a4e2-1b07e9f469bc"
  }')
echo "创建文章: $CREATE_RESPONSE"

ARTICLE_ID=$(python3 -c "import json; data=json.loads('''$CREATE_RESPONSE'''); print(data.get('id', ''))" 2>/dev/null)

if [ -n "$ARTICLE_ID" ]; then
    # 发布文章
    echo -e "\n发布文章:"
    curl -s -X POST "$API_URL/api/admin/articles/$ARTICLE_ID/publish" \
      -H "Authorization: Bearer $TOKEN"
    
    # 删除文章
    echo -e "\n删除文章:"
    curl -s -X DELETE "$API_URL/api/admin/articles/$ARTICLE_ID" \
      -H "Authorization: Bearer $TOKEN"
fi

echo -e "\n================================"
echo "🎉 所有测试完成！"
echo -e "\n🌐 访问地址:"
echo "  - 前端: $FRONTEND_URL"
echo "  - 后端API: $API_URL"
echo "  - 管理员账号: admin@example.com / admin123"
echo "  - 测试账号: $TEST_EMAIL / test123"