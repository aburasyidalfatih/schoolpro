'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2, LayoutDashboard, Database, FileText, CreditCard,
  ArrowRightLeft, Wallet, Landmark, ClipboardList, Settings,
  Wrench, ChevronRight, ChevronLeft, ShoppingBag, Newspaper,
  MessageCircle, BarChart3, BrainCircuit, Bot, ShieldAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './AdminSidebar.module.css'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: 'soon' | 'new' | 'beta'
  children?: { label: string; href: string; badge?: 'soon' | 'new' | 'beta' }[]
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
          { label: 'Persyaratan Berkas', href: '/ppdb/persyaratan' },
          { label: 'Periode', href: '/ppdb/periode' },
          { label: 'Pengaturan', href: '/ppdb/pengaturan' },
        ],
      },
      {
        label: 'E-Kantin', href: '/e-kantin', icon: <ShoppingBag size={20} />,
        children: [
          { label: 'Menu Kantin', href: '/e-kantin/menu' },
          { label: 'Transaksi Kantin', href: '/e-kantin/transaksi' },
          { label: 'Laporan Kantin', href: '/e-kantin/laporan' },
        ],
      },
    ],
  },
  {
    title: 'LAPORAN',
    items: [
      {
        label: 'Laporan', href: '/laporan', icon: <BarChart3 size={20} />,
        children: [
          { label: 'Laporan Keuangan', href: '/laporan/keuangan' },
          { label: 'Laporan Tagihan', href: '/laporan/tagihan' },
          { label: 'Laporan Tabungan', href: '/laporan/tabungan' },
          { label: 'Laporan PPDB', href: '/laporan/ppdb' },
        ],
      },
    ],
  },
  {
    title: 'KOMUNIKASI',
    items: [
      {
        label: 'Berita & Pengumuman', href: '/berita', icon: <Newspaper size={20} />,
        children: [
          { label: 'Portal Berita', href: '/berita/artikel' },
          { label: 'Pengumuman', href: '/berita/pengumuman' },
        ],
      },
      {
        label: 'Notifikasi', href: '/notifikasi', icon: <MessageCircle size={20} />,
        children: [
          { label: 'WhatsApp', href: '/notifikasi/whatsapp' },
          { label: 'Pengingat Tagihan', href: '/notifikasi/pengingat' },
          { label: 'Riwayat Kirim', href: '/notifikasi/riwayat' },
        ],
      },
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
          { label: 'Profil Sekolah', href: '/pengaturan/umum' },
          { label: 'Tampilan', href: '/pengaturan/tampilan' },
          { label: 'Portal Publik', href: '/pengaturan/portal' },
          { label: 'Sistem', href: '/pengaturan/sistem' },
          { label: 'Notifikasi', href: '/pengaturan/notifikasi' },
        ],
      },
      {
        label: 'Peralatan', href: '/peralatan', icon: <Wrench size={20} />,
        children: [
          { label: 'Log Aktivitas', href: '/peralatan/log-aktivitas' },
        ],
      },
    ],
  },
  {
    title: 'AI & INSIGHTS',
    items: [
      {
        label: 'AI Assistant', href: '/ai/assistant', icon: <Bot size={20} />, badge: 'soon' as const,
        children: [
          { label: 'Chatbot WhatsApp', href: '/ai/chatbot', badge: 'soon' as const },
          { label: 'Tanya Data', href: '/ai/query', badge: 'soon' as const },
        ],
      },
      {
        label: 'Prediksi & Analitik', href: '/ai/analytics', icon: <BrainCircuit size={20} />, badge: 'soon' as const,
        children: [
          { label: 'Prediksi Tunggakan', href: '/ai/prediksi-tunggakan', badge: 'soon' as const },
          { label: 'Tren Pendaftaran', href: '/ai/tren-ppdb', badge: 'soon' as const },
          { label: 'Laporan Otomatis', href: '/ai/laporan-otomatis', badge: 'soon' as const },
        ],
      },
      { label: 'Deteksi Anomali', href: '/ai/anomali', icon: <ShieldAlert size={20} />, badge: 'soon' as const },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [openMenus, setOpenMenus] = useState<string[]>([])

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--current-sidebar-width',
      collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)'
    )
  }, [collapsed])

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
      setCollapsed(false)
      setOpenMenus((prev) => (prev.includes(label) ? prev : [...prev, label]))
    } else {
      setOpenMenus((prev) =>
        prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
      )
    }
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const getBadgeClass = (badge?: string) => {
    if (badge === 'new') return styles.badgeNew
    if (badge === 'beta') return styles.badgeBeta
    return styles.badgeSoon
  }

  const getBadgeLabel = (badge?: string) => {
    if (badge === 'new') return 'New'
    if (badge === 'beta') return 'Beta'
    return 'Soon'
  }

  return (
    <aside className={cn(styles.sidebar, collapsed && styles.collapsed)}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}><Building2 size={20} /></div>
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
                          {item.badge && (
                            <span className={getBadgeClass(item.badge)}>
                              {getBadgeLabel(item.badge)}
                            </span>
                          )}
                          <ChevronRight
                            size={14}
                            className={cn(styles.chevron, openMenus.includes(item.label) && styles.chevronOpen)}
                          />
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
                            {child.badge && (
                              <span className={getBadgeClass(child.badge)} style={{ marginLeft: 'auto' }}>
                                {getBadgeLabel(child.badge)}
                              </span>
                            )}
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
                    {!collapsed && (
                      <>
                        <span className={styles.navLabel}>{item.label}</span>
                        {item.badge && (
                          <span className={getBadgeClass(item.badge)}>
                            {getBadgeLabel(item.badge)}
                          </span>
                        )}
                      </>
                    )}
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
