import { prisma } from './prisma'

export interface TenantContext {
  id: string
  nama: string
  slug: string
  logoUrl: string | null
  pengaturan: Record<string, unknown> | null
  paket: string
}

/**
 * Get tenant from subdomain slug
 */
export async function getTenantBySlug(slug: string): Promise<TenantContext | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      nama: true,
      slug: true,
      logoUrl: true,
      pengaturan: true,
      paket: true,
    },
  })

  if (!tenant) return null

  return {
    ...tenant,
    pengaturan: tenant.pengaturan as Record<string, unknown> | null,
  }
}

/**
 * Get tenant by ID
 */
export async function getTenantById(id: string): Promise<TenantContext | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { id, isActive: true },
    select: {
      id: true,
      nama: true,
      slug: true,
      logoUrl: true,
      pengaturan: true,
      paket: true,
    },
  })

  if (!tenant) return null

  return {
    ...tenant,
    pengaturan: tenant.pengaturan as Record<string, unknown> | null,
  }
}

/**
 * Parse subdomain from hostname
 * Example: sekolah1.sispro.id -> sekolah1
 */
export function parseSubdomain(hostname: string): string | null {
  const parts = hostname.split('.')

  // localhost:3000 or IP address — use 'demo' as default tenant
  if (parts.length <= 1 || hostname.includes('localhost')) {
    return 'demo'
  }

  // sekolah1.sispro.id -> sekolah1
  if (parts.length >= 3) {
    return parts[0]
  }

  return null
}
