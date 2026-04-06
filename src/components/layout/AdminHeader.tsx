'use client'

import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Home, Search, Bell, LogOut } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
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
          <span className={styles.crumbItem}><Home size={16} /></span>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.href} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
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
          <span className={styles.searchIcon}><Search size={16} /></span>
          <input
            type="text"
            placeholder="Cari menu, siswa, tagihan..."
            className={styles.searchInput}
          />
          <kbd className={styles.searchKbd}>⌘K</kbd>
        </div>

        {/* Notifications */}
        <button className={styles.iconBtn} title="Notifikasi">
          <Bell size={20} />
          <span className={styles.badge}>3</span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Profile */}
        <div className={styles.profile}>
          <div className={styles.avatar}>A</div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>Admin</span>
            <span className={styles.profileRole}>Administrator</span>
          </div>
        </div>

        {/* Sign Out */}
        <button
          className={styles.iconBtn}
          title="Keluar"
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ color: 'var(--danger-500)', marginLeft: 'var(--space-2)' }}
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}
