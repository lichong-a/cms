import { tenant_status } from '@prisma/client';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import app from '../app';
import './setup';

import { prisma } from '../../services/database.service';

describe('Tenant Middleware', () => {
  beforeEach(async () => {
    await prisma.tenants.deleteMany({
      where: {
        id: {
          not: 'default',
        },
      },
    });
  });

  it('should resolve the default tenant without runtime creation', async () => {
    const response = await request(app).get('/api/v1/articles');

    expect(response.status).toBe(200);
  });

  it('should treat localhost host requests as the default tenant', async () => {
    const response = await request(app)
      .get('/api/v1/articles')
      .set('Host', 'localhost:3003');

    expect(response.status).toBe(200);
  });

  it('should return 404 for an unknown tenant', async () => {
    const response = await request(app)
      .get('/api/v1/articles')
      .set('X-Tenant', 'missing-tenant');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Tenant not found');
  });

  it('should return 403 for a non-active tenant', async () => {
    await prisma.tenants.create({
      data: {
        id: 'suspended',
        slug: 'suspended',
        name: 'Suspended Tenant',
        status: tenant_status.SUSPENDED,
        config: {},
        updated_at: new Date(),
      },
    });

    const response = await request(app)
      .get('/api/v1/articles')
      .set('X-Tenant', 'suspended');

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Tenant is not active');
  });
});
