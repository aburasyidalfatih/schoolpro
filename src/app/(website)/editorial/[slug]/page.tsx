import { notFound } from 'next/navigation'
import Image from 'next/image'
import PageHeader from '@/components/website/shared/PageHeader'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

async function getTenant() {
  const h = await headers()
  const slug = h.get('x-tenant-slug') || 'demo'
  return prisma.tenant.findFirst({ where: { slug, isActive: true } })
}

export default async function EditorialDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tenant = await getTenant()
  if (!tenant) return notFound()

  const item = await prisma.editorial.findFirst({ where: { tenantId: tenant.id, slug } })
  if (!item) return notFound()

  return (
    <>
      <PageHeader title={item.judul} breadcrumbs={[{ label: 'Editorial', href: '/editorial' }, { label: item.judul }]} />
      <article className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {item.gambarUrl && (
            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-8">
              <Image src={item.gambarUrl} alt={item.judul} fill className="object-cover" />
            </div>
          )}

          {item.penulis && (
            <div className="flex items-center gap-4 p-5 rounded-2xl mb-8" style={{ background: 'var(--skin-surface)' }}>
              {item.fotoPenulis && (
                <div className="w-16 h-16 rounded-xl overflow-hidden relative flex-shrink-0">
                  <Image src={item.fotoPenulis} alt={item.penulis} fill className="object-cover" />
                </div>
              )}
              <div>
                <p className="font-bold" style={{ color: 'var(--skin-text-heading)' }}>{item.penulis}</p>
                {item.judulPenulis && <p className="text-sm" style={{ color: 'var(--skin-primary)' }}>{item.judulPenulis}</p>}
                <p className="text-xs mt-1" style={{ color: 'var(--skin-text-muted)' }}>
                  {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          )}

          <div className="prose prose-lg max-w-none" style={{ color: 'var(--skin-text-body)' }}>
            {item.konten.split('\n').map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </article>
    </>
  )
}
