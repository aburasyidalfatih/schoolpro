import { headers } from 'next/headers'
import { getTenantBySlug } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Building2 } from 'lucide-react'
import styles from '@/components/website/page.module.css'

export default async function FasilitasPage() {
  const headerList = await headers()
  const tenantSlug = headerList.get('x-tenant-slug') || 'demo'
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) redirect('/app/login')

  const fasilitas = await prisma.fasilitas.findMany({
    where: { tenantId: tenant.id, isPublished: true },
    orderBy: { nama: 'asc' },
  })

  return (
    <>
      <div className={styles.pageHero}>
        <div className={styles.pageHeroInner}>
          <div className={styles.breadcrumb}><Link href="/">Beranda</Link> <span>/</span> <span>Fasilitas</span></div>
          <div className={styles.pageLabel}><Building2 size={13} /> Sarana & Prasarana</div>
          <h1 className={styles.pageTitle}>Fasilitas Pesantren</h1>
          <p className={styles.pageSubtitle}>Sarana dan prasarana penunjang pembelajaran</p>
        </div>
      </div>
      <div className={styles.container}>
        {fasilitas.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}><Building2 size={28} /></div>
            <div className={styles.emptyText}>Belum ada data fasilitas</div>
          </div>
        ) : (
          <div className={styles.grid3}>
            {fasilitas.map(f => (
              <div key={f.id} className={styles.card}>
                <div className={styles.cardImg}>
                  {f.gambarUrl ? <img src={f.gambarUrl} alt={f.nama} /> : <Building2 size={40} />}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTitle}>{f.nama}</div>
                  {f.deskripsi && <div className={styles.cardDesc}>{f.deskripsi}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
