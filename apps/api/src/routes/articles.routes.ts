import { Router } from 'express';
import { z } from 'zod';

import { authenticate, type AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import * as articleService from '../services/article.service';
import { success, paginated } from '../utils/response';

const router: ReturnType<typeof Router> = Router();

// 验证 schemas
const createArticleSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    slug: z.string().min(1).max(255).optional().or(z.undefined()),
    content: z.any().optional(),
    excerpt: z.string().optional(),
    thumbnail: z.string().optional(),
    categoryId: z.number().optional(),
    tagIds: z.array(z.number()).optional(),
    tags: z.array(z.string()).optional(), // 支持标签名称
    status: z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED']).optional(),
    metadata: z.any().optional(),
  }).passthrough(), // 允许额外字段
});

const updateArticleSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    slug: z.string().min(1).max(255).optional(),
    content: z.any().optional(),
    excerpt: z.string().optional(),
    thumbnail: z.string().optional(),
    categoryId: z.number().optional(),
    tagIds: z.array(z.number()).optional(),
    metadata: z.any().optional(),
    status: z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED']).optional(),
  }),
});

const getArticlesSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED']).optional(),
    categoryId: z.string().optional(),
    authorId: z.string().optional(),
    search: z.string().optional(),
  }),
});

// 获取文章列表（公开）
router.get('/', validate(getArticlesSchema), async (req, res, next) => {
  try {
    const { page, limit, status, categoryId, authorId, search } = req.query;
    const tenantId = req.tenantId || 'default';
    const query: Parameters<typeof articleService.getArticles>[0] = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      status: status as any,
      search: search as string,
    };

    if (categoryId) {
      query.categoryId = parseInt(categoryId as string);
    }

    if (authorId) {
      query.authorId = parseInt(authorId as string);
    }

    const result = await articleService.getArticles(query, tenantId);
    paginated(res, result.articles, result.page, result.limit, result.total);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 根据 ID 获取文章（公开）
router.get('/:id', async (req, res, next) => {
  try {
    const tenantId = req.tenantId || 'default';
    const articleId = parseInt(req.params['id'], 10);
    const article = await articleService.getArticleById(articleId, tenantId);
    success(res, article);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 根据 slug 获取文章（公开）
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const tenantId = req.tenantId || 'default';
    const slug = req.params['slug'];
    const article = await articleService.getArticleBySlug(slug, tenantId);
    success(res, article);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 创建文章（需要认证）
router.post('/', authenticate, validate(createArticleSchema), async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const article = await articleService.createArticle({
      ...req.body,
      authorId: req.user.userId,
      tenantId: req.tenantId ?? 'default',
    });
    success(res, article, 201);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 更新文章（需要认证）
router.put('/:id', authenticate, validate(updateArticleSchema), async (req: AuthRequest, res, next) => {
  try {
    const articleId = parseInt(req.params['id'] ?? '', 10);
    const article = await articleService.updateArticle(articleId, {
      ...req.body,
      tenantId: req.tenantId ?? 'default',
    });
    success(res, article);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

// 删除文章（需要认证）
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const tenantId = req.tenantId || 'default';
    const articleId = parseInt(req.params['id'] ?? '', 10);
    const result = await articleService.deleteArticle(articleId, tenantId);
    success(res, result);
    return;
  } catch (error) {
    next(error);
    return;
  }
});

export default router;
