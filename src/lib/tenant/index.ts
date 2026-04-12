import { cache } from 'react'
import { headers } from 'next/headers'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'

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

type TenantRecord = Prisma.TenantGetPayload<{
  select: typeof tenantSelect
}>

function mapTenant(tenant: TenantRecord): TenantContext {
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

/**
 * Per-request cached tenant lookup untuk website pages.
 * Menggunakan React cache() sehingga layout + page hanya query DB 1x per request.
 */
export const getWebsiteTenant = cache(async (): Promise<TenantContext | null> => {
  const h = await headers()
  const slug = h.get('x-tenant-slug') || 'demo'
  const tenant = await prisma.tenant.findUnique({
    where: { slug, isActive: true },
    select: tenantSelect,
  })
  return tenant ? mapTenant(tenant) : null
})
