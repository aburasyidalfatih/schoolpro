import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Trophy, Medal, Tag, Calendar } from 'lucide-react'
import PageHeader from '@/components/public/shared/PageHeader'
import { getWebsiteTenant } from '@/lib/tenant'
import { getWebsitePrestasiBySlug } from '@/features/website/lib/website-data'

const levelColors: Record<string, string> = {
  KOTA: '#64748b', PROVINSI: '#2563eb', NASIONAL: '#d97706', INTERNASIONAL: '#dc2626', SEKOLAH: '#16a34a',
}

export default async function PrestasiDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tenant = await getWebsiteTenant()
  if (!tenant) return notFound()

  const item = await getWebsitePrestasiBySlug(tenant.id, slug)
  if (!item) return notFound()

  const color = levelColors[item.tingkat?.toUpperCase()] || '#64748b'

  return (
    <>
      <PageHeader title={item.judul} breadcrumbs={[{ label: 'Prestasi', href: '/prestasi' }, { label: item.judul }]} />
      <article className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ background: color }}>
              <Trophy className="h-3 w-3" /> Tingkat {item.tingkat}
            </span>
            {item.pencapaian && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border" style={{ color, borderColor: color }}>
                <Medal className="h-3 w-3" /> {item.pencapaian}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full" style={{ background: 'var(--skin-surface)', color: 'var(--skin-text-muted)' }}>
              <Tag className="h-3 w-3" /> {item.kategori}
            </span>
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full" style={{ background: 'var(--skin-surface)', color: 'var(--skin-text-muted)' }}>
              <Calendar className="h-3 w-3" /> {item.tahun}
            </span>
          </div>

          {item.siswa && (
            <div className="p-5 rounded-2xl mb-8" style={{ background: 'var(--skin-surface)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--skin-text-muted)' }}>Peraih Prestasi:</p>
              <p className="font-bold text-lg" style={{ color: 'var(--skin-primary)' }}>{item.siswa}</p>
            </div>
          )}

          {item.gambarUrl && (
            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-8">
              <Image src={item.gambarUrl} alt={item.judul} fill className="object-cover" />
            </div>
          )}

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
