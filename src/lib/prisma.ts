import { PrismaClient } from '@prisma/client'

// Singleton pattern untuk mencegah kebocoran koneksi di Next.js development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

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
