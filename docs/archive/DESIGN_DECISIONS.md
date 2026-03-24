# CMS系统设计决策文档

**生成日期**: 2026-03-11  
**决策方式**: 多方辩论模式（6位专家）  
**最终决策者**: 李冲

---

## 📋 执行摘要

本文档记录了CMS系统重新设计的所有关键决策，经过产品经理、系统架构师、前端专家、后端专家、测试专家和运维专家的充分讨论，最终由李冲确认。

---

## 🎯 核心决策

### 1. 架构方案

**决策**: 前后端分离架构（MVP阶段）

```
cms/
├── apps/
│   ├── web-frontend/     # 前台展示（Next.js）
│   ├── web-admin/        # 后台管理（Next.js）
│   └── api/              # API服务（Express）
├── packages/
│   ├── types/            # 共享类型
│   ├── core/             # 领域核心
│   ├── infrastructure/   # 基础设施
│   └── utils/            # 工具函数
```

**理由**:
- MVP阶段就分离，避免后期重构成本
- 前台后台可独立部署和扩展
- 团队协作更清晰

---

### 2. 技术选型

#### 2.1 前端技术栈

| 领域 | 选择 | 理由 |
|------|------|------|
| **框架** | Next.js 15 + React 19 | 最新版本，性能最优 |
| **编辑器** | Tiptap（分屏预览） | ProseMirror底层，协作编辑支持 |
| **状态管理** | TanStack Query + Zustand | 服务端/客户端状态分离 |
| **UI组件** | Shadcn/ui + TailwindCSS 4 | Radix基础，可定制性强 |
| **表单** | React Hook Form + Zod | 性能好，验证灵活 |

#### 2.2 后端技术栈

| 领域 | 选择 | 理由 |
|------|------|------|
| **框架** | Express 5 + TypeScript | 成熟稳定 |
| **ORM** | Prisma 6 | 类型安全，开发效率高 |
| **API风格** | RESTful only | MVP阶段不引入GraphQL |
| **认证** | JWT + Refresh Token | 安全可靠 |
| **数据库** | PostgreSQL 18 (TimescaleDB) | 多租户支持，全文搜索 |

#### 2.3 基础设施

| 领域 | 选择 | 理由 |
|------|------|------|
| **缓存** | Redis 8 | 分层缓存策略 |
| **搜索** | PostgreSQL pg_trgm | 10万级够用，无需ES |
| **文件存储** | 本地 + 云厂商 + 网盘 | 多存储支持 |
| **容器** | Docker Compose → Swarm | 渐进式部署 |

---

### 3. 功能设计

#### 3.1 多租户支持（MVP阶段）

```prisma
model Tenant {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  config    Json
  articles  Article[]
  users     User[]
}

model Article {
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  // ... 其他字段
  
  @@index([tenantId])
}
```

#### 3.2 文件上传

**支持的存储后端**:
1. **本地存储**: `/uploads` 目录
2. **云厂商**: 
   - 阿里云 OSS
   - 腾讯云 COS
   - AWS S3
   - MinIO（私有化）
3. **网盘**:
   - WebDAV
   - SFTP

**抽象接口**:
```typescript
interface StorageProvider {
  upload(file: Buffer, path: string): Promise<string>
  download(path: string): Promise<Buffer>
  delete(path: string): Promise<void>
  getUrl(path: string): string
}
```

---

### 4. 测试策略

**决策**: 测试金字塔 70/20/10

```
        E2E测试 (10% - 15个)
       /              \
    集成测试 (20% - 30个)
   /                    \
单元测试 (70% - 120个)
```

#### 4.1 覆盖率目标

| 层级 | 行覆盖率 | 分支覆盖率 |
|------|---------|-----------|
| 单元测试 | 85% | 80% |
| 集成测试 | 70% | 65% |
| 关键路径 | 100% | 100% |

#### 4.2 E2E测试范围（15个关键场景）

1. 完整内容生命周期（3个）
2. 用户权限与安全（3个）
3. 媒体资源管理（2个）
4. 跨浏览器兼容（3个 × 3浏览器）
5. 移动端适配（2个）
6. 性能基线（2个）

---

### 5. 安全加固

#### 5.1 P0优先级（立即处理）

1. **文件上传安全**
   - Magic Number验证（不只看扩展名）
   - 文件类型白名单
   - 大小限制：10MB
   - 随机化文件名
   - 使用Sharp替代ImageMagick

2. **CSP + 安全头**
   ```javascript
   app.use(helmet({
     contentSecurityPolicy: { /* 完整CSP策略 */ },
     hsts: { maxAge: 31536000, includeSubDomains: true }
   }));
   ```

3. **JWT Secret管理**
   - 环境变量 + Secrets Manager
   - Access Token: 15分钟
   - Refresh Token: 7天 + Rotation
   - 每90天轮换Secret

---

### 6. CI/CD流程

**四阶段流水线**:

```yaml
Stage 1: 代码质量（<5分钟）
  - ESLint + Prettier
  - TypeScript类型检查
  - 安全审计

Stage 2: 测试（<15分钟）
  - 单元测试（70%）
  - 集成测试（20%）
  - E2E测试（10%，关键路径）

Stage 3: 构建（<10分钟）
  - Docker镜像构建
  - 推送到Registry

Stage 4: 部署（<10分钟）
  - 蓝绿部署
  - 健康检查
  - 自动回滚
```

---

## 📊 MVP范围（3周）

### 必须有
- ✅ 用户认证与权限（基础RBAC）
- ✅ Markdown编辑器（Tiptap）
- ✅ 文章CRUD + 分类标签
- ✅ 多租户支持
- ✅ 文件上传（本地 + 至少1个云厂商）
- ✅ 前后端分离

### 可以延后
- ⏳ 主题系统
- ⏳ 插件系统
- ⏳ 用户会员/等级
- ⏳ SEO高级功能
- ⏳ 工作流审批
- ⏳ 多语言

---

## 🚀 渐进演进路线

### Phase 1: MVP（Month 1-3）
- 前后端分离架构
- 核心功能（认证+编辑+内容）
- 多租户基础
- Docker Compose部署
- 基础监控

### Phase 2: 稳定版（Month 4-6）
- 更多云存储支持
- E2E测试完善
- 性能优化
- Docker Swarm（如需）

### Phase 3: 增强版（Month 7-12）
- 监控告警完善
- 插件系统
- 高级SEO
- 用户会员体系

### Phase 4: 规模化（Year 2+）
- 评估K8s（用户量>10万）
- 微服务拆分（按需）
- 多地域部署

---

## 📝 专家观点汇总

| 专家 | 核心建议 | 采纳情况 |
|------|---------|---------|
| **产品经理** | 权限优先，3周MVP | ✅ 采纳 |
| **系统架构师** | 渐进式演进，DDD分层 | ✅ 采纳 |
| **前端专家** | Tiptap分屏预览，移动端优先 | ✅ 采纳 |
| **后端专家** | 多租户+软删除，分层缓存 | ✅ 采纳 |
| **测试专家** | 金字塔70/20/10，E2E精简 | ✅ 采纳 |
| **运维专家** | 渐进式部署，三层监控 | ✅ 采纳 |

---

## ⚠️ 风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 前后端分离增加复杂度 | 中 | 共享types包，统一API规范 |
| 多租户数据隔离 | 高 | 中间件自动过滤，索引优化 |
| 文件存储迁移 | 中 | 抽象存储接口，支持多后端 |
| 测试维护成本 | 中 | 自动化CI/CD，精简E2E |

---

## ✅ 决策确认

- [x] GraphQL不引入
- [x] E2E测试精简到15个
- [x] 单元测试保留（70/20/10）
- [x] 多租户MVP阶段加入
- [x] 文件上传多存储支持
- [x] 前后端MVP阶段分离

---

**决策确认人**: 李冲  
**决策日期**: 2026-03-11
