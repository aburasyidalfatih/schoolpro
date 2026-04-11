import Link from 'next/link'
import { AlertTriangle, Bell, Info } from 'lucide-react'
import PageHeader from '@/components/website/shared/PageHeader'
import { getWebsiteTenant } from '@/lib/tenant'
import { getWebsitePengumuman } from '@/lib/website-data'

const priorityConfig: Record<string, { icon: React.ReactNode; bg: string; border: string; text: string; label: string }> = {
  urgent: { icon: <AlertTriangle className="h-4 w-4" />, bg: '#fef2f2', border: '#fecaca', text: '#dc2626', label: 'Penting' },
  normal: { icon: <Bell className="h-4 w-4" />, bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb', label: 'Normal' },
  info: { icon: <Info className="h-4 w-4" />, bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', label: 'Info' },
}

function getAnnouncementPreview(summary = '', content = '') {
  const baseText = [content, summary]
    .filter(Boolean)
    .join(' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!baseText) return ''

  const normalized = baseText
    .replace(/([.!?])\s+/g, '$1|')
    .split('|')
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  if (normalized.length >= 2) {
    return normalized.slice(0, 2).join(' ')
  }

  if (baseText.length > 220) {
    return `${baseText.slice(0, 220).trim()}...`
  }

  return baseText
}

export default async function PengumumanPage() {
  const tenant = await getWebsiteTenant()
  if (!tenant) return null

  const data = await getWebsitePengumuman(tenant.id)

  return (
    <>
      <PageHeader title="Pengumuman" description="Informasi dan pemberitahuan resmi sekolah"
        breadcrumbs={[{ label: 'Pengumuman' }]} />
      <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto grid gap-5">
          {data.map((item) => {
            const config = priorityConfig[(item as any).prioritas] || priorityConfig.normal
            const href = (item as any).slug ? `/pengumuman/${(item as any).slug}` : '#'
            const preview = getAnnouncementPreview((item as any).ringkasan || '', (item as any).konten || '')
            return (
              <Link key={item.id} href={href} className="block group">
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border" style={{ borderColor: 'var(--skin-border)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background: config.bg, color: config.text, border: `1px solid ${config.border}` }}>
                      {config.icon} {config.label}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--skin-text-muted)' }}>
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold mb-2 group-hover:underline decoration-2 underline-offset-4" style={{ color: 'var(--skin-text-heading)' }}>
                    {item.judul}
                  </h2>
                  {preview && <p className="text-sm leading-relaxed line-clamp-5" style={{ color: 'var(--skin-text-muted)' }}>{preview}</p>}
                </div>
              </Link>
            )
          })}
          {data.length === 0 && <p className="text-center py-12" style={{ color: 'var(--skin-text-muted)' }}>Belum ada pengumuman.</p>}
        </div>
      </section>
    </>
  )
}
