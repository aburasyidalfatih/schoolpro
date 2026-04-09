import { headers } from 'next/headers'
import { getTenantBySlug } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Bell, Clock } from 'lucide-react'
import styles from '@/components/website/page.module.css'

function formatTanggal(date: Date) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
}

export default async function PengumumanPage() {
  const headerList = await headers()
  const tenantSlug = headerList.get('x-tenant-slug') || 'demo'
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) redirect('/app/login')

  const pengumumans = await prisma.pengumuman.findMany({
    where: { tenantId: tenant.id },
    orderBy: { tanggal: 'desc' },
  })

  return (
    <>
      <div className={styles.pageHero}>
        <div className={styles.pageHeroInner}>
          <div className={styles.breadcrumb}><Link href="/">Beranda</Link> <span>/</span> <span>Pengumuman</span></div>
          <div className={styles.pageLabel}><Bell size={13} /> Informasi Resmi</div>
          <h1 className={styles.pageTitle}>Pengumuman</h1>
          <p className={styles.pageSubtitle}>Informasi dan pemberitahuan resmi dari pesantren</p>
        </div>
      </div>
      <div className={styles.container}>
        {pengumumans.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}><Bell size={28} /></div>
            <div className={styles.emptyText}>Belum ada pengumuman</div>
          </div>
        ) : pengumumans.map(p => (
          <div key={p.id} className={styles.listItem}>
            <div className={styles.listItemTitle}>{p.judul}</div>
            <div className={styles.listItemMeta}>
              <Clock size={12} /> {formatTanggal(p.tanggal)}
            </div>
            {p.konten && (
              <div style={{ marginTop: '0.875rem', fontSize: '0.9rem', color: '#475569', lineHeight: 1.7, paddingTop: '0.875rem', borderTop: '1px solid #f1f5f9' }}>
                {p.konten}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
