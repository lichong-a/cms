# CMS MVP 功能清单

## MVP 范围 (Phase 1)

### P0 - 核心功能

| 功能 | 描述 | 状态 |
|------|------|------|
| 用户注册/登录 | JWT 认证，角色分配 | 待开发 |
| 内容创建 | Rich Text 编辑器 | 待开发 |
| 内容列表 | 分页、筛选、搜索 | 待开发 |
| 内容编辑 | 修改、自动保存 | 待开发 |
| 内容删除 | 软删除 | 待开发 |
| 工作流 | 草稿→待审→发布 | 待开发 |
| 媒体上传 | 图片上传、预览 | 待开发 |
| 媒体管理 | 列表、删除 | 待开发 |

### P1 - 重要功能

| 功能 | 描述 | 状态 |
|------|------|------|
| 用户管理 | 用户列表、角色分配 | 待开发 |
| 内容搜索 | Elasticsearch 全文搜索 | 待开发 |
| 缓存优化 | Redis 热点数据缓存 | 待开发 |
| 操作日志 | 工作流变更记录 | 待开发 |

### P2 - 后续功能

| 功能 | 描述 | 状态 |
|------|------|------|
| Markdown 支持 | Markdown 编辑器 | 后续 |
| 多语言 | i18n 支持 | 后续 |
| SEO 优化 | Meta 管理 | 后续 |
| 版本控制 | 内容版本历史 | 后续 |

## 实现优先级

```
Week 1:
  Day 1-2: 项目搭建 + 数据库初始化 + 用户认证
  Day 3-4: 内容 CRUD + 编辑器集成
  Day 5: 媒体上传 + 工作流

Week 2:
  Day 1-2: 前端 UI 完善
  Day 3: 搜索集成 (Elasticsearch)
  Day 4: 缓存优化 (Redis)
  Day 5: 测试 + 部署
```

## 技术依赖

### 后端
- @nestjs/core
- @nestjs/graphql
- @nestjs/passport
- @nestjs/typeorm
- typeorm
- pg
- ioredis
- @elastic/elasticsearch
- bcrypt
- jsonwebtoken

### 前端
- react
- react-dom
- @apollo/client
- graphql
- react-quill
- tailwindcss
- react-router-dom
