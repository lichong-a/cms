import { join } from 'path';

import { loadEnv } from '../../utils/load-env';

// Load test environment variables
loadEnv({ path: join(__dirname, '../../.env.test') });

import { beforeAll, afterAll, beforeEach } from 'vitest';

import { connectRedis, disconnectRedis } from '../../services/cache.service';
import { prisma, connectDatabase, disconnectDatabase } from '../../services/database.service';
import { ensureDefaultTenant } from '../../services/tenant.service';

// Global setup before all tests
beforeAll(async () => {
  try {
    // Connect to test database
    await connectDatabase();
    
    // Connect to Redis
    await connectRedis();
    
    // Clean database
    await prisma.articles.deleteMany({});
    await prisma.categories.deleteMany({});
    await prisma.tags.deleteMany({});
    await prisma.user_roles.deleteMany({});
    await prisma.users.deleteMany({});
    await prisma.tenants.deleteMany({});

    await ensureDefaultTenant();
    
    // Create test user
    const hashedPassword = await import('bcrypt').then(bcrypt => 
      bcrypt.hash('admin123', 10)
    );
    
    await prisma.users.create({
      data: {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        passwordHash: hashedPassword,
        tenant_id: 'default',
        isActive: true,
        updated_at: new Date(),
      },
    });
    
    // Create test category
    await prisma.categories.create({
      data: {
        id: 1,
        name: 'Test Category',
        slug: 'test-category',
        tenant_id: 'default',
        updated_at: new Date(),
      },
    });
    
    // Create test tag
    await prisma.tags.create({
      data: {
        id: 1,
        name: 'Test Tag',
        slug: 'test-tag',
        tenant_id: 'default',
        updated_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Test setup failed:', error);
    throw error;
  }
});

// Global teardown after all tests
afterAll(async () => {
  try {
    // Clean up
    await prisma.articles.deleteMany({});
    await prisma.categories.deleteMany({});
    await prisma.tags.deleteMany({});
    await prisma.user_roles.deleteMany({});
    await prisma.users.deleteMany({});
    await prisma.tenants.deleteMany({});
    
    // Disconnect from database
    await disconnectDatabase();
    
    // Disconnect from Redis
    await disconnectRedis();
  } catch (error) {
    console.error('Test teardown failed:', error);
  }
});

// Clean up before each test
beforeEach(async () => {
  // Optionally reset data before each test
});
