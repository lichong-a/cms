# CMS 共享类型包

CMS 系统的 TypeScript 类型定义包，提供完整的类型系统支持。

## 特性

- ✅ **完整的类型定义** - 覆盖用户、内容、媒体、配置、API 等所有模块
- ✅ **TypeScript 5.x 支持** - 使用最新的 TypeScript 特性
- ✅ **Strict Mode** - 严格类型检查
- ✅ **JSDoc 注释** - 详细的文档注释
- ✅ **枚举支持** - 状态、类型等枚举定义
- ✅ **工具类型** - CreateInput、UpdateInput 等便捷类型

## 安装

```bash
npm install @cms/types
# 或
yarn add @cms/types
# 或
pnpm add @cms/types
```

## 使用方法

### 基础导入

```typescript
import { User, Article, ApiResponse, ArticleStatus } from '@cms/types';
```

### 用户相关

```typescript
import { User, Role, Permission, UserWithRoles } from '@cms/types';

// 创建用户输入
const user: User = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  passwordHash: '...',
  isActive: true,
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 带角色和权限的用户
const userWithRoles: UserWithRoles = {
  ...user,
  roles: [{ id: 1, name: 'admin', description: '管理员' }],
  permissions: [{ id: 1, name: 'content:create', description: '创建内容' }],
};
```

### 内容相关

```typescript
import { Article, ArticleStatus, Content, ContentStatus } from '@cms/types';

// 文章
const article: Article = {
  id: 1,
  title: '文章标题',
  slug: 'article-slug',
  status: ArticleStatus.PUBLISHED,
  content: {},
  metadata: {},
  authorId: 1,
  excerpt: '文章摘要',
  categoryId: 1,
  tags: [1, 2, 3],
  viewCount: 100,
  likeCount: 10,
  commentCount: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 使用枚举
if (article.status === ArticleStatus.PUBLISHED) {
  console.log('文章已发布');
}
```

### 配置相关（重点）

```typescript
import { 
  SystemConfig, 
  Theme, 
  ThemeConfig, 
  Menu, 
  MenuItem,
  PageLayout,
  Widget 
} from '@cms/types';

// 系统配置
const config: SystemConfig = {
  id: 1,
  configGroup: 'basic',
  configKey: 'site_name',
  configValue: '我的博客',
  displayName: '网站名称',
  inputType: 'text',
  sortOrder: 1,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 主题配置
const theme: Theme = {
  id: 1,
  name: 'default',
  displayName: '默认主题',
  config: {
    colors: {
      primary: '#F97316',
      secondary: '#6366F1',
      background: '#FFFFFF',
      text: '#1F2937',
    },
    typography: {
      fontFamily: 'Inter',
      fontSizeBase: 16,
    },
  },
  isActive: true,
  isBuiltin: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 菜单
const menu: Menu = {
  id: 1,
  name: 'main-nav',
  displayName: '主导航',
  location: 'header',
  items: [
    {
      id: 'home',
      label: '首页',
      url: '/',
      icon: 'home',
    },
  ],
  isActive: true,
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 小部件
const widget: Widget = {
  id: 1,
  name: 'recent-posts',
  displayName: '最新文章',
  widgetType: 'recent_posts',
  config: { limit: 5 },
  showTitle: true,
  location: 'sidebar',
  sortOrder: 1,
  visibilityRules: {
    showOnPages: ['home', 'category'],
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

### API 响应

```typescript
import { ApiResponse, PaginatedResponse, ErrorCode } from '@cms/types';

// 单个资源响应
const response: ApiResponse<Article> = {
  success: true,
  data: article,
  meta: {
    timestamp: new Date(),
  },
};

// 分页响应
const paginatedResponse: PaginatedResponse<Article> = {
  success: true,
  data: [article1, article2],
  meta: {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5,
    hasNext: true,
    hasPrev: false,
    timestamp: new Date(),
  },
};

// 错误响应
const errorResponse: ApiResponse<never> = {
  success: false,
  error: {
    code: ErrorCode.CONTENT_NOT_FOUND,
    message: '内容不存在',
    details: { id: 123 },
  },
  meta: {
    timestamp: new Date(),
  },
};
```

### 工具类型

```typescript
import { CreateInput, UpdateInput, DeepPartial } from '@cms/types';

// 创建输入（自动排除 id、时间戳等）
type CreateArticleInput = CreateInput<Article>;
// 等价于: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>

// 更新输入（所有字段可选）
type UpdateArticleInput = UpdateInput<Article>;
// 等价于: DeepPartial<CreateInput<Article>>

// 使用示例
const createInput: CreateArticleInput = {
  title: '新文章',
  slug: 'new-article',
  // ... 其他必填字段
};

const updateInput: UpdateArticleInput = {
  title: '更新标题', // 只更新需要修改的字段
};
```

## 类型分类

### 用户相关
- `User` - 用户基本信息
- `Role` - 角色信息
- `Permission` - 权限信息
- `UserRole` - 用户角色关联
- `RolePermission` - 角色权限关联
- `UserWithRoles` - 带角色和权限的用户

### 内容相关
- `Content` - 通用内容
- `ContentVersion` - 内容版本
- `ContentField` - 内容自定义字段
- `Article` - 文章（内容的扩展）
- `Category` - 分类
- `Tag` - 标签
- `ArticleTag` - 文章标签关联
- `Comment` - 评论

### 媒体相关
- `Media` - 媒体文件
- `MediaMetadata` - 媒体元数据
- `MediaType` - 媒体类型
- `ContentMedia` - 内容媒体关联

### 配置相关（重点）
- `SystemConfig` - 系统配置项
- `ConfigGroup` - 配置分组
- `Theme` - 主题信息
- `ThemeConfig` - 主题配置
- `Menu` - 菜单信息
- `MenuItem` - 菜单项
- `PageLayout` - 页面布局
- `LayoutConfig` - 布局配置
- `Widget` - 小部件
- `WidgetConfig` - 小部件配置

### API 相关
- `ApiResponse<T>` - API 通用响应
- `PaginatedResponse<T>` - 分页响应
- `ApiError` - API 错误信息
- `ErrorCode` - 错误码枚举
- `PaginationParams` - 分页请求参数

### 工作流相关
- `WorkflowInstance` - 工作流实例
- `WorkflowLog` - 工作流日志

## 枚举列表

- `ArticleStatus` - 文章状态（draft | published | archived）
- `ContentStatus` - 内容状态
- `CommentStatus` - 评论状态
- `MediaType` - 媒体类型
- `ConfigInputType` - 配置输入类型
- `MenuLocation` - 菜单位置
- `WidgetType` - 小部件类型
- `ErrorCode` - 错误码

## 开发指南

### 构建类型包

```bash
# 编译 TypeScript
npm run build

# 类型检查
npm run type-check
```

### 发布

```bash
# 发布到 npm
npm publish
```

## 注意事项

1. **严格模式**: 所有类型都基于 TypeScript strict mode，确保类型安全
2. **可扩展性**: 使用 JSONB 字段支持灵活扩展
3. **文档化**: 所有类型都有 JSDoc 注释，提供 IDE 提示
4. **向后兼容**: 修改类型时注意向后兼容性

## 许可证

MIT

## 维护者

CMS 开发团队
