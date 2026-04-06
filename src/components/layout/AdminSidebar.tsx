'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import styles from './AdminSidebar.module.css'

interface NavItem {
  label: string
  href: string
  icon: string
  children?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  {
    label: 'Data Master',
    href: '/data-master',
    icon: '🗄️',
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
  { label: 'Tagihan', href: '/tagihan', icon: '📋' },
  { label: 'Pembayaran', href: '/pembayaran', icon: '💳' },
  { label: 'Transaksi', href: '/transaksi', icon: '🔄' },
  { label: 'Arus Kas', href: '/arus-kas', icon: '💰' },
  { label: 'Tabungan', href: '/tabungan', icon: '🏦' },
  {
    label: 'PPDB',
    href: '/ppdb',
    icon: '📝',
    children: [
      { label: 'Pendaftar', href: '/ppdb/pendaftar' },
      { label: 'Tagihan PPDB', href: '/ppdb/tagihan' },
      { label: 'Berkas', href: '/ppdb/berkas' },
      { label: 'Periode', href: '/ppdb/periode' },
      { label: 'Pengaturan', href: '/ppdb/pengaturan' },
    ],
  },
  { label: 'Laporan', href: '/laporan', icon: '📑' },
  {
    label: 'Pengaturan',
    href: '/pengaturan',
    icon: '⚙️',
    children: [
      { label: 'Umum', href: '/pengaturan/umum' },
      { label: 'Tampilan', href: '/pengaturan/tampilan' },
      { label: 'Portal', href: '/pengaturan/portal' },
      { label: 'Sistem', href: '/pengaturan/sistem' },
      { label: 'Notifikasi', href: '/pengaturan/notifikasi' },
    ],
  },
  {
    label: 'Peralatan',
    href: '/peralatan',
    icon: '🔧',
    children: [
      { label: 'Portal Berita', href: '/peralatan/portal-berita' },
      { label: 'Pengumuman', href: '/peralatan/pengumuman' },
      { label: 'Pengingat Tagihan', href: '/peralatan/pengingat-tagihan' },
      { label: 'Log Aktivitas', href: '/peralatan/log-aktivitas' },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [openMenus, setOpenMenus] = useState<string[]>([])

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    )
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className={cn(styles.sidebar, collapsed && styles.collapsed)}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>🏫</div>
        {!collapsed && (
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>SISPRO</span>
            <span className={styles.logoSub}>Sistem Informasi Sekolah</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map((item) => (
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
      </nav>

      {/* Collapse Toggle */}
      <button
        className={styles.collapseBtn}
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? '→' : '←'}
      </button>
    </aside>
  )
}
