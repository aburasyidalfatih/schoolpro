import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Tenant-scoped query helper
 * Auto-injects tenantId into where clause
 */
export function withTenantScope<T extends Record<string, unknown>>(
  tenantId: string,
  where?: T
): T & { tenantId: string } {
  return { ...where, tenantId } as T & { tenantId: string }
}
