import { headers } from 'next/headers'
import { getTenantBySlug } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Star, Clock, User } from 'lucide-react'
import styles from '@/components/website/page.module.css'

export default async function EkskulPage() {
  const headerList = await headers()
  const tenantSlug = headerList.get('x-tenant-slug') || 'demo'
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) redirect('/app/login')

  const ekskuls = await prisma.ekskul.findMany({
    where: { tenantId: tenant.id, isActive: true },
    orderBy: { nama: 'asc' },
  })

  return (
    <>
      <div className={styles.pageHero}>
        <div className={styles.pageHeroInner}>
          <div className={styles.breadcrumb}><Link href="/">Beranda</Link> <span>/</span> <span>Program & Kegiatan</span></div>
          <div className={styles.pageLabel}><Star size={13} /> Pengembangan Diri</div>
          <h1 className={styles.pageTitle}>Program & Kegiatan</h1>
          <p className={styles.pageSubtitle}>Kembangkan potensi dan bakat bersama kami</p>
        </div>
      </div>
      <div className={styles.container}>
        {ekskuls.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}><Star size={28} /></div>
            <div className={styles.emptyText}>Belum ada data program kegiatan</div>
          </div>
        ) : (
          <div className={styles.grid3}>
            {ekskuls.map(e => (
              <div key={e.id} className={styles.card}>
                <div className={styles.cardBody}>
                  <div style={{ width: 48, height: 48, background: '#f0fdf4', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', marginBottom: '1rem' }}>
                    <Star size={22} />
                  </div>
                  <div className={styles.cardTitle}>{e.nama}</div>
                  {e.deskripsi && <div className={styles.cardDesc}>{e.deskripsi}</div>}
                  <div className={styles.cardMeta}>
                    {e.jadwal && <><Clock size={12} /> {e.jadwal}</>}
                    {e.pembina && <><User size={12} /> {e.pembina}</>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
