import { Router, type Request, type Response } from 'express';
import { z } from 'zod';

import { authenticate, type AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { prisma } from '../services/database.service';

const router: ReturnType<typeof Router> = Router();

// Validation schemas
const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    sortOrder: z.number().optional(),
  }),
});

const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    sortOrder: z.number().optional(),
  }),
});

// Helper function to generate slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '');
};

// GET /api/v1/categories - 获取所有分类
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query['page'] as string) ?? '1', 10) || 1;
    const limit = parseInt((req.query['limit'] as string) ?? '10', 10) || 10;
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      prisma.categories.findMany({
        skip,
        take: limit,
        orderBy: { sort_order: 'asc' },
        include: {
          _count: {
            select: { articles: true },
          },
        },
      }),
      prisma.categories.count(),
    ]);

    res.json({
      success: true,
      data: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sort_order,
        createdAt: cat.created_at,
        updatedAt: cat.updated_at,
        articleCount: cat._count.articles,
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
    console.error('Failed to fetch categories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
    return;
  }
});

// GET /api/v1/categories/:id - 获取单个分类
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const categoryId = parseInt(req.params['id'] ?? '', 10);
    const category = await prisma.categories.findUnique({
      where: { id: categoryId },
      include: {
        articles: {
          where: { deleted_at: null },
          take: 10,
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!category) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    res.json({ success: true, data: category });
    return;
  } catch (error) {
    console.error('Failed to fetch category:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch category' });
    return;
  }
});

// POST /api/v1/categories - 创建分类（需要认证）
router.post('/', authenticate, validate(createCategorySchema), async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, description, sortOrder } = req.body;
    const tenantId = req.tenantId ?? 'default';

    // Auto-generate slug if not provided
    const categorySlug = slug || generateSlug(name);

    // Check if slug exists
    const existingCategory = await prisma.categories.findFirst({
      where: { slug: categorySlug, tenant_id: tenantId },
    });

    if (existingCategory) {
      res.status(409).json({
        success: false,
        error: 'Category with this slug already exists',
      });
      return;
    }

    const category = await prisma.categories.create({
      data: {
        name,
        slug: categorySlug,
        description,
        sort_order: sortOrder || 0,
        tenant_id: tenantId,
        updated_at: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      data: category,
    });
    return;
  } catch (error) {
    console.error('Failed to create category:', error);
    res.status(500).json({ success: false, error: 'Failed to create category' });
    return;
  }
});

// PUT /api/v1/categories/:id - 更新分类（需要认证）
router.put('/:id', authenticate, validate(updateCategorySchema), async (req: AuthRequest, res: Response) => {
  try {
    const categoryId = parseInt(req.params['id'] ?? '', 10);
    const { name, slug, description, sortOrder } = req.body;
    const tenantId = req.tenantId ?? 'default';

    // Check if category exists
    const existingCategory = await prisma.categories.findFirst({
      where: { id: categoryId, tenant_id: tenantId },
    });

    if (!existingCategory) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    // Check slug uniqueness if updating slug
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await prisma.categories.findFirst({
        where: { slug, tenant_id: tenantId, NOT: { id: categoryId } },
      });
      if (slugExists) {
        res.status(409).json({
          success: false,
          error: 'Category with this slug already exists',
        });
        return;
      }
    }

    const category = await prisma.categories.update({
      where: { id: categoryId },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(sortOrder !== undefined && { sort_order: sortOrder }),
        updated_at: new Date(),
      },
    });

    res.json({ success: true, data: category });
    return;
  } catch (error) {
    console.error('Failed to update category:', error);
    res.status(500).json({ success: false, error: 'Failed to update category' });
    return;
  }
});

// DELETE /api/v1/categories/:id - 删除分类（需要认证）
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const categoryId = parseInt(req.params['id'] ?? '', 10);
    const tenantId = req.tenantId ?? 'default';

    // Check if category exists
    const existingCategory = await prisma.categories.findFirst({
      where: { id: categoryId, tenant_id: tenantId },
    });

    if (!existingCategory) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    await prisma.categories.delete({
      where: { id: categoryId },
    });

    res.json({ success: true, data: { id: categoryId } });
    return;
  } catch (error) {
    console.error('Failed to delete category:', error);
    res.status(500).json({ success: false, error: 'Failed to delete category' });
    return;
  }
});

export default router;
