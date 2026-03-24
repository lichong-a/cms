# 后端 Dockerfile - Express 5 with TypeScript
FROM node:22-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 生成 Prisma 客户端
RUN npx prisma generate

# 构建 TypeScript
RUN npm run build

# 运行阶段 - 使用轻量级镜像
FROM node:22-alpine AS runner

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# 复制构建产物和依赖
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# 创建上传目录
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app/uploads

# 切换到非 root 用户
USER nodejs

# 暴露端口
EXPOSE 3003

# 启动应用
CMD ["node", "dist/bootstrap.js"]
