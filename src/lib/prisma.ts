import { PrismaClient } from '.prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

function createPrismaClient() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || 'file:./dev.db',
  })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Tenant-scoped query helper
 */
export function withTenantScope<T extends Record<string, unknown>>(
  tenantId: string,
  where?: T
): T & { tenantId: string } {
  return { ...where, tenantId } as T & { tenantId: string }
}
