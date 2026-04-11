import Link from 'next/link'
import { Zap, Shield, Users, Globe, ArrowRight, Building2, GraduationCap, DollarSign, BarChart3 } from 'lucide-react'
import styles from './page.module.css'

export const metadata = {
  title: 'SchoolPro - Sistem Informasi Sekolah Modern',
  description: 'Platform SaaS untuk manajemen sekolah: Data Master, Keuangan, PPDB Online, dan Website Sekolah',
}

export default function LandingPage() {
  return (
    <div className={styles.landing}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <Zap size={14} />
            Platform SaaS Terpercaya untuk Lembaga Pendidikan
          </div>
          <h1 className={styles.heroTitle}>
            Sistem Informasi Sekolah<br />
            <span className={styles.heroGradient}>Modern & Terpadu</span>
          </h1>
          <p className={styles.heroDesc}>
            Kelola data siswa, keuangan, PPDB, dan website sekolah dalam satu platform. 
            Hemat waktu, tingkatkan efisiensi, dan fokus pada pendidikan berkualitas.
          </p>
          <div className={styles.heroActions}>
            <Link href="#daftar" className={styles.btnPrimary}>
              Mulai Gratis <ArrowRight size={18} />
            </Link>
            <Link href="https://demo.schoolpro.id" target="_blank" className={styles.btnSecondary}>
              Lihat Demo
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <div className={styles.heroStatNum}>500+</div>
              <div className={styles.heroStatLabel}>Sekolah Terdaftar</div>
            </div>
            <div className={styles.heroStat}>
              <div className={styles.heroStatNum}>50K+</div>
              <div className={styles.heroStatLabel}>Siswa Aktif</div>
            </div>
            <div className={styles.heroStat}>
              <div className={styles.heroStatNum}>99.9%</div>
              <div className={styles.heroStatLabel}>Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>Fitur Lengkap</div>
            <h2 className={styles.sectionTitle}>Semua yang Sekolah Anda Butuhkan</h2>
            <p className={styles.sectionDesc}>Platform all-in-one untuk manajemen sekolah modern</p>
          </div>

          <div className={styles.featuresGrid}>
            {[
              { icon: <Users size={24} />, title: 'Data Master', desc: 'Kelola data siswa, guru, kelas, unit, tahun ajaran, dan rekening dengan mudah' },
              { icon: <DollarSign size={24} />, title: 'Keuangan Terpadu', desc: 'Tagihan otomatis, pembayaran multi-metode, tabungan siswa, dan arus kas real-time' },
              { icon: <GraduationCap size={24} />, title: 'PPDB Online', desc: 'Pendaftaran siswa baru online dengan verifikasi berkas, tagihan, dan pengumuman otomatis' },
              { icon: <Globe size={24} />, title: 'Website Sekolah', desc: 'Website profesional dengan CMS untuk berita, pengumuman, agenda, prestasi, dan ekskul' },
              { icon: <BarChart3 size={24} />, title: 'Dashboard Analytics', desc: 'Visualisasi data real-time untuk siswa, keuangan, PPDB, dan performa sekolah' },
              { icon: <Shield size={24} />, title: 'Multi-Tenant & Keamanan', desc: 'Isolasi data per sekolah, enkripsi, backup otomatis, dan role-based access control' },
            ].map((feature, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>Roadmap</div>
            <h2 className={styles.sectionTitle}>Fitur yang Akan Datang</h2>
            <p className={styles.sectionDesc}>Kami terus berinovasi untuk memberikan solusi terbaik</p>
          </div>

          <div className={styles.roadmapGrid}>
            {[
              { 
                status: 'Dalam Pengembangan', 
                title: 'Absensi Digital', 
                desc: 'Absensi siswa dan guru dengan QR Code, GPS tracking, dan notifikasi real-time',
                color: '#14b8a6'
              },
              { 
                status: 'Dalam Pengembangan', 
                title: 'Raport Digital', 
                desc: 'Raport online sesuai Kurikulum Merdeka dengan analisis perkembangan siswa',
                color: '#14b8a6'
              },
              { 
                status: 'Q2 2026', 
                title: 'Modul Kepegawaian', 
                desc: 'Manajemen data pegawai, absensi, gaji, dan evaluasi kinerja',
                color: '#10b981'
              },
              { 
                status: 'Q2 2026', 
                title: 'E-Learning', 
                desc: 'Platform pembelajaran online dengan materi, tugas, ujian, dan video conference',
                color: '#10b981'
              },
              { 
                status: 'Q3 2026', 
                title: 'Mobile App (PWA)', 
                desc: 'Aplikasi mobile untuk siswa, orang tua, dan guru (Android & iOS)',
                color: '#0d9488'
              },
              { 
                status: 'Q3 2026', 
                title: 'Notifikasi WhatsApp', 
                desc: 'Notifikasi otomatis via WhatsApp untuk tagihan, pengumuman, dan absensi',
                color: '#0d9488'
              },
              { 
                status: 'Q4 2026', 
                title: 'AI Assistant', 
                desc: 'Chatbot AI untuk menjawab pertanyaan, prediksi tunggakan, dan analisis data',
                color: '#0891b2'
              },
              { 
                status: 'Q4 2026', 
                title: 'E-Kantin', 
                desc: 'Sistem kantin digital dengan saldo, transaksi, dan laporan penjualan',
                color: '#0891b2'
              },
            ].map((item, i) => (
              <div key={i} className={styles.roadmapCard}>
                <div className={styles.roadmapStatus} style={{ background: item.color }}>
                  {item.status}
                </div>
                <h3 className={styles.roadmapTitle}>{item.title}</h3>
                <p className={styles.roadmapDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <Building2 size={48} className={styles.ctaIcon} />
          <h2 className={styles.ctaTitle}>Siap Modernisasi Sekolah Anda?</h2>
          <p className={styles.ctaDesc}>Bergabunglah dengan ratusan sekolah yang sudah merasakan manfaatnya</p>
          <Link href="#daftar" className={styles.btnPrimary}>
            Daftar Sekarang - Gratis <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <h3>SchoolPro</h3>
            <p>Platform SaaS untuk manajemen sekolah modern</p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 SchoolPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
