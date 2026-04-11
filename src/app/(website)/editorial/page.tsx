import Link from 'next/link'
import Image from 'next/image'
import PageHeader from '@/components/website/shared/PageHeader'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

async function getTenant() {
  const h = await headers()
  const slug = h.get('x-tenant-slug') || 'demo'
  return prisma.tenant.findFirst({ where: { slug, isActive: true } })
}

export default async function EditorialPage() {
  const tenant = await getTenant()
  if (!tenant) return null

  const data = await prisma.editorial.findMany({
    where: { tenantId: tenant.id, isPublished: true },
    orderBy: { tanggal: 'desc' },
  })

  return (
    <>
      <PageHeader title="Editorial Kepala Sekolah" description="Catatan, opini, dan visi dari pimpinan sekolah"
        breadcrumbs={[{ label: 'Editorial' }]} />
      <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {data[0] && (
            <Link href={`/editorial/${data[0].slug}`} className="block group mb-10">
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border" style={{ borderColor: 'var(--skin-border)' }}>
                {data[0].gambarUrl && (
                  <div className="relative h-64 sm:h-80 overflow-hidden">
                    <Image src={data[0].gambarUrl} alt={data[0].judul} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{data[0].judul}</h2>
                      {data[0].penulis && (
                        <div className="flex items-center gap-3">
                          {data[0].fotoPenulis && (
                            <div className="w-8 h-8 rounded-full overflow-hidden relative">
                              <Image src={data[0].fotoPenulis} alt={data[0].penulis} fill className="object-cover" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-white">{data[0].penulis}</p>
                            <p className="text-xs text-white/70">{new Date(data[0].tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {!data[0].gambarUrl && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--skin-text-heading)' }}>{data[0].judul}</h2>
                  </div>
                )}
                {data[0].ringkasan && (
                  <div className="p-6">
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--skin-text-muted)' }}>{data[0].ringkasan}</p>
                  </div>
                )}
              </div>
            </Link>
          )}

          <div className="grid gap-5">
            {data.slice(1).map((item) => (
              <Link key={item.id} href={`/editorial/${item.slug}`} className="block group">
                <div className="flex gap-5 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-5 border" style={{ borderColor: 'var(--skin-border)' }}>
                  {item.fotoPenulis && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden relative">
                      <Image src={item.fotoPenulis} alt={item.penulis || ''} fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--skin-text-muted)' }}>
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <h2 className="text-base font-bold group-hover:underline decoration-2 underline-offset-4 mb-1" style={{ color: 'var(--skin-text-heading)' }}>
                      {item.judul}
                    </h2>
                    {item.ringkasan && <p className="text-sm line-clamp-2" style={{ color: 'var(--skin-text-muted)' }}>{item.ringkasan}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {data.length === 0 && <p className="text-center py-12" style={{ color: 'var(--skin-text-muted)' }}>Belum ada editorial.</p>}
        </div>
      </section>
    </>
  )
}
