import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';

import app from '../app';
import './setup';

describe('Categories API', () => {
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

  describe('GET /api/v1/categories', () => {
    it('should return categories list', async () => {
      const response = await request(app)
        .get('/api/v1/categories');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return categories with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/categories?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.meta).toBeDefined();
    });
  });

  describe('POST /api/v1/categories', () => {
    it('should create category with authentication', async () => {
      const timestamp = Date.now();
      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `New Category ${timestamp}`,
          slug: `new-category-${timestamp}`,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(`New Category ${timestamp}`);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/categories')
        .send({
          name: 'Another Category',
          slug: 'another-category',
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should auto-generate slug if not provided', async () => {
      const timestamp = Date.now();
      const response = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `Category Without Slug ${timestamp}`,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.slug).toBeDefined();
    });
  });

  describe('GET /api/v1/categories/:id', () => {
    it('should return category by id', async () => {
      // The test category created in setup has id 1
      const response = await request(app)
        .get('/api/v1/categories/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .get('/api/v1/categories/99999');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/categories/:id', () => {
    it('should update category', async () => {
      const response = await request(app)
        .put('/api/v1/categories/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Category Name',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated Category Name');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put('/api/v1/categories/1')
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .put('/api/v1/categories/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/categories/:id', () => {
    it('should delete category', async () => {
      const timestamp = Date.now();
      // Create a new category to delete
      const createResponse = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `Category to Delete ${timestamp}`,
          slug: `category-to-delete-${timestamp}`,
        });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.data).toBeDefined();
      const categoryId = createResponse.body.data.id;

      // Delete category
      const deleteResponse = await request(app)
        .delete(`/api/v1/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(deleteResponse.status).toBe(200);

      // Confirm deleted
      const getResponse = await request(app)
        .get(`/api/v1/categories/${categoryId}`);

      expect(getResponse.status).toBe(404);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/categories/1');

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .delete('/api/v1/categories/99999')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });
  });
});
