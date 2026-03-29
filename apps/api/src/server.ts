import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import swaggerDocs from './docs/swagger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { tenantMiddleware } from './middleware/tenant';
import routes from './routes';
import { connectRedis, disconnectRedis } from './services/cache.service';
import { connectDatabase, disconnectDatabase } from './services/database.service';
import { buildAllowedOrigins, isAllowedOrigin, shouldAllowLanOrigins } from './utils/cors';
import { ensureDefaultAdmin, ensureDefaultTenant } from './services/tenant.service';
import logger from './utils/logger';

const app = express();
const PORT = process.env['PORT'] || 3003;

const allowedOrigins = buildAllowedOrigins();
const allowLanOrigins = shouldAllowLanOrigins();

// 中间件 - 开发环境禁用 CSP 以支持 Swagger UI
app.use(
  helmet({
    ...(process.env['NODE_ENV'] === 'production' ? {} : { contentSecurityPolicy: false }),
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // 允许无 origin 的请求（如移动应用、Postman）
    if (!origin) return callback(null, true);
    
    if (isAllowedOrigin(origin, allowedOrigins, { allowLanOrigins })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 速率限制
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个 IP 最多 100 个请求
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
    },
  },
}));

// 健康检查（不需要租户验证）
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 租户中间件（在路由之前，但在 health 之后）
app.use(tenantMiddleware);

// 静态文件服务
app.use('/uploads', express.static(process.env['UPLOAD_DIR'] || './uploads'));

// API 路由
app.use('/api/v1', routes);

// Swagger API 文档
app.use('/api/docs', swaggerDocs);

// 404 处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 启动服务器
const startServer = async () => {
  try {
    // 连接数据库
    await connectDatabase();

    // 连接 Redis
    await connectRedis();

    // 确保默认租户在启动前就存在，避免请求链路里产生副作用
    await ensureDefaultTenant();
    await ensureDefaultAdmin();

    // 生成 Prisma Client
    logger.info('🔄 Generating Prisma Client...');
    
    // 启动 Express 服务器
    app.listen(PORT, () => {
      logger.info(`🚀 CMS API 服务已启动: http://localhost:${PORT}`);
      logger.info(`📚 API 文档: http://localhost:${PORT}/api/v1`);
      logger.info(`📖 Swagger 文档: http://localhost:${PORT}/api/docs`);
      logger.info(`❤️  健康检查: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

// 优雅关闭
const gracefulShutdown = async () => {
  logger.info('📤 Shutting down gracefully...');

  try {
    await disconnectDatabase();
    await disconnectRedis();
    logger.info('✅ All connections closed');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();
