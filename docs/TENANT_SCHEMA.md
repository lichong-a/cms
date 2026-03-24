# 多租户 Schema 设计

## 1. 概述

### 设计目标

- **数据隔离**：确保不同租户的数据完全隔离，防止数据泄露
- **可扩展性**：支持数千个租户，每个租户可有独立配置
- **性能优化**：通过索引策略确保查询性能
- **易维护性**：清晰的租户识别机制，便于开发和调试

### 适用场景

- **SaaS CMS 平台**：多客户共享同一套代码，但数据隔离
- **企业级内容管理**：不同部门或子公司独立管理内容
- **白标解决方案**：为不同品牌提供独立的 CMS 实例

### 隔离策略

采用 **共享数据库 + 租户字段** 的隔离策略：
- 所有租户共享同一数据库
- 通过 `tenantId` 字段实现逻辑隔离
- Prisma 中间件自动注入租户过滤条件

## 2. 数据模型

### 2.1 Tenant 模型

```prisma
model Tenant {
  id        String       @id @default(cuid())
  slug      String       @unique @db.VarChar(50)  // 租户标识（用于 subdomain）
  name      String       @db.VarChar(100)
  logo      String?      @db.VarChar(500)
  config    Json         @default("{}")  // 租户配置（主题、功能开关等）
  status    TenantStatus @default(ACTIVE)
  
  // 关联
  users               User[]
  articles            Article[]
  categories          Category[]
  tags                Tag[]
  media               Media[]
  comments            Comment[]
  tenantConfigs       TenantConfig[]
  articleVersions     ArticleVersion[]
  articleFields       ArticleField[]
  articleTags         ArticleTag[]
  articleMedia        ArticleMedia[]
  workflowInstances   WorkflowInstance[]
  workflowLogs        WorkflowLog[]
  themes              Theme[]
  menus               Menu[]
  pageLayouts         PageLayout[]
  widgets             Widget[]
  
  createdAt  DateTime   @default(now()) @map("created_at")
  updatedAt  DateTime   @updatedAt @map("updated_at")
  
  @@index([slug])
  @@index([status])
  @@map("tenants")
}

enum TenantStatus {
  ACTIVE      // 活跃租户
  SUSPENDED   // 已暂停（欠费/违规）
  TRIAL       // 试用期
  DISABLED    // 已禁用
  
  @@map("tenant_status")
}
```

### 2.2 租户配置字段说明

Tenant 模型的 `config` 字段存储 JSON 格式的配置：

```typescript
interface TenantConfig {
  // 主题配置
  theme: {
    primaryColor: string
    logo?: string
    customCSS?: string
  }
  
  // 功能开关
  features: {
    enableComments: boolean
    enableWorkflows: boolean
    enableMediaLibrary: boolean
    enableVersioning: boolean
    maxStorageMB: number
    maxArticles: number
  }
  
  // 域名配置
  domains: {
    customDomain?: string
    subdomain: string
  }
  
  // SEO 配置
  seo: {
    siteName: string
    siteDescription?: string
    robotsTxt?: string
  }
}
```

### 2.3 需要租户隔离的模型

以下模型需要添加 `tenantId` 字段：

| 模型 | 是否必需 | 说明 |
|------|---------|------|
| User | ✅ 必需 | 用户属于特定租户 |
| Article | ✅ 必需 | 内容隔离的核心 |
| ArticleVersion | ✅ 必需 | 文章版本跟随文章 |
| ArticleField | ✅ 必需 | 自定义字段隔离 |
| ArticleTag | ✅ 必需 | 关联表需要隔离 |
| ArticleMedia | ✅ 必需 | 媒体关联隔离 |
| Category | ✅ 必需 | 分类体系独立 |
| Tag | ✅ 必需 | 标签体系独立 |
| Media | ✅ 必需 | 媒体文件隔离 |
| Comment | ✅ 必需 | 评论跟随文章 |
| TenantConfig | ✅ 必需 | 替代 SystemConfig |
| WorkflowInstance | ✅ 必需 | 工作流实例隔离 |
| WorkflowLog | ✅ 必需 | 工作流日志隔离 |
| Theme | ✅ 必需 | 主题配置独立 |
| Menu | ✅ 必需 | 导航菜单独立 |
| PageLayout | ✅ 必需 | 页面布局独立 |
| Widget | ✅ 必需 | 小部件独立 |
| Role | ❌ 可选 | 可考虑全局角色 + 租户角色 |
| Permission | ❌ 可选 | 权限定义可全局共享 |
| UserRole | ❌ 可选 | 跟随 User 隔离 |

**特殊说明**：
- **Role/Permission**：建议保持全局，由 TenantConfig 控制功能权限
- **UserRole**：通过 User.tenantId 间接隔离

### 2.4 模型更新示例

#### User 模型

```prisma
model User {
  id                Int                @id @default(autoincrement())
  tenantId          String             @map("tenant_id")
  username          String             @db.VarChar(50)
  email             String             @db.VarChar(100)
  passwordHash      String             @db.VarChar(255)
  avatarUrl         String?            @db.VarChar(255)
  isActive          Boolean            @default(true)
  metadata          Json               @default("{}")
  createdAt         DateTime           @default(now()) @map("created_at")
  updatedAt         DateTime           @updatedAt @map("updated_at")
  deletedAt         DateTime?          @map("deleted_at")
  
  // 关联
  tenant            Tenant             @relation(fields: [tenantId], references: [id])
  articleVersions   ArticleVersion[]   @relation("ArticleVersionAuthor")
  articles          Article[]
  comments          Comment[]
  media             Media[]
  roles             UserRole[]
  workflowApprovals WorkflowInstance[] @relation("WorkflowApprover")
  workflowInstances WorkflowInstance[] @relation("WorkflowCreator")
  workflowLogs      WorkflowLog[]

  @@unique([tenantId, username])
  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([tenantId, isActive])
  @@index([tenantId, deletedAt])
  @@map("users")
}
```

#### Article 模型

```prisma
model Article {
  id          Int               @id @default(autoincrement())
  tenantId    String            @map("tenant_id")
  title       String            @db.VarChar(255)
  slug        String            @db.VarChar(255)
  status      ArticleStatus     @default(DRAFT)
  content     Json              @default("{}")
  metadata    Json              @default("{}")
  excerpt     String?
  thumbnail   String?           @db.VarChar(500)
  createdAt   DateTime          @default(now()) @map("created_at")
  updatedAt   DateTime          @updatedAt @map("updated_at")
  publishedAt DateTime?         @map("published_at")
  deletedAt   DateTime?         @map("deleted_at")
  authorId    Int?              @map("author_id")
  categoryId  Int?              @map("category_id")
  
  // 关联
  tenant      Tenant            @relation(fields: [tenantId], references: [id])
  fields      ArticleField[]
  media       ArticleMedia[]
  tags        ArticleTag[]
  versions    ArticleVersion[]
  author      User?             @relation(fields: [authorId], references: [id])
  category    Category?         @relation(fields: [categoryId], references: [id])
  comments    Comment[]
  workflow    WorkflowInstance?

  @@unique([tenantId, slug])
  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, authorId])
  @@index([tenantId, categoryId])
  @@index([tenantId, publishedAt])
  @@index([tenantId, deletedAt])
  @@map("articles")
}
```

## 3. 索引策略

### 3.1 必须索引

每个需要租户隔离的表都必须包含：

```sql
-- 单列索引：租户 ID
CREATE INDEX idx_{table}_tenant_id ON {table}(tenant_id);

-- 唯一约束：租户内唯一字段
CREATE UNIQUE INDEX idx_{table}_tenant_{unique_field} ON {table}(tenant_id, {unique_field});
```

### 3.2 复合索引策略

#### 原则

1. **tenantId 总是第一列**：确保分区裁剪（Partition Pruning）
2. **高频查询字段**：根据业务场景添加
3. **覆盖索引**：包含常用返回字段

#### 核心表索引

**articles 表**
```sql
-- 列表查询（按状态和时间）
CREATE INDEX idx_articles_tenant_status_published 
  ON articles(tenant_id, status, published_at DESC);

-- 作者查询
CREATE INDEX idx_articles_tenant_author 
  ON articles(tenant_id, author_id);

-- 分类查询
CREATE INDEX idx_articles_tenant_category 
  ON articles(tenant_id, category_id);

-- 软删除过滤
CREATE INDEX idx_articles_tenant_deleted 
  ON articles(tenant_id, deleted_at) 
  WHERE deleted_at IS NULL;
```

**users 表**
```sql
-- 租户内用户查询
CREATE INDEX idx_users_tenant_active 
  ON users(tenant_id, is_active) 
  WHERE is_active = true;

-- 软删除过滤
CREATE INDEX idx_users_tenant_deleted 
  ON users(tenant_id, deleted_at) 
  WHERE deleted_at IS NULL;
```

**media_files 表**
```sql
-- 按时间查询媒体
CREATE INDEX idx_media_tenant_created 
  ON media_files(tenant_id, created_at DESC);

-- 按类型查询
CREATE INDEX idx_media_tenant_type 
  ON media_files(tenant_id, mime_type);
```

### 3.3 性能考虑

1. **索引数量控制**：每个表不超过 8 个索引
2. **复合索引顺序**：tenantId → status → 时间字段
3. **部分索引**：对状态字段使用 WHERE 子句
4. **避免过度索引**：低频查询不考虑索引

### 3.4 索引监控

```sql
-- 查询未使用的索引
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

-- 查询缺失索引的外键
SELECT 
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = tc.table_name
      AND indexdef LIKE '%' || kcu.column_name || '%'
  );
```

## 4. 租户识别

### 4.1 识别方式

#### 1. Subdomain 方式（推荐）

```
tenant1.cms.com  → slug: "tenant1"
tenant2.cms.com  → slug: "tenant2"
```

**优点**：
- URL 友好，易于记忆
- SEO 友好，独立域名权重
- 用户体验好

**缺点**：
- 需要 DNS 配置
- 需要 SSL 证书管理
- 本地开发需要 hosts 配置

**实现**：
```typescript
// middleware/tenantResolver.ts
export function extractTenantFromHost(host: string): string | null {
  // 移除端口号
  const hostname = host.split(':')[0]
  
  // 提取子域名
  const parts = hostname.split('.')
  if (parts.length >= 2) {
    return parts[0] // tenant1.cms.com → "tenant1"
  }
  
  return null
}
```

#### 2. Header 方式（API 场景）

```http
GET /api/articles HTTP/1.1
Host: cms.com
X-Tenant-ID: tenant1
```

**优点**：
- 实现简单
- 适合 API 场景
- 无需 DNS 配置

**缺点**：
- 用户无法直接访问
- 需要前端配合
- 不利于 SEO

**实现**：
```typescript
// middleware/tenantResolver.ts
export function extractTenantFromHeader(headers: Headers): string | null {
  return headers.get('x-tenant-id') || headers.get('x-tenant')
}
```

#### 3. Path 方式（可选）

```
cms.com/t/tenant1/articles
cms.com/t/tenant2/articles
```

**优点**：
- 无需 DNS 配置
- 容易测试和调试

**缺点**：
- URL 较长
- 不够直观

**实现**：
```typescript
// middleware/tenantResolver.ts
export function extractTenantFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/t\/([^\/]+)/)
  return match ? match[1] : null
}
```

### 4.2 识别优先级

```
Header (X-Tenant-ID) 
  ↓ (not found)
Subdomain (tenant1.cms.com)
  ↓ (not found)
Default Tenant (fallback)
```

**实现**：
```typescript
// middleware/tenantContext.ts
export async function resolveTenant(request: Request): Promise<Tenant> {
  // 1. 尝试从 Header 获取
  const headerTenant = extractTenantFromHeader(request.headers)
  if (headerTenant) {
    return await getTenantBySlug(headerTenant)
  }
  
  // 2. 尝试从 Subdomain 获取
  const host = request.headers.get('host')
  const subdomainTenant = extractTenantFromHost(host)
  if (subdomainTenant) {
    return await getTenantBySlug(subdomainTenant)
  }
  
  // 3. 返回默认租户
  return await getDefaultTenant()
}
```

### 4.3 租户上下文存储

使用 **AsyncLocalStorage** 存储当前请求的租户上下文：

```typescript
// lib/tenantContext.ts
import { AsyncLocalStorage } from 'async_hooks'

interface TenantContext {
  tenantId: string
  tenantSlug: string
  isSuperAdmin: boolean
}

const tenantStorage = new AsyncLocalStorage<TenantContext>()

export function setTenantContext(context: TenantContext) {
  return tenantStorage.enterWith(context)
}

export function getTenantContext(): TenantContext | undefined {
  return tenantStorage.getStore()
}

export function getCurrentTenantId(): string {
  const context = getTenantContext()
  if (!context) {
    throw new Error('Tenant context not found')
  }
  return context.tenantId
}
```

## 5. 数据隔离

### 5.1 Prisma 中间件实现

```typescript
// lib/prisma.ts
import { Prisma } from '@prisma/client'

// 需要租户过滤的模型
const TENANT_FILTERED_MODELS = [
  'User',
  'Article',
  'ArticleVersion',
  'ArticleField',
  'ArticleTag',
  'ArticleMedia',
  'Category',
  'Tag',
  'Media',
  'Comment',
  'TenantConfig',
  'WorkflowInstance',
  'WorkflowLog',
  'Theme',
  'Menu',
  'PageLayout',
  'Widget',
]

// 需要跳过租户过滤的操作
const SKIP_ACTIONS = ['create', 'update', 'delete', 'deleteMany']

// Prisma 中间件
prisma.$use(async (params, next) => {
  // 检查是否需要租户过滤
  if (
    !TENANT_FILTERED_MODELS.includes(params.model!) ||
    SKIP_ACTIONS.includes(params.action)
  ) {
    return next(params)
  }

  // 获取租户上下文
  const context = getTenantContext()
  
  // 超级管理员绕过过滤
  if (context?.isSuperAdmin) {
    return next(params)
  }

  // 注入租户过滤条件
  if (params.action === 'findMany' || params.action === 'findFirst') {
    params.args.where = {
      ...params.args.where,
      tenantId: context?.tenantId,
    }
  } else if (params.action === 'count') {
    params.args.where = {
      ...params.args.where,
      tenantId: context?.tenantId,
    }
  } else if (params.action === 'aggregate') {
    params.args.where = {
      ...params.args.where,
      tenantId: context?.tenantId,
    }
  }

  return next(params)
})
```

### 5.2 写入操作自动注入

```typescript
// lib/prisma.ts
prisma.$use(async (params, next) => {
  // 写入操作自动注入 tenantId
  if (
    ['create', 'createMany', 'update', 'updateMany'].includes(params.action) &&
    TENANT_FILTERED_MODELS.includes(params.model!)
  ) {
    const context = getTenantContext()
    
    if (context && !context.isSuperAdmin) {
      if (params.action === 'create') {
        params.args.data = {
          ...params.args.data,
          tenantId: context.tenantId,
        }
      } else if (params.action === 'createMany') {
        params.args.data = params.args.data.map((item: any) => ({
          ...item,
          tenantId: context.tenantId,
        }))
      }
    }
  }

  return next(params)
})
```

### 5.3 超级管理员机制

#### 权限标识

```typescript
interface User {
  id: number
  email: string
  isSuperAdmin?: boolean  // 超级管理员标记
  tenantId: string
}

// JWT Token 中包含
interface JWTPayload {
  userId: number
  tenantId: string
  isSuperAdmin: boolean
}
```

#### 绕过租户过滤

```typescript
// 超级管理员查询所有租户数据
async function getGlobalStats() {
  const context = {
    tenantId: 'system',
    tenantSlug: 'system',
    isSuperAdmin: true,  // 标记为超级管理员
  }
  
  return setTenantContext(context, async () => {
    // 此查询不会注入 tenantId 过滤
    return await prisma.article.count()
  })
}
```

#### 跨租户操作示例

```typescript
// 超级管理员迁移数据
async function migrateArticles(fromTenantId: string, toTenantId: string) {
  const context = {
    tenantId: 'system',
    tenantSlug: 'system',
    isSuperAdmin: true,
  }
  
  return setTenantContext(context, async () => {
    return await prisma.article.updateMany({
      where: { tenantId: fromTenantId },
      data: { tenantId: toTenantId },
    })
  })
}
```

### 5.4 防御措施

#### 1. 防止租户越权

```typescript
// 中间件检查
export async function validateTenantAccess(
  userId: number,
  tenantId: string
): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { id: userId },
    select: { tenantId: true },
  })
  
  if (!user) {
    throw new Error('User not found')
  }
  
  // 普通用户只能访问自己租户的数据
  if (user.tenantId !== tenantId) {
    throw new Error('Tenant access denied')
  }
  
  return true
}
```

#### 2. 防止数据泄露

```typescript
// API 响应过滤
export function sanitizeResponse<T>(
  data: T,
  currentTenantId: string
): T {
  if (Array.isArray(data)) {
    return data.filter(item => item.tenantId === currentTenantId) as T
  }
  
  if (data && typeof data === 'object' && 'tenantId' in data) {
    if (data.tenantId !== currentTenantId) {
      throw new Error('Data leakage detected')
    }
  }
  
  return data
}
```

## 6. 迁移计划

### 6.1 迁移前准备

1. **备份数据库**
   ```bash
   pg_dump cms_production > backup_$(date +%Y%m%d).sql
   ```

2. **确认停机窗口**：建议维护窗口 2-4 小时

3. **通知所有用户**：提前发送维护通知

### 6.2 数据库迁移步骤

#### Step 1: 创建 tenants 表

```sql
-- 创建 Tenant 表
CREATE TABLE tenants (
  id VARCHAR(30) PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  logo VARCHAR(500),
  config JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);

-- 创建枚举类型
CREATE TYPE tenant_status AS ENUM ('ACTIVE', 'SUSPENDED', 'TRIAL', 'DISABLED');
```

#### Step 2: 创建默认租户

```sql
-- 插入默认租户
INSERT INTO tenants (id, slug, name, status, config)
VALUES (
  'default_tenant_001',
  'default',
  'Default Tenant',
  'ACTIVE',
  '{
    "theme": {"primaryColor": "#1890ff"},
    "features": {
      "enableComments": true,
      "enableWorkflows": true,
      "enableMediaLibrary": true,
      "enableVersioning": true,
      "maxStorageMB": 10240,
      "maxArticles": 10000
    },
    "domains": {"subdomain": "default"},
    "seo": {"siteName": "CMS"}
  }'
);
```

#### Step 3: 添加 tenant_id 列

```sql
-- 为所有需要隔离的表添加 tenant_id 列
ALTER TABLE users ADD COLUMN tenant_id VARCHAR(30);
ALTER TABLE articles ADD COLUMN tenant_id VARCHAR(30);
ALTER TABLE article_versions ADD COLUMN tenant_id VARCHAR(30);
ALTER TABLE article_fields ADD COLUMN tenant_id VARCHAR(30);
ALTER TABLE article_tags ADD COLUMN tenant_id VARCHAR(30);
ALTER TABLE article_media ADD COLUMN tenant_id VARCHAR(30);
ALTER TABLE categories ADD COLUMN tenant_id VARCHAR(30);
ALTER TABLE tags ADD COLUMN tenant_id VARCHAR(30);
ALTER TABLE media_files ADD COLUMN tenant_id VARCHAR(30);
ALTER TABLE comments ADD COLUMN tenant_id VARCHAR(30);
ALTER TABLE workflow_instances ADD COLUMN tenant_id VARCHAR(30);
ALTER TABLE workflow_logs ADD COLUMN tenant_id VARCHAR(30);
ALTER TABLE themes ADD COLUMN tenant_id VARCHAR(30);
ALTER TABLE menus ADD COLUMN tenant_id VARCHAR(30);
ALTER TABLE page_layouts ADD COLUMN tenant_id VARCHAR(30);
ALTER TABLE widgets ADD COLUMN tenant_id VARCHAR(30);
```

#### Step 4: 迁移现有数据

```sql
-- 将所有现有数据关联到默认租户
UPDATE users SET tenant_id = 'default_tenant_001';
UPDATE articles SET tenant_id = 'default_tenant_001';
UPDATE article_versions SET tenant_id = 'default_tenant_001';
UPDATE article_fields SET tenant_id = 'default_tenant_001';
UPDATE article_tags SET tenant_id = 'default_tenant_001';
UPDATE article_media SET tenant_id = 'default_tenant_001';
UPDATE categories SET tenant_id = 'default_tenant_001';
UPDATE tags SET tenant_id = 'default_tenant_001';
UPDATE media_files SET tenant_id = 'default_tenant_001';
UPDATE comments SET tenant_id = 'default_tenant_001';
UPDATE workflow_instances SET tenant_id = 'default_tenant_001';
UPDATE workflow_logs SET tenant_id = 'default_tenant_001';
UPDATE themes SET tenant_id = 'default_tenant_001';
UPDATE menus SET tenant_id = 'default_tenant_001';
UPDATE page_layouts SET tenant_id = 'default_tenant_001';
UPDATE widgets SET tenant_id = 'default_tenant_001';
```

#### Step 5: 创建外键约束

```sql
-- 添加外键约束
ALTER TABLE users 
  ADD CONSTRAINT fk_users_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) 
  ON DELETE RESTRICT;

ALTER TABLE articles 
  ADD CONSTRAINT fk_articles_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) 
  ON DELETE RESTRICT;

-- ... 为其他表添加类似约束
```

#### Step 6: 创建索引

```sql
-- 单列索引
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_articles_tenant ON articles(tenant_id);
CREATE INDEX idx_categories_tenant ON categories(tenant_id);
CREATE INDEX idx_tags_tenant ON tags(tenant_id);
CREATE INDEX idx_media_tenant ON media_files(tenant_id);
CREATE INDEX idx_comments_tenant ON comments(tenant_id);

-- 复合索引
CREATE INDEX idx_articles_tenant_status_published 
  ON articles(tenant_id, status, published_at DESC);
CREATE INDEX idx_users_tenant_active 
  ON users(tenant_id, is_active) WHERE is_active = true;
```

#### Step 7: 修改唯一约束

```sql
-- 移除旧的全局唯一约束
ALTER TABLE users DROP CONSTRAINT users_username_key;
ALTER TABLE users DROP CONSTRAINT users_email_key;
ALTER TABLE articles DROP CONSTRAINT articles_slug_key;
ALTER TABLE categories DROP CONSTRAINT categories_name_key;
ALTER TABLE categories DROP CONSTRAINT categories_slug_key;
ALTER TABLE tags DROP CONSTRAINT tags_name_key;
ALTER TABLE tags DROP CONSTRAINT tags_slug_key;

-- 添加租户内唯一约束
ALTER TABLE users ADD CONSTRAINT users_tenant_username_unique 
  UNIQUE (tenant_id, username);
ALTER TABLE users ADD CONSTRAINT users_tenant_email_unique 
  UNIQUE (tenant_id, email);
ALTER TABLE articles ADD CONSTRAINT articles_tenant_slug_unique 
  UNIQUE (tenant_id, slug);
ALTER TABLE categories ADD CONSTRAINT categories_tenant_name_unique 
  UNIQUE (tenant_id, name);
ALTER TABLE categories ADD CONSTRAINT categories_tenant_slug_unique 
  UNIQUE (tenant_id, slug);
ALTER TABLE tags ADD CONSTRAINT tags_tenant_name_unique 
  UNIQUE (tenant_id, name);
ALTER TABLE tags ADD CONSTRAINT tags_tenant_slug_unique 
  UNIQUE (tenant_id, slug);
```

#### Step 8: 设置非空约束

```sql
-- 确认数据迁移完成后，设置 NOT NULL 约束
ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE articles ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE categories ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE tags ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE media_files ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE comments ALTER COLUMN tenant_id SET NOT NULL;
-- ... 其他表
```

### 6.3 SystemConfig → TenantConfig 迁移

```sql
-- 1. 创建 tenant_configs 表
CREATE TABLE tenant_configs (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(30) NOT NULL,
  config_group VARCHAR(50) NOT NULL,
  config_key VARCHAR(100) NOT NULL,
  config_value JSONB NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  input_type VARCHAR(50) NOT NULL,
  input_options JSONB,
  validation_rules JSONB,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_tenant_configs_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT tenant_configs_tenant_group_key_unique 
    UNIQUE (tenant_id, config_group, config_key)
);

-- 2. 迁移 system_configs 数据到 tenant_configs
INSERT INTO tenant_configs (
  tenant_id, config_group, config_key, config_value, 
  display_name, description, input_type, input_options, 
  validation_rules, sort_order, is_active, created_at, updated_at
)
SELECT 
  'default_tenant_001',
  config_group, config_key, config_value,
  display_name, description, input_type, input_options,
  validation_rules, sort_order, is_active, created_at, updated_at
FROM system_configs;

-- 3. 创建索引
CREATE INDEX idx_tenant_configs_tenant ON tenant_configs(tenant_id);
CREATE INDEX idx_tenant_configs_group ON tenant_configs(tenant_id, config_group);
CREATE INDEX idx_tenant_configs_key ON tenant_configs(tenant_id, config_key);

-- 4. 重命名旧表（保留备份）
ALTER TABLE system_configs RENAME TO system_configs_backup;

-- 5. 创建视图兼容旧代码（可选）
CREATE VIEW system_configs AS
SELECT * FROM tenant_configs WHERE tenant_id = 'default_tenant_001';
```

### 6.4 验证步骤

```sql
-- 1. 验证租户数据完整性
SELECT 
  (SELECT COUNT(*) FROM users WHERE tenant_id IS NULL) as users_null,
  (SELECT COUNT(*) FROM articles WHERE tenant_id IS NULL) as articles_null,
  (SELECT COUNT(*) FROM categories WHERE tenant_id IS NULL) as categories_null;

-- 2. 验证外键约束
SELECT 
  u.id, u.username, u.tenant_id
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE t.id IS NULL;

-- 3. 验证唯一约束
SELECT tenant_id, username, COUNT(*) 
FROM users 
GROUP BY tenant_id, username 
HAVING COUNT(*) > 1;

-- 4. 验证数据量
SELECT 
  (SELECT COUNT(*) FROM tenants) as tenants,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM articles) as articles,
  (SELECT COUNT(*) FROM categories) as categories;

-- 5. 验证索引使用情况
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans
FROM pg_stat_user_indexes
WHERE indexname LIKE '%tenant%'
ORDER BY tablename, indexname;
```

### 6.5 回滚计划

如果迁移失败，执行回滚：

```sql
-- 1. 删除新增的 tenant_id 列
ALTER TABLE users DROP COLUMN tenant_id;
ALTER TABLE articles DROP COLUMN tenant_id;
-- ... 其他表

-- 2. 恢复唯一约束
ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
-- ... 其他约束

-- 3. 删除 tenants 表
DROP TABLE IF EXISTS tenants CASCADE;

-- 4. 恢复 system_configs
DROP VIEW IF EXISTS system_configs;
ALTER TABLE system_configs_backup RENAME TO system_configs;
```

## 7. API 变更

### 7.1 请求要求

#### 必需 Headers

```http
GET /api/articles HTTP/1.1
Host: tenant1.cms.com
Authorization: Bearer <token>
X-Tenant-ID: tenant1  # 可选（从 subdomain 自动推断）
```

#### 认证流程

```typescript
// 1. 登录时验证租户
POST /api/auth/login
{
  "email": "user@tenant1.com",
  "password": "password"
}

// 响应包含租户信息
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "email": "user@tenant1.com",
    "tenantId": "tenant_001",
    "tenantSlug": "tenant1"
  }
}

// 2. 后续请求自动携带租户信息
// JWT payload 包含 tenantId
{
  "userId": 1,
  "tenantId": "tenant_001",
  "isSuperAdmin": false
}
```

### 7.2 响应格式

#### 成功响应

```json
{
  "success": true,
  "data": {
    "articles": [...]
  },
  "meta": {
    "tenant": "tenant1",
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 错误响应

**租户不存在**
```json
{
  "success": false,
  "error": {
    "code": "TENANT_NOT_FOUND",
    "message": "Tenant not found: unknown-tenant",
    "details": {
      "tenantSlug": "unknown-tenant"
    }
  }
}
```

**租户已暂停**
```json
{
  "success": false,
  "error": {
    "code": "TENANT_SUSPENDED",
    "message": "Tenant is suspended",
    "details": {
      "tenantSlug": "tenant1",
      "status": "SUSPENDED"
    }
  }
}
```

**跨租户访问**
```json
{
  "success": false,
  "error": {
    "code": "TENANT_ACCESS_DENIED",
    "message": "Access to this tenant's data is forbidden",
    "details": {
      "currentTenant": "tenant1",
      "requestedTenant": "tenant2"
    }
  }
}
```

### 7.3 API 端点变更

#### 新增端点

```typescript
// 租户管理（仅超级管理员）
GET    /api/admin/tenants              // 列出所有租户
POST   /api/admin/tenants              // 创建新租户
GET    /api/admin/tenants/:id          // 获取租户详情
PUT    /api/admin/tenants/:id          // 更新租户信息
DELETE /api/admin/tenants/:id          // 删除租户（软删除）
PUT    /api/admin/tenants/:id/status   // 更新租户状态

// 租户配置（租户管理员）
GET    /api/tenant/configs             // 获取租户配置
PUT    /api/tenant/configs             // 更新租户配置
GET    /api/tenant/info                // 获取当前租户信息
```

#### 修改的端点

所有现有端点都自动应用租户过滤：

```typescript
// 之前
GET /api/articles          // 返回所有文章
GET /api/users             // 返回所有用户

// 之后
GET /api/articles          // 仅返回当前租户的文章
GET /api/users             // 仅返回当前租户的用户
```

### 7.4 分页和过滤

#### 租户感知的分页

```typescript
// 查询参数保持不变，但自动限制在租户范围内
GET /api/articles?page=1&pageSize=20&status=PUBLISHED

// SQL 自动注入
SELECT * FROM articles 
WHERE tenant_id = 'tenant_001' 
  AND status = 'PUBLISHED'
ORDER BY published_at DESC
LIMIT 20 OFFSET 0;
```

#### 全局搜索（仅超级管理员）

```typescript
// 超级管理员可跨租户搜索
GET /api/admin/articles/search?tenantId=tenant_001

// 如果不指定 tenantId，搜索所有租户
GET /api/admin/articles/search?query=intro
```

## 8. 安全考虑

### 8.1 租户越权防护

#### 1. 认证层防护

```typescript
// JWT 验证中间件
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const payload = verifyJWT(token)
  
  // 检查 token 中的租户与请求的租户是否匹配
  const requestTenant = await resolveTenant(req)
  
  if (payload.tenantId !== requestTenant.id && !payload.isSuperAdmin) {
    return res.status(403).json({
      error: {
        code: 'TENANT_MISMATCH',
        message: 'Token tenant does not match request tenant',
      },
    })
  }
  
  req.user = payload
  next()
}
```

#### 2. 数据访问层防护

```typescript
// 查询前验证
export async function getArticleById(id: number, userId: number) {
  const article = await prisma.article.findFirst({
    where: { id },
  })
  
  if (!article) {
    throw new NotFoundError('Article not found')
  }
  
  // 验证租户权限
  const user = await prisma.user.findFirst({
    where: { id: userId },
  })
  
  if (article.tenantId !== user.tenantId && !user.isSuperAdmin) {
    throw new ForbiddenError('Access denied')
  }
  
  return article
}
```

#### 3. 写入操作验证

```typescript
// 创建时验证
export async function createArticle(
  data: CreateArticleDto,
  userId: number
) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  })
  
  // 确保 authorId 属于当前租户
  if (data.authorId) {
    const author = await prisma.user.findFirst({
      where: { id: data.authorId },
    })
    
    if (author.tenantId !== user.tenantId) {
      throw new BadRequestError('Invalid author ID')
    }
  }
  
  // 确保 categoryId 属于当前租户
  if (data.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId },
    })
    
    if (category.tenantId !== user.tenantId) {
      throw new BadRequestError('Invalid category ID')
    }
  }
  
  // 创建文章（中间件自动注入 tenantId）
  return await prisma.article.create({
    data: {
      ...data,
      authorId: userId,
    },
  })
}
```

### 8.2 数据泄露预防

#### 1. 响应过滤

```typescript
// API 响应中间件
export function filterTenantData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const originalJson = res.json.bind(res)
  
  res.json = (data: any) => {
    const context = getTenantContext()
    
    // 如果不是超级管理员，移除 tenantId 字段
    if (!context?.isSuperAdmin) {
      data = removeTenantFields(data)
    }
    
    return originalJson(data)
  }
  
  next()
}

function removeTenantFields(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(removeTenantFields)
  }
  
  if (obj && typeof obj === 'object') {
    const { tenantId, ...rest } = obj
    return Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [
        key,
        removeTenantFields(value),
      ])
    )
  }
  
  return obj
}
```

#### 2. 错误消息脱敏

```typescript
// 错误处理中间件
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 生产环境隐藏详细错误信息
  if (process.env.NODE_ENV === 'production') {
    // 移除可能泄露租户信息的内容
    const message = err.message.replace(/tenant[_-]?id[:\s]+\S+/gi, '[REDACTED]')
    
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    })
  }
  
  // 开发环境返回详细错误
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message,
      stack: err.stack,
    },
  })
}
```

#### 3. 日志脱敏

```typescript
// 日志中间件
export function sanitizeLog(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data
  }
  
  const sensitiveFields = ['password', 'passwordHash', 'token', 'tenantId']
  const sanitized = { ...data }
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }
  
  return sanitized
}
```

### 8.3 性能安全

#### 1. 查询深度限制

```typescript
// GraphQL 深度限制（如使用 GraphQL）
import { depthLimit } from 'graphql-depth-limit'

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5)],  // 限制查询深度
})
```

#### 2. 查询复杂度限制

```typescript
// 限制返回数量
const MAX_PAGE_SIZE = 100

export function validatePagination(pageSize: number) {
  if (pageSize > MAX_PAGE_SIZE) {
    throw new BadRequestError(`Page size cannot exceed ${MAX_PAGE_SIZE}`)
  }
}
```

#### 3. 租户配额限制

```typescript
// 检查租户配额
export async function checkTenantQuota(
  tenantId: string,
  resource: 'articles' | 'media' | 'users'
) {
  const tenant = await prisma.tenant.findFirst({
    where: { id: tenantId },
  })
  
  const limits = tenant.config.features
  
  if (resource === 'articles') {
    const count = await prisma.article.count({
      where: { tenantId },
    })
    
    if (count >= limits.maxArticles) {
      throw new QuotaExceededError(
        `Article quota exceeded: ${count}/${limits.maxArticles}`
      )
    }
  }
  
  // ... 其他资源检查
}
```

### 8.4 审计日志

```typescript
// 创建审计日志表
model AuditLog {
  id          Int      @id @default(autoincrement())
  tenantId    String   @map("tenant_id")
  userId      Int?     @map("user_id")
  action      String   @db.VarChar(50)
  resource    String   @db.VarChar(100)
  resourceId  Int?     @map("resource_id")
  changes     Json     @default("{}")
  ipAddress   String?  @map("ip_address") @db.VarChar(45)
  userAgent   String?  @map("user_agent") @db.VarChar(500)
  createdAt   DateTime @default(now()) @map("created_at")
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  user        User?    @relation(fields: [userId], references: [id])
  
  @@index([tenantId])
  @@index([tenantId, userId])
  @@index([tenantId, action])
  @@index([createdAt])
  @@map("audit_logs")
}

// 记录关键操作
export async function logAudit(
  action: string,
  resource: string,
  resourceId: number,
  changes: any
) {
  const context = getTenantContext()
  
  await prisma.auditLog.create({
    data: {
      tenantId: context.tenantId,
      userId: context.userId,
      action,
      resource,
      resourceId,
      changes,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    },
  })
}
```

### 8.5 数据加密

#### 1. 敏感配置加密

```typescript
// 租户配置中的敏感字段加密存储
import { encrypt, decrypt } from '@/lib/crypto'

export async function saveTenantConfig(
  tenantId: string,
  config: any
) {
  // 加密敏感字段
  if (config.secrets?.apiKey) {
    config.secrets.apiKey = encrypt(config.secrets.apiKey)
  }
  
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { config },
  })
}

export async function getTenantConfig(tenantId: string) {
  const tenant = await prisma.tenant.findFirst({
    where: { id: tenantId },
  })
  
  // 解密敏感字段
  if (tenant.config.secrets?.apiKey) {
    tenant.config.secrets.apiKey = decrypt(tenant.config.secrets.apiKey)
  }
  
  return tenant.config
}
```

#### 2. 文件存储隔离

```typescript
// 媒体文件存储路径包含租户 ID
export function getMediaPath(tenantId: string, filename: string): string {
  return `uploads/${tenantId}/${filename}`
}

// 验证文件访问权限
export async function validateMediaAccess(
  mediaId: number,
  userId: number
): Promise<boolean> {
  const media = await prisma.media.findFirst({
    where: { id: mediaId },
  })
  
  const user = await prisma.user.findFirst({
    where: { id: userId },
  })
  
  return media.tenantId === user.tenantId
}
```

## 9. 测试策略

### 9.1 单元测试

```typescript
describe('Tenant Isolation', () => {
  let tenant1Context: TenantContext
  let tenant2Context: TenantContext
  
  beforeEach(() => {
    tenant1Context = {
      tenantId: 'tenant_001',
      tenantSlug: 'tenant1',
      isSuperAdmin: false,
    }
    
    tenant2Context = {
      tenantId: 'tenant_002',
      tenantSlug: 'tenant2',
      isSuperAdmin: false,
    }
  })
  
  it('should only return articles from current tenant', async () => {
    // 在 tenant1 上下文中查询
    const articles = await setTenantContext(tenant1Context, async () => {
      return await prisma.article.findMany()
    })
    
    // 验证所有文章都属于 tenant1
    expect(articles.every(a => a.tenantId === 'tenant_001')).toBe(true)
  })
  
  it('should prevent cross-tenant access', async () => {
    // 创建 tenant1 的文章
    const article1 = await setTenantContext(tenant1Context, async () => {
      return await prisma.article.create({
        data: { title: 'Article 1', slug: 'article-1' },
      })
    })
    
    // 尝试在 tenant2 上下文中访问
    await expect(
      setTenantContext(tenant2Context, async () => {
        return await prisma.article.findFirst({
          where: { id: article1.id },
        })
      })
    ).resolves.toBeNull()
  })
})
```

### 9.2 集成测试

```typescript
describe('API Tenant Isolation', () => {
  let tenant1Token: string
  let tenant2Token: string
  
  beforeEach(async () => {
    // 创建测试租户和用户
    const tenant1 = await createTestTenant('tenant1')
    const user1 = await createTestUser('user1@tenant1.com', tenant1.id)
    tenant1Token = generateJWT(user1)
    
    const tenant2 = await createTestTenant('tenant2')
    const user2 = await createTestUser('user2@tenant2.com', tenant2.id)
    tenant2Token = generateJWT(user2)
  })
  
  it('should isolate articles between tenants', async () => {
    // tenant1 创建文章
    await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${tenant1Token}`)
      .send({ title: 'Tenant1 Article', content: {} })
      .expect(201)
    
    // tenant2 查询文章
    const res = await request(app)
      .get('/api/articles')
      .set('Authorization', `Bearer ${tenant2Token}`)
      .expect(200)
    
    // tenant2 不应该看到 tenant1 的文章
    expect(res.body.data.articles).toHaveLength(0)
  })
})
```

### 9.3 性能测试

```typescript
describe('Tenant Performance', () => {
  it('should use index for tenant queries', async () => {
    const query = `
      SELECT * FROM articles 
      WHERE tenant_id = 'tenant_001' 
      AND status = 'PUBLISHED'
    `
    
    const result = await prisma.$queryRaw`
      EXPLAIN ANALYZE ${Prisma.raw(query)}
    `
    
    // 验证使用了索引
    expect(result).toContain('Index Scan')
    expect(result).toContain('idx_articles_tenant_status_published')
  })
  
  it('should maintain performance with 1000 tenants', async () => {
    // 创建 1000 个租户，每个租户 100 篇文章
    // ...
    
    const start = Date.now()
    
    const articles = await prisma.article.findMany({
      where: {
        tenantId: 'tenant_500',
        status: 'PUBLISHED',
      },
    })
    
    const duration = Date.now() - start
    
    // 查询时间应小于 50ms
    expect(duration).toBeLessThan(50)
  })
})
```

## 10. 监控和运维

### 10.1 监控指标

```typescript
// 租户相关监控指标
const tenantMetrics = {
  // 租户活跃度
  'tenant.active_users': new Counter({
    name: 'tenant_active_users',
    help: 'Active users per tenant',
    labelNames: ['tenant_id'],
  }),
  
  // 租户存储使用
  'tenant.storage_used': new Gauge({
    name: 'tenant_storage_used_bytes',
    help: 'Storage used per tenant',
    labelNames: ['tenant_id'],
  }),
  
  // 租户请求量
  'tenant.requests': new Counter({
    name: 'tenant_requests_total',
    help: 'Total requests per tenant',
    labelNames: ['tenant_id', 'method', 'path'],
  }),
  
  // 跨租户访问尝试（安全告警）
  'tenant.cross_tenant_attempts': new Counter({
    name: 'tenant_cross_tenant_access_attempts',
    help: 'Cross-tenant access attempts',
    labelNames: ['source_tenant', 'target_tenant'],
  }),
}
```

### 10.2 告警规则

```yaml
# Prometheus 告警规则
groups:
  - name: tenant_alerts
    rules:
      # 租户存储配额告警
      - alert: TenantStorageNearLimit
        expr: tenant_storage_used_bytes / tenant_storage_limit_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Tenant {{ $labels.tenant_id }} storage near limit"
      
      # 跨租户访问尝试告警
      - alert: CrossTenantAccessAttempt
        expr: rate(tenant_cross_tenant_access_attempts[5m]) > 1
        labels:
          severity: critical
        annotations:
          summary: "Potential cross-tenant access attack"
      
      # 租户请求异常告警
      - alert: TenantRequestSpike
        expr: rate(tenant_requests_total[5m]) > 100
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Tenant {{ $labels.tenant_id }} has unusual request spike"
```

### 10.3 运维脚本

#### 租户创建脚本

```bash
#!/bin/bash
# scripts/create-tenant.sh

TENANT_SLUG=$1
TENANT_NAME=$2

if [ -z "$TENANT_SLUG" ] || [ -z "$TENANT_NAME" ]; then
  echo "Usage: ./create-tenant.sh <slug> <name>"
  exit 1
fi

# 创建租户
psql $DATABASE_URL <<EOF
INSERT INTO tenants (id, slug, name, status, config)
VALUES (
  'tenant_$(date +%s)',
  '$TENANT_SLUG',
  '$TENANT_NAME',
  'TRIAL',
  '{
    "theme": {"primaryColor": "#1890ff"},
    "features": {
      "enableComments": true,
      "enableWorkflows": true,
      "maxStorageMB": 1024,
      "maxArticles": 100
    }
  }'
);
EOF

echo "Tenant created: $TENANT_SLUG"
```

#### 租户数据清理脚本

```bash
#!/bin/bash
# scripts/cleanup-tenant.sh

TENANT_ID=$1

if [ -z "$TENANT_ID" ]; then
  echo "Usage: ./cleanup-tenant.sh <tenant_id>"
  exit 1
fi

# 软删除租户
psql $DATABASE_URL <<EOF
UPDATE tenants 
SET status = 'DISABLED' 
WHERE id = '$TENANT_ID';

-- 可选：删除租户数据（硬删除）
-- DELETE FROM articles WHERE tenant_id = '$TENANT_ID';
-- DELETE FROM users WHERE tenant_id = '$TENANT_ID';
-- DELETE FROM tenants WHERE id = '$TENANT_ID';
EOF

echo "Tenant disabled: $TENANT_ID"
```

## 11. 最佳实践

### 11.1 开发注意事项

1. **始终使用 Prisma Client**：不要写原生 SQL，确保中间件生效
2. **测试租户隔离**：每个 PR 都要运行租户隔离测试
3. **Code Review 要点**：检查是否遗漏 `tenantId` 过滤
4. **文档更新**：新增模型时更新租户隔离列表

### 11.2 性能优化建议

1. **索引优化**：定期分析慢查询，调整索引
2. **缓存策略**：对租户配置使用 Redis 缓存
3. **连接池配置**：根据租户数量调整连接池大小
4. **分区策略**：超大租户考虑独立数据库

### 11.3 常见问题

**Q1: 如何处理全局数据（如系统配置）？**
A: 使用 `TenantConfig` 模型，为每个租户创建独立配置副本。

**Q2: 超级管理员如何跨租户查询？**
A: 在上下文中设置 `isSuperAdmin: true`，绕过租户过滤。

**Q3: 如何防止 N+1 查询问题？**
A: 使用 Prisma 的 `include` 预加载关联数据，中间件会自动注入租户过滤。

**Q4: 租户迁移如何处理？**
A: 提供迁移脚本，验证数据完整性后再切换。

## 12. 参考资源

- [Prisma 中间件文档](https://www.prisma.io/docs/concepts/components/prisma-client/middleware)
- [PostgreSQL 索引优化](https://www.postgresql.org/docs/current/indexes.html)
- [AsyncLocalStorage API](https://nodejs.org/api/async_context.html)
- [SaaS 多租户架构模式](https://docs.microsoft.com/en-us/azure/architecture/guide/saas-multitenant/saas-overview)

---

**文档版本**: 1.0  
**最后更新**: 2024-03-11  
**维护者**: CMS Team
