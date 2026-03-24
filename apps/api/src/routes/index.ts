import { Router } from 'express';

import articlesRoutes from './articles.routes';
import authRoutes from './auth.routes';
import categoriesRoutes from './categories.routes';
import configRoutes from './config.routes';
import dashboardRoutes from './dashboard.routes';
import mediaRoutes from './media.routes';
import ossRoutes from './oss.routes';
import stsRoutes from './sts.routes';
import tagsRoutes from './tags.routes';
import tenantsRoutes from './tenants.routes';
import uploadRoutes from './upload.routes';

const router: ReturnType<typeof Router> = Router();

// API 版本信息
router.get('/', (_req, res) => {
  res.json({
    name: 'CMS API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      articles: '/api/v1/articles',
      categories: '/api/v1/categories',
      tags: '/api/v1/tags',
      config: '/api/v1/config',
      media: '/api/v1/media',
      upload: '/api/v1/upload',
      sts: '/api/v1/auth/sts',
      oss: '/api/v1/upload/oss',
      dashboard: '/api/v1/dashboard',
      tenants: '/api/v1/tenants',
    },
  });
});

// 注册路由
router.use('/auth', authRoutes);
router.use('/articles', articlesRoutes);
router.use('/categories', categoriesRoutes);
router.use('/tags', tagsRoutes);
router.use('/config', configRoutes);
router.use('/media', mediaRoutes);
router.use('/upload', uploadRoutes);
router.use('/upload', ossRoutes);
router.use('/', stsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/tenants', tenantsRoutes);

export default router;
