# CMS 类型定义摘要

本文档总结了 `@cms/types` 包中定义的所有类型。

## 📦 类型统计

- **总类型数**: 70+
- **枚举数**: 8
- **接口数**: 60+
- **工具类型**: 5

## 🎯 类型分类

### 1. 枚举 (Enums)

| 枚举名 | 用途 | 值 |
|--------|------|-----|
| `ArticleStatus` | 文章状态 | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `ContentStatus` | 内容状态 | `DRAFT`, `PUBLISHED`, `ARCHIVED`, `DELETED` |
| `CommentStatus` | 评论状态 | `PENDING`, `APPROVED`, `SPAM`, `TRASH` |
| `ConfigInputType` | 配置输入类型 | `TEXT`, `TEXTAREA`, `NUMBER`, `COLOR`, `IMAGE`, `SELECT`, `SWITCH`, `JSON` 等 |
| `MenuLocation` | 菜单位置 | `HEADER`, `FOOTER`, `SIDEBAR`, `CUSTOM` |
| `WidgetType` | 小部件类型 | `RECENT_POSTS`, `CATEGORIES`, `TAGS`, `SEARCH` 等 |
| `ErrorCode` | 错误码 | `UNKNOWN_ERROR`, `UNAUTHORIZED`, `NOT_FOUND` 等 |
| `PageType` | 页面类型 | `HOME`, `ARTICLE`, `CATEGORY`, `TAG`, `SEARCH` 等 |

### 2. 用户相关 (User)

| 类型名 | 说明 | 关键字段 |
|--------|------|----------|
| `User` | 用户基本信息 | `id`, `username`, `email`, `passwordHash`, `isActive` |
| `Role` | 角色信息 | `id`, `name`, `description` |
| `Permission` | 权限信息 | `id`, `name`, `description` |
| `UserRole` | 用户角色关联 | `userId`, `roleId` |
| `RolePermission` | 角色权限关联 | `roleId`, `permissionId` |
| `UserWithRoles` | 带角色的用户 | 继承 `User` + `roles`, `permissions` |

### 3. 内容相关 (Content)

| 类型名 | 说明 | 关键字段 |
|--------|------|----------|
| `Content` | 通用内容 | `id`, `title`, `slug`, `status`, `content` (JSONB), `metadata` |
| `ContentVersion` | 内容版本 | `id`, `contentId`, `version`, `isCurrent` |
| `ContentField` | 自定义字段 | `id`, `contentId`, `fieldName`, `fieldType`, `fieldValue` |
| `Article` | 文章 | 继承 `Content` + `excerpt`, `coverImage`, `categoryId`, `tags` |
| `Category` | 分类 | `id`, `name`, `slug`, `parentId`, `sortOrder` |
| `Tag` | 标签 | `id`, `name`, `slug`, `description` |
| `ArticleTag` | 文章标签关联 | `articleId`, `tagId` |
| `Comment` | 评论 | `id`, `content`, `postId`, `authorId`, `parentId`, `status` |

### 4. 媒体相关 (Media)

| 类型名 | 说明 | 关键字段 |
|--------|------|----------|
| `Media` | 媒体文件 | `id`, `filename`, `mimeType`, `size`, `storagePath`, `metadata` |
| `MediaMetadata` | 媒体元数据 | `width`, `height`, `duration`, `format`, `alt` |
| `MediaTypeConfig` | 媒体类型配置 | `id`, `name`, `mimeType`, `extensions`, `maxSize` |
| `ContentMedia` | 内容媒体关联 | `contentId`, `mediaId`, `sortOrder`, `position` |

### 5. 配置相关 (Configuration) - 重点

| 类型名 | 说明 | 关键字段 |
|--------|------|----------|
| `SystemConfig` | 系统配置项 | `id`, `configGroup`, `configKey`, `configValue`, `inputType` |
| `ConfigGroup` | 配置分组 | `'basic'`, `'theme'`, `'layout'`, `'feature'`, `'seo'` 等 |
| `ValidationRules` | 验证规则 | `required`, `minLength`, `maxLength`, `pattern` |
| `Theme` | 主题信息 | `id`, `name`, `displayName`, `config`, `isActive`, `isBuiltin` |
| `ThemeConfig` | 主题配置 | `colors`, `typography`, `spacing`, `borderRadius`, `shadows`, `animations` |
| `ThemeColors` | 主题颜色 | `primary`, `secondary`, `background`, `text`, `success`, `warning`, `error` |
| `ThemeTypography` | 主题字体 | `fontFamily`, `fontSizeBase`, `fontWeightBase`, `lineHeight` |
| `Menu` | 菜单信息 | `id`, `name`, `displayName`, `location`, `items` |
| `MenuItem` | 菜单项 | `id`, `label`, `url`, `icon`, `target`, `children` |
| `PageLayout` | 页面布局 | `id`, `pageType`, `pageName`, `layoutConfig`, `components` |
| `LayoutConfig` | 布局配置 | `container`, `sidebar`, `content` |
| `SidebarConfig` | 侧边栏配置 | `enabled`, `position`, `width`, `sticky`, `widgets` |
| `ContentConfig` | 内容区域配置 | `width`, `padding` |
| `PageComponent` | 页面组件 | `id`, `name`, `type`, `config`, `position`, `isActive` |
| `Widget` | 小部件 | `id`, `name`, `widgetType`, `config`, `location`, `visibilityRules` |
| `WidgetConfig` | 小部件配置 | 动态配置对象 |
| `VisibilityRules` | 可见性规则 | `showOnPages`, `hideOnPages`, `userRoles`, `devices` |

### 6. API 相关 (API)

| 类型名 | 说明 | 关键字段 |
|--------|------|----------|
| `ApiResponse<T>` | API 通用响应 | `success`, `data`, `error`, `meta` |
| `PaginatedResponse<T>` | 分页响应 | 继承 `ApiResponse<T[]>` + `meta` |
| `ApiError` | API 错误 | `code`, `message`, `details`, `stack` |
| `ResponseMeta` | 响应元数据 | `timestamp`, `requestId` |
| `PaginationMeta` | 分页元数据 | 继承 `ResponseMeta` + `page`, `limit`, `total`, `hasNext`, `hasPrev` |
| `PaginationParams` | 分页请求参数 | `page`, `limit`, `sortBy`, `sortOrder` |

### 7. 工作流相关 (Workflow)

| 类型名 | 说明 | 关键字段 |
|--------|------|----------|
| `WorkflowInstance` | 工作流实例 | `id`, `contentId`, `currentState`, `nextState`, `workflowType` |
| `WorkflowLog` | 工作流日志 | `id`, `workflowInstanceId`, `previousState`, `newState`, `actorId` |

### 8. 工具类型 (Utility Types)

| 类型名 | 说明 | 用途 |
|--------|------|------|
| `DeepPartial<T>` | 递归可选 | 所有属性递归变为可选 |
| `Timestamp` | 时间戳 | `Date`, `string`, `number` |
| `CreateInput<T>` | 创建输入 | 排除 `id`, `createdAt`, `updatedAt`, `deletedAt` |
| `UpdateInput<T>` | 更新输入 | `DeepPartial<CreateInput<T>>` |
| `ID` | ID 类型 | `number`, `string` |
| `JSONValue` | JSON 值 | JSON 支持的所有值类型 |
| `JSONObject` | JSON 对象 | 键值对对象 |
| `JSONArray` | JSON 数组 | 值数组 |

## 🔥 重点类型详解

### ThemeConfig - 主题配置

```typescript
interface ThemeConfig {
  colors: ThemeColors;         // 颜色配置
  typography: ThemeTypography; // 字体配置
  spacing: ThemeSpacing;       // 间距配置
  borderRadius: ThemeBorderRadius; // 圆角配置
  shadows: ThemeShadows;       // 阴影配置
  animations: ThemeAnimations; // 动画配置
}
```

### SystemConfig - 系统配置

```typescript
interface SystemConfig {
  configGroup: ConfigGroup;    // 配置分组
  configKey: string;           // 配置键
  configValue: any;            // 配置值（JSON）
  inputType: ConfigInputType;  // 输入类型
  validationRules?: ValidationRules; // 验证规则
}
```

### Widget - 小部件

```typescript
interface Widget {
  widgetType: WidgetType;      // 小部件类型
  config: WidgetConfig;        // 配置
  location: WidgetLocation;    // 位置
  visibilityRules: VisibilityRules; // 可见性规则
}
```

## 📝 使用示例

```typescript
import { 
  Article, 
  ContentStatus, 
  SystemConfig, 
  ApiResponse,
  CreateInput 
} from '@cms/types';

// 创建文章
const article: Article = { /* ... */ };

// API 响应
const response: ApiResponse<Article> = {
  success: true,
  data: article,
};

// 创建输入
const input: CreateInput<Article> = {
  title: 'New Article',
  // ...
};
```

## 🎨 设计原则

1. **类型安全**: 使用 TypeScript strict mode
2. **可扩展性**: 使用 JSONB 字段支持灵活扩展
3. **文档化**: 所有类型都有 JSDoc 注释
4. **一致性**: 命名和结构保持一致
5. **实用性**: 提供工具类型简化使用

## 📚 参考资料

- [CONFIGURATION_DESIGN.md](../../docs/CONFIGURATION_DESIGN.md) - 可配置化设计
- [PRISMA_SCHEMA_GUIDE.md](../../docs/PRISMA_SCHEMA_GUIDE.md) - 当前 Prisma Schema 设计

---

**维护者**: CMS 开发团队  
**更新时间**: 2026-03-11
