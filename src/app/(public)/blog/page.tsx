import Link from 'next/link'
import Image from 'next/image'
import PageHeader from '@/components/public/shared/PageHeader'
import { getWebsiteTenant } from '@/lib/tenant'
import { getWebsiteBlog } from '@/features/website/lib/website-data'

export default async function BlogPage() {
  const tenant = await getWebsiteTenant()
  if (!tenant) return null

  const data = await getWebsiteBlog(tenant.id)

  return (
    <>
      <PageHeader title="Blog Guru" description="Tulisan, modul, dan refleksi dari para pendidik"
        breadcrumbs={[{ label: 'Blog Guru' }]} />
      <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 gap-6">
          {data.map((item) => (
            <Link key={item.id} href={`/blog/${item.slug}`} className="block group">
              <div className="h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border" style={{ borderColor: 'var(--skin-border)' }}>
                {item.gambarUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <Image src={item.gambarUrl} alt={item.judul} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    {item.kategori && (
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white shadow-lg" style={{ background: 'var(--skin-primary)' }}>{item.kategori}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-5">
                  {item.penulis && (
                    <div className="flex items-center gap-3 mb-3">
                      {item.fotoPenulis && (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <Image src={item.fotoPenulis} alt={item.penulis} fill className="object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold" style={{ color: 'var(--skin-text-heading)' }}>{item.penulis}</p>
                        <p className="text-[10px]" style={{ color: 'var(--skin-text-muted)' }}>
                          {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  )}
                  <h2 className="text-base font-bold mb-2 line-clamp-2 group-hover:underline decoration-2 underline-offset-4" style={{ color: 'var(--skin-text-heading)' }}>
                    {item.judul}
                  </h2>
                  {item.ringkasan && <p className="text-sm line-clamp-2" style={{ color: 'var(--skin-text-muted)' }}>{item.ringkasan}</p>}
                  {item.tags && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.tags.split(',').map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--skin-surface)', color: 'var(--skin-text-muted)' }}>#{tag.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {data.length === 0 && <p className="col-span-2 text-center py-12" style={{ color: 'var(--skin-text-muted)' }}>Belum ada blog.</p>}
        </div>
      </section>
    </>
  )
}
