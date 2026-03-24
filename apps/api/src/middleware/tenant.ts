import { type tenants as TenantRecord } from '@prisma/client'
import { type Request, type Response, type NextFunction } from 'express'

import { prisma } from '../services/database.service'
import logger from '../utils/logger'

declare global {
  namespace Express {
    interface Request {
      tenantId?: string
      tenant?: TenantRecord
    }
  }
}

const resolveTenantSlug = (req: Request): string => {
  const headerTenant = req.headers['x-tenant']

  if (typeof headerTenant === 'string' && headerTenant.trim()) {
    return headerTenant.trim()
  }

  const host = req.hostname
  const subdomain = host.split('.')[0]

  if (
    subdomain &&
    subdomain !== 'www' &&
    subdomain !== 'api' &&
    !/^\d+$/.test(subdomain) &&
    !subdomain.includes(':')
  ) {
    return subdomain
  }

  return 'default'
}

export async function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tenantSlug = resolveTenantSlug(req)

    const tenant = await prisma.tenants.findUnique({
      where: { slug: tenantSlug }
    })

    if (!tenant) {
      res.status(404).json({
        success: false,
        error: 'Tenant not found'
      })
      return
    }
    
    if (tenant.status !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        error: 'Tenant is not active'
      })
      return
    }

    req.tenantId = tenant.id
    req.tenant = tenant
    
    next()
  } catch (error) {
    logger.error({ error }, 'Failed to verify tenant')
    res.status(500).json({
      success: false,
      error: 'Failed to verify tenant'
    })
    return
  }
}
