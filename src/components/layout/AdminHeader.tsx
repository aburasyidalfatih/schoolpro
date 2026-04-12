'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useRef, useState, useEffect } from 'react'
import { Home, Search, Bell, LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import styles from './AdminHeader.module.css'

type HeaderUser = {
  name?: string | null
  role?: string | null
  email?: string | null
}

export default function AdminHeader({ initialUser }: { initialUser?: HeaderUser }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    return paths.map((p, i) => ({
      label: p.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      href: '/' + paths.slice(0, i + 1).join('/'),
      isLast: i === paths.length - 1,
    }))
  }

  const breadcrumbs = getBreadcrumbs()
  const sessionUser = session?.user as HeaderUser | undefined
  const user = sessionUser || initialUser
  const isSessionLoading = status === 'loading' && !user
  const profileName = isSessionLoading ? 'Memuat...' : user?.name || 'User'
  const profileRole = isSessionLoading ? 'Mohon tunggu' : user?.role || 'User'
  const profileInitial = user?.name?.charAt(0)?.toUpperCase()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.breadcrumbs}>
          <span className={styles.crumbItem}><Home size={16} /></span>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.href} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className={styles.separator}>/</span>
              <span className={crumb.isLast ? styles.crumbActive : styles.crumbItem}>{crumb.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className={styles.right}>
        {/* Search */}
        <div className={styles.search}>
          <span className={styles.searchIcon}><Search size={16} /></span>
          <input type="text" placeholder="Cari menu, siswa, tagihan..." className={styles.searchInput} />
          <kbd className={styles.searchKbd}>⌘K</kbd>
        </div>

        {/* Notifications */}
        <button className={styles.iconBtn} title="Notifikasi">
          <Bell size={20} />
          <span className={styles.badge}>3</span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Profile Dropdown */}
        <div className={styles.profileWrapper} ref={dropdownRef}>
          <div className={styles.profile} onClick={() => setDropdownOpen((v) => !v)}>
            <div className={styles.avatar}>
              {profileInitial || <UserIcon size={18} />}
            </div>
            <div className={styles.profileInfo}>
              <span className={`${styles.profileName} ${isSessionLoading ? styles.profilePlaceholder : ''}`}>{profileName}</span>
              <span className={`${styles.profileRole} ${isSessionLoading ? styles.profilePlaceholder : ''}`}>{profileRole}</span>
            </div>
            <ChevronDown size={14} className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`} />
          </div>

          {dropdownOpen && (
            <div className={styles.dropdown}>
              <button
                className={styles.dropdownItem}
                onClick={() => { setDropdownOpen(false); router.push('/app/pengaturan/umum') }}
              >
                <Settings size={15} />
                Pengaturan
              </button>
              <div className={styles.dropdownDivider} />
              <button
                className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                onClick={() => signOut({ callbackUrl: '/app/login' })}
              >
                <LogOut size={15} />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
