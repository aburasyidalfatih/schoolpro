import Link from 'next/link'
import { AlertTriangle, Bell, Info } from 'lucide-react'
import PageHeader from '@/components/website/shared/PageHeader'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

const priorityConfig: Record<string, { icon: React.ReactNode; bg: string; border: string; text: string; label: string }> = {
  urgent: { icon: <AlertTriangle className="h-4 w-4" />, bg: '#fef2f2', border: '#fecaca', text: '#dc2626', label: 'Penting' },
  normal: { icon: <Bell className="h-4 w-4" />, bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb', label: 'Normal' },
  info: { icon: <Info className="h-4 w-4" />, bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', label: 'Info' },
}

async function getTenant() {
  const h = await headers()
  const slug = h.get('x-tenant-slug') || 'demo'
  return prisma.tenant.findFirst({ where: { slug, isActive: true } })
}

export default async function PengumumanPage() {
  const tenant = await getTenant()
  if (!tenant) return null

  const data = await prisma.pengumuman.findMany({
    where: { tenantId: tenant.id },
    orderBy: { tanggal: 'desc' },
  })

  return (
    <>
      <PageHeader title="Pengumuman" description="Informasi dan pemberitahuan resmi sekolah"
        breadcrumbs={[{ label: 'Pengumuman' }]} />
      <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto grid gap-5">
          {data.map((item) => {
            const config = priorityConfig[(item as any).prioritas] || priorityConfig.normal
            const href = (item as any).slug ? `/pengumuman/${(item as any).slug}` : '#'
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
                  {(item as any).ringkasan && <p className="text-sm leading-relaxed" style={{ color: 'var(--skin-text-muted)' }}>{(item as any).ringkasan}</p>}
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
