# CMS 内容管理系统

一个基于 `pnpm` monorepo 的内容管理系统，包含前台展示、后台管理和独立 API 服务。

## 当前基线

- 前台应用: `apps/web-frontend`，Next.js 15，端口 `3001`
- 后台应用: `apps/web-admin`，Next.js 15，端口 `3002`
- API 服务: `apps/api`，Express 5 + Prisma，端口 `3003`
- 共享包: `packages/types`、`packages/utils`、`packages/config`
- 测试: Vitest + Playwright

当前仓库已经有一批页面、路由和测试，但文档与脚本曾有漂移。本 README 以当前代码事实为准。

## 快速开始

### 前置要求

- Node.js `>= 22`
- pnpm `>= 10`
- PostgreSQL
- Redis

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

```bash
cp .env.example .env 2>/dev/null || true
cp apps/api/.env.example apps/api/.env 2>/dev/null || true
```

前端应用如需补充变量，请直接参考各自目录中的现有 `.env.local` 文件。

### 启动开发环境

```bash
pnpm dev
```

也可以分别启动：

```bash
pnpm dev:frontend
pnpm dev:admin
pnpm dev:api
```

### 常用命令

```bash
pnpm build
pnpm test
pnpm test:e2e
pnpm lint
pnpm typecheck
```

## 访问地址

- 前台: `http://localhost:3001`
- 后台: `http://localhost:3002`
- API: `http://localhost:3003`
- Swagger: `http://localhost:3003/api/docs`

## 项目结构

```text
cms/
├── apps/
│   ├── api/
│   ├── web-admin/
│   └── web-frontend/
├── packages/
│   ├── config/
│   ├── types/
│   └── utils/
├── docs/
└── tests/
```

## 文档

- [架构说明](./docs/architecture.md)
- [部署指南](./docs/DEPLOYMENT.md)
- [任务清单](./docs/TODO.md)
- [Prisma Schema 设计](./docs/PRISMA_SCHEMA_GUIDE.md)
- [多租户 Schema 设计](./docs/TENANT_SCHEMA.md)

历史规划、审查和设计过程材料已归档到 [`docs/archive/`](./docs/archive)。

## 当前开发建议

建议按下面顺序推进：

1. 先稳定鉴权、租户、dashboard 和主链路回归
2. 再完成后台内容管理闭环：文章、分类、标签、媒体
3. 然后做前台展示与 SEO 基础项
4. 最后再推进缓存、监控、CI/CD 等工程化增强

功能继续扩展前，优先保证脚本、文档、环境变量和测试链路一致。
