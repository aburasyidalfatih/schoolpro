import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Calendar, MapPin, Clock, User, Phone } from 'lucide-react'
import PageHeader from '@/components/public/shared/PageHeader'
import { getWebsiteTenant } from '@/lib/tenant'
import { getWebsiteAgendaBySlug } from '@/features/website/lib/website-data'

export default async function AgendaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tenant = await getWebsiteTenant()
  if (!tenant) return notFound()

  const item = await getWebsiteAgendaBySlug(tenant.id, slug)
  if (!item) return notFound()

  const details = [
    { icon: <Calendar className="h-4 w-4" />, label: 'Tanggal', value: new Date(item.tanggalMulai).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
    item.waktu && { icon: <Clock className="h-4 w-4" />, label: 'Waktu', value: item.waktu },
    item.lokasi && { icon: <MapPin className="h-4 w-4" />, label: 'Lokasi', value: item.lokasi },
    item.penanggungjawab && { icon: <User className="h-4 w-4" />, label: 'Penanggung Jawab', value: item.penanggungjawab },
    item.kontakPerson && { icon: <Phone className="h-4 w-4" />, label: 'Kontak', value: item.kontakPerson },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[]

  return (
    <>
      <PageHeader title={item.judul} breadcrumbs={[{ label: 'Agenda', href: '/agenda' }, { label: item.judul }]} />
      <article className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {item.gambarUrl && (
            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-8">
              <Image src={item.gambarUrl} alt={item.judul} fill className="object-cover" />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {details.map((d, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'var(--skin-surface)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: 'var(--skin-primary)' }}>{d.icon}</div>
                <div>
                  <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--skin-text-muted)' }}>{d.label}</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--skin-text-heading)' }}>{d.value}</p>
                </div>
              </div>
            ))}
          </div>
          {item.deskripsi && (
            <div className="prose prose-lg max-w-none" style={{ color: 'var(--skin-text-body)' }}>
              {item.deskripsi.split('\n').map((p, i) => <p key={i}>{p}</p>)}
            </div>
          )}
        </div>
      </article>
    </>
  )
}
