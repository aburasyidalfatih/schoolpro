'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Blocks, Building2, ChevronLeft, ChevronRight, ClipboardList, CreditCard, LayoutDashboard, LockKeyhole, ReceiptText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './AdminSidebar.module.css'

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
  badge?: 'soon'
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/super-admin/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Tenants', href: '/super-admin/tenants', icon: <Building2 size={20} /> },
  { label: 'Plans', href: '/super-admin/plans', icon: <CreditCard size={20} /> },
  { label: 'Subscription Orders', href: '/super-admin/subscription-orders', icon: <ReceiptText size={20} /> },
  { label: 'Feature Access', href: '/super-admin/feature-access', icon: <Blocks size={20} /> },
  { label: 'Audit Logs', href: '/super-admin/audit-logs', icon: <ClipboardList size={20} /> },
  { label: 'Settings', href: '/super-admin/settings', icon: <Settings size={20} />, badge: 'soon' },
]

export default function SuperAdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--current-sidebar-width',
      collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)'
    )
  }, [collapsed])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className={cn(styles.sidebar, collapsed && styles.collapsed)}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <LockKeyhole size={20} />
        </div>
        {!collapsed && (
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>SchoolPro</span>
            <span className={styles.logoSub}>Platform Control</span>
          </div>
        )}
      </div>

      <nav className={styles.nav}>
        {!collapsed && <div className={styles.sectionLabel}>SUPER ADMIN</div>}
        {navItems.map((item) => (
          <div key={item.href} className={styles.navGroup}>
            <Link
              href={item.href}
              className={cn(styles.navItem, isActive(item.href) && styles.active)}
              title={collapsed ? item.label : undefined}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && (
                <>
                  <span className={styles.navLabel}>{item.label}</span>
                  {item.badge ? <span className={styles.badgeSoon}>Soon</span> : null}
                </>
              )}
            </Link>
          </div>
        ))}
      </nav>

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
