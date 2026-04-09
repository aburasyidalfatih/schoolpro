import { prisma } from './prisma'

export interface TenantContext {
  id: string
  nama: string
  slug: string
  logoUrl: string | null
  alamat: string | null
  telepon: string | null
  email: string | null
  website: string | null
  mediaSosial: Record<string, unknown> | null
  pengaturan: Record<string, unknown> | null
  profileWebsite: Record<string, unknown> | null
  paket: string
}

const tenantSelect = {
  id: true, nama: true, slug: true, logoUrl: true,
  alamat: true, telepon: true, email: true, website: true,
  mediaSosial: true, pengaturan: true, profileWebsite: true, paket: true,
}

function mapTenant(tenant: any): TenantContext {
  return {
    ...tenant,
    mediaSosial: tenant.mediaSosial as Record<string, unknown> | null,
    pengaturan: tenant.pengaturan as Record<string, unknown> | null,
    profileWebsite: tenant.profileWebsite as Record<string, unknown> | null,
  }
}

export async function getTenantBySlug(slug: string): Promise<TenantContext | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug, isActive: true },
    select: tenantSelect,
  })
  return tenant ? mapTenant(tenant) : null
}

export async function getTenantById(id: string): Promise<TenantContext | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { id, isActive: true },
    select: tenantSelect,
  })
  return tenant ? mapTenant(tenant) : null
}

export function parseSubdomain(hostname: string): string | null {
  const parts = hostname.split('.')
  if (parts.length <= 1 || hostname.includes('localhost')) return 'demo'
  if (parts.length >= 3) return parts[0]
  return null
}
