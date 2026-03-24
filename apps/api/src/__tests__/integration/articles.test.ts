import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';

import app from '../app';
import './setup';

describe('Articles API', () => {
  let accessToken: string;

  beforeEach(async () => {
    // Login to get token
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
      });

    accessToken = response.body.data.accessToken;
  });

  describe('GET /api/v1/articles', () => {
    it('should return articles list', async () => {
      const response = await request(app)
        .get('/api/v1/articles');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/articles?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(10);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/v1/articles?status=PUBLISHED');

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        response.body.data.forEach((article: any) => {
          expect(article.status).toBe('PUBLISHED');
        });
      }
    });

    it('should filter by categoryId', async () => {
      const response = await request(app)
        .get('/api/v1/articles?categoryId=1');

      expect(response.status).toBe(200);
    });

    it('should support search', async () => {
      const response = await request(app)
        .get('/api/v1/articles?search=test');

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/v1/articles', () => {
    it('should create article with authentication', async () => {
      const response = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Article',
          content: '<p>Test content</p>',
          status: 'DRAFT',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Article');
      expect(response.body.data.status).toBe('DRAFT');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/articles')
        .send({
          title: 'Test Article',
          content: '<p>Test content</p>',
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: '<p>Test content</p>',
        });

      expect(response.status).toBe(400);
    });

    it('should set published_at when status is PUBLISHED', async () => {
      const response = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Published Article',
          content: '<p>Content</p>',
          status: 'PUBLISHED',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.published_at).not.toBeNull();
    });

    it('should auto-generate slug if not provided', async () => {
      const response = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Article Without Slug',
          content: '<p>Content</p>',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.slug).toBeDefined();
      expect(response.body.data.slug.length).toBeGreaterThan(0);
    });

    it('should create article with category', async () => {
      const response = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Article with Category',
          content: '<p>Content</p>',
          categoryId: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.category_id).toBe(1);
    });

    it('should create article with tags', async () => {
      const response = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Article with Tags',
          content: '<p>Content</p>',
          tags: ['Test Tag', 'New Tag'],
        });

      expect(response.status).toBe(201);
      expect(response.body.data.article_tags).toBeDefined();
      expect(response.body.data.article_tags.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/articles/:id', () => {
    it('should return article by id', async () => {
      // Create article first
      const createResponse = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Article for Get',
          content: '<p>Content</p>',
        });

      const articleId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/v1/articles/${articleId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(articleId);
    });

    it('should return 404 for non-existent article', async () => {
      const response = await request(app)
        .get('/api/v1/articles/99999');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/articles/:id', () => {
    it('should update article', async () => {
      // Create article first
      const createResponse = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Original Title',
          content: '<p>Content</p>',
          status: 'DRAFT',
        });

      const articleId = createResponse.body.data.id;

      // Update article
      const updateResponse = await request(app)
        .put(`/api/v1/articles/${articleId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated Title',
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.title).toBe('Updated Title');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put('/api/v1/articles/1')
        .send({
          title: 'Updated Title',
        });

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent article', async () => {
      const response = await request(app)
        .put('/api/v1/articles/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated Title',
        });

      expect(response.status).toBe(404);
    });

    it('should set published_at when changing status to PUBLISHED', async () => {
      // Create draft article
      const createResponse = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Draft Article',
          content: '<p>Content</p>',
          status: 'DRAFT',
        });

      const articleId = createResponse.body.data.id;
      expect(createResponse.body.data.published_at).toBeNull();

      // Update to published
      const updateResponse = await request(app)
        .put(`/api/v1/articles/${articleId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          status: 'PUBLISHED',
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.published_at).not.toBeNull();
    });
  });

  describe('DELETE /api/v1/articles/:id', () => {
    it('should soft delete article', async () => {
      // Create article
      const createResponse = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'To Delete',
          content: '<p>Content</p>',
        });

      const articleId = createResponse.body.data.id;

      // Delete article
      const deleteResponse = await request(app)
        .delete(`/api/v1/articles/${articleId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(deleteResponse.status).toBe(200);

      // Confirm soft deleted (should return 404)
      const getResponse = await request(app)
        .get(`/api/v1/articles/${articleId}`);

      expect(getResponse.status).toBe(404);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/articles/1');

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent article', async () => {
      const response = await request(app)
        .delete('/api/v1/articles/99999')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });
  });
});
