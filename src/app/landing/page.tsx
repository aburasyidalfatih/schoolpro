import Link from 'next/link'
import { headers } from 'next/headers'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Globe,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { getDemoHost } from '@/lib/runtime/app-context'
import styles from './page.module.css'

export const metadata = {
  title: 'SchoolPro - Sistem Administrasi Sekolah Modern dan Profesional',
  description:
    'Kelola website sekolah, PPDB online, keuangan, dan administrasi dalam satu platform yang rapi, mudah dipakai, dan siap berkembang bersama sekolah Anda.',
}

const freeFeatures = [
  'Website sekolah profesional dengan halaman profil, berita, pengumuman, agenda, prestasi, dan kontak yang siap dipublikasikan.',
  'Dashboard admin yang memudahkan tim sekolah memperbarui konten tanpa bergantung pada developer.',
  'Tampilan sekolah yang lebih rapi dan kredibel untuk wali murid, calon siswa, dan masyarakat.',
]

const premiumFeatures = [
  'PPDB online dengan alur pendaftaran, verifikasi berkas, dan pemantauan calon siswa dalam satu tempat.',
  'Keuangan sekolah untuk tagihan, pembayaran, tabungan, dan arus kas yang lebih tertib dan mudah dipantau.',
  'Data siswa, dashboard operasional, dan modul admin yang membantu pekerjaan sekolah berjalan lebih efisien.',
]

const journeySteps = [
  {
    number: '01',
    title: 'Mulai dari kebutuhan yang paling terasa',
    desc: 'Sekolah dapat langsung memiliki website resmi dan panel admin yang rapi untuk mengelola informasi publik.',
  },
  {
    number: '02',
    title: 'Satukan pekerjaan admin di satu dashboard',
    desc: 'Tim sekolah tidak perlu berpindah-pindah alat untuk mengelola konten, pendaftaran, dan administrasi.',
  },
  {
    number: '03',
    title: 'Kembangkan sistem saat sekolah berkembang',
    desc: 'Ketika kebutuhan bertambah, modul seperti PPDB dan keuangan dapat digunakan tanpa mengganti platform.',
  },
]

const faqs = [
  {
    q: 'Apa saja yang bisa dikelola dengan SchoolPro?',
    a: 'SchoolPro membantu sekolah mengelola website resmi, konten informasi publik, PPDB online, keuangan, dan administrasi sekolah dari satu platform.',
  },
  {
    q: 'Apakah SchoolPro cocok untuk sekolah yang belum memiliki tim IT?',
    a: 'Ya. SchoolPro dirancang agar admin sekolah dapat mengelola konten dan operasional harian dengan alur yang jelas dan tidak bergantung pada setup teknis yang rumit.',
  },
  {
    q: 'Apa manfaat utamanya untuk sekolah?',
    a: 'Sekolah mendapatkan proses kerja yang lebih rapi, informasi yang lebih mudah diakses, dan pengalaman yang lebih profesional bagi wali murid maupun calon siswa.',
  },
]

export default async function LandingPage() {
  const host = (await headers()).get('host') || ''
  const demoUrl = `https://${getDemoHost(host)}`

  return (
    <div className={styles.landing}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <div className={styles.heroBadge}>
              <Sparkles size={14} />
              Platform modern untuk operasional sekolah yang lebih rapi
            </div>
            <h1 className={styles.heroTitle}>
              Kelola website, PPDB, dan administrasi sekolah
              <span className={styles.heroHighlight}> dalam satu platform yang terasa profesional</span>
            </h1>
            <p className={styles.heroDesc}>
              Banyak sekolah masih bekerja dengan proses yang terpisah-pisah: website sulit diperbarui,
              informasi publik tidak konsisten, PPDB memakan banyak waktu, dan administrasi berjalan manual.
              SchoolPro menyatukan semuanya ke dalam dashboard yang lebih rapi, mudah dipakai, dan siap berkembang.
            </p>
            <div className={styles.heroActions}>
              <Link href="/landing/daftarkan-sekolah" className={styles.btnPrimary}>
                Daftarkan Sekolah <ArrowRight size={18} />
              </Link>
              <Link href={demoUrl} target="_blank" className={styles.btnSecondary}>
                Lihat Demo
              </Link>
              <Link href="#cta-final" className={styles.btnTertiary}>
                Jadwalkan Demo
              </Link>
            </div>
            <div className={styles.heroMeta}>
              <span>Informasi sekolah lebih tertata</span>
              <span>Administrasi lebih efisien</span>
              <span>Pengalaman wali murid lebih baik</span>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.dashboardShell}>
              <div className={styles.windowBar}>
                <span />
                <span />
                <span />
              </div>
              <div className={styles.dashboardBody}>
                <aside className={styles.sidebarMock}>
                  <div className={styles.sidebarBrand}>SchoolPro</div>
                  <div className={styles.sidebarNavItemActive}>Website Sekolah</div>
                  <div className={styles.sidebarNavItem}>Berita & Pengumuman</div>
                  <div className={styles.sidebarNavItem}>Agenda & Prestasi</div>
                  <div className={styles.sidebarNavItemLocked}>PPDB Online</div>
                  <div className={styles.sidebarNavItemLocked}>Keuangan</div>
                </aside>
                <div className={styles.dashboardMain}>
                  <div className={styles.dashboardTop}>
                    <div>
                      <div className={styles.dashboardEyebrow}>Aktif sekarang</div>
                      <div className={styles.dashboardTitle}>Operasional sekolah lebih rapi dalam satu dashboard</div>
                    </div>
                    <div className={styles.dashboardStatus}>Siap digunakan</div>
                  </div>

                  <div className={styles.metricsRow}>
                    <div className={styles.metricCard}>
                      <span>Informasi Publik</span>
                      <strong>Lebih terstruktur</strong>
                    </div>
                    <div className={styles.metricCard}>
                      <span>Pekerjaan Admin</span>
                      <strong>Lebih efisien</strong>
                    </div>
                    <div className={styles.metricCard}>
                      <span>Layanan Sekolah</span>
                      <strong>Lebih profesional</strong>
                    </div>
                  </div>

                  <div className={styles.previewCanvas}>
                    <div className={styles.previewWebsite}>
                      <div className={styles.previewHeader}>
                        <div className={styles.previewBadge}>Website Sekolah</div>
                        <div className={styles.previewDomain}>profil yang siap dilihat publik</div>
                      </div>
                      <div className={styles.previewHeroCard}>
                        <div className={styles.previewHeroText}>
                          <strong>Sekolah tampil lebih kredibel</strong>
                          <span>Profil, berita, pengumuman, agenda, dan informasi penting tersusun lebih jelas.</span>
                        </div>
                        <div className={styles.previewHeroVisual} />
                      </div>
                    </div>

                    <div className={styles.unlockCard}>
                      <div className={styles.unlockLabel}>Yang dapat dikelola</div>
                      <div className={styles.unlockItem}>
                        <GraduationCap size={16} />
                        <span>PPDB Online</span>
                      </div>
                      <div className={styles.unlockItem}>
                        <Wallet size={16} />
                        <span>Keuangan Sekolah</span>
                      </div>
                      <div className={styles.unlockItem}>
                        <LayoutDashboard size={16} />
                        <span>Dashboard Administrasi</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.trustStrip}>
          <div className={styles.trustInner}>
            <div className={styles.trustItem}>
              <strong>Informasi sekolah lebih mudah diakses</strong>
              <span>Website dan konten publik sekolah tampil lebih rapi dan mudah diperbarui.</span>
            </div>
            <div className={styles.trustItem}>
              <strong>Pekerjaan admin lebih efisien</strong>
              <span>Tim sekolah tidak lagi mengelola banyak proses secara terpisah dan manual.</span>
            </div>
            <div className={styles.trustItem}>
              <strong>Pengalaman yang lebih profesional</strong>
              <span>Calon siswa, wali murid, dan pihak sekolah melihat sistem yang lebih tertata.</span>
            </div>
          </div>
      </section>

      <section className={styles.sectionShowcase}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLead}>
            <div className={styles.sectionBadge}>Masalah Yang Diselesaikan</div>
            <h2 className={styles.sectionTitle}>SchoolPro membantu sekolah yang ingin terlihat rapi dan bekerja lebih efisien</h2>
            <p className={styles.sectionDesc}>
              Ketika informasi sekolah tersebar, website jarang diperbarui, dan proses administrasi berjalan manual,
              beban kerja tim sekolah bertambah dan pengalaman wali murid ikut menurun.
            </p>
          </div>

          <div className={styles.showcaseLayout}>
            <div className={styles.showcaseCardPrimary}>
              <div className={styles.showcaseHeader}>
                <Globe size={20} />
                <div>
                  <strong>Tampilan sekolah yang lebih profesional</strong>
                  <span>Website dan dashboard yang membantu sekolah terlihat lebih siap dan tertata.</span>
                </div>
              </div>
              <ul className={styles.featureList}>
                {freeFeatures.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.showcaseStack}>
              <div className={styles.showcaseCardSecondary}>
                <div className={styles.stackTitle}>Hasil yang langsung dirasakan</div>
                <div className={styles.stackMetric}>Informasi sekolah lebih meyakinkan di mata publik</div>
                <p>Konten lebih mudah diperbarui, informasi penting tidak tercecer, dan sekolah tampil lebih profesional.</p>
              </div>
              <div className={styles.showcaseQuote}>
                <span>SchoolPro bukan hanya membuat sekolah terlihat modern, tetapi juga membantu pekerjaan administrasi berjalan lebih tertib.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionComparison}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLeadCenter}>
            <div className={styles.sectionBadge}>Kemudahan Yang Didapat</div>
            <h2 className={styles.sectionTitle}>Satu platform untuk kebutuhan publik sekolah sampai administrasi internal</h2>
            <p className={styles.sectionDesc}>
              SchoolPro membantu sekolah membangun kehadiran digital yang baik sekaligus menyiapkan fondasi untuk proses administrasi yang lebih efisien.
            </p>
          </div>

          <div className={styles.comparisonGrid}>
            <article className={styles.planCardFree}>
              <div className={styles.planPill}>Website & Informasi Publik</div>
              <h3 className={styles.planTitle}>Bangun kepercayaan lewat tampilan sekolah yang lebih baik</h3>
              <p className={styles.planDesc}>Website sekolah yang rapi memudahkan orang tua, calon siswa, dan masyarakat menemukan informasi penting dengan cepat.</p>
              <ul className={styles.planList}>
                {freeFeatures.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className={styles.planCardPremium}>
              <div className={styles.planPillAccent}>Administrasi & Operasional</div>
              <h3 className={styles.planTitle}>Rapikan proses kerja sekolah di dashboard yang sama</h3>
              <p className={styles.planDesc}>Saat kebutuhan administrasi semakin kompleks, sekolah dapat mengelola proses penting tanpa berpindah-pindah sistem.</p>
              <ul className={styles.planList}>
                {premiumFeatures.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.sectionJourney}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLead}>
            <div className={styles.sectionBadge}>Cara Kerja</div>
            <h2 className={styles.sectionTitle}>Tiga langkah menuju operasional sekolah yang lebih rapi</h2>
          </div>

          <div className={styles.journeyGrid}>
            {journeySteps.map((step) => (
              <article key={step.number} className={styles.journeyCard}>
                <div className={styles.journeyNumber}>{step.number}</div>
                <h3 className={styles.journeyTitle}>{step.title}</h3>
                <p className={styles.journeyDesc}>{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionProof}>
        <div className={styles.sectionInner}>
          <div className={styles.proofPanel}>
            <div className={styles.proofCopy}>
              <div className={styles.sectionBadge}>Kenapa SchoolPro</div>
              <h2 className={styles.sectionTitle}>Platform yang membantu sekolah tampil lebih baik sekaligus bekerja lebih tertib</h2>
              <p className={styles.sectionDesc}>
                SchoolPro dirancang untuk kebutuhan sekolah nyata: memperjelas informasi publik, menyederhanakan proses administrasi, dan membantu tim sekolah bekerja lebih efisien.
              </p>
            </div>
            <div className={styles.proofList}>
              <div>
                <ShieldCheck size={18} />
                <span>Informasi sekolah lebih mudah diakses oleh wali murid dan calon siswa.</span>
              </div>
              <div>
                <LayoutDashboard size={18} />
                <span>Tim admin bekerja dari dashboard yang lebih tertata dan mudah dipahami.</span>
              </div>
              <div>
                <ChevronRight size={18} />
                <span>Sekolah dapat berkembang ke proses yang lebih terintegrasi tanpa mengganti sistem.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionFaq}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLeadCenter}>
            <div className={styles.sectionBadge}>FAQ Singkat</div>
            <h2 className={styles.sectionTitle}>Hal yang biasanya ingin diketahui calon pengguna</h2>
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

      <section id="cta-final" className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <div className={styles.ctaBadge}>Siap Melihat SchoolPro Lebih Dekat?</div>
          <h2 className={styles.ctaTitle}>Pilih cara terbaik untuk mulai mengenal SchoolPro</h2>
          <p className={styles.ctaDesc}>
            Mulai langsung, lihat demonstrasi produk, atau jadwalkan sesi agar tim sekolah Anda bisa menilai apakah SchoolPro sesuai dengan kebutuhan.
          </p>
          <div className={styles.ctaGrid}>
            <Link href="/landing/daftarkan-sekolah" className={styles.ctaPrimary}>
              <span>Daftarkan Sekolah</span>
              <small>Ajukan sekolah Anda sebagai calon tenant untuk direview tim SchoolPro.</small>
            </Link>
            <Link href={demoUrl} target="_blank" className={styles.ctaSecondary}>
              <span>Lihat Demo</span>
              <small>Lihat gambaran produk dan pengalaman admin SchoolPro.</small>
            </Link>
            <Link href="/landing/daftarkan-sekolah" className={styles.ctaTertiary}>
              <span>Ajukan Tenant</span>
              <small>Kirim kebutuhan awal sekolah agar onboarding bisa dipersiapkan lebih tepat.</small>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
