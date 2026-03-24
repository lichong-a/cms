import { Router } from 'express';

import { authenticate, type AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../services/database.service';

const router: ReturnType<typeof Router> = Router();

/**
 * 获取仪表盘统计数据
 */
router.get('/stats', authenticate, async (req: AuthRequest, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;

    if (!tenantId) {
      res.status(400).json({
        success: false,
        error: 'Tenant ID is required',
      });
      return;
    }

    // 并行查询所有统计数据
    const [
      articleCount,
      categoryCount,
      tagCount,
      userCount,
      mediaCount,
      recentArticles,
    ] = await Promise.all([
      // 文章总数（排除已删除）
      prisma.articles.count({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
        },
      }),

      // 分类总数
      prisma.categories.count({
        where: {
          tenant_id: tenantId,
        },
      }),

      // 标签总数
      prisma.tags.count({
        where: {
          tenant_id: tenantId,
        },
      }),

      // 用户总数（排除已删除）
      prisma.users.count({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
        },
      }),

      // 媒体文件总数（排除已删除）
      prisma.media_files.count({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
        },
      }),

      // 最近5篇文章
      prisma.articles.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
        },
        take: 5,
        orderBy: {
          created_at: 'desc',
        },
        select: {
          id: true,
          title: true,
          status: true,
          created_at: true,
          published_at: true,
          users: {
            select: {
              username: true,
            },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        articleCount,
        categoryCount,
        tagCount,
        userCount,
        mediaCount,
        recentArticles: recentArticles.map((article) => ({
          id: article.id,
          title: article.title,
          status: article.status,
          createdAt: article.created_at,
          publishedAt: article.published_at,
          author: article.users?.username || '未知',
        })),
      },
    });
    return;
  } catch (error) {
    console.error('获取仪表盘统计失败:', error);
    res.status(500).json({
      success: false,
      error: '获取统计数据失败',
    });
    return;
  }
});

export default router;
