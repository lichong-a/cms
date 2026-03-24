import { Prisma } from '@prisma/client'

// 需要租户过滤的模型
const TENANT_MODELS = [
  'User',
  'Article',
  'Category',
  'Tag',
  'Media',
  'Comment',
  // ... 其他模型
]

// Prisma 中间件
export function tenantFilterMiddleware(tenantId: string) {
  return Prisma.defineExtension({
    name: 'tenantFilter',
    query: {
      $allModels: {
        async $allOperations({ args, model, operation, query }) {
          // 检查是否需要租户过滤
          if (TENANT_MODELS.includes(model)) {
            // 读操作：自动添加 tenantId 过滤
            if (['findMany', 'findFirst', 'findFirstOrThrow', 'count', 'aggregate'].includes(operation)) {
              const where = (args as any).where || {}
              ;(args as any).where = { ...where, tenantId }
            }
            
            // 写操作：自动添加 tenantId
            if (['create', 'createMany'].includes(operation)) {
              const data = (args as any).data
              ;(args as any).data = { ...data, tenantId }
            }
          }
          
          return query(args)
        }
      }
    }
  })
}
