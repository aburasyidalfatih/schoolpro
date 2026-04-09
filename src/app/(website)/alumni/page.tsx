import { headers } from 'next/headers'
import { getTenantBySlug } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { GraduationCap, UserCircle, ArrowRight, BookOpen } from 'lucide-react'
import styles from '@/components/website/page.module.css'
import alumniStyles from './page.module.css'

export default async function AlumniPage() {
  const headerList = await headers()
  const tenantSlug = headerList.get('x-tenant-slug') || 'demo'
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) redirect('/app/login')

  const alumnis = await prisma.alumni.findMany({
    where: { tenantId: tenant.id, status: 'DISETUJUI' },
    orderBy: { tahunLulus: 'desc' },
  })

  return (
    <>
      <div className={styles.pageHero}>
        <div className={styles.pageHeroInner}>
          <div className={styles.breadcrumb}><Link href="/">Beranda</Link> <span>/</span> <span>Alumni</span></div>
          <div className={styles.pageLabel}><GraduationCap size={13} /> Jejak Sukses</div>
          <h1 className={styles.pageTitle}>Alumni</h1>
          <p className={styles.pageSubtitle}>Kebanggaan pesantren yang telah berkarya di berbagai bidang</p>
        </div>
      </div>
      <div className={styles.container}>
        {/* CTA daftar alumni */}
        <div className={alumniStyles.ctaBanner}>
          <div className={alumniStyles.ctaContent}>
            <div className={alumniStyles.ctaIcon}><GraduationCap size={24} /></div>
            <div>
              <div className={alumniStyles.ctaTitle}>Apakah Anda alumni pesantren ini?</div>
              <div className={alumniStyles.ctaDesc}>Daftarkan diri dan bagikan perjalanan sukses Anda kepada adik-adik santri</div>
            </div>
          </div>
          <Link href="/alumni/daftar" className={alumniStyles.ctaBtn}>
            Daftar Alumni <ArrowRight size={15} />
          </Link>
        </div>

        {alumnis.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}><GraduationCap size={28} /></div>
            <div className={styles.emptyText}>Belum ada data alumni yang ditampilkan</div>
          </div>
        ) : (
          <div className={styles.grid4}>
            {alumnis.map(a => (
              <div key={a.id} className={alumniStyles.alumniCard}>
                <div className={alumniStyles.alumniAvatar}>
                  {a.foto
                    ? <img src={a.foto} alt={a.namaLengkap} />
                    : <UserCircle size={40} />
                  }
                </div>
                <div className={alumniStyles.alumniAngkatan}>Angkatan {a.tahunLulus}</div>
                <div className={alumniStyles.alumniNama}>{a.namaLengkap}</div>
                {(a.pekerjaan || a.instansi) && (
                  <div className={alumniStyles.alumniPekerjaan}>
                    {a.pekerjaan}{a.instansi && ` · ${a.instansi}`}
                  </div>
                )}
                {a.melanjutkanKe && (
                  <div className={alumniStyles.alumniLanjut}>
                    <BookOpen size={12} /> {a.melanjutkanKe}
                  </div>
                )}
                {a.testimonial && (
                  <div className={alumniStyles.alumniTestimonial}>"{a.testimonial}"</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
