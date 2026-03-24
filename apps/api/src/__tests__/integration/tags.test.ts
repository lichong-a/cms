import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';

import app from '../app';
import './setup';

describe('Tags API', () => {
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

  describe('GET /api/v1/tags', () => {
    it('should return tags list', async () => {
      const response = await request(app)
        .get('/api/v1/tags');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return tags with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/tags?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.meta).toBeDefined();
    });
  });

  describe('POST /api/v1/tags', () => {
    it('should create tag with authentication', async () => {
      const timestamp = Date.now();
      const response = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `New Tag ${timestamp}`,
          slug: `new-tag-${timestamp}`,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(`New Tag ${timestamp}`);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/tags')
        .send({
          name: 'Another Tag',
          slug: 'another-tag',
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should auto-generate slug if not provided', async () => {
      const timestamp = Date.now();
      const response = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `Tag Without Slug ${timestamp}`,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.slug).toBeDefined();
    });
  });

  describe('GET /api/v1/tags/:id', () => {
    it('should return tag by id', async () => {
      // The test tag created in setup has id 1
      const response = await request(app)
        .get('/api/v1/tags/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
    });

    it('should return 404 for non-existent tag', async () => {
      const response = await request(app)
        .get('/api/v1/tags/99999');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/tags/:id', () => {
    it('should update tag', async () => {
      const timestamp = Date.now();
      // First create a tag to update
      const createResponse = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `Tag to Update ${timestamp}`,
          slug: `tag-to-update-${timestamp}`,
        });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.data).toBeDefined();
      const tagId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/v1/tags/${tagId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `Updated Tag Name ${timestamp}`,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(`Updated Tag Name ${timestamp}`);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put('/api/v1/tags/1')
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent tag', async () => {
      const response = await request(app)
        .put('/api/v1/tags/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/tags/:id', () => {
    it('should delete tag', async () => {
      const timestamp = Date.now();
      // Create a new tag to delete
      const createResponse = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `Tag to Delete ${timestamp}`,
          slug: `tag-to-delete-${timestamp}`,
        });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.data).toBeDefined();
      const tagId = createResponse.body.data.id;

      // Delete tag
      const deleteResponse = await request(app)
        .delete(`/api/v1/tags/${tagId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(deleteResponse.status).toBe(200);

      // Confirm deleted
      const getResponse = await request(app)
        .get(`/api/v1/tags/${tagId}`);

      expect(getResponse.status).toBe(404);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/tags/1');

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent tag', async () => {
      const response = await request(app)
        .delete('/api/v1/tags/99999')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });
  });
});
