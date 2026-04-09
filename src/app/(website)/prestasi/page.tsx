import { headers } from 'next/headers'
import { getTenantBySlug } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Trophy, Medal } from 'lucide-react'
import styles from '@/components/website/page.module.css'

const tingkatConfig: Record<string, { label: string; bg: string; color: string }> = {
  SEKOLAH:       { label: 'Sekolah',       bg: '#f1f5f9', color: '#475569' },
  KOTA:          { label: 'Kota/Kab',      bg: '#eff6ff', color: '#2563eb' },
  PROVINSI:      { label: 'Provinsi',      bg: '#f5f3ff', color: '#7c3aed' },
  NASIONAL:      { label: 'Nasional',      bg: '#fef3c7', color: '#d97706' },
  INTERNASIONAL: { label: 'Internasional', bg: '#fef2f2', color: '#dc2626' },
}

export default async function PrestasiPage() {
  const headerList = await headers()
  const tenantSlug = headerList.get('x-tenant-slug') || 'demo'
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) redirect('/app/login')

  const prestasis = await prisma.prestasi.findMany({
    where: { tenantId: tenant.id, isPublished: true },
    orderBy: [{ tahun: 'desc' }, { tingkat: 'asc' }],
  })

  return (
    <>
      <div className={styles.pageHero}>
        <div className={styles.pageHeroInner}>
          <div className={styles.breadcrumb}><Link href="/">Beranda</Link> <span>/</span> <span>Prestasi</span></div>
          <div className={styles.pageLabel}><Trophy size={13} /> Capaian Kami</div>
          <h1 className={styles.pageTitle}>Prestasi Unggulan</h1>
          <p className={styles.pageSubtitle}>Pencapaian membanggakan warga pesantren</p>
        </div>
      </div>
      <div className={styles.container}>
        {prestasis.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}><Trophy size={28} /></div>
            <div className={styles.emptyText}>Belum ada prestasi yang ditampilkan</div>
          </div>
        ) : (
          <div className={styles.grid3}>
            {prestasis.map(p => {
              const tc = tingkatConfig[p.tingkat] || tingkatConfig.SEKOLAH
              return (
                <div key={p.id} className={styles.card} style={{ borderTop: `3px solid ${tc.color}` }}>
                  <div className={styles.cardBody}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ width: 44, height: 44, background: '#fef3c7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                        <Trophy size={20} />
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0.25rem 0.625rem', borderRadius: 100, background: tc.bg, color: tc.color }}>
                        {tc.label}
                      </span>
                    </div>
                    <div className={styles.cardTitle}>{p.judul}</div>
                    {p.deskripsi && <div className={styles.cardDesc}>{p.deskripsi}</div>}
                    <div className={styles.cardMeta}>
                      <Medal size={12} /> {p.tahun}
                      <span style={{ color: '#cbd5e1' }}>·</span>
                      {p.kategori}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
