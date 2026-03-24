import { tenant_status } from '@prisma/client';

import { prisma } from './database.service';

export const DEFAULT_TENANT_ID = 'default';
export const DEFAULT_TENANT_SLUG = 'default';

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
