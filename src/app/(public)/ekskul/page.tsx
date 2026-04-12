import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Clock, Users, XCircle } from 'lucide-react'
import PageHeader from '@/components/public/shared/PageHeader'
import { getWebsiteTenant } from '@/lib/tenant'
import { getWebsiteEkskul } from '@/features/website/lib/website-data'

export default async function EkskulPage() {
  const tenant = await getWebsiteTenant()
  if (!tenant) return null

  const data = await getWebsiteEkskul(tenant.id)

  return (
    <>
      <PageHeader title="Kegiatan Ekstrakurikuler" description="Beragam kegiatan pengembangan diri untuk siswa"
        breadcrumbs={[{ label: 'Ekskul' }]} />
      <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((item) => {
            const href = item.slug ? `/ekskul/${item.slug}` : '#'
            const open = item.pendaftaranBuka ?? true
            return (
              <Link key={item.id} href={href} className="block group">
                <div className="h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border" style={{ borderColor: 'var(--skin-border)' }}>
                  {item.gambarUrl ? (
                    <div className="relative h-44 overflow-hidden">
                      <Image src={item.gambarUrl} alt={item.nama} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-3 right-3">
                        {open ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500 text-white shadow-lg">
                            <CheckCircle className="h-3 w-3" /> Buka
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500 text-white shadow-lg">
                            <XCircle className="h-3 w-3" /> Penuh
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-20 flex items-center justify-center" style={{ background: 'var(--skin-surface)' }}>
                      <span className="text-3xl">🎯</span>
                    </div>
                  )}
                  <div className="p-5">
                    {item.kategori && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{ background: 'var(--skin-surface)', color: 'var(--skin-primary)' }}>{item.kategori}</span>
                    )}
                    <h2 className="text-base font-bold mt-2 mb-2 group-hover:underline decoration-2 underline-offset-4" style={{ color: 'var(--skin-text-heading)' }}>
                      {item.nama}
                    </h2>
                    {item.deskripsi && <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--skin-text-muted)' }}>{item.deskripsi}</p>}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--skin-text-muted)' }}>
                      {item.hari && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.hari}</span>}
                      {item.jumlahAnggota !== undefined && (
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {item.jumlahAnggota}/{item.maxAnggota}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
          {data.length === 0 && <p className="col-span-3 text-center py-12" style={{ color: 'var(--skin-text-muted)' }}>Belum ada ekskul.</p>}
        </div>
      </section>
    </>
  )
}
