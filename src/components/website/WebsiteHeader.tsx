'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Phone, Mail, ChevronDown, BookOpen, Newspaper, Calendar, Trophy, Users, Building2, GraduationCap, LogIn, Menu, X } from 'lucide-react'
import styles from './WebsiteLayout.module.css'

interface Props {
  tenant: { nama: string; logoUrl?: string | null; telepon?: string | null; email?: string | null; profileWebsite?: any }
  ppdbAktif?: boolean
}

export default function WebsiteHeader({ tenant, ppdbAktif }: Props) {
  const profile = tenant.profileWebsite || {}
  const runningText = profile.runningText || `Selamat datang di website resmi ${tenant.nama}`
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  const close = () => { setMobileOpen(false); setOpenGroup(null) }

  return (
    <header className={styles.header}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.runningTextWrapper}>
            <span className={styles.runningText}>{runningText}</span>
          </div>
          <div className={styles.topBarContact}>
            {tenant.telepon && (
              <a href={`tel:${tenant.telepon}`} className={styles.topBarContactItem}>
                <Phone size={12} /> {tenant.telepon}
              </a>
            )}
            {tenant.email && (
              <a href={`mailto:${tenant.email}`} className={styles.topBarContactItem}>
                <Mail size={12} /> {tenant.email}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className={styles.headerMain}>
        <Link href="/" className={styles.brand} onClick={close}>
          <div className={styles.logoBox}>
            {tenant.logoUrl
              ? <img src={tenant.logoUrl} alt={tenant.nama} style={{ width: 28, height: 28, objectFit: 'contain' }} />
              : <BookOpen size={22} />
            }
          </div>
          <div className={styles.brandText}>
            <h1>{tenant.nama}</h1>
            <p>{profile.tipeLembaga || 'Lembaga Pendidikan'}</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className={styles.nav}>
          <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.navLinkActive : ''}`}>Beranda</Link>
          <Link href="/profil" className={`${styles.navLink} ${pathname === '/profil' ? styles.navLinkActive : ''}`}>Profil</Link>

          <div className={styles.navDropdown}>
            <div className={styles.navDropdownTrigger}>Informasi <ChevronDown size={14} /></div>
            <div className={styles.navDropdownMenu}>
              <Link href="/berita" className={styles.navDropdownItem}><div className={styles.navDropdownIcon}><Newspaper size={15} /></div>Berita & Artikel</Link>
              <Link href="/pengumuman" className={styles.navDropdownItem}><div className={styles.navDropdownIcon}><BookOpen size={15} /></div>Pengumuman</Link>
              <Link href="/agenda" className={styles.navDropdownItem}><div className={styles.navDropdownIcon}><Calendar size={15} /></div>Agenda Kegiatan</Link>
            </div>
          </div>

          <div className={styles.navDropdown}>
            <div className={styles.navDropdownTrigger}>Sekolah <ChevronDown size={14} /></div>
            <div className={styles.navDropdownMenu}>
              <Link href="/ekskul" className={styles.navDropdownItem}><div className={styles.navDropdownIcon}><Users size={15} /></div>Ekstrakurikuler</Link>
              <Link href="/fasilitas" className={styles.navDropdownItem}><div className={styles.navDropdownIcon}><Building2 size={15} /></div>Fasilitas</Link>
              <Link href="/prestasi" className={styles.navDropdownItem}><div className={styles.navDropdownIcon}><Trophy size={15} /></div>Prestasi</Link>
              <Link href="/alumni" className={styles.navDropdownItem}><div className={styles.navDropdownIcon}><GraduationCap size={15} /></div>Alumni</Link>
            </div>
          </div>

          {ppdbAktif && (
            <Link href="/ppdb" className={`${styles.navLink} ${styles.navLinkPpdb}`}>Pendaftaran</Link>
          )}
        </nav>

        <div className={styles.headerCta}>
          <Link href="/app/login" className={styles.btnLogin}><LogIn size={15} /> Masuk</Link>
          {ppdbAktif && (
            <Link href="/ppdb" className={styles.btnPpdb}><GraduationCap size={15} /> Daftar Sekarang</Link>
          )}
        </div>

        {/* Hamburger */}
        <button className={styles.hamburger} onClick={() => setMobileOpen(v => !v)} aria-label="Menu">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className={styles.mobileNav}>
          <Link href="/" className={`${styles.mobileNavLink} ${pathname === '/' ? styles.mobileNavLinkActive : ''}`} onClick={close}>Beranda</Link>
          <Link href="/profil" className={`${styles.mobileNavLink} ${pathname === '/profil' ? styles.mobileNavLinkActive : ''}`} onClick={close}>Profil</Link>

          {/* Informasi group */}
          <div>
            <button className={styles.mobileNavGroup} onClick={() => setOpenGroup(openGroup === 'info' ? null : 'info')}>
              Informasi <ChevronDown size={14} className={openGroup === 'info' ? styles.mobileChevronOpen : ''} />
            </button>
            {openGroup === 'info' && (
              <div className={styles.mobileNavSub}>
                <Link href="/berita" className={styles.mobileNavSubLink} onClick={close}><Newspaper size={14} />Berita & Artikel</Link>
                <Link href="/pengumuman" className={styles.mobileNavSubLink} onClick={close}><BookOpen size={14} />Pengumuman</Link>
                <Link href="/agenda" className={styles.mobileNavSubLink} onClick={close}><Calendar size={14} />Agenda Kegiatan</Link>
              </div>
            )}
          </div>

          {/* Sekolah group */}
          <div>
            <button className={styles.mobileNavGroup} onClick={() => setOpenGroup(openGroup === 'sekolah' ? null : 'sekolah')}>
              Sekolah <ChevronDown size={14} className={openGroup === 'sekolah' ? styles.mobileChevronOpen : ''} />
            </button>
            {openGroup === 'sekolah' && (
              <div className={styles.mobileNavSub}>
                <Link href="/ekskul" className={styles.mobileNavSubLink} onClick={close}><Users size={14} />Ekstrakurikuler</Link>
                <Link href="/fasilitas" className={styles.mobileNavSubLink} onClick={close}><Building2 size={14} />Fasilitas</Link>
                <Link href="/prestasi" className={styles.mobileNavSubLink} onClick={close}><Trophy size={14} />Prestasi</Link>
                <Link href="/alumni" className={styles.mobileNavSubLink} onClick={close}><GraduationCap size={14} />Alumni</Link>
              </div>
            )}
          </div>

          {ppdbAktif && (
            <Link href="/ppdb" className={styles.mobileNavLink} onClick={close}>Pendaftaran</Link>
          )}

          <div className={styles.mobileNavFooter}>
            <Link href="/app/login" className={styles.btnLogin} onClick={close}><LogIn size={15} /> Masuk</Link>
            {ppdbAktif && (
              <Link href="/ppdb" className={styles.btnPpdb} onClick={close}><GraduationCap size={15} /> Daftar Sekarang</Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
