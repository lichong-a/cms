import { article_status, tenant_status, type Prisma } from '@prisma/client';
import { Router, type Response } from 'express';
import { z } from 'zod';

import { authenticate, type AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { prisma } from '../services/database.service';

const router: ReturnType<typeof Router> = Router();

const createTenantSchema = z.object({
  body: z.object({
    id: z.string().min(1).max(30),
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(50),
    logo: z.string().max(500).optional(),
    config: z.any().optional(),
  }),
});

const updateTenantSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(50).optional(),
    logo: z.string().max(500).optional(),
    config: z.any().optional(),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'TRIAL', 'DISABLED']).optional(),
  }),
});

const getTenantId = (req: AuthRequest): string => req.params['id'] ?? '';

const toInputJson = (value: unknown): Prisma.InputJsonValue => {
  return ((value ?? {}) as Prisma.InputJsonValue);
};

const ensureUniqueSlug = async (
  table: 'categories' | 'tags' | 'articles',
  baseSlug: string,
  tenantId: string
): Promise<string> => {
  let slug = baseSlug;
  let attempt = 0;

  while (true) {
    const existing =
      table === 'categories'
        ? await prisma.categories.findFirst({ where: { slug, tenant_id: tenantId } })
        : table === 'tags'
          ? await prisma.tags.findFirst({ where: { slug, tenant_id: tenantId } })
          : await prisma.articles.findFirst({ where: { slug, tenant_id: tenantId } });

    if (!existing) {
      return slug;
    }

    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }
};

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt((req.query['page'] as string) ?? '1', 10) || 1;
    const limit = parseInt((req.query['limit'] as string) ?? '10', 10) || 10;
    const status = req.query['status'] as string | undefined;
    const search = req.query['search'] as string | undefined;
    const skip = (page - 1) * limit;

    const where: Prisma.tenantsWhereInput = {};

    if (status) {
      where.status = status as tenant_status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tenants, total] = await Promise.all([
      prisma.tenants.findMany({
        skip,
        take: limit,
        where,
        orderBy: { created_at: 'desc' },
      }),
      prisma.tenants.count({ where }),
    ]);

    res.json({
      success: true,
      data: tenants.map((tenant) => ({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        logo: tenant.logo,
        status: tenant.status,
        config: tenant.config,
        createdAt: tenant.created_at,
        updatedAt: tenant.updated_at,
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
    console.error('Failed to fetch tenants:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tenants' });
    return;
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = getTenantId(req);

    const tenant = await prisma.tenants.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            users: true,
            articles: true,
            categories: true,
            tags: true,
          },
        },
      },
    });

    if (!tenant) {
      res.status(404).json({ success: false, error: 'Tenant not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        ...tenant,
        counts: tenant._count,
      },
    });
    return;
  } catch (error) {
    console.error('Failed to fetch tenant:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tenant' });
    return;
  }
});

router.post('/', authenticate, validate(createTenantSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { id, name, slug, logo, config } = req.body;

    const existingTenant = await prisma.tenants.findFirst({
      where: {
        OR: [{ id }, { slug }],
      },
    });

    if (existingTenant) {
      res.status(409).json({
        success: false,
        error: existingTenant.id === id ? 'Tenant ID already exists' : 'Tenant slug already exists',
      });
      return;
    }

    const tenant = await prisma.tenants.create({
      data: {
        id,
        name,
        slug,
        logo,
        config: toInputJson(config),
        status: tenant_status.ACTIVE,
        updated_at: new Date(),
      },
    });

    res.status(201).json({ success: true, data: tenant });
    return;
  } catch (error) {
    console.error('Failed to create tenant:', error);
    res.status(500).json({ success: false, error: 'Failed to create tenant' });
    return;
  }
});

router.put('/:id', authenticate, validate(updateTenantSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { name, slug, logo, config, status } = req.body;

    const existingTenant = await prisma.tenants.findUnique({
      where: { id: tenantId },
    });

    if (!existingTenant) {
      res.status(404).json({ success: false, error: 'Tenant not found' });
      return;
    }

    if (slug && slug !== existingTenant.slug) {
      const slugExists = await prisma.tenants.findFirst({
        where: { slug, NOT: { id: tenantId } },
      });

      if (slugExists) {
        res.status(409).json({
          success: false,
          error: 'Tenant with this slug already exists',
        });
        return;
      }
    }

    const data: Prisma.tenantsUpdateInput = {
      updated_at: new Date(),
    };

    if (name !== undefined) data.name = name;
    if (slug !== undefined) data.slug = slug;
    if (logo !== undefined) data.logo = logo;
    if (config !== undefined) data.config = toInputJson(config);
    if (status !== undefined) data.status = status;

    const tenant = await prisma.tenants.update({
      where: { id: tenantId },
      data,
    });

    res.json({ success: true, data: tenant });
    return;
  } catch (error) {
    console.error('Failed to update tenant:', error);
    res.status(500).json({ success: false, error: 'Failed to update tenant' });
    return;
  }
});

router.get('/:id/config', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const tenant = await prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { config: true },
    });

    if (!tenant) {
      res.status(404).json({ success: false, error: 'Tenant not found' });
      return;
    }

    res.json({ success: true, data: tenant.config || {} });
    return;
  } catch (error) {
    console.error('Failed to fetch tenant config:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tenant config' });
    return;
  }
});

router.put('/:id/config', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { config } = req.body as { config?: Record<string, unknown> };

    if (!config || typeof config !== 'object') {
      res.status(400).json({ success: false, error: 'Config is required' });
      return;
    }

    const existingTenant = await prisma.tenants.findUnique({
      where: { id: tenantId },
    });

    if (!existingTenant) {
      res.status(404).json({ success: false, error: 'Tenant not found' });
      return;
    }

    const mergedConfig = {
      ...((existingTenant.config as Record<string, unknown> | null) || {}),
      ...config,
    };

    const tenant = await prisma.tenants.update({
      where: { id: tenantId },
      data: {
        config: toInputJson(mergedConfig),
        updated_at: new Date(),
      },
    });

    res.json({ success: true, data: tenant });
    return;
  } catch (error) {
    console.error('Failed to update tenant config:', error);
    res.status(500).json({ success: false, error: 'Failed to update tenant config' });
    return;
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const existingTenant = await prisma.tenants.findUnique({
      where: { id: tenantId },
    });

    if (!existingTenant) {
      res.status(404).json({ success: false, error: 'Tenant not found' });
      return;
    }

    const tenant = await prisma.tenants.update({
      where: { id: tenantId },
      data: {
        status: tenant_status.DISABLED,
        updated_at: new Date(),
      },
    });

    res.json({
      success: true,
      data: { id: tenantId, status: tenant.status },
      message: 'Tenant has been disabled',
    });
    return;
  } catch (error) {
    console.error('Failed to delete tenant:', error);
    res.status(500).json({ success: false, error: 'Failed to delete tenant' });
    return;
  }
});

router.post('/:id/export', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { articles, categories, tags, media, users } = req.body as Record<string, boolean>;

    const tenant = await prisma.tenants.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(404).json({ success: false, error: 'Tenant not found' });
      return;
    }

    const exportData: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        config: tenant.config,
      },
    };

    if (articles) {
      exportData['articles'] = await prisma.articles.findMany({
        where: { tenant_id: tenantId },
        include: {
          categories: { select: { id: true, name: true } },
          article_tags: {
            include: {
              tags: { select: { id: true, name: true } },
            },
          },
        },
      });
    }

    if (categories) {
      exportData['categories'] = await prisma.categories.findMany({
        where: { tenant_id: tenantId },
      });
    }

    if (tags) {
      exportData['tags'] = await prisma.tags.findMany({
        where: { tenant_id: tenantId },
      });
    }

    if (media) {
      exportData['media'] = await prisma.media_files.findMany({
        where: { tenant_id: tenantId },
      });
    }

    if (users) {
      exportData['users'] = await prisma.users.findMany({
        where: { tenant_id: tenantId },
        select: {
          id: true,
          username: true,
          email: true,
          created_at: true,
        },
      });
    }

    res.json({ success: true, data: exportData });
    return;
  } catch (error) {
    console.error('Failed to export tenant data:', error);
    res.status(500).json({ success: false, error: 'Failed to export tenant data' });
    return;
  }
});

router.post('/:id/import', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    const { data } = req.body as { data?: Record<string, unknown> };

    if (!data || typeof data !== 'object') {
      res.status(400).json({ success: false, error: 'Invalid import data' });
      return;
    }

    const tenant = await prisma.tenants.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(404).json({ success: false, error: 'Tenant not found' });
      return;
    }

    const imported = { categories: 0, tags: 0, articles: 0, media: 0 };

    await prisma.$transaction(async (tx) => {
      if (Array.isArray(data['categories'])) {
        for (const rawCategory of data['categories']) {
          const cat = rawCategory as Record<string, unknown>;
          const slug = await ensureUniqueSlug('categories', String(cat['slug'] ?? `category-${Date.now()}`), tenantId);
          const categoryData: Prisma.categoriesUncheckedCreateInput = {
            name: String(cat['name'] ?? 'Imported Category'),
            slug,
            description: typeof cat['description'] === 'string' ? cat['description'] : null,
            tenant_id: tenantId,
            created_at: cat['created_at'] ? new Date(String(cat['created_at'])) : new Date(),
            updated_at: new Date(),
          };

          await tx.categories.create({
            data: categoryData,
          });
          imported.categories += 1;
        }
      }

      if (Array.isArray(data['tags'])) {
        for (const rawTag of data['tags']) {
          const tag = rawTag as Record<string, unknown>;
          const slug = await ensureUniqueSlug('tags', String(tag['slug'] ?? `tag-${Date.now()}`), tenantId);

          await tx.tags.create({
            data: {
              name: String(tag['name'] ?? 'Imported Tag'),
              slug,
              tenant_id: tenantId,
              created_at: tag['created_at'] ? new Date(String(tag['created_at'])) : new Date(),
              updated_at: new Date(),
            },
          });
          imported.tags += 1;
        }
      }

      if (Array.isArray(data['articles'])) {
        for (const rawArticle of data['articles']) {
          const article = rawArticle as Record<string, unknown>;
          const slug = await ensureUniqueSlug(
            'articles',
            String(article['slug'] ?? `article-${Date.now()}`),
            tenantId
          );
          const articleData: Prisma.articlesUncheckedCreateInput = {
            title: String(article['title'] ?? 'Imported Article'),
            slug,
            content: toInputJson(article['content'] ?? {}),
            excerpt: typeof article['excerpt'] === 'string' ? article['excerpt'] : null,
            status: (article['status'] as article_status | undefined) ?? article_status.DRAFT,
            tenant_id: tenantId,
            author_id: typeof article['author_id'] === 'number' ? article['author_id'] : null,
            created_at: article['created_at'] ? new Date(String(article['created_at'])) : new Date(),
            updated_at: new Date(),
            published_at: article['published_at'] ? new Date(String(article['published_at'])) : null,
          };

          await tx.articles.create({
            data: articleData,
          });
          imported.articles += 1;
        }
      }

      if (Array.isArray(data['media'])) {
        for (const rawMedia of data['media']) {
          const mediaFile = rawMedia as Record<string, unknown>;
          const mediaData: Prisma.media_filesUncheckedCreateInput = {
            filename: String(mediaFile['filename'] ?? `imported-${Date.now()}`),
            original_name: String(mediaFile['original_name'] ?? mediaFile['filename'] ?? 'imported-file'),
            mime_type: String(mediaFile['mime_type'] ?? 'application/octet-stream'),
            size: typeof mediaFile['size'] === 'number' ? mediaFile['size'] : 0,
            storage_path: String(mediaFile['storage_path'] ?? ''),
            tenant_id: tenantId,
            uploader_id: typeof mediaFile['uploader_id'] === 'number' ? mediaFile['uploader_id'] : null,
            metadata: toInputJson(mediaFile['metadata'] ?? {}),
          };

          await tx.media_files.create({
            data: mediaData,
          });
          imported.media += 1;
        }
      }
    });

    res.json({
      success: true,
      message: `导入完成: 分类 ${imported.categories}, 标签 ${imported.tags}, 文章 ${imported.articles}, 媒体 ${imported.media}`,
      imported,
    });
    return;
  } catch (error) {
    console.error('Failed to import tenant data:', error);
    res.status(500).json({ success: false, error: 'Failed to import tenant data' });
    return;
  }
});

router.post('/:id/clone', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const sourceTenantId = getTenantId(req);
    const { newTenantId, newTenantName, newTenantSlug, copyData } = req.body as {
      newTenantId?: string;
      newTenantName?: string;
      newTenantSlug?: string;
      copyData?: { categories?: boolean; tags?: boolean; articles?: boolean; media?: boolean };
    };

    if (!newTenantId || !newTenantName || !newTenantSlug) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }

    const sourceTenant = await prisma.tenants.findUnique({ where: { id: sourceTenantId } });
    if (!sourceTenant) {
      res.status(404).json({ success: false, error: 'Source tenant not found' });
      return;
    }

    const existingTenant = await prisma.tenants.findFirst({
      where: { OR: [{ id: newTenantId }, { slug: newTenantSlug }] },
    });
    if (existingTenant) {
      res.status(409).json({ success: false, error: 'Target tenant already exists' });
      return;
    }

    const copied = { categories: 0, tags: 0, articles: 0, media: 0 };

    await prisma.$transaction(async (tx) => {
      await tx.tenants.create({
        data: {
          id: newTenantId,
          name: newTenantName,
          slug: newTenantSlug,
          config: toInputJson(sourceTenant.config),
          status: tenant_status.ACTIVE,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      if (copyData?.categories) {
        const categories = await tx.categories.findMany({ where: { tenant_id: sourceTenantId } });
        for (const cat of categories) {
          const slug = await ensureUniqueSlug('categories', `${cat.slug}-clone`, newTenantId);
          await tx.categories.create({
            data: {
              name: cat.name,
              slug,
              description: cat.description,
              tenant_id: newTenantId,
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
          copied.categories += 1;
        }
      }

      if (copyData?.tags) {
        const tags = await tx.tags.findMany({ where: { tenant_id: sourceTenantId } });
        for (const tag of tags) {
          const slug = await ensureUniqueSlug('tags', `${tag.slug}-clone`, newTenantId);
          await tx.tags.create({
            data: {
              name: tag.name,
              slug,
              tenant_id: newTenantId,
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
          copied.tags += 1;
        }
      }

      if (copyData?.articles) {
        const articles = await tx.articles.findMany({ where: { tenant_id: sourceTenantId } });
        for (const article of articles) {
          const slug = await ensureUniqueSlug('articles', `${article.slug}-clone`, newTenantId);
          await tx.articles.create({
            data: {
              title: article.title,
              slug,
              content: toInputJson(article.content),
              excerpt: article.excerpt,
              status: article_status.DRAFT,
              tenant_id: newTenantId,
              author_id: article.author_id ?? null,
              created_at: new Date(),
              updated_at: new Date(),
              published_at: null,
            },
          });
          copied.articles += 1;
        }
      }

      if (copyData?.media) {
        const mediaFiles = await tx.media_files.findMany({ where: { tenant_id: sourceTenantId } });
        for (const mediaFile of mediaFiles) {
          await tx.media_files.create({
            data: {
              filename: mediaFile.filename,
              original_name: mediaFile.original_name,
              mime_type: mediaFile.mime_type,
              size: mediaFile.size,
              storage_path: mediaFile.storage_path,
              tenant_id: newTenantId,
              uploader_id: mediaFile.uploader_id ?? null,
              metadata: toInputJson(mediaFile.metadata),
            },
          });
          copied.media += 1;
        }
      }
    });

    res.json({
      success: true,
      message: `租户复制成功! 复制了: 分类 ${copied.categories}, 标签 ${copied.tags}, 文章 ${copied.articles}, 媒体 ${copied.media}`,
      data: {
        newTenantId,
        newTenantName,
        copied,
      },
    });
    return;
  } catch (error) {
    console.error('Failed to clone tenant:', error);
    res.status(500).json({ success: false, error: 'Failed to clone tenant' });
    return;
  }
});

export default router;
