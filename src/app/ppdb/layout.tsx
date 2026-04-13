import { headers } from 'next/headers'
import { getTenantBySlug } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from './layout.module.css'

export default async function PpdbLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headerList = await headers()
  const tenantSlug = headerList.get('x-tenant-slug')
  if (!tenantSlug) redirect('/404')
  const tenant = await getTenantBySlug(tenantSlug)

  if (!tenant) redirect('/404')

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <Link href="/ppdb" className={styles.brand}>
            <div className={styles.logoBox}>
              {tenant.logoUrl ? (
                <Image src={tenant.logoUrl} alt={tenant.nama} width={32} height={32} />
              ) : (
                <span style={{ fontSize: '1.25rem', fontWeight: 900, fontStyle: 'italic' }}>S</span>
              )}
            </div>
            <div className={styles.brandText}>
              <h1>PPDB Online</h1>
              <p>{tenant.nama}</p>
            </div>
          </Link>

          <nav className={styles.nav}>
            <Link href="/ppdb" className={styles.navLink}>Beranda</Link>
            <Link href="/ppdb/status" className={styles.navLink}>Cek Status</Link>
            <Link href="/app/login" className={styles.loginBtn}>Masuk</Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className={styles.main}>{children}</main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <p className={styles.copy}>
            &copy; {new Date().getFullYear()} {tenant.nama}. Powered by{' '}
            <span className={styles.schoolproBrand}>SchoolPro</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
