import '@/app/website.css'
import { SkinProvider } from '@/providers/SkinProvider'
import RunningText from '@/components/public/layout/RunningText'
import Header from '@/components/public/layout/Header'
import Footer from '@/components/public/layout/Footer'
import SkinSwitcher from '@/components/public/layout/SkinSwitcher'
import WhatsAppButton from '@/components/public/layout/WhatsAppButton'
import { getWebsiteTenant } from '@/lib/tenant'
import { getWebsiteLayoutData } from '@/features/website/lib/website-data'

function getObjectRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function getStringValue(record: Record<string, unknown>, key: string): string {
  const value = record[key]
  return typeof value === 'string' ? value : ''
}

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getWebsiteTenant()

  const { latestPengumuman, latestAgenda } = tenant
    ? await getWebsiteLayoutData(tenant.id)
    : { latestPengumuman: null, latestAgenda: null }

  const pengaturan = getObjectRecord(tenant?.pengaturan)
  const mediaSosial = getObjectRecord(tenant?.mediaSosial)

  const schoolInfo = {
    name: tenant?.nama || 'Sekolah',
    shortName: getStringValue(pengaturan, 'shortName') || tenant?.nama || 'Sekolah',
    tagline: getStringValue(pengaturan, 'tagline'),
    address: tenant?.alamat || '',
    phone: tenant?.telepon || '',
    email: tenant?.email || '',
    akreditasi: getStringValue(pengaturan, 'akreditasi'),
    npsn: getStringValue(pengaturan, 'npsn'),
    socialIg: getStringValue(mediaSosial, 'instagram'),
    socialFb: getStringValue(mediaSosial, 'facebook'),
    socialYt: getStringValue(mediaSosial, 'youtube'),
    socialTk: getStringValue(mediaSosial, 'tiktok'),
  }

  const runningItems = [
    latestPengumuman && { label: 'Pengumuman', text: latestPengumuman.judul, href: latestPengumuman.slug ? `/pengumuman/${latestPengumuman.slug}` : '/pengumuman' },
    latestAgenda && { label: 'Agenda', text: latestAgenda.judul, href: latestAgenda.slug ? `/agenda/${latestAgenda.slug}` : '/agenda' },
  ].filter(Boolean) as { label: string; text: string; href: string }[]

  return (
    <SkinProvider>
      <div className="flex flex-col min-h-screen overflow-x-hidden" style={{ background: 'var(--skin-surface)' }}>
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
