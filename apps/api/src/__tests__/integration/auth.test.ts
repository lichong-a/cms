import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../app';
import './setup';

describe('Auth API', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'admin123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe('admin@example.com');
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'admin123',
        });

      expect(response.status).toBe(400);
    });

    it('should require email and password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh token', async () => {
      // First login to get refreshToken
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'admin123',
        });

      const refreshToken = loginResponse.body.data.refreshToken;

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
    });

    it('should fail without refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      // Login first
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'admin123',
        });

      const accessToken = loginResponse.body.data.accessToken;

      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('admin@example.com');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      // Login first
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'admin123',
        });

      const accessToken = loginResponse.body.data.accessToken;

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
