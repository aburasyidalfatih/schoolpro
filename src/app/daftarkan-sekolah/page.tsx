import Link from 'next/link'
import { Clock3, FileText } from 'lucide-react'
import styles from '../landing/daftarkan-sekolah/page.module.css'
import { TenantApplicationForm } from '../landing/daftarkan-sekolah/tenant-application-form'

export const metadata = {
  title: 'Daftarkan Sekolah | SchoolPro',
  description:
    'Ajukan sekolah Anda ke SchoolPro melalui formulir aplikasi tenant. Tim kami akan meninjau data sekolah sebelum tenant diprovision.',
}

export default function TenantApplicationPage() {
  return (
    <main className={styles.page}>
      <div className={styles.bgGrid} aria-hidden="true" />
      <div className={`${styles.bgGlow} ${styles.bgGlowOne}`} aria-hidden="true" />
      <div className={`${styles.bgGlow} ${styles.bgGlowTwo}`} aria-hidden="true" />
      <div className="mobile-overlay" id="mobile-overlay" />

      <header className="navbar" id="navbar">
        <div className="container">
          <Link href="/" className="navbar-brand" aria-label="SchoolPro Home">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
              <defs>
                <linearGradient id="brand-grad-form" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#brand-grad-form)" />
              <text x="16" y="22" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="800" fontSize="18" fill="#fff">
                S
              </text>
            </svg>
            School<span>Pro</span>
          </Link>

          <nav className="navbar-links" id="navbar-links" aria-label="Main Navigation">
            <Link href="/#fitur">Fitur</Link>
            <Link href="/#website-sekolah">Website</Link>
            <Link href="/#ppdb">PPDB</Link>
            <Link href="/#harga">Harga</Link>
            <Link href="/#roadmap">Roadmap</Link>
          </nav>

          <div className="navbar-cta">
            <button className="theme-toggle" id="theme-toggle" aria-label="Toggle Theme">
              <svg className="icon-sun" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'none' }}>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
              <svg className="icon-moon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </button>
            <Link href="/daftarkan-sekolah" className="btn btn-primary btn-sm">
              Mulai Gratis
            </Link>
            <button className="navbar-toggle" id="navbar-toggle" aria-label="Toggle Menu" aria-expanded="false">
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <section className={styles.formMain}>
        <div className={styles.container}>
          <section className={styles.formIntro}>
            <div className={styles.introBadge}>
              <span className={styles.badgeDot} aria-hidden="true" />
              Formulir Pendaftaran Sekolah
            </div>
            <h1 className={styles.heroTitle}>
              Daftarkan Sekolah Anda <br />
              <span className={styles.gradientText}>ke SchoolPro</span>
            </h1>
            <p className={styles.introDescription}>
              Isi informasi berikut dengan data yang paling mudah dihubungi dan dipahami oleh tim sekolah Anda.
            </p>
            <div className={styles.introMeta}>
              <div className={styles.metaItem}>
                <Clock3 size={18} />
                <div>
                  <span className={styles.metaLabel}>Waktu pengisian</span>
                  <span className={styles.metaValue}>Sekitar 3-5 menit</span>
                </div>
              </div>
              <div className={styles.metaItem}>
                <FileText size={18} />
                <div>
                  <span className={styles.metaLabel}>Siapkan</span>
                  <span className={styles.metaValue}>Kontak sekolah dan PIC</span>
                </div>
              </div>
            </div>
          </section>

          <TenantApplicationForm />
        </div>
      </section>
    </main>
  )
}
