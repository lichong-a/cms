# Prisma Schema 设计文档

## 概述

本文档说明 CMS 系统的 Prisma Schema 设计，基于 PostgreSQL 18 (TimescaleDB)。

## 数据库连接

```bash
DATABASE_URL="postgresql://${RIC_PG_USER}:${RIC_PG_PASSWORD}@${RIC_PG_IP}:${RIC_PG_PORT}/cms?schema=public"
```

## Schema 结构

### 1. 用户认证系统

#### User（用户表）
- **字段**:
  - `id`: 自增主键
  - `username`: 用户名（唯一，50字符）
  - `email`: 邮箱（唯一，100字符）
  - `passwordHash`: 密码哈希
  - `avatarUrl`: 头像URL（可选）
  - `isActive`: 激活状态（默认 true）
  - `metadata`: JSONB 扩展字段
  - `deletedAt`: 软删除时间戳

- **关系**:
  - 一对多：UserRole, Article, Comment, Media
  - 工作流关系：WorkflowInstance (创建者/审批者)

- **索引**: username, email, isActive

#### Role（角色表）
- **字段**:
  - `id`: 自增主键
  - `name`: 角色名（唯一）
  - `description`: 描述

- **关系**: 一对多 UserRole, RolePermission

#### Permission（权限表）
- **字段**:
  - `id`: 自增主键
  - `name`: 权限名（唯一）
  - `description`: 描述

- **关系**: 一对多 RolePermission

#### UserRole（用户角色关联表）
- **复合主键**: [userId, roleId]
- **级联删除**: 删除用户或角色时自动删除关联

#### RolePermission（角色权限关联表）
- **复合主键**: [roleId, permissionId]
- **级联删除**: 删除角色或权限时自动删除关联

---

### 2. 内容管理系统

#### Article（文章表）
- **字段**:
  - `id`: 自增主键
  - `title`: 标题（255字符）
  - `slug`: URL 别名（唯一）
  - `status`: 状态枚举（DRAFT, PENDING, PUBLISHED, ARCHIVED, SCHEDULED）
  - `content`: JSONB 内容
  - `metadata`: JSONB 元数据
  - `excerpt`: 摘要（可选）
  - `thumbnail`: 缩略图（可选）
  - `publishedAt`: 发布时间（可选）
  - `deletedAt`: 软删除时间戳

- **关系**:
  - 多对一：User (作者), Category
  - 一对多：ArticleTag, Comment, ArticleVersion, ArticleField, ArticleMedia
  - 一对一：WorkflowInstance

- **索引**: status, authorId, categoryId, publishedAt, deletedAt, slug

#### ArticleVersion（文章版本表）
- **字段**:
  - `id`: 自增主键
  - `articleId`: 关联文章ID
  - `version`: 版本号
  - `title`: 标题
  - `content`: JSONB 内容
  - `metadata`: JSONB 元数据
  - `description`: 版本描述
  - `isCurrent`: 是否当前版本

- **关系**: 多对一 Article, User (作者)

- **索引**: articleId, isCurrent, createdAt

#### ArticleField（文章字段表）
- **字段**:
  - `id`: 自增主键
  - `articleId`: 关联文章ID
  - `fieldName`: 字段名
  - `fieldType`: 字段类型
  - `fieldValue`: 字段值
  - `fieldData`: JSONB 字段数据

- **关系**: 多对一 Article

- **索引**: articleId, fieldName

#### Category（分类表）
- **字段**:
  - `id`: 自增主键
  - `name`: 分类名（唯一）
  - `slug`: URL 别名（唯一）
  - `description`: 描述
  - `parentId`: 父分类ID（支持树形结构）
  - `sortOrder`: 排序

- **关系**:
  - 自引用：parent/children（树形结构）
  - 一对多：Article

- **索引**: name, slug, parentId

#### Tag（标签表）
- **字段**:
  - `id`: 自增主键
  - `name`: 标签名（唯一）
  - `slug`: URL 别名（唯一）

- **关系**: 多对多 Article (通过 ArticleTag)

- **索引**: name, slug

#### ArticleTag（文章标签关联表）
- **复合主键**: [articleId, tagId]
- **级联删除**: 删除文章或标签时自动删除关联

#### Comment（评论表）
- **字段**:
  - `id`: 自增主键
  - `content`: 评论内容
  - `status`: 状态枚举（PENDING, APPROVED, SPAM, DELETED）
  - `parentId`: 父评论ID（支持嵌套）
  - `deletedAt`: 软删除时间戳

- **关系**:
  - 多对一：Article, User
  - 自引用：parent/children（嵌套评论）

- **索引**: articleId, authorId, status, deletedAt

#### ArticleMedia（文章媒体关联表）
- **复合主键**: [articleId, mediaId]
- **字段**:
  - `sortOrder`: 排序
  - `position`: 位置（body, header, footer）

- **级联删除**: 删除文章或媒体时自动删除关联

---

### 3. 媒体库系统

#### Media（媒体文件表）
- **字段**:
  - `id`: 自增主键
  - `filename`: 文件名
  - `originalName`: 原始文件名
  - `mimeType`: MIME 类型
  - `size`: 文件大小（字节）
  - `storagePath`: 存储路径
  - `thumbnailPath`: 缩略图路径（可选）
  - `metadata`: JSONB 元数据
  - `deletedAt`: 软删除时间戳

- **关系**: 多对一 User (上传者), 多对多 Article (通过 ArticleMedia)

- **索引**: uploaderId, createdAt, deletedAt, mimeType

---

### 4. 工作流系统

#### WorkflowInstance（工作流实例表）
- **字段**:
  - `id`: 自增主键
  - `articleId`: 关联文章ID（唯一）
  - `currentState`: 当前状态（默认 "draft"）
  - `nextState`: 下一个状态
  - `workflowType`: 工作流类型（默认 "content"）
  - `dueAt`: 截止时间（可选）

- **关系**:
  - 一对一：Article
  - 多对一：User (创建者), User (审批者)
  - 一对多：WorkflowLog

- **索引**: articleId, currentState, creatorId, approverId

#### WorkflowLog（工作流日志表）
- **字段**:
  - `id`: 自增主键
  - `workflowInstanceId`: 关联工作流实例ID
  - `previousState`: 变更前状态
  - `newState`: 变更后状态
  - `reason`: 变更原因

- **关系**: 多对一 WorkflowInstance, User (操作者)

- **索引**: workflowInstanceId, actorId, createdAt

---

### 5. 配置系统（重点）

#### SystemConfig（系统配置表）
- **字段**:
  - `id`: 自增主键
  - `configGroup`: 配置分组（basic, theme, layout, feature, seo, notification）
  - `configKey`: 配置键
  - `configValue`: 配置值（JSONB）
  - `displayName`: 显示名称
  - `description`: 描述
  - `inputType`: 输入类型（text, textarea, number, color, image, select, switch, json）
  - `inputOptions`: 输入选项（JSONB）
  - `validationRules`: 验证规则（JSONB）
  - `sortOrder`: 排序
  - `isActive`: 激活状态

- **唯一约束**: [configGroup, configKey]
- **索引**: configGroup, configKey

#### Theme（主题配置表）
- **字段**:
  - `id`: 自增主键
  - `name`: 主题标识（唯一）
  - `displayName`: 显示名称
  - `description`: 描述
  - `previewImage`: 预览图URL
  - `config`: 主题配置（JSONB）
    - 包含：colors, typography, spacing, borderRadius, shadows, animations
  - `isActive`: 是否激活
  - `isBuiltin`: 是否内置主题

- **索引**: name, isActive

#### Menu（导航菜单表）
- **字段**:
  - `id`: 自增主键
  - `name`: 菜单名称
  - `displayName`: 显示名称
  - `location`: 位置（header, footer, sidebar）
  - `items`: 菜单项（JSONB 数组）
    - 结构：id, label, url, icon, target, children
  - `isActive`: 激活状态
  - `sortOrder`: 排序

- **索引**: location, isActive

#### PageLayout（页面布局表）
- **字段**:
  - `id`: 自增主键
  - `pageType`: 页面类型（唯一）
    - home, article, category, tag, search, author
  - `pageName`: 页面名称
  - `layoutConfig`: 布局配置（JSONB）
    - 包含：container, sidebar, content
  - `components`: 组件配置（JSONB 数组）
  - `isActive`: 激活状态

- **索引**: pageType

#### Widget（小部件表）
- **字段**:
  - `id`: 自增主键
  - `name`: 标识（唯一）
  - `displayName`: 显示名称
  - `widgetType`: 类型（recent_posts, categories, tags, search, custom_html）
  - `config`: 配置（JSONB）
  - `showTitle`: 显示标题
  - `customClass`: 自定义CSS类
  - `location`: 位置（sidebar, footer, header, custom）
  - `sortOrder`: 排序
  - `visibilityRules`: 可见性规则（JSONB）
    - show_on_pages, hide_on_pages, user_roles
  - `isActive`: 激活状态

- **索引**: name, location, isActive

---

## 枚举类型

### ArticleStatus（文章状态）
- `DRAFT`: 草稿
- `PENDING`: 待审核
- `PUBLISHED`: 已发布
- `ARCHIVED`: 已归档
- `SCHEDULED`: 定时发布

### CommentStatus（评论状态）
- `PENDING`: 待审核
- `APPROVED`: 已批准
- `SPAM`: 垃圾评论
- `DELETED`: 已删除

---

## PostgreSQL 特性使用

### 1. JSONB 字段
广泛使用 JSONB 存储灵活数据：
- User.metadata: 用户扩展属性
- Article.content: 文章内容结构
- Article.metadata: 文章元数据
- SystemConfig.configValue: 配置值
- Theme.config: 主题配置
- Menu.items: 菜单项
- PageLayout.layoutConfig: 布局配置
- Widget.config: 小部件配置

### 2. 索引优化
- 为所有外键字段添加索引
- 为常用查询字段添加索引
- 为唯一约束字段自动创建唯一索引
- 为软删除字段添加索引（deletedAt）

### 3. 级联删除
- 用户角色关联：CASCADE
- 角色权限关联：CASCADE
- 文章标签关联：CASCADE
- 评论：CASCADE（删除文章时删除所有评论）
- 工作流实例：CASCADE

### 4. 软删除
- User, Article, Comment, Media 使用 `deletedAt` 字段
- 允许数据恢复和审计

---

## 使用指南

### 1. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 创建迁移
npx prisma migrate dev --name init

# 或直接推送 schema（开发环境）
npx prisma db push
```

### 2. 查询示例

#### 获取用户及其角色

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    roles: {
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    }
  }
});
```

#### 获取文章及关联数据

```typescript
const article = await prisma.article.findUnique({
  where: { slug: 'article-slug' },
  include: {
    author: true,
    category: true,
    tags: {
      include: {
        tag: true
      }
    },
    comments: {
      where: { status: 'APPROVED' },
      include: {
        author: true
      }
    }
  }
});
```

#### 获取系统配置

```typescript
const configs = await prisma.systemConfig.findMany({
  where: {
    configGroup: 'basic',
    isActive: true
  },
  orderBy: {
    sortOrder: 'asc'
  }
});
```

### 3. 创建示例

#### 创建文章

```typescript
const article = await prisma.article.create({
  data: {
    title: 'My First Article',
    slug: 'my-first-article',
    status: 'DRAFT',
    content: {
      body: 'Article content...',
      blocks: []
    },
    author: {
      connect: { id: 1 }
    },
    category: {
      connect: { id: 1 }
    },
    tags: {
      create: [
        { tag: { connect: { id: 1 } } },
        { tag: { connect: { id: 2 } } }
      ]
    }
  }
});
```

#### 创建工作流

```typescript
const workflow = await prisma.workflowInstance.create({
  data: {
    article: {
      connect: { id: 1 }
    },
    currentState: 'draft',
    creator: {
      connect: { id: 1 }
    }
  }
});
```

---

## 性能优化建议

### 1. 查询优化
- 使用 `select` 只选择需要的字段
- 使用 `include` 预加载关联数据，避免 N+1 查询
- 使用分页（`skip` + `take`）处理大量数据

### 2. 索引优化
- 为常用查询条件添加索引
- 为排序字段添加索引
- 为全文搜索字段添加索引（PostgreSQL fullTextSearch）

### 3. 缓存策略
- 缓存常用配置（SystemConfig, Theme）
- 缓存热门文章和分类
- 使用 Redis 缓存查询结果

---

## 迁移和版本管理

### 创建迁移

```bash
# 创建新迁移
npx prisma migrate dev --name add_custom_fields

# 应用迁移到生产环境
npx prisma migrate deploy
```

### 重置数据库

```bash
# 警告：会删除所有数据！
npx prisma migrate reset
```

---

## 扩展建议

### 1. 添加全文搜索

```typescript
// 在 Article 模型中添加全文搜索索引
@@index([title, content], type: Gin)
```

### 2. 添加分区策略（TimescaleDB）

```sql
-- 按时间分区文章表
SELECT create_hypertable('articles', 'created_at',
    chunk_time_interval => INTERVAL '1 month');
```

### 3. 添加审计日志

可以考虑添加通用的审计日志表，记录所有数据变更。

---

## 总结

本 Schema 设计涵盖了：
- ✅ 完整的用户权限系统（RBAC）
- ✅ 灵活的内容管理系统（支持版本控制）
- ✅ 强大的媒体库系统
- ✅ 可配置的工作流系统
- ✅ 高度可定制的配置系统（重点）
- ✅ PostgreSQL 特性（JSONB, 索引, 软删除）
- ✅ 性能优化（索引, 关系映射）
- ✅ 数据安全（级联删除, 软删除）

所有模型都遵循：
- 命名规范（snake_case for database, camelCase for Prisma）
- 时间戳（createdAt, updatedAt）
- 必要的索引
- 合理的默认值
- 完整的关系映射
