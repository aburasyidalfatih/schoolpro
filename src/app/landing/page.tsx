import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Shield,
  Sparkles,
  Wallet,
} from 'lucide-react'
import styles from './page.module.css'

export const metadata = {
  title: 'SchoolPro - Website Sekolah Gratis, Siap Upgrade ke Sistem Admin',
  description:
    'Buat website sekolah profesional gratis dengan CMS konten yang mudah. Saat sekolah siap berkembang, upgrade ke PPDB online, keuangan, dan dashboard admin terintegrasi.',
}

const freeFeatures = [
  {
    icon: <Globe size={22} />,
    title: 'Website sekolah siap publish',
    desc: 'Halaman profil, berita, pengumuman, agenda, prestasi, ekskul, dan kontak sekolah langsung aktif.',
  },
  {
    icon: <LayoutDashboard size={22} />,
    title: 'Dashboard admin untuk kelola konten',
    desc: 'Tim sekolah bisa mengatur konten website dari satu panel admin yang rapi dan mudah dipelajari.',
  },
  {
    icon: <Sparkles size={22} />,
    title: 'Tampilan profesional',
    desc: 'Sekolah tampil lebih modern dengan struktur konten yang jelas, mobile-friendly, dan siap dipresentasikan ke calon wali murid.',
  },
]

const premiumFeatures = [
  {
    icon: <GraduationCap size={22} />,
    title: 'PPDB online terintegrasi',
    desc: 'Buka pendaftaran siswa baru, verifikasi berkas, pantau status pendaftar, dan kelola tagihan PPDB dalam satu alur.',
  },
  {
    icon: <Wallet size={22} />,
    title: 'Keuangan dan tagihan sekolah',
    desc: 'Kelola tagihan, pembayaran, tabungan, dan arus kas dengan laporan yang lebih mudah dipantau oleh tim sekolah.',
  },
  {
    icon: <Shield size={22} />,
    title: 'Operasional admin yang lebih lengkap',
    desc: 'Saat kebutuhan sekolah bertambah, aktifkan modul data siswa, dashboard analitik, dan pengelolaan operasional yang lebih dalam.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Daftarkan sekolah',
    desc: 'Mulai dari kebutuhan paling ringan: hadir secara profesional lewat website sekolah resmi.',
  },
  {
    number: '02',
    title: 'Kelola website dari dashboard',
    desc: 'Admin sekolah masuk ke dashboard untuk mengisi profil, berita, pengumuman, dan konten publik lainnya.',
  },
  {
    number: '03',
    title: 'Upgrade saat sekolah siap',
    desc: 'Ketika ingin membuka PPDB online, keuangan, atau modul operasional lain, upgrade bisa dilakukan tanpa pindah platform.',
  },
]

const faqs = [
  {
    q: 'Apa yang benar-benar gratis?',
    a: 'Paket awal difokuskan untuk website sekolah dan pengelolaan konten publik. Ini bukan trial singkat, tetapi pintu masuk agar sekolah bisa mulai lebih cepat.',
  },
  {
    q: 'Kapan sekolah perlu upgrade?',
    a: 'Upgrade dibutuhkan saat sekolah ingin membuka modul operasional seperti PPDB online, keuangan, data siswa, atau workflow admin yang lebih lengkap.',
  },
  {
    q: 'Apakah sekolah bisa melihat dashboard meski belum upgrade?',
    a: 'Ya. Dashboard tetap menjadi pusat pengelolaan website, sekaligus memperlihatkan modul premium yang bisa diaktifkan saat kebutuhan bertambah.',
  },
]

export default function LandingPage() {
  return (
    <div className={styles.landing}>
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} />
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <Sparkles size={14} />
              Funnel baru SchoolPro: mulai dari website sekolah gratis
            </div>
            <h1 className={styles.heroTitle}>
              Buat <span className={styles.heroGradient}>Website Sekolah Profesional Gratis</span>,
              lalu upgrade saat operasional sekolah siap berkembang
            </h1>
            <p className={styles.heroDesc}>
              SchoolPro membantu sekolah mulai dari kebutuhan paling mudah dipahami:
              website resmi yang bisa langsung dipublikasikan. Setelah itu, sekolah masuk ke
              dashboard admin yang sama untuk mengelola konten dan membuka modul premium saat dibutuhkan.
            </p>
            <div className={styles.heroActions}>
              <Link href="/app/register" className={styles.btnPrimary}>
                Buat Website Gratis <ArrowRight size={18} />
              </Link>
              <Link href="https://demo.schoolpro.id" target="_blank" className={styles.btnSecondary}>
                Lihat Demo Admin
              </Link>
            </div>
            <div className={styles.heroProof}>
              <span>Tanpa pindah platform</span>
              <span>Dashboard admin tetap sama</span>
              <span>Upgrade saat kebutuhan jelas</span>
            </div>
          </div>

          <div className={styles.heroPanel}>
            <div className={styles.panelCard}>
              <div className={styles.panelLabel}>Langsung aktif</div>
              <h2 className={styles.panelTitle}>Website sekolah gratis</h2>
              <ul className={styles.panelList}>
                <li>
                  <CheckCircle2 size={18} />
                  Profil sekolah, berita, pengumuman, agenda, prestasi, dan kontak
                </li>
                <li>
                  <CheckCircle2 size={18} />
                  Dashboard untuk kelola konten website tanpa setup teknis yang rumit
                </li>
                <li>
                  <CheckCircle2 size={18} />
                  Tampilan profesional untuk membangun kepercayaan wali murid
                </li>
              </ul>
            </div>

            <div className={styles.panelAside}>
              <div className={styles.panelAsideTitle}>Siap dibuka saat upgrade</div>
              <div className={styles.panelAsideItem}>
                <GraduationCap size={18} />
                <div>
                  <strong>PPDB Online</strong>
                  <span>Pendaftaran, verifikasi, dan monitoring pendaftar</span>
                </div>
              </div>
              <div className={styles.panelAsideItem}>
                <Wallet size={18} />
                <div>
                  <strong>Keuangan Sekolah</strong>
                  <span>Tagihan, pembayaran, tabungan, dan arus kas</span>
                </div>
              </div>
              <div className={styles.panelAsideItem}>
                <LayoutDashboard size={18} />
                <div>
                  <strong>Admin Terintegrasi</strong>
                  <span>Modul operasional tumbuh tanpa ganti sistem</span>
                </div>
              </div>
              <Link href="#alur" className={styles.inlineLink}>
                Lihat alur penggunaan <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>Gratis Sekarang</div>
            <h2 className={styles.sectionTitle}>Masuk lewat kebutuhan yang paling mudah diputuskan</h2>
            <p className={styles.sectionDesc}>
              Banyak sekolah belum siap membeli sistem operasional penuh di awal. Karena itu,
              SchoolPro membuka pintu dengan produk yang langsung terasa manfaatnya: website sekolah resmi.
            </p>
          </div>

          <div className={styles.cardGrid}>
            {freeFeatures.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>Upgrade Saat Dibutuhkan</div>
            <h2 className={styles.sectionTitle}>Dashboard yang sama, kemampuan yang terus bertambah</h2>
            <p className={styles.sectionDesc}>
              Setelah website berjalan, admin sekolah sudah berada di ekosistem yang benar.
              Saat kebutuhan tumbuh, modul premium dibuka tanpa migrasi platform.
            </p>
          </div>

          <div className={styles.cardGrid}>
            {premiumFeatures.map((feature) => (
              <article key={feature.title} className={styles.featureCardAlt}>
                <div className={styles.featureIconAlt}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.valueStrip}>
            <div>
              <span className={styles.valueLabel}>Kenapa model ini lebih kuat?</span>
              <h2 className={styles.valueTitle}>Sekolah mendapat hasil nyata dulu, lalu keputusan upgrade jadi lebih mudah</h2>
            </div>
            <div className={styles.valuePoints}>
              <div>Lead lebih mudah masuk karena tawarannya konkret dan ringan.</div>
              <div>Admin sekolah langsung mengenal dashboard sebelum membeli modul premium.</div>
              <div>Upsell terasa natural karena muncul saat kebutuhan sekolah benar-benar ada.</div>
            </div>
          </div>
        </div>
      </section>

      <section id="alur" className={styles.sectionSteps}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>Alur Penggunaan</div>
            <h2 className={styles.sectionTitle}>Funnel yang sederhana dan mudah dijelaskan ke calon sekolah</h2>
            <p className={styles.sectionDesc}>
              Visitor tidak dipaksa langsung membeli. Mereka masuk, merasakan value, lalu naik ke kebutuhan berikutnya.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {steps.map((step) => (
              <article key={step.number} className={styles.stepCard}>
                <div className={styles.stepNumber}>{step.number}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>FAQ Singkat</div>
            <h2 className={styles.sectionTitle}>Hal yang biasanya ingin dipastikan sekolah sejak awal</h2>
          </div>

          <div className={styles.faqGrid}>
            {faqs.map((item) => (
              <article key={item.q} className={styles.faqCard}>
                <div className={styles.faqIcon}>
                  <CircleHelp size={18} />
                </div>
                <h3 className={styles.faqQuestion}>{item.q}</h3>
                <p className={styles.faqAnswer}>{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="get-started" className={styles.cta}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaBadge}>Mulai dari yang paling mudah</div>
          <h2 className={styles.ctaTitle}>Aktifkan website sekolah gratis hari ini, lalu upgrade saat sekolah siap</h2>
          <p className={styles.ctaDesc}>
            Pilih jalur yang sesuai. Jika ingin langsung mencoba, buat akun sekolah sekarang.
            Jika ingin melihat gambaran dashboard lebih dulu, buka demo admin.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/app/register" className={styles.btnPrimary}>
              Buat Website Gratis <ArrowRight size={18} />
            </Link>
            <Link href="https://demo.schoolpro.id" target="_blank" className={styles.btnGhost}>
              Lihat Demo Admin
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
