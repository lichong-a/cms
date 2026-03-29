# CMS Web Frontend

前台展示应用 - 基于 Next.js 15 和 Shadcn/ui

## 技术栈

- **框架**: Next.js 15 (App Router)
- **样式**: TailwindCSS 4
- **UI 组件**: Shadcn/ui
- **状态管理**: TanStack Query
- **语言**: TypeScript (严格模式)

## 开始使用

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

应用将在 [http://localhost:3001](http://localhost:3001) 启动

### 构建

```bash
pnpm build
```

### 生产模式

```bash
pnpm start
```

## 目录结构

```
apps/web-frontend/
├── app/                    # Next.js App Router
│   ├── (public)/          # 前台路由组
│   │   ├── layout.tsx     # 前台布局
│   │   ├── page.tsx       # 首页
│   │   ├── articles/      # 文章详情页
│   │   ├── categories/    # 分类页
│   │   └── tags/          # 标签页
│   └── layout.tsx         # 根布局
├── components/
│   ├── ui/                # Shadcn/ui 组件
│   └── public/            # 前台业务组件
├── lib/
│   ├── api-client.ts      # API 客户端
│   └── utils.ts           # 工具函数
├── styles/
│   └── globals.css        # 全局样式
└── public/                # 静态资源
```

## 环境变量

在 `.env.local` 中配置:

```env
NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1
ALLOWED_DEV_ORIGINS=
```

`ALLOWED_DEV_ORIGINS` 仅在需要局域网调试 Next 开发服务器时填写，多个值用逗号分隔。

默认情况下建议不要写死 `NEXT_PUBLIC_API_URL`：

- 浏览器端会自动使用当前访问主机推导 API 地址
- SSR 默认访问 `localhost:3003`
- 容器或反向代理场景可使用 `API_INTERNAL_URL` 指定服务端内部地址

## 功能特性

- ✅ SEO 优化 (Metadata API)
- ✅ 响应式设计
- ✅ 深色模式支持
- ✅ TypeScript 类型安全
- ✅ 代码分割和懒加载

## 共享包

本应用使用 monorepo 共享以下包:

- `@cms/types` - 共享类型定义
- `@cms/utils` - 共享工具函数

## 添加新页面

1. 在 `app/(public)/` 下创建新目录
2. 添加 `page.tsx` 文件
3. 实现页面组件和 metadata

## 添加新组件

### UI 组件 (Shadcn/ui)

```bash
npx shadcn@latest add <component-name>
```

### 业务组件

在 `components/public/` 下创建新组件

## 注意事项

- 使用 Next.js 15 App Router (不是 Pages Router)
- 所有组件使用 Server Components (除非需要交互)
- 使用 Metadata API 进行 SEO 优化
- 遵循 TailwindCSS 最佳实践
