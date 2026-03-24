import { AsyncLocalStorage } from 'async_hooks'

interface TenantContext {
  tenantId: string
  userId?: string
  isSuperAdmin?: boolean
}

export const tenantContext = new AsyncLocalStorage<TenantContext>()

export function getTenantId(): string {
  const store = tenantContext.getStore()
  if (!store?.tenantId) {
    throw new Error('Tenant ID not found in context. Ensure tenant middleware is executed first.')
  }
  return store.tenantId
}

export function setContext(context: TenantContext) {
  return tenantContext.enterWith(context)
}
