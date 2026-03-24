import { article_status } from '@prisma/client';

import { createError } from '../middleware/error.middleware';

import { prisma } from './database.service';

// 使用 Prisma 生成的枚举（小写）
const ArticleStatus = article_status;

export interface CreateArticleInput {
  title: string;
  slug?: string;
  content: any;
  excerpt?: string;
  thumbnail?: string;
  categoryId?: number;
  tagIds?: number[];
  tags?: string[]; // 标签名称数组
  status?: article_status;
  metadata?: any;
  authorId: number;
  tenantId: string; // 必需的租户ID
}

export interface UpdateArticleInput {
  title?: string;
  slug?: string;
  content?: any;
  excerpt?: string;
  thumbnail?: string;
  categoryId?: number;
  tagIds?: number[];
  metadata?: any;
  status?: article_status;
  tenantId: string; // 必需的租户ID
}

export interface GetArticlesQuery {
  page?: number;
  limit?: number;
  status?: article_status;
  categoryId?: number;
  authorId?: number;
  search?: string;
}

export const createArticle = async (input: CreateArticleInput) => {
  const { title, content, excerpt, thumbnail, categoryId, tags, status, metadata, authorId, tenantId } = input;
  let { slug, tagIds } = input;

  // 自动生成 slug（如果没有提供）
  if (!slug) {
    slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();
  }

  // 检查 slug 是否已存在
  const existingArticle = await prisma.articles.findUnique({
    where: { slug },
  });

  if (existingArticle) {
    // 如果 slug 已存在，添加时间戳
    slug = `${slug}-${Date.now()}`;
  }

  // 处理标签：如果有 tags（标签名称），查找或创建标签并转换为 tagIds
  if (tags && tags.length > 0) {
    const tagPromises = tags.map(async (tagName) => {
      // 查找现有标签
      let tag = await prisma.tags.findFirst({
        where: {
          name: tagName,
          tenant_id: tenantId,
        },
      });

      // 如果不存在，创建新标签
      if (!tag) {
        tag = await prisma.tags.create({
          data: {
            name: tagName,
            slug: tagName.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-'),
            tenant_id: tenantId,
            updated_at: new Date(),
          },
        });
      }

      return tag.id;
    });

    tagIds = await Promise.all(tagPromises);
  }

  // 创建文章
  const data: Parameters<typeof prisma.articles.create>[0]['data'] = {
    title,
    slug,
    content,
    author_id: authorId,
    status: status || ArticleStatus.DRAFT,
    tenant_id: tenantId,
    updated_at: new Date(),
    published_at: status === ArticleStatus.PUBLISHED ? new Date() : null,
  };

  if (excerpt !== undefined) {
    data.excerpt = excerpt;
  }

  if (thumbnail !== undefined) {
    data.thumbnail = thumbnail;
  }

  if (categoryId !== undefined) {
    data.category_id = categoryId;
  }

  if (metadata !== undefined) {
    data.metadata = metadata;
  }

  if (tagIds && tagIds.length > 0) {
    data.article_tags = {
      create: tagIds.map((tagId) => ({
        tag_id: tagId,
        tenant_id: tenantId,
      })),
    };
  }

  const article = await prisma.articles.create({
    data,
    include: {
      users: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
        },
      },
      categories: true,
      article_tags: {
        include: {
          tags: true,
        },
      },
    },
  });

  return article;
};

export const updateArticle = async (id: number, input: UpdateArticleInput) => {
  const { title, slug, content, excerpt, thumbnail, categoryId, tagIds, metadata, status, tenantId } = input;

  // 检查文章是否存在（租户内）
  const existingArticle = await prisma.articles.findFirst({
    where: { 
      id,
      tenant_id: tenantId,
    },
  });

  if (!existingArticle) {
    throw createError('Article not found', 404, 'ARTICLE_NOT_FOUND');
  }

  // 如果更新 slug，检查是否重复
  if (slug && slug !== existingArticle.slug) {
    const slugExists = await prisma.articles.findUnique({
      where: { slug },
    });
    if (slugExists) {
      throw createError('Article with this slug already exists', 409, 'DUPLICATE_SLUG');
    }
  }

  // 更新文章
  const data: Parameters<typeof prisma.articles.update>[0]['data'] = {
    updated_at: new Date(),
    published_at:
      status === ArticleStatus.PUBLISHED
        ? (existingArticle.published_at || new Date())
        : existingArticle.published_at,
  };

  if (title !== undefined) {
    data.title = title;
  }

  if (slug !== undefined) {
    data.slug = slug;
  }

  if (content !== undefined) {
    data.content = content;
  }

  if (excerpt !== undefined) {
    data.excerpt = excerpt;
  }

  if (thumbnail !== undefined) {
    data.thumbnail = thumbnail;
  }

  if (categoryId !== undefined) {
    data.category_id = categoryId;
  }

  if (metadata !== undefined) {
    data.metadata = metadata;
  }

  if (status !== undefined) {
    data.status = status;
  }

  if (tagIds) {
    data.article_tags = {
      deleteMany: {},
      create: tagIds.map((tagId) => ({
        tag_id: tagId,
        tenant_id: tenantId,
      })),
    };
  }

  const article = await prisma.articles.update({
    where: { id },
    data,
    include: {
      users: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
        },
      },
      categories: true,
      article_tags: {
        include: {
          tags: true,
        },
      },
    },
  });

  return article;
};

export const getArticleById = async (id: number, tenantId: string) => {
  const article = await prisma.articles.findFirst({
    where: { 
      id,
      tenant_id: tenantId,
      deleted_at: null,
    },
    include: {
      users: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
        },
      },
      categories: true,
      article_tags: {
        include: {
          tags: true,
        },
      },
    },
  });

  if (!article) {
    throw createError('Article not found', 404, 'ARTICLE_NOT_FOUND');
  }

  return article;
};

export const getArticleBySlug = async (slug: string, tenantId: string) => {
  const article = await prisma.articles.findFirst({
    where: { 
      slug,
      tenant_id: tenantId,
      deleted_at: null,
    },
    include: {
      users: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
        },
      },
      categories: true,
      article_tags: {
        include: {
          tags: true,
        },
      },
    },
  });

  if (!article) {
    throw createError('Article not found', 404, 'ARTICLE_NOT_FOUND');
  }

  return article;
};

export const getArticles = async (query: GetArticlesQuery, tenantId: string) => {
  const { page = 1, limit = 10, status, categoryId, authorId, search } = query;
  const skip = (page - 1) * limit;

  const where: any = {
    tenant_id: tenantId,
    deleted_at: null,
  };

  if (status) {
    where.status = status;
  }

  if (categoryId) {
    where.category_id = categoryId;
  }

  if (authorId) {
    where.author_id = authorId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [articles, total] = await Promise.all([
    prisma.articles.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
        categories: true,
        article_tags: {
          include: {
            tags: true,
          },
        },
      },
    }),
    prisma.articles.count({ where }),
  ]);

  return {
    articles,
    total,
    page,
    limit,
  };
};

export const deleteArticle = async (id: number, tenantId: string) => {
  const article = await prisma.articles.findFirst({
    where: { 
      id,
      tenant_id: tenantId,
    },
  });

  if (!article) {
    throw createError('Article not found', 404, 'ARTICLE_NOT_FOUND');
  }

  // 软删除
  await prisma.articles.update({
    where: { id },
    data: { deleted_at: new Date() },
  });

  return { id };
};

export default {
  createArticle,
  updateArticle,
  getArticleById,
  getArticleBySlug,
  getArticles,
  deleteArticle,
};
