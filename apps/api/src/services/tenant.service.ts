import { tenant_status } from '@prisma/client';

import { prisma } from './database.service';
import { hashPassword } from '../utils/password';
import logger from '../utils/logger';

export const DEFAULT_TENANT_ID = 'default';
export const DEFAULT_TENANT_SLUG = 'default';
export const DEFAULT_ADMIN_EMAIL = 'admin@example.com';
export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_ROLE = 'admin';

export const shouldBootstrapDefaultAdmin = (env: NodeJS.ProcessEnv = process.env): boolean => {
  const configured = env['AUTO_BOOTSTRAP_ADMIN'];
  if (configured === 'true') {
    return true;
  }

  if (configured === 'false') {
    return false;
  }

  return env['NODE_ENV'] !== 'production';
};

export const ensureDefaultTenant = async () => {
  const existingTenant = await prisma.tenants.findUnique({
    where: { id: DEFAULT_TENANT_ID },
  });

  if (existingTenant) {
    return existingTenant;
  }

  return prisma.tenants.create({
    data: {
      id: DEFAULT_TENANT_ID,
      slug: DEFAULT_TENANT_SLUG,
      name: 'Default Tenant',
      status: tenant_status.ACTIVE,
      config: {},
      updated_at: new Date(),
    },
  });
};

export const ensureDefaultAdmin = async (env: NodeJS.ProcessEnv = process.env) => {
  if (!shouldBootstrapDefaultAdmin(env)) {
    return null;
  }

  const email = env['DEFAULT_ADMIN_EMAIL'] || DEFAULT_ADMIN_EMAIL;
  const username = env['DEFAULT_ADMIN_USERNAME'] || DEFAULT_ADMIN_USERNAME;
  const password = env['DEFAULT_ADMIN_PASSWORD'] || 'admin123';

  const adminRole = await prisma.roles.upsert({
    where: { name: DEFAULT_ADMIN_ROLE },
    update: { updated_at: new Date() },
    create: {
      name: DEFAULT_ADMIN_ROLE,
      description: 'Default bootstrap administrator',
      updated_at: new Date(),
    },
  });

  let adminUser = await prisma.users.findUnique({
    where: {
      tenant_id_email: {
        tenant_id: DEFAULT_TENANT_ID,
        email,
      },
    },
  });

  let created = false;

  if (!adminUser) {
    created = true;
    adminUser = await prisma.users.create({
      data: {
        tenant_id: DEFAULT_TENANT_ID,
        username,
        email,
        passwordHash: await hashPassword(password),
        isActive: true,
        metadata: {
          nickname: '管理员',
          bootstrap: true,
        },
        updated_at: new Date(),
      },
    });
  }

  await prisma.user_roles.upsert({
    where: {
      user_id_role_id: {
        user_id: adminUser.id,
        role_id: adminRole.id,
      },
    },
    update: {},
    create: {
      user_id: adminUser.id,
      role_id: adminRole.id,
    },
  });

  if (created) {
    logger.info({ email }, 'Bootstrapped default admin user');
  }

  return adminUser;
};
