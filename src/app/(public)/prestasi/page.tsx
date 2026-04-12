import Link from 'next/link'
import Image from 'next/image'
import { Trophy, Medal } from 'lucide-react'
import PageHeader from '@/components/public/shared/PageHeader'
import { getWebsiteTenant } from '@/lib/tenant'
import { getWebsitePrestasi } from '@/features/website/lib/website-data'

const levelColors: Record<string, string> = {
  KOTA: '#64748b', PROVINSI: '#2563eb', NASIONAL: '#d97706', INTERNASIONAL: '#dc2626', SEKOLAH: '#16a34a',
}

export default async function PrestasiPage() {
  const tenant = await getWebsiteTenant()
  if (!tenant) return null

  const data = await getWebsitePrestasi(tenant.id)

  return (
    <>
      <PageHeader title="Galeri Prestasi" description="Catatan kebanggaan siswa di berbagai kompetisi"
        breadcrumbs={[{ label: 'Prestasi' }]} />
      <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item) => {
            const color = levelColors[item.tingkat?.toUpperCase()] || '#64748b'
            const href = item.slug ? `/prestasi/${item.slug}` : '#'
            return (
              <Link key={item.id} href={href} className="block group">
                <div className="h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border" style={{ borderColor: 'var(--skin-border)' }}>
                  {item.gambarUrl ? (
                    <div className="relative h-48 overflow-hidden">
                      <Image src={item.gambarUrl} alt={item.judul} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-white shadow-lg"
                          style={{ background: color }}>
                          <Trophy className="h-3 w-3" />{item.tingkat}
                        </span>
                      </div>
                      {item.pencapaian && (
                        <div className="absolute bottom-3 right-3">
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-white/90 backdrop-blur shadow-md"
                            style={{ color }}>
                            <Medal className="h-3.5 w-3.5" />{item.pencapaian}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-24 flex items-center justify-center" style={{ background: `${color}15` }}>
                      <Trophy className="h-10 w-10" style={{ color }} />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-xs mb-2" style={{ color: 'var(--skin-text-muted)' }}>{item.tahun}</p>
                    <h2 className="text-base font-bold mb-2 line-clamp-2 group-hover:underline decoration-2 underline-offset-4" style={{ color: 'var(--skin-text-heading)' }}>
                      {item.judul}
                    </h2>
                    {item.siswa && <p className="text-sm font-medium mb-2" style={{ color: 'var(--skin-primary)' }}>{item.siswa}</p>}
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--skin-surface)', color: 'var(--skin-text-muted)' }}>{item.kategori}</span>
                  </div>
                </div>
              </Link>
            )
          })}
          {data.length === 0 && <p className="col-span-3 text-center py-12" style={{ color: 'var(--skin-text-muted)' }}>Belum ada prestasi.</p>}
        </div>
      </section>
    </>
  )
}
