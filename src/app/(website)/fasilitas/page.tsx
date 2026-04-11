import Link from 'next/link'
import Image from 'next/image'
import { Eye } from 'lucide-react'
import PageHeader from '@/components/website/shared/PageHeader'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

async function getTenant() {
  const h = await headers()
  const slug = h.get('x-tenant-slug') || 'demo'
  return prisma.tenant.findFirst({ where: { slug, isActive: true } })
}

export default async function FasilitasPage() {
  const tenant = await getTenant()
  if (!tenant) return null

  const data = await prisma.fasilitas.findMany({
    where: { tenantId: tenant.id, isPublished: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <PageHeader title="Fasilitas Sekolah" description="Sarana dan prasarana modern untuk mendukung kegiatan belajar"
        breadcrumbs={[{ label: 'Fasilitas' }]} />
      <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((item) => {
            const href = (item as any).slug ? `/fasilitas/${(item as any).slug}` : '#'
            return (
              <Link key={item.id} href={href} className="block group">
                <div className="relative h-72 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                  {item.gambarUrl ? (
                    <Image src={item.gambarUrl} alt={item.nama} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--skin-surface)' }}>
                      <span className="text-5xl">🏫</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {(item as any).kategori && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white/90 bg-white/20 backdrop-blur">
                        {(item as any).kategori}
                      </span>
                    )}
                    <h2 className="text-lg font-bold text-white mt-2">{item.nama}</h2>
                    {(item as any).kapasitas && <p className="text-xs text-white/70 mt-0.5">Kapasitas: {(item as any).kapasitas}</p>}
                  </div>
                </div>
              </Link>
            )
          })}
          {data.length === 0 && <p className="col-span-3 text-center py-12" style={{ color: 'var(--skin-text-muted)' }}>Belum ada fasilitas.</p>}
        </div>
      </section>
    </>
  )
}
