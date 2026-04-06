'use client'

import { usePathname } from 'next/navigation'
import styles from './AdminHeader.module.css'

export default function AdminHeader() {
  const pathname = usePathname()

  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    return paths.map((p, i) => ({
      label: p
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      href: '/' + paths.slice(0, i + 1).join('/'),
      isLast: i === paths.length - 1,
    }))
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.breadcrumbs}>
          <span className={styles.crumbItem}>🏠</span>
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href}>
              <span className={styles.separator}>/</span>
              <span
                className={
                  crumb.isLast ? styles.crumbActive : styles.crumbItem
                }
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className={styles.right}>
        {/* Search */}
        <div className={styles.search}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Cari menu, siswa, tagihan..."
            className={styles.searchInput}
          />
          <kbd className={styles.searchKbd}>⌘K</kbd>
        </div>

        {/* Notifications */}
        <button className={styles.iconBtn} title="Notifikasi">
          🔔
          <span className={styles.badge}>3</span>
        </button>

        {/* Profile */}
        <div className={styles.profile}>
          <div className={styles.avatar}>A</div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>Admin</span>
            <span className={styles.profileRole}>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  )
}
