import { GraduationCap, Eye, Target, Award, BookOpen, Users, Globe } from 'lucide-react'
import PageHeader from '@/components/public/shared/PageHeader'
import { getWebsiteTenant } from '@/lib/tenant'

function getObjectRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function getStringValue(record: Record<string, unknown>, key: string): string {
  const value = record[key]
  return typeof value === 'string' ? value : ''
}

function getNumberValue(record: Record<string, unknown>, key: string): number {
  const value = record[key]
  return typeof value === 'number' ? value : 0
}

export default async function ProfilPage() {
  const tenant = await getWebsiteTenant()
  if (!tenant) return null

  const pengaturan = getObjectRecord(tenant.pengaturan)

  let misiArr: string[] = []
  const rawMisi = pengaturan.misi
  try {
    misiArr = JSON.parse(typeof rawMisi === 'string' ? rawMisi : '[]')
  } catch {
    if (typeof rawMisi === 'string') misiArr = rawMisi.split(',').map((s: string) => s.trim())
  }

  const stats = [
    { icon: <Users className="h-5 w-5 sm:h-6 sm:w-6" />, value: getNumberValue(pengaturan, 'statsStudents'), label: 'Siswa' },
    { icon: <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />, value: getNumberValue(pengaturan, 'statsTeachers'), label: 'Pendidik' },
    { icon: <Award className="h-5 w-5 sm:h-6 sm:w-6" />, value: getNumberValue(pengaturan, 'statsAchieve'), label: 'Prestasi' },
    { icon: <Globe className="h-5 w-5 sm:h-6 sm:w-6" />, value: getNumberValue(pengaturan, 'statsEkskul'), label: 'Ekskul' },
  ]

  return (
    <>
      <PageHeader title="Profil Sekolah" description={`Mengenal lebih dekat ${tenant.nama}`}
        breadcrumbs={[{ label: 'Profil' }]} />
      <div className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">

          {/* Identitas */}
          <section className="glass-card rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}>
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--skin-text-heading)' }}>{tenant.nama}</h2>
                <p className="text-sm" style={{ color: 'var(--skin-text-muted)' }}>
                  {getStringValue(pengaturan, 'akreditasi') && <>Akreditasi: <strong>{getStringValue(pengaturan, 'akreditasi')}</strong> &bull; </>}
                  {getStringValue(pengaturan, 'npsn') && <>NPSN: {getStringValue(pengaturan, 'npsn')}</>}
                </p>
              </div>
            </div>
            {getStringValue(pengaturan, 'tagline') && <p className="text-base leading-relaxed" style={{ color: 'var(--skin-text-body)' }}>{getStringValue(pengaturan, 'tagline')}</p>}
          </section>

          {/* Sejarah */}
          {getStringValue(pengaturan, 'sejarah') && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="h-6 w-6" style={{ color: 'var(--skin-primary)' }} />
                <h2 className="text-xl font-bold" style={{ color: 'var(--skin-text-heading)' }}>Sejarah</h2>
              </div>
              <div className="section-divider mb-6" />
              <p className="text-base leading-relaxed" style={{ color: 'var(--skin-text-body)' }}>{getStringValue(pengaturan, 'sejarah')}</p>
            </section>
          )}

          {/* Visi */}
          {getStringValue(pengaturan, 'visi') && (
            <section className="p-8 rounded-2xl" style={{ background: 'linear-gradient(135deg, var(--skin-primary-dark), var(--skin-primary))' }}>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">Visi</h2>
              </div>
              <p className="text-base leading-relaxed text-white/85">{getStringValue(pengaturan, 'visi')}</p>
            </section>
          )}

          {/* Misi */}
          {misiArr.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-6 w-6" style={{ color: 'var(--skin-primary)' }} />
                <h2 className="text-xl font-bold" style={{ color: 'var(--skin-text-heading)' }}>Misi</h2>
              </div>
              <div className="section-divider mb-6" />
              <div className="space-y-3">
                {misiArr.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'var(--skin-surface)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 text-sm font-bold"
                      style={{ background: 'var(--skin-primary)' }}>{i + 1}</div>
                    <p className="text-sm leading-relaxed pt-1" style={{ color: 'var(--skin-text-body)' }}>{m}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Statistik */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-6 w-6" style={{ color: 'var(--skin-primary)' }} />
              <h2 className="text-xl font-bold" style={{ color: 'var(--skin-text-heading)' }}>Sekolah dalam Angka</h2>
            </div>
            <div className="section-divider mb-6" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="text-center p-4 sm:p-6 rounded-2xl" style={{ background: 'var(--skin-surface)' }}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl mx-auto mb-2 sm:mb-3 flex items-center justify-center text-white"
                    style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}>
                    {stat.icon}
                  </div>
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--skin-text-heading)' }}>{Number(stat.value).toLocaleString('id-ID')}+</p>
                  <p className="text-[10px] sm:text-xs font-medium" style={{ color: 'var(--skin-text-muted)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
