import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ClipboardList, Clock3, MessagesSquare, ShieldCheck, Sparkles } from 'lucide-react'
import styles from './page.module.css'
import { TenantApplicationForm } from './tenant-application-form'

export const metadata = {
  title: 'Daftarkan Sekolah | SchoolPro',
  description:
    'Ajukan sekolah Anda ke SchoolPro melalui formulir aplikasi tenant. Tim kami akan meninjau data sekolah sebelum tenant diprovision.',
}

const checklist = [
  'Isi satu formulir singkat untuk memperkenalkan sekolah dan kebutuhan utama Anda.',
  'Tim kami akan menghubungi PIC sekolah jika ada hal yang perlu dikonfirmasi atau disesuaikan.',
  'Setelah disetujui, sekolah Anda akan dibantu masuk ke tahap setup dan onboarding awal.',
]

const steps = [
  {
    title: 'Isi data sekolah',
    description: 'Lengkapi informasi sekolah, PIC, dan kebutuhan awal agar kami memahami konteks sekolah Anda.',
  },
  {
    title: 'Kami review dan hubungi Anda',
    description: 'Tim SchoolPro akan meninjau kebutuhan sekolah dan menghubungi PIC bila diperlukan.',
  },
  {
    title: 'Lanjut ke tahap onboarding',
    description: 'Jika sudah sesuai, kami bantu menyiapkan akses awal dan langkah onboarding berikutnya.',
  },
]

const highlights = [
  {
    icon: <Clock3 size={18} />,
    label: 'Form ringkas',
    description: 'Dirancang supaya mudah diisi oleh kepala sekolah, TU, operator, atau tim administrasi.',
  },
  {
    icon: <MessagesSquare size={18} />,
    label: 'Pendampingan awal',
    description: 'Setelah masuk, tim kami akan menyesuaikan pembahasan sesuai kebutuhan sekolah Anda.',
  },
  {
    icon: <ShieldCheck size={18} />,
    label: 'Proses rapi',
    description: 'Data sekolah diperiksa terlebih dahulu agar tahap setup berjalan lebih aman dan jelas.',
  },
]

export default function TenantApplicationPage() {
  return (
    <main className={styles.page}>
      <div className={styles.heroGlow} />
      <section className={styles.hero}>
        <div className={styles.heroHeader}>
          <Link href="/landing" className={styles.backLink}>
            <ArrowLeft size={16} />
            Kembali ke Landing
          </Link>
          <span className={styles.eyebrow}>
            <Sparkles size={14} />
            Pendaftaran Sekolah Baru
          </span>
          <h1 className={styles.title}>Mulai percakapan awal untuk digitalisasi sekolah Anda</h1>
          <p className={styles.description}>
            Halaman ini dibuat untuk sekolah yang ingin mulai menggunakan SchoolPro. Isi formulir berikut agar tim kami
            bisa memahami profil sekolah, kebutuhan yang paling mendesak, dan menyiapkan langkah awal yang tepat.
          </p>
          <div className={styles.highlightGrid}>
            {highlights.map((item) => (
              <article key={item.label} className={styles.highlightCard}>
                <div className={styles.highlightIcon}>{item.icon}</div>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoHeader}>
              <ShieldCheck size={20} />
              <div>
                <h2>Apa yang akan terjadi setelah Anda mengisi formulir?</h2>
                <p>SchoolPro akan meninjau kebutuhan sekolah Anda terlebih dahulu agar proses lanjutan lebih terarah.</p>
              </div>
            </div>
            <ul className={styles.checklist}>
              {checklist.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={16} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className={styles.stepsCard}>
              <div className={styles.stepsTitle}>
                <ClipboardList size={18} />
                Langkah selanjutnya
              </div>
              <div className={styles.stepsList}>
                {steps.map((step, index) => (
                  <div key={step.title} className={styles.stepItem}>
                    <span className={styles.stepNumber}>{index + 1}</span>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <TenantApplicationForm />
        </div>
      </section>
    </main>
  )
}
