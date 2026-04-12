import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Building, Users } from 'lucide-react'
import PageHeader from '@/components/public/shared/PageHeader'
import { getWebsiteTenant } from '@/lib/tenant'
import { getWebsiteFasilitasBySlug } from '@/features/website/lib/website-data'

export default async function FasilitasDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tenant = await getWebsiteTenant()
  if (!tenant) return notFound()

  const item = await getWebsiteFasilitasBySlug(tenant.id, slug)
  if (!item) return notFound()

  return (
    <>
      <PageHeader title={item.nama} breadcrumbs={[{ label: 'Fasilitas', href: '/fasilitas' }, { label: item.nama }]} />
      <article className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {item.gambarUrl && (
            <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden mb-8">
              <Image src={item.gambarUrl} alt={item.nama} fill className="object-cover" />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {item.kategori && (
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--skin-surface)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: 'var(--skin-primary)' }}>
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--skin-text-muted)' }}>Kategori</p>
                  <p className="font-semibold" style={{ color: 'var(--skin-text-heading)' }}>{item.kategori}</p>
                </div>
              </div>
            )}
            {item.kapasitas && (
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--skin-surface)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: 'var(--skin-secondary)' }}>
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--skin-text-muted)' }}>Kapasitas</p>
                  <p className="font-semibold" style={{ color: 'var(--skin-text-heading)' }}>{String(item.kapasitas)}</p>
                </div>
              </div>
            )}
          </div>

          {item.deskripsi && (
            <div className="prose prose-lg max-w-none" style={{ color: 'var(--skin-text-body)' }}>
              <p>{item.deskripsi}</p>
            </div>
          )}
        </div>
      </article>
    </>
  )
}
