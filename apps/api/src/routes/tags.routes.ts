import { Router, type Request, type Response } from 'express';
import { z } from 'zod';

import { authenticate, type AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { prisma } from '../services/database.service';

const router: ReturnType<typeof Router> = Router();

// Validation schemas
const createTagSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50),
    slug: z.string().min(1).max(50).optional(),
  }),
});

const updateTagSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    slug: z.string().min(1).max(50).optional(),
  }),
});

// Helper function to generate slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '');
};

// GET /api/v1/tags - 获取所有标签
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query['page'] as string) ?? '1', 10) || 1;
    const limit = parseInt((req.query['limit'] as string) ?? '10', 10) || 10;
    const skip = (page - 1) * limit;

    const [tags, total] = await Promise.all([
      prisma.tags.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { article_tags: true },
          },
        },
      }),
      prisma.tags.count(),
    ]);

    res.json({
      success: true,
      data: tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        createdAt: tag.created_at,
        articleCount: tag._count.article_tags,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
    return;
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tags' });
    return;
  }
});

// GET /api/v1/tags/:id - 获取单个标签
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tagId = parseInt(req.params['id'] ?? '', 10);

    const tag = await prisma.tags.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      res.status(404).json({ success: false, error: 'Tag not found' });
      return;
    }

    // Fetch related articles separately with proper filtering
    const articleTags = await prisma.article_tags.findMany({
      where: { tag_id: tagId },
      take: 10,
      include: {
        articles: true,
      },
      orderBy: { articles: { created_at: 'desc' } },
    });

    const articles = articleTags
      .map((at) => at.articles)
      .filter((a) => a.deleted_at === null);

    res.json({
      success: true,
      data: {
        ...tag,
        articles,
      },
    });
    return;
  } catch (error) {
    console.error('Failed to fetch tag:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tag' });
    return;
  }
});

// POST /api/v1/tags - 创建标签（需要认证）
router.post('/', authenticate, validate(createTagSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug } = req.body;
    const tenantId = req.tenantId ?? 'default';

    // Auto-generate slug if not provided
    const tagSlug = slug || generateSlug(name);

    // Check if slug exists
    const existingTag = await prisma.tags.findFirst({
      where: { slug: tagSlug, tenant_id: tenantId },
    });

    if (existingTag) {
      res.status(409).json({
        success: false,
        error: 'Tag with this slug already exists',
      });
      return;
    }

    const tag = await prisma.tags.create({
      data: {
        name,
        slug: tagSlug,
        tenant_id: tenantId,
        updated_at: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      data: tag,
    });
    return;
  } catch (error) {
    console.error('Failed to create tag:', error);
    res.status(500).json({ success: false, error: 'Failed to create tag' });
    return;
  }
});

// PUT /api/v1/tags/:id - 更新标签（需要认证）
router.put('/:id', authenticate, validate(updateTagSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tagId = parseInt(req.params['id'] ?? '', 10);
    const { name, slug } = req.body;
    const tenantId = req.tenantId ?? 'default';

    // Check if tag exists
    const existingTag = await prisma.tags.findFirst({
      where: { id: tagId, tenant_id: tenantId },
    });

    if (!existingTag) {
      res.status(404).json({ success: false, error: 'Tag not found' });
      return;
    }

    // Check slug uniqueness if updating slug
    if (slug && slug !== existingTag.slug) {
      const slugExists = await prisma.tags.findFirst({
        where: { slug, tenant_id: tenantId, NOT: { id: tagId } },
      });
      if (slugExists) {
        res.status(409).json({
          success: false,
          error: 'Tag with this slug already exists',
        });
        return;
      }
    }

    const tag = await prisma.tags.update({
      where: { id: tagId },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        updated_at: new Date(),
      },
    });

    res.json({ success: true, data: tag });
    return;
  } catch (error) {
    console.error('Failed to update tag:', error);
    res.status(500).json({ success: false, error: 'Failed to update tag' });
    return;
  }
});

// DELETE /api/v1/tags/:id - 删除标签（需要认证）
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tagId = parseInt(req.params['id'] ?? '', 10);
    const tenantId = req.tenantId ?? 'default';

    // Check if tag exists
    const existingTag = await prisma.tags.findFirst({
      where: { id: tagId, tenant_id: tenantId },
    });

    if (!existingTag) {
      res.status(404).json({ success: false, error: 'Tag not found' });
      return;
    }

    // Delete article_tags relations first
    await prisma.article_tags.deleteMany({
      where: { tag_id: tagId },
    });

    // Delete the tag
    await prisma.tags.delete({
      where: { id: tagId },
    });

    res.json({ success: true, data: { id: tagId } });
    return;
  } catch (error) {
    console.error('Failed to delete tag:', error);
    res.status(500).json({ success: false, error: 'Failed to delete tag' });
    return;
  }
});

export default router;
