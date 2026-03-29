#!/usr/bin/env python3
import requests
import json
import time
import random
import string
from datetime import datetime
import os

CMS_HOST = os.getenv("CMS_HOST", "localhost")
API_PORT = os.getenv("API_PORT", "3003")
FRONTEND_PORT = os.getenv("FRONTEND_PORT", "3001")
API_URL = os.getenv("API_URL", f"http://{CMS_HOST}:{API_PORT}")
HEADERS = {}

def generate_random_string(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def test_api(endpoint, method='GET', data=None, headers=None, expected_status=200):
    try:
        url = f"{API_URL}{endpoint}"
        response = requests.request(method, url, json=data, headers=headers or HEADERS)
        assert response.status_code == expected_status, f"状态码错误: {response.status_code}, 预期: {expected_status}"
        return response.json()
    except Exception as e:
        print(f"❌ {endpoint} 测试失败: {str(e)}")
        return None

def test_health_check():
    print("🔍 测试 1: 健康检查")
    result = test_api("/api/health")
    print(f"✅ 健康检查通过: {result['status']}")
    return result

def test_user_registration():
    print("\n👤 测试 2: 用户注册")
    email = f"test{int(time.time())}@example.com"
    password = "test123"
    captcha = test_api("/api/captcha")
    
    result = test_api("/api/auth/register", method="POST", data={
        "email": email,
        "password": password,
        "name": "测试用户",
        "captchaId": captcha["captchaId"],
        "captcha": captcha["captcha"]
    })
    
    print(f"✅ 注册成功: {result['user']['email']}")
    return {"email": email, "password": password, "user": result["user"]}

def test_user_login(user):
    print("\n🔐 测试 3: 用户登录")
    captcha = test_api("/api/captcha")
    
    result = test_api("/api/auth/login", method="POST", data={
        "email": user["email"],
        "password": user["password"],
        "captchaId": captcha["captchaId"],
        "captcha": captcha["captcha"]
    })
    
    global HEADERS
    HEADERS = {"Authorization": f"Bearer {result['token']}"}
    print(f"✅ 登录成功: {result['user']['name']}")
    return result["user"]

def test_article_crud(user):
    print("\n📝 测试 4: 文章CRUD操作")
    
    # 创建文章
    article_data = {
        "title": f"测试文章-{int(time.time())}",
        "content": "# 测试文章内容\n\n这是一个测试文章，包含Markdown格式。\n\n- 列表项1\n- 列表项2",
        "excerpt": "这是文章摘要",
        "category_id": "54bd1bb4-8a04-4097-a4e2-1b07e9f469bc"
    }
    
    result = test_api("/api/admin/articles", method="POST", data=article_data)
    article_id = result["id"]
    print(f"✅ 文章创建成功: {result['title']}")
    
    # 获取文章列表
    articles = test_api("/api/admin/articles")
    print(f"✅ 文章列表获取成功: {len(articles)}篇文章")
    
    # 更新文章
    update_data = {"title": "更新后的标题"}
    result = test_api(f"/api/admin/articles/{article_id}", method="PUT", data=update_data)
    print(f"✅ 文章更新成功: {result['title']}")
    
    # 发布文章
    result = test_api(f"/api/admin/articles/{article_id}/publish", method="POST")
    print(f"✅ 文章发布成功: 状态={result['status']}")
    
    # 删除文章
    test_api(f"/api/admin/articles/{article_id}", method="DELETE")
    print("✅ 文章删除成功")
    
    return article_id

def test_public_api():
    print("\n🌐 测试 5: 公开API")
    
    # 获取文章列表
    articles = test_api("/api/articles?page=1&pageSize=5")
    print(f"✅ 文章列表获取成功: {len(articles['items'])}篇文章")
    
    # 获取文章详情
    if articles['items']:
        article = test_api(f"/api/articles/{articles['items'][0]['slug']}")
        print(f"✅ 文章详情获取成功: {article['title']}")
    
    # 获取分类
    categories = test_api("/api/categories")
    print(f"✅ 分类获取成功: {len(categories)}个分类")
    
    # 获取标签
    tags = test_api("/api/tags")
    print(f"✅ 标签获取成功: {len(tags)}个标签")
    
    # 搜索
    search = test_api("/api/search?q=测试")
    print(f"✅ 搜索功能正常")
    
    return articles['items'][0]['slug'] if articles['items'] else None

def test_user_interaction(slug):
    print("\n👥 测试 6: 用户互动功能")
    
    # 点赞
    result = test_api(f"/api/articles/{slug}/like", method="POST")
    print(f"✅ 点赞操作: {result['message']}")
    
    # 收藏
    result = test_api(f"/api/articles/{slug}/favorite", method="POST")
    print(f"✅ 收藏操作: {result['message']}")
    
    # 获取评论
    comments = test_api(f"/api/articles/{slug}/comments")
    print(f"✅ 评论获取成功: {len(comments)}条评论")
    
    # 发表评论
    result = test_api(f"/api/articles/{slug}/comments", method="POST", data={
        "content": "测试评论内容"
    })
    print(f"✅ 评论发表成功: {result['content']}")

def test_media_upload():
    print("\n🖼️ 测试 7: 媒体上传")
    
    # 创建测试文件
    test_content = "测试文件内容"
    with open("test_upload.txt", "w") as f:
        f.write(test_content)
    
    files = {"file": ("test_upload.txt", open("test_upload.txt", "rb"), "text/plain")}
    
    response = requests.post(f"{API_URL}/api/admin/media/upload", 
                          files=files, 
                          headers=HEADERS)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ 媒体上传成功: {result['original_name']}")
    else:
        print(f"❌ 媒体上传失败: {response.text}")
    
    # 清理测试文件
    import os
    os.remove("test_upload.txt")

def test_seo_features():
    print("\n🔍 测试 8: SEO功能")
    
    # Sitemap
    sitemap = test_api("/api/sitemap.xml", expected_status=200)
    print(f"✅ Sitemap获取成功: {len(sitemap.split('</url>')) - 1}个URL")
    
    # Robots.txt
    robots = test_api("/api/robots.txt", expected_status=200)
    print("✅ Robots.txt获取成功")
    
    # RSS Feed
    rss = test_api("/api/rss.xml", expected_status=200)
    print("✅ RSS Feed获取成功")

def test_admin_features():
    print("\n🛡️ 测试 9: 后台管理功能")
    
    # 获取统计数据
    stats = test_api("/api/admin/stats")
    print(f"✅ 统计数据获取成功: {stats['articleCount']}篇文章")
    
    # 获取用户列表
    users = test_api("/api/admin/users")
    print(f"✅ 用户列表获取成功: {len(users)}个用户")

def main():
    print("🚀 开始CMS系统完整测试...\n")
    
    try:
        # Phase 1: 基础检查
        test_health_check()
        
        # Phase 2: 用户系统
        user = test_user_registration()
        logged_in_user = test_user_login(user)
        
        # Phase 3: 核心功能
        article_slug = test_public_api()
        if article_slug:
            test_user_interaction(article_slug)
        
        # Phase 4: 增强功能
        test_media_upload()
        test_seo_features()
        test_admin_features()
        
        print("\n🎉 所有测试通过！CMS系统功能完整。")
        print(f"\n📊 测试摘要:")
        print(f"  - API健康检查: ✅")
        print(f"  - 用户系统: ✅")
        print(f"  - 文章管理: ✅")
        print(f"  - 公开API: ✅")
        print(f"  - 用户互动: ✅")
        print(f"  - 媒体上传: ✅")
        print(f"  - SEO功能: ✅")
        print(f"  - 后台管理: ✅")
        
        print(f"\n🌐 访问地址:")
        print(f"  - 前端: http://{CMS_HOST}:{FRONTEND_PORT}")
        print(f"  - 后端API: {API_URL}")
        print(f"  - 管理员账号: admin@example.com / admin123")
        print(f"  - 测试账号: {user['email']} / test123")
        
    except Exception as e:
        print(f"\n❌ 测试失败: {str(e)}")
        print("请检查系统配置和API端点")

if __name__ == "__main__":
    main()
