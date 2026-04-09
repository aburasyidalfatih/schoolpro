import { headers } from 'next/headers'
import { getTenantBySlug } from '@/lib/tenant'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import styles from './page.module.css'

function formatTanggal(date: Date) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const headerList = await headers()
  const tenantSlug = headerList.get('x-tenant-slug') || 'demo'
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) redirect('/app/login')

  const berita = await prisma.berita.findUnique({
    where: { tenantId_slug: { tenantId: tenant.id, slug } },
    include: { user: { select: { nama: true, role: true } } },
  })

  if (!berita || berita.status !== 'TERBIT') notFound()

  const lainnya = await prisma.berita.findMany({
    where: { tenantId: tenant.id, status: 'TERBIT', id: { not: berita.id } },
    orderBy: { tanggalTerbit: 'desc' },
    take: 3,
  })

  return (
    <div className={styles.wrapper}>
      {/* Hero */}
      <div className={styles.articleHero}>
        <div className={styles.articleHeroInner}>
          <div className={styles.breadcrumb}>
            <Link href="/">Beranda</Link> / <Link href="/berita">Berita</Link> / <span>{berita.judul}</span>
          </div>
          <span className={styles.badge}>{berita.kategori}</span>
          <h1 className={styles.articleTitle}>{berita.judul}</h1>
          <div className={styles.articleMeta}>
            <span>✍️ {berita.user.nama}</span>
            <span>📅 {formatTanggal(berita.tanggalTerbit || berita.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className={styles.articleLayout}>
        {/* Konten */}
        <article className={styles.articleContent}>
          {berita.gambarUrl && (
            <img src={berita.gambarUrl} alt={berita.judul} className={styles.articleImg} />
          )}
          <div className={styles.prose} dangerouslySetInnerHTML={{ __html: berita.konten }} />
        </article>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>Berita Lainnya</h3>
            {lainnya.map(b => (
              <Link key={b.id} href={`/berita/${b.slug}`} className={styles.sidebarItem}>
                <div className={styles.sidebarItemTitle}>{b.judul}</div>
                <div className={styles.sidebarItemMeta}>{formatTanggal(b.tanggalTerbit || b.createdAt)}</div>
              </Link>
            ))}
            {lainnya.length === 0 && <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Belum ada berita lain</p>}
          </div>
        </aside>
      </div>
    </div>
  )
}
