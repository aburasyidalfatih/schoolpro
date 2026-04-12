import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Users, Clock, User, CheckCircle, XCircle } from 'lucide-react'
import PageHeader from '@/components/public/shared/PageHeader'
import { getWebsiteTenant } from '@/lib/tenant'
import { getWebsiteEkskulBySlug } from '@/features/website/lib/website-data'

export default async function EkskulDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tenant = await getWebsiteTenant()
  if (!tenant) return notFound()

  const item = await getWebsiteEkskulBySlug(tenant.id, slug)
  if (!item) return notFound()

  const jumlah = item.jumlahAnggota || 0
  const max = item.maxAnggota || 30
  const progress = Math.round((jumlah / max) * 100)
  const open = item.pendaftaranBuka ?? true

  return (
    <>
      <PageHeader title={item.nama} breadcrumbs={[{ label: 'Ekskul', href: '/ekskul' }, { label: item.nama }]} />
      <article className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {item.gambarUrl && (
            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-8">
              <Image src={item.gambarUrl} alt={item.nama} fill className="object-cover" />
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-6">
            {item.kategori && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ background: 'var(--skin-primary)' }}>{item.kategori}</span>
            )}
            {open ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-green-500 text-white">
                <CheckCircle className="h-3 w-3" /> Pendaftaran Dibuka
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-red-500 text-white">
                <XCircle className="h-3 w-3" /> Kuota Penuh
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {item.hari && (
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--skin-surface)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: 'var(--skin-primary)' }}>
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--skin-text-muted)' }}>Hari Latihan</p>
                  <p className="font-semibold text-sm" style={{ color: 'var(--skin-text-heading)' }}>{item.hari}</p>
                </div>
              </div>
            )}
            {item.jadwal && (
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--skin-surface)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: 'var(--skin-secondary)' }}>
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--skin-text-muted)' }}>Jadwal</p>
                  <p className="font-semibold text-sm" style={{ color: 'var(--skin-text-heading)' }}>{item.jadwal}</p>
                </div>
              </div>
            )}
            {item.pembina && (
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--skin-surface)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: 'var(--skin-accent)' }}>
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--skin-text-muted)' }}>Pembina</p>
                  <p className="font-semibold text-sm" style={{ color: 'var(--skin-text-heading)' }}>{item.pembina}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--skin-surface)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ background: progress >= 90 ? '#dc2626' : 'var(--skin-primary-light)' }}>
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs" style={{ color: 'var(--skin-text-muted)' }}>Anggota</p>
                <p className="font-semibold text-sm" style={{ color: 'var(--skin-text-heading)' }}>{jumlah}/{max}</p>
                <div className="w-full h-1.5 rounded-full mt-1" style={{ background: 'var(--skin-border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${progress}%`, background: progress >= 90 ? '#dc2626' : 'var(--skin-primary)' }} />
                </div>
              </div>
            </div>
          </div>

          {item.deskripsi && (
            <div className="prose prose-lg max-w-none mb-8" style={{ color: 'var(--skin-text-body)' }}>
              <p>{item.deskripsi}</p>
            </div>
          )}

          {open && (
            <div className="p-6 rounded-2xl text-center" style={{ background: 'var(--skin-surface)' }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--skin-text-heading)' }}>Tertarik Bergabung?</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--skin-text-muted)' }}>Hubungi pembina ekskul atau daftar melalui bagian kesiswaan.</p>
              <a href="/kontak" className="inline-block px-6 py-3 rounded-xl text-white font-bold transition-all hover:shadow-lg hover:scale-105"
                style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}>
                Hubungi Kami
              </a>
            </div>
          )}
        </div>
      </article>
    </>
  )
}
