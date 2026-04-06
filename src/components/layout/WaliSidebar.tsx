'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Building2, 
  LayoutDashboard, 
  FileText, 
  Landmark,
  User,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './AdminSidebar.module.css' // We can reuse the same css for now

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { label: 'Beranda', href: '/beranda', icon: <LayoutDashboard size={20} /> },
  { label: 'Tagihan Saya', href: '/tagihan-saya', icon: <FileText size={20} /> },
  { label: 'Tabungan Saya', href: '/tabungan-saya', icon: <Landmark size={20} /> },
  { label: 'Profil', href: '/profil', icon: <User size={20} /> },
]

export default function WaliSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className={cn(styles.sidebar, collapsed && styles.collapsed)}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}><Building2 size={24} /></div>
        {!collapsed && (
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>SISPRO</span>
            <span className={styles.logoSub}>Portal Wali Murid</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <div key={item.label} className={styles.navGroup}>
            <Link
              href={item.href}
              className={cn(styles.navItem, isActive(item.href) && styles.active)}
              title={collapsed ? item.label : undefined}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            </Link>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        className={styles.collapseBtn}
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  )
}
