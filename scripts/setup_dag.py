#!/usr/bin/env python3
import json
import os
from datetime import datetime

# 任务数据
project_file = os.path.expanduser("~/.openclaw/data/team-tasks/cms-p0p1.json")

with open(project_file, 'r') as f:
    data = json.load(f)

# 定义任务
tasks = [
    {
        "id": "frontend-infra",
        "agent": "code-agent",
        "description": "搭建Next.js 14项目，配置TypeScript、Tailwind CSS、路由结构、API集成",
        "depends": [],
        "status": "pending"
    },
    {
        "id": "frontend-public",
        "agent": "code-agent", 
        "description": "前台展示：首页文章列表、文章详情页（Markdown渲染+代码高亮+TOC目录）、分类页、标签页、搜索功能",
        "depends": ["frontend-infra"],
        "status": "pending"
    },
    {
        "id": "frontend-admin",
        "agent": "code-agent",
        "description": "后台管理：Markdown编辑器（Monaco Editor+实时预览）、媒体库（拖拽上传+图片管理）、分类标签CRUD、仪表盘统计",
        "depends": ["frontend-infra"],
        "status": "pending"
    },
    {
        "id": "user-system",
        "agent": "code-agent",
        "description": "用户系统完善：头像上传、密码修改、找回密码（邮件验证）、个人中心、等级展示",
        "depends": ["frontend-infra"],
        "status": "pending"
    },
    {
        "id": "backend-api",
        "agent": "code-agent",
        "description": "后端API完善：评论API、收藏API、点赞API、搜索API、RBAC中间件完善",
        "depends": [],
        "status": "pending"
    },
    {
        "id": "seo-optimization",
        "agent": "code-agent",
        "description": "SEO优化：Next.js SSR渲染、Meta标签动态生成、Sitemap.xml自动生成、Open Graph标签、结构化数据JSON-LD",
        "depends": ["frontend-public"],
        "status": "pending"
    },
    {
        "id": "performance",
        "agent": "code-agent",
        "description": "性能优化：Redis缓存热点数据、图片懒加载、代码分割、Gzip压缩、CDN配置",
        "depends": ["frontend-public", "frontend-admin"],
        "status": "pending"
    },
    {
        "id": "security",
        "agent": "code-agent",
        "description": "安全加固：Rate Limiting（express-rate-limit）、图形验证码（svg-captcha）、CSP策略、XSS防护、CSRF Token、安全日志",
        "depends": ["frontend-public", "frontend-admin", "user-system", "backend-api"],
        "status": "pending"
    },
    {
        "id": "browser-test",
        "agent": "test-agent",
        "description": "浏览器交互测试：前台浏览、后台管理、用户操作、SEO验证、安全测试、所有P0+P1测试用例通过",
        "depends": ["seo-optimization", "performance", "security"],
        "status": "pending"
    }
]

# 添加任务到项目
for task in tasks:
    data["stages"][task["id"]] = {
        "agent": task["agent"],
        "description": task["description"],
        "depends": task["depends"],
        "status": task["status"],
        "created": datetime.now().isoformat(),
        "updated": datetime.now().isoformat(),
        "logs": [],
        "output": ""
    }

# 保存
data["updated"] = datetime.now().isoformat()

with open(project_file, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("✅ DAG 任务图创建成功！")
print("\n📋 任务依赖关系：")
for task_id, task in data["stages"].items():
    deps = ", ".join(task["depends"]) if task["depends"] else "无"
    print(f"  {task_id} ({task['agent']})")
    print(f"    依赖: {deps}")
    print(f"    描述: {task['description'][:60]}...")
    print()

# 统计
pending = sum(1 for t in data["stages"].values() if t["status"] == "pending")
print(f"📊 总任务数: {len(data['stages'])}")
print(f"⏳ 待执行: {pending}")