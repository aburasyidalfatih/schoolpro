'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Bell, Home, LogOut, Search, ShieldCheck, User as UserIcon, ChevronDown } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import styles from './AdminHeader.module.css'

type HeaderUser = {
  name?: string | null
  role?: string | null
  email?: string | null
}

export default function SuperAdminHeader({ initialUser }: { initialUser?: HeaderUser }) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const paths = pathname.split('/').filter(Boolean)
  const breadcrumbs = paths.map((path, index) => ({
    label: path.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '),
    href: '/' + paths.slice(0, index + 1).join('/'),
    isLast: index === paths.length - 1,
  }))

  const sessionUser = session?.user as HeaderUser | undefined
  const user = sessionUser || initialUser
  const isSessionLoading = status === 'loading' && !user
  const profileName = isSessionLoading ? 'Memuat...' : user?.name || 'Super Admin'
  const profileRole = isSessionLoading ? 'Mohon tunggu' : 'Platform Access'
  const profileInitial = user?.name?.charAt(0)?.toUpperCase()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
        <div className={styles.search}>
          <span className={styles.searchIcon}><Search size={16} /></span>
          <input type="text" placeholder="Cari tenant, plan, atau fitur..." className={styles.searchInput} />
          <kbd className={styles.searchKbd}>⌘K</kbd>
        </div>

        <button className={styles.iconBtn} title="Platform notices">
          <Bell size={20} />
          <span className={styles.badge}>1</span>
        </button>

        <ThemeToggle />

        <div className={styles.profileWrapper} ref={dropdownRef}>
          <div className={styles.profile} onClick={() => setDropdownOpen((value) => !value)}>
            <div className={styles.avatar}>
              {profileInitial || <UserIcon size={18} />}
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{profileName}</span>
              <span className={styles.profileRole}>{profileRole}</span>
            </div>
            <ChevronDown size={14} className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`} />
          </div>

          {dropdownOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownItem} style={{ cursor: 'default' }}>
                <ShieldCheck size={15} />
                SUPER_ADMIN
              </div>
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
