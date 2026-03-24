# CMS Web Admin

CMS 后台管理系统

## 技术栈

- **框架**: Next.js 15 (App Router)
- **样式**: TailwindCSS 4
- **UI组件**: Shadcn/ui (待集成)
- **状态**: TanStack Query + Zustand
- **表单**: React Hook Form + Zod
- **TypeScript**: 严格模式

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build

# 启动生产服务器
pnpm start
```

## 目录结构

```
app/
├── (auth)/          # 认证路由组
│   ├── login/       # 登录页
│   └── layout.tsx   # 认证布局
├── (admin)/         # 管理路由组（需认证）
│   ├── layout.tsx   # 后台布局（含侧边栏、顶栏）
│   ├── page.tsx     # 仪表盘
│   ├── articles/    # 文章管理
│   ├── categories/  # 分类管理
│   ├── tags/        # 标签管理
│   ├── media/       # 媒体库
│   ├── users/       # 用户管理
│   └── settings/    # 系统设置
├── layout.tsx       # 根布局
└── middleware.ts    # 认证中间件

components/
├── ui/              # Shadcn/ui 组件
└── admin/           # 后台组件
    ├── sidebar.tsx  # 侧边栏
    ├── header.tsx   # 顶栏
    └── data-table.tsx # 数据表格

lib/
├── api-client.ts    # API 客户端
└── auth.ts          # 认证工具

stores/
└── ui-store.ts      # Zustand store

styles/
└── globals.css      # 全局样式
```

## 功能

### 已完成
- ✅ 基础布局（侧边栏、顶栏）
- ✅ 登录页面
- ✅ 仪表盘页面
- ✅ 文章管理（列表、新建、编辑）
- ✅ 分类管理
- ✅ 标签管理
- ✅ 媒体库
- ✅ 用户管理
- ✅ 系统设置
- ✅ 认证中间件

### 待完成
- [ ] 集成 Shadcn/ui 组件
- [ ] 完善表单验证
- [ ] 实现真实登录逻辑
- [ ] API 对接
- [ ] 数据表格分页、排序
- [ ] 图片上传功能

## 认证

当前使用简单的 localStorage 认证，未认证用户访问 `/admin/*` 路由会被重定向到 `/login`。

后续需要对接真实 API 和 JWT 认证。

## 端口

开发端口: `3002`

## 注意事项

- 所有管理路由都在 `/admin/*` 下
- 使用 Zustand 管理 UI 状态
- 共享 `@cms/types` 包中的类型定义
