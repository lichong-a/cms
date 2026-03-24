# CMS 安全审查报告

**审查日期**: 2026-03-11  
**审查人员**: monitor-agent  
**系统版本**: CMS Content Management System  
**数据库**: PostgreSQL 18 (TimescaleDB)  

---

## 执行摘要

对 CMS 内容管理系统进行了全面的安全审查。系统整体安全性良好，采用了现代化的安全实践。发现 2 个高危问题和 3 个中危问题需要修复。

### 风险评级统计

| 等级 | 数量 | 问题 |
|------|------|------|
| 🔴 高危 | 2 | JWT Secret 默认值、文件上传安全 |
| 🟡 中危 | 3 | CSP 缺失、环境变量暴露、日志敏感信息 |
| 🟢 低危 | 2 | Rate Limit 粒度、Token 过期时间 |

---

## 1. XSS 防护 ✅

### 1.1 React 自动转义 ✅
- **状态**: 通过
- **详情**: 前端使用 React 框架，默认对 JSX 中的内容进行 HTML 转义
- **验证**: 前端源码中未发现自定义转义绕过

### 1.2 dangerouslySetInnerHTML 使用 ⚠️
- **状态**: 部分通过
- **详情**: 
  - 前端源代码中未直接使用 `dangerouslySetInnerHTML`
  - 构建产物中发现使用（来自第三方依赖 `webpack-bundle-analyzer`）
  - 该使用场景仅限开发分析工具，不影响生产环境
- **建议**: 确认生产构建不包含 analyzer 相关代码

### 1.3 CSP (Content Security Policy) 配置 ❌
- **状态**: 未配置
- **详情**: 
  - 前端 Next.js 配置中未设置 CSP headers
  - 后端 Helmet 配置未明确添加 CSP 指令
- **风险**: 中 - 缺少 CSP 防护层，可能遭受 XSS 攻击
- **建议**: 
  ```typescript
  // 在 server.ts 中添加
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    })
  );
  ```

---

## 2. CSRF 防护 ⚠️

### 2.1 CSRF Token 机制 ✅
- **状态**: 不适用
- **详情**: 系统使用 JWT Bearer Token 认证，不依赖 Cookie Session
- **评估**: API 架构天然防范 CSRF 攻击

### 2.2 SameSite Cookie 设置 ✅
- **状态**: 通过
- **详情**: 系统使用 Authorization Header 传递 Token，不依赖 Cookie

### 2.3 Origin 验证 ✅
- **状态**: 通过
- **详情**: CORS 配置中限制了 origin
  ```typescript
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  }));
  ```

---

## 3. SQL 注入防护 ✅

### 3.1 Prisma 参数化查询 ✅
- **状态**: 通过
- **详情**: 
  - 全面使用 Prisma ORM
  - 所有数据库操作通过 Prisma Client 执行
  - 自动使用参数化查询

### 3.2 用户输入验证 ⚠️
- **状态**: 部分通过
- **详情**: 
  - 使用 TypeScript 类型系统
  - 建议添加更严格的输入验证库（如 Zod、Joi）

### 3.3 原始 SQL 使用检查 ✅
- **状态**: 通过
- **详情**: 代码中未发现 `$queryRaw` 或 `$executeRaw` 的直接使用

---

## 4. 认证安全 ⚠️

### 4.1 JWT Token 安全 🔴
- **状态**: 高危
- **详情**: 
  ```typescript
  // apps/api/src/utils/jwt.ts
  const JWT_SECRET = process.env.JWT_SECRET || 'cms-jwt-secret-change-in-production';
  ```
  - 存在硬编码的默认 Secret
  - 如果环境变量未设置，将使用弱密钥
- **风险**: 高 - 攻击者可伪造 Token
- **建议**: 
  ```typescript
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  ```

### 4.2 密码加密强度 ✅
- **状态**: 通过
- **详情**: 
  ```typescript
  // apps/api/src/utils/password.ts
  const SALT_ROUNDS = 12;  // 强度足够
  return bcrypt.hash(password, SALT_ROUNDS);
  ```
  - 使用 bcrypt 算法
  - Salt rounds = 12（推荐值）

### 4.3 Session 管理 ✅
- **状态**: 通过
- **详情**: 使用无状态 JWT，服务端不保存 Session

### 4.4 Token 黑名单机制 ✅
- **状态**: 通过
- **详情**: 
  ```typescript
  // apps/api/src/middleware/auth.middleware.ts
  if (isTokenBlacklisted(token)) {
    return error(res, 'Token has been revoked', 'TOKEN_REVOKED', 401);
  }
  ```
  - 实现了 Token 黑名单
  - 支持主动注销和 Token 撤销

### 4.5 Token 过期时间 ⚠️
- **状态**: 可改进
- **详情**: 
  ```typescript
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  ```
  - 默认 7 天过期时间较长
- **建议**: 
  - 缩短 Access Token 有效期（如 15-30 分钟）
  - 实现 Refresh Token 机制

---

## 5. 权限验证 ✅

### 5.1 RBAC 中间件 ✅
- **状态**: 通过
- **详情**: 
  ```typescript
  // apps/api/src/middleware/rbac.middleware.ts
  export const requireRole = (...roles: string[]) => { ... }
  export const requirePermission = (...permissions: string[]) => { ... }
  ```
  - 实现了完整的 RBAC 系统
  - 支持角色和权限两种粒度控制

### 5.2 路由权限保护 ✅
- **状态**: 通过
- **详情**: 
  - 敏感路由使用 `authenticate` 中间件
  - 权限操作使用 `requirePermission` 中间件

### 5.3 API 权限验证 ✅
- **状态**: 通过
- **详情**: 
  - 所有受保护的 API 端点都经过认证中间件
  - 数据库查询关联用户 ID，防止越权访问

---

## 6. 其他安全项 ⚠️

### 6.1 Helmet 安全头配置 ✅
- **状态**: 通过
- **详情**: 
  ```typescript
  app.use(helmet());
  ```
  - 启用了 Helmet 默认安全头
  - 包含 X-Content-Type-Options、X-Frame-Options 等

### 6.2 Rate Limit 配置 ⚠️
- **状态**: 可改进
- **详情**: 
  ```typescript
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分钟
    max: 100, // 每个 IP 最多 100 个请求
  }));
  ```
  - 全局限流粒度较粗
- **建议**: 
  - 为登录、注册等敏感接口设置更严格的限流
  - 实现分级限流策略

### 6.3 文件上传安全 🔴
- **状态**: 高危
- **详情**: 
  ```typescript
  app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));
  ```
  - 未发现明确的文件类型验证
  - 未发现文件大小限制
  - 静态文件目录可能直接暴露
- **风险**: 高 - 可能上传恶意文件、大文件 DoS
- **建议**: 
  ```typescript
  // 添加文件上传中间件
  import multer from 'multer';
  
  const upload = multer({
    dest: 'uploads/',
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 1,
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type'));
      }
      cb(null, true);
    },
  });
  ```

### 6.4 环境变量安全 ⚠️
- **状态**: 可改进
- **详情**: 
  - .env.example 文件存在但内容不完整
  - 建议添加所有必需的环境变量说明
- **建议**: 创建完整的 .env.example 文件

### 6.5 日志敏感信息 ⚠️
- **状态**: 需验证
- **详情**: 需检查日志是否记录敏感信息（密码、Token 等）

---

## 7. 数据库安全 ✅

### 7.1 Prisma Schema 设计 ✅
- **状态**: 通过
- **详情**: 
  - 使用 Prisma Schema 定义数据模型
  - 索引设计合理
  - 关系定义完整

### 7.2 级联删除 ✅
- **状态**: 通过
- **详情**: 
  ```prisma
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  ```
  - 正确配置了级联删除策略

### 7.3 软删除 ✅
- **状态**: 通过
- **详情**: 
  ```prisma
  deletedAt DateTime? @map("deleted_at")
  ```
  - 主要实体实现了软删除字段

---

## 8. 发现的问题汇总

### 高危问题 🔴

| ID | 问题 | 影响 | 修复优先级 |
|----|------|------|------------|
| H1 | JWT Secret 默认值 | Token 可被伪造 | P0 |
| H2 | 文件上传安全缺失 | 恶意文件上传/DoS | P0 |

### 中危问题 🟡

| ID | 问题 | 影响 | 修复优先级 |
|----|------|------|------------|
| M1 | 缺少 CSP 配置 | XSS 风险增加 | P1 |
| M2 | Token 过期时间长 | 长期有效 Token 风险 | P1 |
| M3 | Rate Limit 粒度粗 | 暴力破解防护不足 | P2 |

### 低危问题 🟢

| ID | 问题 | 影响 | 修复优先级 |
|----|------|------|------------|
| L1 | .env.example 不完整 | 部署配置错误 | P3 |
| L2 | 日志敏感信息检查 | 信息泄露风险 | P3 |

---

## 9. 修复建议

### 9.1 立即修复 (P0)

#### H1: JWT Secret 硬编码
```typescript
// apps/api/src/utils/jwt.ts
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable must be set');
}
```

#### H2: 文件上传安全
```typescript
// 创建 apps/api/src/middleware/upload.middleware.ts
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
    cb(null, true);
  },
});
```

### 9.2 近期修复 (P1)

#### M1: 添加 CSP 配置
```typescript
// apps/api/src/server.ts
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "https:"],
      "font-src": ["'self'"],
      "object-src": ["'none'"],
      "frame-ancestors": ["'none'"],
    },
  })
);
```

#### M2: 实现双 Token 机制
```typescript
// Access Token: 15分钟
// Refresh Token: 7天
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';
```

### 9.3 长期优化 (P2-P3)

- 细化 Rate Limit 策略
- 添加输入验证库
- 完善环境变量文档
- 审计日志敏感信息

---

## 10. 安全检查清单

### 后端安全 ✅❌

- [x] Helmet 安全头配置
- [x] CORS 配置
- [x] Rate Limit 配置
- [x] JWT 认证实现
- [x] Token 黑名单机制
- [x] bcrypt 密码加密
- [x] RBAC 权限控制
- [ ] CSP 内容安全策略
- [ ] 文件上传安全验证
- [ ] JWT Secret 环境变量强制

### 前端安全 ✅❌

- [x] React 自动转义
- [x] 无 dangerouslySetInnerHTML 滥用
- [ ] CSP 响应头配置
- [ ] 环境变量安全处理

### 数据库安全 ✅❌

- [x] Prisma 参数化查询
- [x] 索引优化
- [x] 级联删除策略
- [x] 软删除支持

### 认证安全 ✅❌

- [x] Bearer Token 认证
- [x] 密码强度加密
- [x] Token 撤销机制
- [ ] Token 过期时间优化
- [ ] JWT Secret 安全配置

---

## 11. 总结

### 优点 👍
1. 使用现代化技术栈，安全性基础良好
2. Prisma ORM 有效防止 SQL 注入
3. bcrypt 密码加密强度足够
4. RBAC 权限系统设计完善
5. Token 黑名单机制实现完整

### 需改进 ⚠️
1. JWT Secret 硬编码问题需立即修复
2. 文件上传安全机制需要加强
3. CSP 安全策略需要配置
4. Token 过期策略需要优化

### 下一步行动
1. **立即**: 修复 H1、H2 高危问题
2. **本周**: 配置 CSP、优化 Token 过期时间
3. **本月**: 细化 Rate Limit、完善文档

---

**审查完成时间**: 2026-03-11  
**下次审查建议**: 3 个月后或重大更新时
