import Link from 'next/link'
import { MapPin, Clock, User } from 'lucide-react'
import PageHeader from '@/components/public/shared/PageHeader'
import { getWebsiteTenant } from '@/lib/tenant'
import { getWebsiteAgenda } from '@/features/website/lib/website-data'

const categoryColors: Record<string, string> = {
  ujian: '#dc2626', rapat: '#2563eb', libur: '#16a34a', kegiatan: '#d97706', lainnya: '#64748b',
}

export default async function AgendaPage() {
  const tenant = await getWebsiteTenant()
  if (!tenant) return null

  const agendaData = await getWebsiteAgenda(tenant.id)

  return (
    <>
      <PageHeader title="Agenda Kegiatan" description="Jadwal kegiatan dan acara sekolah"
        breadcrumbs={[{ label: 'Agenda' }]} />
      <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-5">
          {agendaData.map((item) => {
            const color = categoryColors[item.kategori || 'kegiatan'] || categoryColors.kegiatan
            const href = item.slug ? `/agenda/${item.slug}` : '#'
            return (
              <Link key={item.id} href={href} className="block group">
                <div className="flex items-stretch gap-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden border"
                  style={{ borderColor: 'var(--skin-border)' }}>
                  <div className="flex-shrink-0 w-20 sm:w-28 flex flex-col items-center justify-center text-white p-3 sm:p-4"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                    <span className="text-2xl sm:text-4xl font-bold">{new Date(item.tanggalMulai).getDate()}</span>
                    <span className="text-[10px] sm:text-xs font-medium uppercase mt-0.5">{new Date(item.tanggalMulai).toLocaleString('id-ID', { month: 'short' })}</span>
                    <span className="text-[9px] sm:text-[10px] opacity-80">{new Date(item.tanggalMulai).getFullYear()}</span>
                  </div>
                  <div className="flex-1 py-4 pr-4">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white mb-2"
                      style={{ background: color }}>{item.kategori || 'kegiatan'}</span>
                    <h2 className="text-lg font-bold group-hover:underline decoration-2 underline-offset-4" style={{ color: 'var(--skin-text-heading)' }}>
                      {item.judul}
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] sm:text-sm" style={{ color: 'var(--skin-text-muted)' }}>
                      {item.waktu && <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {item.waktu}</span>}
                      {item.lokasi && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {item.lokasi}</span>}
                      {item.penanggungjawab && <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {item.penanggungjawab}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
          {agendaData.length === 0 && <p className="text-center py-12" style={{ color: 'var(--skin-text-muted)' }}>Belum ada agenda.</p>}
        </div>
      </section>
    </>
  )
}
