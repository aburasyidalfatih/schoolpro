'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Building2, 
  LayoutDashboard, 
  Database, 
  FileText, 
  CreditCard, 
  ArrowRightLeft, 
  Wallet, 
  Landmark, 
  ClipboardList, 
  FileStack, 
  Settings, 
  Wrench,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './AdminSidebar.module.css'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  children?: { label: string; href: string }[]
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'UTAMA',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    ],
  },
  {
    title: 'KEUANGAN',
    items: [
      { label: 'Tagihan', href: '/tagihan', icon: <FileText size={20} /> },
      { label: 'Pembayaran', href: '/pembayaran', icon: <CreditCard size={20} /> },
      { label: 'Transaksi', href: '/transaksi', icon: <ArrowRightLeft size={20} /> },
      { label: 'Arus Kas', href: '/arus-kas', icon: <Wallet size={20} /> },
      { label: 'Tabungan', href: '/tabungan', icon: <Landmark size={20} /> },
    ],
  },
  {
    title: 'AKADEMIK',
    items: [
      {
        label: 'PPDB', href: '/ppdb', icon: <ClipboardList size={20} />,
        children: [
          { label: 'Pendaftar', href: '/ppdb/pendaftar' },
          { label: 'Tagihan PPDB', href: '/ppdb/tagihan' },
          { label: 'Berkas', href: '/ppdb/berkas' },
          { label: 'Periode', href: '/ppdb/periode' },
          { label: 'Pengaturan', href: '/ppdb/pengaturan' },
        ],
      },
      { label: 'Laporan', href: '/laporan', icon: <FileStack size={20} /> },
    ],
  },
  {
    title: 'ADMINISTRASI',
    items: [
      { 
        label: 'Data Master', href: '/data-master', icon: <Database size={20} />,
        children: [
          { label: 'Petugas', href: '/data-master/petugas' },
          { label: 'Unit/Jenjang', href: '/data-master/unit' },
          { label: 'Tahun Ajaran', href: '/data-master/tahun-ajaran' },
          { label: 'Kelas', href: '/data-master/kelas' },
          { label: 'Siswa', href: '/data-master/siswa' },
          { label: 'Akun Siswa', href: '/data-master/akun-siswa' },
          { label: 'Kategori Tagihan', href: '/data-master/kategori-tagihan' },
          { label: 'Rekening', href: '/data-master/rekening' },
        ],
      },
      {
        label: 'Pengaturan', href: '/pengaturan', icon: <Settings size={20} />,
        children: [
          { label: 'Umum', href: '/pengaturan/umum' },
          { label: 'Tampilan', href: '/pengaturan/tampilan' },
          { label: 'Portal', href: '/pengaturan/portal' },
          { label: 'Sistem', href: '/pengaturan/sistem' },
          { label: 'Notifikasi', href: '/pengaturan/notifikasi' },
        ],
      },
      {
        label: 'Peralatan', href: '/peralatan', icon: <Wrench size={20} />,
        children: [
          { label: 'Portal Berita', href: '/peralatan/portal-berita' },
          { label: 'Pengumuman', href: '/peralatan/pengumuman' },
          { label: 'Pengingat Tagihan', href: '/peralatan/pengingat-tagihan' },
          { label: 'Log Aktivitas', href: '/peralatan/log-aktivitas' },
        ],
      },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [openMenus, setOpenMenus] = useState<string[]>([])

  // Update layout global saat sidebar diciutkan/diperbesar
  useEffect(() => {
    if (collapsed) {
      document.documentElement.style.setProperty('--current-sidebar-width', 'var(--sidebar-collapsed)')
    } else {
      document.documentElement.style.setProperty('--current-sidebar-width', 'var(--sidebar-width)')
    }
  }, [collapsed])

  // Auto-expand menu yang sedang aktif berdasarkan URL
  useEffect(() => {
    navSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children && (pathname === item.href || pathname.startsWith(item.href + '/'))) {
          setOpenMenus((prev) => (prev.includes(item.label) ? prev : [...prev, item.label]))
        }
      })
    })
  }, [pathname])

  const toggleMenu = (label: string) => {
    if (collapsed) {
      setCollapsed(false) // Otomatis perbesar sidebar
      setOpenMenus((prev) => (prev.includes(label) ? prev : [...prev, label]))
    } else {
      setOpenMenus((prev) =>
        prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
      )
    }
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className={cn(styles.sidebar, collapsed && styles.collapsed)}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}><Building2 size={22} /></div>
        {!collapsed && (
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>SISPRO</span>
            <span className={styles.logoSub}>Sistem Informasi Sekolah</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && <div className={styles.sectionLabel}>{section.title}</div>}
            {section.items.map((item) => (
              <div key={item.label} className={styles.navGroup}>
                {item.children ? (
                  <>
                    <button
                      className={cn(styles.navItem, isActive(item.href) && styles.active)}
                      onClick={() => toggleMenu(item.label)}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className={styles.navIcon}>{item.icon}</span>
                      {!collapsed && (
                        <>
                          <span className={styles.navLabel}>{item.label}</span>
                          <span
                            className={cn(
                              styles.chevron,
                              openMenus.includes(item.label) && styles.chevronOpen
                            )}
                          >
                            ›
                          </span>
                        </>
                      )}
                    </button>
                    {!collapsed && openMenus.includes(item.label) && (
                      <div className={styles.subMenu}>
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(styles.subItem, isActive(child.href) && styles.active)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(styles.navItem, isActive(item.href) && styles.active)}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                  </Link>
                )}
              </div>
            ))}
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
