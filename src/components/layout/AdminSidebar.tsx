'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2, LayoutDashboard, Database, FileText, CreditCard,
  ArrowRightLeft, Wallet, Landmark, ClipboardList, Settings,
  Wrench, ChevronRight, ChevronLeft, ShoppingBag,
  MessageCircle, BarChart3, BrainCircuit, Bot, ShieldAlert, Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './AdminSidebar.module.css'

type StudentQuotaWarningLevel = 'NONE' | 'NORMAL' | 'WARNING_80' | 'WARNING_90' | 'FULL'

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
      { label: 'Dashboard', href: '/app/dashboard', icon: <LayoutDashboard size={20} /> },
    ],
  },
  {
    title: 'KEUANGAN',
    items: [
      { label: 'Tagihan', href: '/app/tagihan', icon: <FileText size={20} /> },
      { label: 'Pembayaran', href: '/app/pembayaran', icon: <CreditCard size={20} /> },
      { label: 'Transaksi', href: '/app/transaksi', icon: <ArrowRightLeft size={20} /> },
      { label: 'Arus Kas', href: '/app/arus-kas', icon: <Wallet size={20} /> },
      { label: 'Tabungan', href: '/app/tabungan', icon: <Landmark size={20} /> },
    ],
  },
  {
    title: 'AKADEMIK',
    items: [
      {
        label: 'PPDB', href: '/app/ppdb', icon: <ClipboardList size={20} />,
        children: [
          { label: 'Pendaftar', href: '/app/ppdb/pendaftar' },
          { label: 'Tagihan PPDB', href: '/app/ppdb/tagihan' },
          { label: 'Persyaratan Berkas', href: '/app/ppdb/persyaratan' },
          { label: 'Periode', href: '/app/ppdb/periode' },
          { label: 'Pengaturan', href: '/app/ppdb/pengaturan' },
        ],
      },
      {
        label: 'E-Kantin', href: '/app/e-kantin', icon: <ShoppingBag size={20} />,
        children: [
          { label: 'Menu Kantin', href: '/app/e-kantin/menu' },
          { label: 'Transaksi Kantin', href: '/app/e-kantin/transaksi' },
          { label: 'Laporan Kantin', href: '/app/e-kantin/laporan' },
        ],
      },
    ],
  },
  {
    title: 'LAPORAN',
    items: [
      {
        label: 'Laporan', href: '/app/laporan', icon: <BarChart3 size={20} />,
        children: [
          { label: 'Laporan Keuangan', href: '/app/laporan/keuangan' },
          { label: 'Laporan Tagihan', href: '/app/laporan/tagihan' },
          { label: 'Laporan Tabungan', href: '/app/laporan/tabungan' },
          { label: 'Laporan PPDB', href: '/app/laporan/ppdb' },
        ],
      },
    ],
  },
  {
    title: 'KOMUNIKASI',
    items: [

      {
        label: 'Kelola Website', href: '/app/website', icon: <Globe size={20} />,
        children: [
          { label: 'Slider / Banner', href: '/app/website/slider' },
          { label: 'Pengumuman', href: '/app/website/pengumuman' },
          { label: 'Agenda', href: '/app/website/agenda' },
          { label: 'Prestasi', href: '/app/website/prestasi' },
          { label: 'Ekskul', href: '/app/website/ekskul' },
          { label: 'Fasilitas', href: '/app/website/fasilitas' },
          { label: 'Guru & Staff', href: '/app/website/guru' },
          { label: 'Blog Guru', href: '/app/website/blog' },
          { label: 'Editorial', href: '/app/website/editorial' },
        ],
      },
      {
        label: 'Notifikasi', href: '/app/notifikasi', icon: <MessageCircle size={20} />,
        children: [
          { label: 'WhatsApp', href: '/app/notifikasi/whatsapp' },
          { label: 'Pengingat Tagihan', href: '/app/notifikasi/pengingat' },
          { label: 'Riwayat Kirim', href: '/app/notifikasi/riwayat' },
        ],
      },
    ],
  },
  {
    title: 'ADMINISTRASI',
    items: [
      {
        label: 'Data Master', href: '/app/data-master', icon: <Database size={20} />,
        children: [
          { label: 'Petugas', href: '/app/data-master/petugas' },
          { label: 'Wali/Orangtua', href: '/app/data-master/wali' },
          { label: 'Unit/Jenjang', href: '/app/data-master/unit' },
          { label: 'Tahun Ajaran', href: '/app/data-master/tahun-ajaran' },
          { label: 'Kelas', href: '/app/data-master/kelas' },
          { label: 'Siswa', href: '/app/data-master/siswa' },
          { label: 'Akun Siswa', href: '/app/data-master/akun-siswa' },
          { label: 'Kategori Tagihan', href: '/app/data-master/kategori-tagihan' },
          { label: 'Rekening', href: '/app/data-master/rekening' },
        ],
      },
      {
        label: 'Pengaturan', href: '/app/pengaturan', icon: <Settings size={20} />,
        children: [
          { label: 'Profil Sekolah', href: '/app/pengaturan/umum' },
          { label: 'Langganan', href: '/app/pengaturan/langganan' },
          { label: 'Tampilan', href: '/app/pengaturan/tampilan' },
          { label: 'Portal Publik', href: '/app/pengaturan/portal' },
          { label: 'Sistem', href: '/app/pengaturan/sistem' },
          { label: 'Notifikasi', href: '/app/pengaturan/notifikasi' },
        ],
      },
      {
        label: 'Peralatan', href: '/app/peralatan', icon: <Wrench size={20} />,
        children: [
          { label: 'Log Aktivitas', href: '/app/peralatan/log-aktivitas' },
        ],
      },
    ],
  },
  {
    title: 'AI & INSIGHTS',
    items: [
      {
        label: 'AI Assistant', href: '/app/ai/assistant', icon: <Bot size={20} />, badge: 'soon' as const,
        children: [
          { label: 'Chatbot WhatsApp', href: '/app/ai/chatbot', badge: 'soon' as const },
          { label: 'Tanya Data', href: '/app/ai/query', badge: 'soon' as const },
        ],
      },
      {
        label: 'Prediksi & Analitik', href: '/app/ai/analytics', icon: <BrainCircuit size={20} />, badge: 'soon' as const,
        children: [
          { label: 'Prediksi Tunggakan', href: '/app/ai/prediksi-tunggakan', badge: 'soon' as const },
          { label: 'Tren Pendaftaran', href: '/app/ai/tren-ppdb', badge: 'soon' as const },
          { label: 'Laporan Otomatis', href: '/app/ai/laporan-otomatis', badge: 'soon' as const },
        ],
      },
      { label: 'Deteksi Anomali', href: '/app/ai/anomali', icon: <ShieldAlert size={20} />, badge: 'soon' as const },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const [quotaWarningLevel, setQuotaWarningLevel] = useState<StudentQuotaWarningLevel>('NONE')

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

  useEffect(() => {
    const loadQuotaWarning = async () => {
      try {
        const res = await fetch('/api/keuangan/dashboard/stats')
        const json = await res.json()
        if (!res.ok) return
        setQuotaWarningLevel(json.studentQuota?.warningLevel || 'NONE')
      } catch {
        setQuotaWarningLevel('NONE')
      }
    }

    loadQuotaWarning()
  }, [])

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

  const hasQuotaIndicator = ['WARNING_80', 'WARNING_90', 'FULL'].includes(quotaWarningLevel)

  const getQuotaIndicatorLabel = () => {
    if (quotaWarningLevel === 'FULL') return 'Penuh'
    if (quotaWarningLevel === 'WARNING_90') return '90%'
    if (quotaWarningLevel === 'WARNING_80') return '80%'
    return ''
  }

  const getQuotaIndicatorClass = () => {
    if (quotaWarningLevel === 'FULL') return styles.quotaBadgeFull
    if (quotaWarningLevel === 'WARNING_90') return styles.quotaBadgeHigh
    return styles.quotaBadgeWarn
  }

  return (
    <aside className={cn(styles.sidebar, collapsed && styles.collapsed)}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}><Building2 size={20} /></div>
        {!collapsed && (
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>SchoolPro</span>
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
                      {item.href === '/app/pengaturan' && hasQuotaIndicator && (
                        <span className={cn(styles.navAlertDot, styles[`navAlertDot${quotaWarningLevel}`])} />
                      )}
                      {!collapsed && (
                        <>
                          <span className={styles.navLabel}>{item.label}</span>
                          {item.badge && (
                            <span className={getBadgeClass(item.badge)}>
                              {getBadgeLabel(item.badge)}
                            </span>
                          )}
                          {item.href === '/app/pengaturan' && hasQuotaIndicator && (
                            <span className={cn(getQuotaIndicatorClass(), styles.parentQuotaBadge)}>
                              {getQuotaIndicatorLabel()}
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
                            {child.href === '/app/pengaturan/langganan' && hasQuotaIndicator && (
                              <span className={getQuotaIndicatorClass()}>
                                {getQuotaIndicatorLabel()}
                              </span>
                            )}
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
                    {item.href === '/app/pengaturan' && hasQuotaIndicator && (
                      <span className={cn(styles.navAlertDot, styles[`navAlertDot${quotaWarningLevel}`])} />
                    )}
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
