import '@/app/website.css'
import { SkinProvider } from '@/providers/SkinProvider'
import RunningText from '@/components/website/layout/RunningText'
import Header from '@/components/website/layout/Header'
import Footer from '@/components/website/layout/Footer'
import SkinSwitcher from '@/components/website/layout/SkinSwitcher'
import WhatsAppButton from '@/components/website/layout/WhatsAppButton'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

async function getTenant() {
  const headersList = await headers()
  const slug = headersList.get('x-tenant-slug') || 'demo'
  return prisma.tenant.findFirst({ where: { slug, isActive: true } })
}

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenant()

  const [latestPengumuman, latestAgenda] = tenant ? await Promise.all([
    prisma.pengumuman.findFirst({ where: { tenantId: tenant.id }, orderBy: { tanggal: 'desc' } }),
    prisma.agenda.findFirst({ where: { tenantId: tenant.id, isPublished: true }, orderBy: { tanggalMulai: 'asc' } }),
  ]) : [null, null]

  const pengaturan = (tenant?.pengaturan as any) || {}
  const mediaSosial = (tenant?.mediaSosial as any) || {}

  const schoolInfo = {
    name: tenant?.nama || 'Sekolah',
    shortName: pengaturan.shortName || tenant?.nama || 'Sekolah',
    tagline: pengaturan.tagline || '',
    address: tenant?.alamat || '',
    phone: tenant?.telepon || '',
    email: tenant?.email || '',
    akreditasi: pengaturan.akreditasi || '',
    npsn: pengaturan.npsn || '',
    socialIg: mediaSosial.instagram || '',
    socialFb: mediaSosial.facebook || '',
    socialYt: mediaSosial.youtube || '',
    socialTk: mediaSosial.tiktok || '',
  }

  const runningItems = [
    latestPengumuman && { label: 'Pengumuman', text: latestPengumuman.judul, href: latestPengumuman.slug ? `/pengumuman/${latestPengumuman.slug}` : '/pengumuman' },
    latestAgenda && { label: 'Agenda', text: latestAgenda.judul, href: latestAgenda.slug ? `/agenda/${latestAgenda.slug}` : '/agenda' },
  ].filter(Boolean) as { label: string; text: string; href: string }[]

  return (
    <SkinProvider>
      <div className="flex flex-col min-h-screen" style={{ background: 'var(--skin-surface)' }}>
        <RunningText items={runningItems} />
        <Header schoolInfo={schoolInfo} />
        <main className="flex-1" id="main-content">{children}</main>
        <Footer schoolInfo={schoolInfo} />
        <SkinSwitcher />
        <WhatsAppButton schoolInfo={schoolInfo} />
      </div>
    </SkinProvider>
  )
}
