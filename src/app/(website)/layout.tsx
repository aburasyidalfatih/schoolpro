import { headers } from 'next/headers'
import { getTenantBySlug } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import WebsiteHeader from '@/components/website/WebsiteHeader'
import WebsiteFooter from '@/components/website/WebsiteFooter'

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers()
  const tenantSlug = headerList.get('x-tenant-slug') || 'demo'
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) redirect('/app/login')

  const ppdbAktif = await prisma.periodePpdb.findFirst({
    where: {
      tenantId: tenant.id,
      isActive: true,
      tanggalBuka: { lte: new Date() },
      tanggalTutup: { gte: new Date() },
    },
  })

  return (
    <>
      <WebsiteHeader tenant={tenant} ppdbAktif={!!ppdbAktif} />
      <main style={{ minHeight: '60vh' }}>{children}</main>
      <WebsiteFooter tenant={tenant} />
    </>
  )
}
