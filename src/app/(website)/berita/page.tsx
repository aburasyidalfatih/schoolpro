import { headers } from 'next/headers'
import { getTenantBySlug } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Newspaper, Clock, User, ArrowRight } from 'lucide-react'
import styles from '@/components/website/page.module.css'

function formatTanggal(date: Date) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
}

const kategoriLabel: Record<string, string> = {
  BERITA: 'Berita', EDITORIAL: 'Editorial', BLOG_GURU: 'Blog Guru'
}

export default async function BeritaPage() {
  const headerList = await headers()
  const tenantSlug = headerList.get('x-tenant-slug') || 'demo'
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) redirect('/app/login')

  const beritas = await prisma.berita.findMany({
    where: { tenantId: tenant.id, status: 'TERBIT' },
    orderBy: { tanggalTerbit: 'desc' },
    include: { user: { select: { nama: true } } },
  })

  return (
    <>
      <div className={styles.pageHero}>
        <div className={styles.pageHeroInner}>
          <div className={styles.breadcrumb}>
            <Link href="/">Beranda</Link> <span>/</span> <span>Berita</span>
          </div>
          <div className={styles.pageLabel}><Newspaper size={13} /> Informasi Terkini</div>
          <h1 className={styles.pageTitle}>Berita & Artikel</h1>
          <p className={styles.pageSubtitle}>Informasi, editorial, dan blog dari warga pesantren</p>
        </div>
      </div>

      <div className={styles.container}>
        {beritas.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}><Newspaper size={28} /></div>
            <div className={styles.emptyText}>Belum ada berita yang diterbitkan</div>
          </div>
        ) : (
          <div className={styles.grid3}>
            {beritas.map(b => (
              <Link key={b.id} href={`/berita/${b.slug}`} className={styles.card} style={{ textDecoration: 'none' }}>
                <div className={styles.cardImg}>
                  {b.gambarUrl ? <img src={b.gambarUrl} alt={b.judul} /> : <Newspaper size={40} />}
                </div>
                <div className={styles.cardBody}>
                  <span className={styles.cardBadge}>{kategoriLabel[b.kategori] || b.kategori}</span>
                  <div className={styles.cardTitle}>{b.judul}</div>
                  {b.ringkasan && <div className={styles.cardDesc}>{b.ringkasan}</div>}
                  <div className={styles.cardMeta}>
                    <User size={12} /> {b.user.nama}
                    <Clock size={12} /> {formatTanggal(b.tanggalTerbit || b.createdAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
