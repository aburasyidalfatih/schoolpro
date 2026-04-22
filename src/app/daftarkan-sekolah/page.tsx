import styles from '../landing/daftarkan-sekolah/page.module.css'
import { TenantApplicationForm } from '../landing/daftarkan-sekolah/tenant-application-form'

export const metadata = {
  title: 'Daftarkan Sekolah | SchoolPro',
  description:
    'Daftarkan sekolah Anda ke SchoolPro dan mulai perjalanan digitalisasi. Gratis untuk memulai. Tim kami akan menghubungi Anda dalam 1–2 hari kerja.',
}

export default function TenantApplicationPage() {
  return (
    <main className={styles.page}>
      <div className={styles.bgGrid} aria-hidden="true" />
      <div className={`${styles.bgGlow} ${styles.bgGlowOne}`} aria-hidden="true" />
      <div className={`${styles.bgGlow} ${styles.bgGlowTwo}`} aria-hidden="true" />

      <section className={styles.formMain}>
        <div className={styles.container}>
          <section className={styles.formIntro}>
            <div className={styles.introBadge}>
              <span className={styles.badgeDot} aria-hidden="true" />
              Gratis untuk memulai
            </div>
            <h1 className={styles.heroTitle}>
              Mulai Digitalisasi{' '}
              <span className={styles.gradientText}>Sekolah Anda</span>
            </h1>
            <p className={styles.introDescription}>
              Isi formulir di bawah ini — hanya butuh 3–5 menit. Tim kami akan meninjau dan menghubungi Anda dalam 1–2 hari kerja.
            </p>
          </section>

          <TenantApplicationForm />
        </div>
      </section>
    </main>
  )
}
