import Image from 'next/image'
import { GraduationCap, BookOpen, Quote } from 'lucide-react'
import PageHeader from '@/components/website/shared/PageHeader'
import { getWebsiteTenant } from '@/lib/tenant'
import { getWebsiteGuru } from '@/lib/website-data'

const jabatanOrder = ['kepala-sekolah', 'wakil', 'guru', 'staf']
const jabatanGroupLabels: Record<string, string> = {
  'kepala-sekolah': 'Kepala Sekolah',
  'wakil': 'Wakil Kepala',
  'guru': 'Tenaga Pendidik',
  'staf': 'Tenaga Kependidikan',
}
const jabatanColors: Record<string, string> = {
  'kepala-sekolah': 'var(--skin-accent)',
  'wakil': 'var(--skin-secondary)',
  'guru': 'var(--skin-primary)',
  'staf': 'var(--skin-primary-light)',
}

export default async function GuruPage() {
  const tenant = await getWebsiteTenant()
  if (!tenant) return null

  const gurus = await getWebsiteGuru(tenant.id)

  const grouped = jabatanOrder
    .map((jab) => ({
      jabatan: jab,
      label: jabatanGroupLabels[jab] || jab,
      items: gurus.filter((g) => g.jabatan === jab),
    }))
    .filter((g) => g.items.length > 0)

  // Add any jabatan not in jabatanOrder
  const otherJabatans = [...new Set(gurus.map((g) => g.jabatan).filter((j) => !jabatanOrder.includes(j)))]
  otherJabatans.forEach((jab) => {
    grouped.push({ jabatan: jab, label: jab, items: gurus.filter((g) => g.jabatan === jab) })
  })

  return (
    <>
      <PageHeader title="Guru & Tenaga Pendidik"
        description="Tenaga pendidik profesional yang membimbing siswa dengan ilmu dan pengalaman"
        breadcrumbs={[{ label: 'Guru & Staff' }]} />
      <div className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {grouped.map((group) => (
            <div key={group.jabatan} className="mb-16 last:mb-0">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-8 rounded-full" style={{ background: jabatanColors[group.jabatan] || 'var(--skin-primary)' }} />
                <h2 className="text-xl lg:text-2xl font-bold" style={{ color: 'var(--skin-text-heading)' }}>{group.label}</h2>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'var(--skin-surface)', color: 'var(--skin-text-muted)' }}>
                  {group.items.length} orang
                </span>
              </div>

              <div className={`grid gap-6 ${
                group.jabatan === 'kepala-sekolah' ? 'grid-cols-1 max-w-3xl' :
                group.jabatan === 'wakil' ? 'grid-cols-1 sm:grid-cols-2' :
                'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}>
                {group.items.map((guru) => (
                  group.jabatan === 'kepala-sekolah' ? (
                    <div key={guru.id} className="bg-white rounded-2xl shadow-lg border overflow-hidden" style={{ borderColor: 'var(--skin-border)' }}>
                      <div className="flex flex-col md:flex-row">
                        <div className="relative w-full md:w-72 h-72 md:h-auto flex-shrink-0">
                          {guru.foto ? (
                            <Image src={guru.foto} alt={guru.nama} fill className="object-cover" sizes="(max-width: 768px) 100vw, 288px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--skin-surface)' }}>
                              <GraduationCap className="h-16 w-16" style={{ color: 'var(--skin-primary)' }} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-6 md:p-8">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-lg shadow mb-4"
                            style={{ background: jabatanColors[guru.jabatan] || 'var(--skin-primary)' }}>
                            <GraduationCap className="h-3.5 w-3.5" />{guru.jabatanLabel}
                          </span>
                          <h3 className="text-xl lg:text-2xl font-bold mb-1" style={{ color: 'var(--skin-text-heading)' }}>{guru.nama}</h3>
                          {guru.bidang && <p className="text-sm font-medium mb-3" style={{ color: 'var(--skin-primary)' }}>{guru.bidang}</p>}
                          {guru.pendidikan && (
                            <div className="flex items-start gap-2 mb-3 text-xs" style={{ color: 'var(--skin-text-muted)' }}>
                              <BookOpen className="h-4 w-4 flex-shrink-0 mt-0.5" /><span>{guru.pendidikan}</span>
                            </div>
                          )}
                          {guru.bio && <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--skin-text-body)' }}>{guru.bio}</p>}
                          {guru.quote && (
                            <blockquote className="text-sm italic pl-4 border-l-3" style={{ borderColor: 'var(--skin-accent)', color: 'var(--skin-text-muted)' }}>
                              &ldquo;{guru.quote}&rdquo;
                            </blockquote>
                          )}
                          {guru.nip && <p className="text-[11px] font-mono mt-4" style={{ color: 'var(--skin-text-muted)' }}>NIP: {guru.nip}</p>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={guru.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border overflow-hidden" style={{ borderColor: 'var(--skin-border)' }}>
                      <div className="relative h-56 overflow-hidden">
                        {guru.foto ? (
                          <Image src={guru.foto} alt={guru.nama} fill className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--skin-surface)' }}>
                            <GraduationCap className="h-12 w-12" style={{ color: 'var(--skin-primary)' }} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white px-2.5 py-1 rounded-lg shadow backdrop-blur"
                            style={{ background: jabatanColors[guru.jabatan] || 'var(--skin-primary)' }}>
                            {guru.jabatanLabel}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-base font-bold mb-0.5" style={{ color: 'var(--skin-text-heading)' }}>{guru.nama}</h3>
                        {guru.bidang && <p className="text-xs font-medium mb-3" style={{ color: 'var(--skin-primary)' }}>{guru.bidang}</p>}
                        {guru.bio && <p className="text-xs leading-relaxed line-clamp-3 mb-3" style={{ color: 'var(--skin-text-body)' }}>{guru.bio}</p>}
                        {guru.pendidikan && (
                          <div className="flex items-start gap-1.5 text-[11px]" style={{ color: 'var(--skin-text-muted)' }}>
                            <GraduationCap className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{guru.pendidikan}</span>
                          </div>
                        )}
                        {guru.quote && (
                          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--skin-border)' }}>
                            <p className="text-[11px] italic line-clamp-2 flex items-start gap-1.5" style={{ color: 'var(--skin-text-muted)' }}>
                              <Quote className="h-3 w-3 flex-shrink-0 mt-0.5" />{guru.quote}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          ))}
          {gurus.length === 0 && <p className="text-center py-12" style={{ color: 'var(--skin-text-muted)' }}>Belum ada data guru.</p>}
        </div>
      </div>
    </>
  )
}
