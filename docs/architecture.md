# CMS 当前架构基线

本文件描述当前仓库中的实际架构，用于约束后续开发。若代码与文档不一致，以修正文档和脚本为优先。

## 系统组成

```text
web-frontend (Next.js 15, port 3001)
        |
        | HTTP / REST
        v
api (Express 5, Prisma, port 3003)
        |
        +--> PostgreSQL / TimescaleDB
        +--> Redis
        +--> Local / OSS storage

web-admin (Next.js 15, port 3002)
        |
        | HTTP / REST
        v
api (Express 5, Prisma, port 3003)
```

## 应用边界

### `apps/web-frontend`

- 面向访客的前台站点
- 负责首页、文章详情、分类、标签、搜索等页面
- 通过 REST API 获取内容

### `apps/web-admin`

- 面向运营和管理员的后台应用
- 负责文章、分类、标签、媒体、租户、设置等管理页面
- 通过 REST API 完成鉴权和内容管理

### `apps/api`

- 独立的 Express 5 API 服务
- 负责鉴权、RBAC、多租户隔离、内容 CRUD、上传与配置接口
- 使用 Prisma 访问 PostgreSQL
- 使用 Redis 处理缓存和令牌相关能力

## 当前关键设计

### 通信方式

- 前后台都通过 HTTP 调用 REST API
- 当前没有 GraphQL 网关

### 多租户

- API 通过 `X-Tenant` 请求头或子域名识别租户
- 租户信息在 API 层注入请求上下文
- 租户隔离是后端设计中的核心约束

### 鉴权

- 当前主链路基于 JWT
- 后台路由通过 Next middleware 做页面级保护
- API 路由通过 Express middleware 做接口级认证和 RBAC

### 存储

- 默认支持本地文件存储
- 已接入 OSS / STS 相关能力
- 媒体与文章存在关联关系

## 当前开发约束

1. 新功能优先沿用 REST 接口，不再引入旧的 GraphQL 设想。
2. 文档中的端口以 `3001 / 3002 / 3003` 为准。
3. 多租户逻辑应继续收敛，避免把初始化副作用放在请求链路中。
4. 后台和前台都应围绕 API 服务开发，不直接绕过后端访问数据库。
