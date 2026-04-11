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

export default async function PengumumanDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tenant = await getTenant()
  if (!tenant) return notFound()

  const item = await prisma.pengumuman.findFirst({ where: { tenantId: tenant.id, slug } })
  if (!item) return notFound()

  return (
    <>
      <PageHeader title={item.judul} breadcrumbs={[{ label: 'Pengumuman', href: '/pengumuman' }, { label: item.judul }]} />
      <article className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {(item as any).gambarUrl && (
            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-8">
              <Image src={(item as any).gambarUrl} alt={item.judul} fill className="object-cover" />
            </div>
          )}
          <p className="text-sm mb-6" style={{ color: 'var(--skin-text-muted)' }}>
            {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className="prose prose-lg max-w-none" style={{ color: 'var(--skin-text-body)' }}>
            {item.konten.split('\n').map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </article>
    </>
  )
}
