import { article_status } from '@prisma/client';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { 
  createArticle, 
  getArticles, 
  updateArticle, 
  getArticleById,
  deleteArticle 
} from '../../services/article.service';
import { prisma } from '../../services/database.service';

// Mock Prisma
vi.mock('../../services/database.service', () => ({
  prisma: {
    articles: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    tags: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
  connectDatabase: vi.fn(),
  disconnectDatabase: vi.fn(),
}));

describe('Article Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createArticle', () => {
    it('should create article with default status', async () => {
      const mockArticle = {
        id: 1,
        title: 'Test Article',
        slug: 'test-article',
        content: '<p>Content</p>',
        status: article_status.DRAFT,
        published_at: null,
        author_id: 1,
        tenant_id: 'default',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        users: { id: 1, username: 'admin', email: 'admin@example.com', avatarUrl: null },
        categories: null,
        article_tags: [],
      };

      vi.mocked(prisma.articles.create).mockResolvedValue(mockArticle as any);

      const result = await createArticle({
        title: 'Test Article',
        content: '<p>Content</p>',
        authorId: 1,
        tenantId: 'default',
      });

      expect(result.status).toBe(article_status.DRAFT);
      expect(result.published_at).toBeNull();
      expect(prisma.articles.create).toHaveBeenCalled();
    });

    it('should set published_at when status is PUBLISHED', async () => {
      const mockArticle = {
        id: 1,
        title: 'Test Article',
        slug: 'test-article',
        content: '<p>Content</p>',
        status: article_status.PUBLISHED,
        published_at: new Date(),
        author_id: 1,
        tenant_id: 'default',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        users: { id: 1, username: 'admin', email: 'admin@example.com', avatarUrl: null },
        categories: null,
        article_tags: [],
      };

      vi.mocked(prisma.articles.create).mockResolvedValue(mockArticle as any);

      const result = await createArticle({
        title: 'Test Article',
        content: '<p>Content</p>',
        authorId: 1,
        status: article_status.PUBLISHED,
        tenantId: 'default',
      });

      expect(result.status).toBe(article_status.PUBLISHED);
      expect(result.published_at).not.toBeNull();
    });

    it('should auto-generate slug if not provided', async () => {
      const mockArticle = {
        id: 1,
        title: 'Test Article',
        slug: 'test-article-1234567890',
        content: '<p>Content</p>',
        status: article_status.DRAFT,
        published_at: null,
        author_id: 1,
        tenant_id: 'default',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        users: { id: 1, username: 'admin', email: 'admin@example.com', avatarUrl: null },
        categories: null,
        article_tags: [],
      };

      vi.mocked(prisma.articles.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.articles.create).mockResolvedValue(mockArticle as any);

      const result = await createArticle({
        title: 'Test Article',
        content: '<p>Content</p>',
        authorId: 1,
        tenantId: 'default',
      });

      expect(result.slug).toBeDefined();
      expect(result.slug.length).toBeGreaterThan(0);
    });

    it('should create tags when tags array is provided', async () => {
      const mockTag = {
        id: 1,
        name: 'Test Tag',
        slug: 'test-tag',
        tenant_id: 'default',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockArticle = {
        id: 1,
        title: 'Test Article',
        slug: 'test-article',
        content: '<p>Content</p>',
        status: article_status.DRAFT,
        published_at: null,
        author_id: 1,
        tenant_id: 'default',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        users: { id: 1, username: 'admin', email: 'admin@example.com', avatarUrl: null },
        categories: null,
        article_tags: [{ tags: mockTag }],
      };

      vi.mocked(prisma.tags.findFirst).mockResolvedValue(mockTag as any);
      vi.mocked(prisma.articles.create).mockResolvedValue(mockArticle as any);

      const result = await createArticle({
        title: 'Test Article',
        content: '<p>Content</p>',
        authorId: 1,
        tags: ['Test Tag'],
        tenantId: 'default',
      });

      expect(prisma.tags.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'Test Tag',
          tenant_id: 'default',
        },
      });
      expect(result.article_tags).toHaveLength(1);
    });
  });

  describe('getArticles', () => {
    it('should return paginated articles', async () => {
      const mockArticles = [
        { 
          id: 1, 
          title: 'Article 1',
          slug: 'article-1',
          status: article_status.PUBLISHED,
          author_id: 1,
          tenant_id: 'default',
          deleted_at: null,
          users: { id: 1, username: 'admin', email: 'admin@example.com', avatarUrl: null },
          categories: null,
          article_tags: [],
        },
        { 
          id: 2, 
          title: 'Article 2',
          slug: 'article-2',
          status: article_status.DRAFT,
          author_id: 1,
          tenant_id: 'default',
          deleted_at: null,
          users: { id: 1, username: 'admin', email: 'admin@example.com', avatarUrl: null },
          categories: null,
          article_tags: [],
        },
      ];

      vi.mocked(prisma.articles.findMany).mockResolvedValue(mockArticles as any);
      vi.mocked(prisma.articles.count).mockResolvedValue(2);

      const result = await getArticles({ page: 1, limit: 10 }, 'default');

      expect(result.articles).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter by status', async () => {
      const mockArticles = [
        { 
          id: 1, 
          status: article_status.PUBLISHED,
          title: 'Published Article',
          slug: 'published-article',
          author_id: 1,
          tenant_id: 'default',
          deleted_at: null,
          users: { id: 1, username: 'admin', email: 'admin@example.com', avatarUrl: null },
          categories: null,
          article_tags: [],
        },
      ];

      vi.mocked(prisma.articles.findMany).mockResolvedValue(mockArticles as any);
      vi.mocked(prisma.articles.count).mockResolvedValue(1);

      const result = await getArticles({ status: article_status.PUBLISHED }, 'default');

      expect(result.articles).toHaveLength(1);
      expect(prisma.articles.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: article_status.PUBLISHED,
          }),
        })
      );
    });

    it('should filter by categoryId', async () => {
      const mockArticles = [
        { 
          id: 1, 
          title: 'Article 1',
          category_id: 1,
          author_id: 1,
          tenant_id: 'default',
          deleted_at: null,
          users: { id: 1, username: 'admin', email: 'admin@example.com', avatarUrl: null },
          categories: { id: 1, name: 'Category 1' },
          article_tags: [],
        },
      ];

      vi.mocked(prisma.articles.findMany).mockResolvedValue(mockArticles as any);
      vi.mocked(prisma.articles.count).mockResolvedValue(1);

      const result = await getArticles({ categoryId: 1 }, 'default');

      expect(result.articles).toHaveLength(1);
      expect(prisma.articles.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category_id: 1,
          }),
        })
      );
    });

    it('should support search', async () => {
      const mockArticles = [
        { 
          id: 1, 
          title: 'Test Article',
          slug: 'test-article',
          author_id: 1,
          tenant_id: 'default',
          deleted_at: null,
          users: { id: 1, username: 'admin', email: 'admin@example.com', avatarUrl: null },
          categories: null,
          article_tags: [],
        },
      ];

      vi.mocked(prisma.articles.findMany).mockResolvedValue(mockArticles as any);
      vi.mocked(prisma.articles.count).mockResolvedValue(1);

      const result = await getArticles({ search: 'test' }, 'default');

      expect(result.articles).toHaveLength(1);
      expect(prisma.articles.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'test', mode: 'insensitive' } },
              { excerpt: { contains: 'test', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });
  });

  describe('updateArticle', () => {
    it('should update article', async () => {
      const existingArticle = {
        id: 1,
        title: 'Old Title',
        slug: 'old-title',
        content: '<p>Content</p>',
        status: article_status.DRAFT,
        published_at: null,
        author_id: 1,
        tenant_id: 'default',
        deleted_at: null,
      };

      const updatedArticle = {
        id: 1,
        title: 'New Title',
        slug: 'old-title',
        content: '<p>Content</p>',
        status: article_status.DRAFT,
        published_at: null,
        author_id: 1,
        tenant_id: 'default',
        deleted_at: null,
        users: { id: 1, username: 'admin', email: 'admin@example.com', avatarUrl: null },
        categories: null,
        article_tags: [],
      };

      vi.mocked(prisma.articles.findFirst).mockResolvedValue(existingArticle as any);
      vi.mocked(prisma.articles.update).mockResolvedValue(updatedArticle as any);

      const result = await updateArticle(1, { title: 'New Title', tenantId: 'default' });

      expect(result.title).toBe('New Title');
    });

    it('should throw error if article not found', async () => {
      vi.mocked(prisma.articles.findFirst).mockResolvedValue(null);

      await expect(updateArticle(999, { title: 'New', tenantId: 'default' })).rejects.toThrow('Article not found');
    });

    it('should set published_at when changing status to PUBLISHED', async () => {
      const existingArticle = {
        id: 1,
        title: 'Test Article',
        slug: 'test-article',
        content: '<p>Content</p>',
        status: article_status.DRAFT,
        published_at: null,
        author_id: 1,
        tenant_id: 'default',
        deleted_at: null,
      };

      const updatedArticle = {
        id: 1,
        title: 'Test Article',
        slug: 'test-article',
        content: '<p>Content</p>',
        status: article_status.PUBLISHED,
        published_at: new Date(),
        author_id: 1,
        tenant_id: 'default',
        deleted_at: null,
        users: { id: 1, username: 'admin', email: 'admin@example.com', avatarUrl: null },
        categories: null,
        article_tags: [],
      };

      vi.mocked(prisma.articles.findFirst).mockResolvedValue(existingArticle as any);
      vi.mocked(prisma.articles.update).mockResolvedValue(updatedArticle as any);

      const result = await updateArticle(1, { status: article_status.PUBLISHED, tenantId: 'default' });

      expect(result.status).toBe(article_status.PUBLISHED);
      expect(result.published_at).not.toBeNull();
    });
  });

  describe('getArticleById', () => {
    it('should return article by id', async () => {
      const mockArticle = {
        id: 1,
        title: 'Test Article',
        slug: 'test-article',
        content: '<p>Content</p>',
        status: article_status.PUBLISHED,
        author_id: 1,
        tenant_id: 'default',
        deleted_at: null,
        users: { id: 1, username: 'admin', email: 'admin@example.com', avatarUrl: null },
        categories: null,
        article_tags: [],
      };

      vi.mocked(prisma.articles.findFirst).mockResolvedValue(mockArticle as any);

      const result = await getArticleById(1, 'default');

      expect(result.id).toBe(1);
      expect(result.title).toBe('Test Article');
    });

    it('should throw error if article not found', async () => {
      vi.mocked(prisma.articles.findFirst).mockResolvedValue(null);

      await expect(getArticleById(999, 'default')).rejects.toThrow('Article not found');
    });
  });

  describe('deleteArticle', () => {
    it('should soft delete article', async () => {
      const mockArticle = {
        id: 1,
        title: 'Test Article',
        slug: 'test-article',
        deleted_at: null,
      };

      vi.mocked(prisma.articles.findFirst).mockResolvedValue(mockArticle as any);
      vi.mocked(prisma.articles.update).mockResolvedValue({ ...mockArticle, deleted_at: new Date() } as any);

      const result = await deleteArticle(1, 'default');

      expect(result.id).toBe(1);
      expect(prisma.articles.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            deleted_at: expect.any(Date),
          }),
        })
      );
    });

    it('should throw error if article not found', async () => {
      vi.mocked(prisma.articles.findFirst).mockResolvedValue(null);

      await expect(deleteArticle(999, 'default')).rejects.toThrow('Article not found');
    });
  });
});
