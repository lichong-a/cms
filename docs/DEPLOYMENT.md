# CMS系统Docker部署指南

> 📅 更新时间: 2026-03-11
> 🎯 部署方式: Docker容器化部署
> ⚡ 技术栈: React 19 + Next.js 15 + Node.js 22

---

## 🚀 快速部署

### 1. 前置要求

#### 本地环境
- ✅ Docker 27.x+
- ✅ Docker Compose 2.x+
- ✅ Git
- ✅ Node.js 22+ (仅用于数据库迁移)

#### 外部服务（已存在）
- ✅ TimescaleDB (PostgreSQL 18) - `${RIC_PG_IP}:${RIC_PG_PORT}`
- ✅ Redis 8.6.x - `${RIC_REDIS_IP}:${RIC_REDIS_PORT}`
- ✅ Elasticsearch 9.3.1 - `${RIC_ES_IP}:${RIC_ES_PORT}`

### 2. 克隆项目
```bash
git clone <your-repo-url>
cd cms
```

### 3. Docker 配置文件说明

#### 前端 Dockerfile (apps/web-frontend/Dockerfile, apps/web-admin/Dockerfile)
- 使用多阶段构建优化镜像大小
- 基于 `node:22-alpine` 轻量级镜像
- 支持 Next.js standalone 模式
- 使用非 root 用户运行

#### 后端 Dockerfile (apps/api/Dockerfile)
- 使用多阶段构建优化镜像大小
- 基于 `node:22-alpine` 轻量级镜像
- 自动生成 Prisma 客户端
- 使用非 root 用户运行

#### docker-compose.yml
包含四个服务：
- **nginx**: 反向代理，监听 80/443 端口
- **cms-web-frontend**: 前台展示，内部端口 3001
- **cms-web-admin**: 后台管理，内部端口 3002
- **cms-api**: 后端 API，内部端口 3003

#### nginx.conf
- 反向代理配置
- Gzip 压缩
- WebSocket 支持
- 文件上传限制 (10M)

#### .env.production
- 生产环境变量配置
- 包含数据库、Redis、ES、JWT 等配置

### 4. 配置环境变量

项目提供了 `.env.production` 模板文件，包含所有必要的环境变量配置。

#### 方式 1: 使用 .env.production 文件
```bash
# 直接修改 .env.production 文件
vim .env.production

# 主要需要修改的配置：
# - JWT_SECRET: 使用强随机字符串
# - ENCRYPTION_KEY: 32字符加密密钥
# - 数据库连接信息（如果与默认不同）
```

#### 方式 2: 使用环境变量
```bash
# 创建 .env 文件供 docker-compose 使用
cp .env.production .env

# 或者直接在命令行传递
export JWT_SECRET="your-strong-secret-key"
export ENCRYPTION_KEY="your-32-char-encryption-key"
```

#### 安全提示 ⚠️
**生产环境必须修改以下配置**：
- `JWT_SECRET`: 使用至少 32 字符的强随机字符串
- `ENCRYPTION_KEY`: 必须是 32 字符的加密密钥
- 数据库密码：如果数据库不是专用的，建议修改
- Elasticsearch 密码：生产环境应使用强密码

### 5. 初始化数据库
```bash
# 安装依赖（用于数据库迁移）
pnpm install

# 生成Prisma客户端
pnpm run db:generate

# 运行数据库迁移
pnpm run db:migrate

# 填充初始数据（可选）
pnpm run db:seed
```

### 6. 构建并启动Docker容器
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps
```

#### 可选: 配置 HTTPS (SSL)
如果需要使用 HTTPS，需要准备 SSL 证书：
```bash
# 创建 SSL 目录
mkdir -p ssl

# 将证书文件放入 ssl 目录
# ssl/cert.pem - SSL 证书
# ssl/key.pem - SSL 私钥

# 编辑 nginx.conf，取消 HTTPS 部分的注释
vim nginx.conf

# 重启 Nginx
docker-compose restart nginx
```

### 7. 验证部署
```bash
# 检查 Nginx（推荐）
curl http://192.168.31.185

# 检查前端（直接访问，用于调试）
curl http://192.168.31.185:3001

# 检查 API（直接访问，用于调试）
curl http://192.168.31.185:3002/health

# 在浏览器中访问
# 通过 Nginx（推荐）: http://192.168.31.185
# 前端直接访问: http://192.168.31.185:3001
# API 直接访问: http://192.168.31.185:3002
```

#### 访问方式说明
- **通过 Nginx（推荐）**: http://192.168.31.185
  - 前端页面: http://192.168.31.185/
  - API 接口: http://192.168.31.185/api/
  - 优点: 统一入口，支持 HTTPS，更好的安全性

- **直接访问容器（仅用于调试）**:
  - 前端: http://192.168.31.185:3001
  - API: http://192.168.31.185:3002
  - 注意: 仅用于开发调试，生产环境不推荐

---

## 📦 Docker命令速查

### 基本操作
```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启所有服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f cms-web
docker-compose logs -f cms-api

# 查看服务状态
docker-compose ps

# 进入容器
docker-compose exec cms-web sh
docker-compose exec cms-api sh
```

### 镜像管理
```bash
# 重新构建镜像
docker-compose build

# 强制重新构建
docker-compose build --no-cache

# 拉取最新基础镜像
docker-compose pull

# 推送镜像到仓库
docker-compose push
```

### 数据管理
```bash
# 查看卷
docker volume ls

# 删除所有未使用的卷
docker volume prune

# 备份uploads目录
tar -czf uploads-backup.tar.gz ./uploads

# 恢复uploads目录
tar -xzf uploads-backup.tar.gz
```

---

## 🔧 故障排查

### 1. 容器无法启动
```bash
# 查看容器日志
docker-compose logs cms-web
docker-compose logs cms-api

# 查看容器状态
docker-compose ps

# 检查容器配置
docker-compose config
```

### 2. 数据库连接失败
```bash
# 测试数据库连接
docker run --rm postgres:16 psql "postgresql://${RIC_PG_USER}:${RIC_PG_PASSWORD}@${RIC_PG_IP}:${RIC_PG_PORT}/cms" -c "SELECT 1;"

# 检查环境变量
docker-compose exec cms-api env | grep DATABASE_URL
```

### 3. Redis连接失败
```bash
# 测试Redis连接
docker run --rm redis:7 redis-cli -h "${RIC_REDIS_IP}" -p "${RIC_REDIS_PORT}" -a "${RIC_REDIS_PASSWORD}" ping

# 检查环境变量
docker-compose exec cms-api env | grep REDIS_URL
```

### 4. Elasticsearch连接失败
```bash
# 测试ES连接
curl -u "${RIC_ES_USER}:${RIC_ES_PASSWORD}" "http://${RIC_ES_IP}:${RIC_ES_PORT}"

# 检查环境变量
docker-compose exec cms-api env | grep ES_HOST
```

### 5. 前端页面无法访问
```bash
# 检查前端容器
docker-compose logs cms-web

# 检查端口占用
netstat -tulpn | grep 3001

# 检查防火墙
sudo ufw status
```

### 6. API接口无法访问
```bash
# 检查API容器
docker-compose logs cms-api

# 检查端口占用
netstat -tulpn | grep 3002

# 测试健康检查
curl http://192.168.31.185:3002/health
```

---

## 🔄 更新部署

### 方式1: 重新构建
```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

### 方式2: 滚动更新
```bash
# 构建新镜像
docker-compose build

# 停止旧容器
docker-compose stop cms-web cms-api

# 启动新容器
docker-compose up -d
```

### 方式3: 零停机更新（推荐）
```bash
# 构建新镜像
docker-compose build

# 使用新镜像启动新容器
docker-compose up -d --no-deps --build cms-web
docker-compose up -d --no-deps --build cms-api
```

---

## 🗄️ 数据库迁移

### 运行迁移
```bash
# 进入API容器
docker-compose exec cms-api sh

# 运行迁移
npx prisma migrate deploy
```

### 重置数据库（危险操作！）
```bash
# 停止服务
docker-compose down

# 重置数据库
npx prisma migrate reset --force

# 重新启动
docker-compose up -d
```

---

## 📊 性能优化

### 1. 镜像优化
```dockerfile
# 使用alpine基础镜像
FROM node:22-alpine

# 多阶段构建
# 分离构建和运行环境
```

### 2. 缓存优化
```dockerfile
# 先复制package文件，利用Docker缓存
COPY package.json package-lock.json ./
RUN pnpm install --frozen-lockfile

# 再复制源代码
COPY . .
```

### 3. 资源限制
```yaml
# docker-compose.yml
services:
  cms-web:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## 🛡️ 安全加固

### 1. 使用非root用户
```dockerfile
# 创建用户
RUN adduser --system --uid 1001 nodejs

# 切换用户
USER nodejs
```

### 2. 环境变量管理
```bash
# 不要在代码中硬编码敏感信息
# 使用.env文件或环境变量
```

### 3. 网络隔离
```yaml
# docker-compose.yml
networks:
  cms-network:
    driver: bridge
    internal: true  # 内部网络
```

---

## 📈 监控和日志

### 1. 查看实时日志
```bash
# 所有服务
docker-compose logs -f

# 特定服务
docker-compose logs -f cms-api --tail=100

# 带时间戳
docker-compose logs -f --timestamps
```

### 2. 导出日志
```bash
# 导出到文件
docker-compose logs > cms-logs.txt

# 导出最近100行
docker-compose logs --tail=100 > cms-recent-logs.txt
```

### 3. 监控容器资源
```bash
# 实时监控
docker stats

# 查看特定容器
docker stats cms-web cms-api
```

---

## 🔐 备份和恢复

### 1. 备份uploads
```bash
# 创建备份
tar -czf backup-uploads-$(date +%Y%m%d).tar.gz ./uploads

# 恢复备份
tar -xzf backup-uploads-20260311.tar.gz
```

### 2. 备份数据库
```bash
# 导出数据库
docker run --rm postgres:16 pg_dump \
  "postgresql://${RIC_PG_USER}:${RIC_PG_PASSWORD}@${RIC_PG_IP}:${RIC_PG_PORT}/cms" \
  > cms-db-backup-$(date +%Y%m%d).sql

# 恢复数据库
docker run --rm -i postgres:16 psql \
  "postgresql://${RIC_PG_USER}:${RIC_PG_PASSWORD}@${RIC_PG_IP}:${RIC_PG_PORT}/cms" \
  < cms-db-backup-20260311.sql
```

---

## 🚀 生产环境建议

### 1. 使用环境变量文件
```bash
# 创建生产环境变量
.env.production
```

### 2. 健康检查
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3002/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### 3. 自动重启
```yaml
restart: unless-stopped
```

### 4. 资源限制
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
```

### 5. 日志轮转
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

## 📋 部署检查清单

### 部署前
- [ ] 检查外部服务状态（DB、Redis、ES）
- [ ] 配置环境变量
- [ ] 运行数据库迁移
- [ ] 构建测试通过

### 部署中
- [ ] 构建Docker镜像成功
- [ ] 启动容器成功
- [ ] 健康检查通过
- [ ] 日志无错误

### 部署后
- [ ] 前端页面可访问
- [ ] API接口正常
- [ ] 数据库连接正常
- [ ] Redis连接正常
- [ ] Elasticsearch连接正常
- [ ] 文件上传功能正常

---

## 🆘 获取帮助

### 日志位置
- 前端日志: `docker-compose logs cms-web`
- API日志: `docker-compose logs cms-api`
- Elasticsearch: `http://${RIC_ES_IP}:${RIC_ES_PORT}`

### 常用调试命令
```bash
# 进入容器
docker-compose exec cms-api sh

# 查看环境变量
docker-compose exec cms-api env

# 查看进程
docker-compose exec cms-api ps aux

# 测试网络连接
docker-compose exec cms-api ping ${RIC_PG_IP}
```

---

**文档版本**: 1.0  
**创建时间**: 2026-03-11  
**维护者**: 开发团队

_此部署指南简化了部署流程，只使用Docker容器，无需额外的ELK和Nginx。_
