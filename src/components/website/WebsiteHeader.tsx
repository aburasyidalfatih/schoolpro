'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Phone, Mail, ChevronDown, BookOpen, Newspaper, Calendar, Trophy, Users, Building2, GraduationCap, LogIn } from 'lucide-react'
import styles from './WebsiteLayout.module.css'

interface Props {
  tenant: { nama: string; logoUrl?: string | null; telepon?: string | null; email?: string | null; profileWebsite?: any }
  ppdbAktif?: boolean
}

export default function WebsiteHeader({ tenant, ppdbAktif }: Props) {
  const profile = tenant.profileWebsite || {}
  const runningText = profile.runningText || `Selamat datang di website resmi ${tenant.nama}`
  const pathname = usePathname()

  return (
    <header className={styles.header}>
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

      <div className={styles.headerMain}>
        <Link href="/" className={styles.brand}>
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

        <nav className={styles.nav}>
          <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.navLinkActive : ''}`}>Beranda</Link>
          <Link href="/profil" className={`${styles.navLink} ${pathname === '/profil' ? styles.navLinkActive : ''}`}>Profil</Link>

          <div className={styles.navDropdown}>
            <div className={styles.navDropdownTrigger}>
              Informasi <ChevronDown size={14} />
            </div>
            <div className={styles.navDropdownMenu}>
              <Link href="/berita" className={styles.navDropdownItem}>
                <div className={styles.navDropdownIcon}><Newspaper size={15} /></div>
                Berita & Artikel
              </Link>
              <Link href="/pengumuman" className={styles.navDropdownItem}>
                <div className={styles.navDropdownIcon}><BookOpen size={15} /></div>
                Pengumuman
              </Link>
              <Link href="/agenda" className={styles.navDropdownItem}>
                <div className={styles.navDropdownIcon}><Calendar size={15} /></div>
                Agenda Kegiatan
              </Link>
            </div>
          </div>

          <div className={styles.navDropdown}>
            <div className={styles.navDropdownTrigger}>
              Sekolah <ChevronDown size={14} />
            </div>
            <div className={styles.navDropdownMenu}>
              <Link href="/ekskul" className={styles.navDropdownItem}>
                <div className={styles.navDropdownIcon}><Users size={15} /></div>
                Ekstrakurikuler
              </Link>
              <Link href="/fasilitas" className={styles.navDropdownItem}>
                <div className={styles.navDropdownIcon}><Building2 size={15} /></div>
                Fasilitas
              </Link>
              <Link href="/prestasi" className={styles.navDropdownItem}>
                <div className={styles.navDropdownIcon}><Trophy size={15} /></div>
                Prestasi
              </Link>
              <Link href="/alumni" className={styles.navDropdownItem}>
                <div className={styles.navDropdownIcon}><GraduationCap size={15} /></div>
                Alumni
              </Link>
            </div>
          </div>

          {ppdbAktif && (
            <Link href="/ppdb" className={`${styles.navLink} ${styles.navLinkPpdb}`}>
              Pendaftaran
            </Link>
          )}
        </nav>

        <div className={styles.headerCta}>
          <Link href="/app/login" className={styles.btnLogin}>
            <LogIn size={15} /> Masuk
          </Link>
          {ppdbAktif && (
            <Link href="/ppdb" className={styles.btnPpdb}>
              <GraduationCap size={15} /> Daftar Sekarang
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
