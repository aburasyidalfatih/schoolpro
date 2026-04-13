import { headers } from 'next/headers'
import { getTenantBySlug } from '@/lib/tenant'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import {
  ArrowRight, Calendar, MapPin, GraduationCap,
  UserPlus, LogIn, CheckCircle2, FileText, CreditCard, ClipboardList
} from 'lucide-react'
import styles from './page.module.css'

const ALUR = [
  { icon: <UserPlus size={22} />, step: '01', title: 'Buat Akun', desc: 'Daftar akun pendaftar dengan email aktif.' },
  { icon: <FileText size={22} />, step: '02', title: 'Isi Form Singkat', desc: 'Masukkan nama calon siswa dan pilih gelombang.' },
  { icon: <CreditCard size={22} />, step: '03', title: 'Bayar Formulir', desc: 'Lunasi biaya pendaftaran sesuai invoice.' },
  { icon: <ClipboardList size={22} />, step: '04', title: 'Lengkapi Data', desc: 'Isi formulir lengkap dan upload berkas persyaratan.' },
  { icon: <CheckCircle2 size={22} />, step: '05', title: 'Tunggu Hasil', desc: 'Pantau status seleksi melalui dasbor akun Anda.' },
]

export default async function PpdbLandingPage() {
  const headerList = await headers()
  const tenantSlug = headerList.get('x-tenant-slug')
  if (!tenantSlug) return null
  const tenant = await getTenantBySlug(tenantSlug)

  if (!tenant) return null

  const activePeriods = await prisma.periodePpdb.findMany({
    where: {
      tenantId: tenant.id,
      isActive: true,
      tanggalTutup: { gte: new Date() },
    },
    include: { unit: true, tahunAjaran: true },
    orderBy: { tanggalBuka: 'asc' },
  })

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroBadge}>
            Penerimaan Peserta Didik Baru 2025/2026
          </span>
          <h2 className={styles.heroTitle}>
            Selamat Datang di Portal PPDB<br />
            <span className={styles.heroGradient}>{tenant.nama}</span>
          </h2>
          <p className={styles.heroDesc}>
            Daftarkan putra-putri Anda secara online. Proses mudah, cepat, dan
            dapat dipantau kapan saja melalui dasbor akun Anda.
          </p>
          <div className={styles.heroCta}>
            <Link href="/app/register" className={styles.btnPrimary}>
              <UserPlus size={18} /> Buat Akun Pendaftar
            </Link>
            <Link href="/app/login" className={styles.btnSecondary}>
              <LogIn size={18} /> Sudah Punya Akun? Masuk
            </Link>
          </div>
        </div>
      </section>

      {/* ── Gelombang Pendaftaran ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div>
              <h3 className={styles.sectionTitle}>Gelombang Pendaftaran</h3>
              <p className={styles.sectionSubtitle}>
                {activePeriods.length > 0
                  ? `${activePeriods.length} gelombang sedang dibuka`
                  : 'Belum ada gelombang yang dibuka saat ini'}
              </p>
            </div>
          </div>

          {activePeriods.length > 0 ? (
            <div className={styles.periodsGrid}>
              {activePeriods.map((period) => (
                <div key={period.id} className={styles.periodCard}>
                  <span className={styles.periodBadge}>Buka</span>

                  <div className={styles.periodIconWrap}>
                    <GraduationCap size={24} />
                  </div>

                  <h4 className={styles.periodName}>{period.nama}</h4>
                  <p className={styles.periodUnit}>
                    {period.unit?.nama || 'Umum'} — TP {period.tahunAjaran.nama}
                  </p>

                  <div className={styles.periodDetails}>
                    <div className={styles.periodDetail}>
                      <Calendar size={15} style={{ color: 'var(--primary-500)', flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <span className={styles.periodDetailLabel}>Masa Pendaftaran</span>
                        {new Date(period.tanggalBuka).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                        {' — '}
                        {new Date(period.tanggalTutup).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    {period.unit && (
                      <div className={styles.periodDetail}>
                        <MapPin size={15} style={{ color: 'var(--primary-500)', flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <span className={styles.periodDetailLabel}>Unit / Jenjang</span>
                          {period.unit.nama}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA selalu ke register/login — bukan langsung ke form */}
                  <Link href="/app/register" className={styles.periodCta}>
                    Daftar ke Gelombang Ini <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyPeriods}>
              Saat ini belum ada gelombang pendaftaran yang dibuka. Pantau terus halaman ini.
            </div>
          )}
        </div>
      </section>

      {/* ── Alur Pendaftaran ── */}
      <section className={styles.alurSection}>
        <div className={styles.alurCard}>
          <h3 className={styles.alurTitle}>Cara Mendaftar</h3>
          <p className={styles.alurSubtitle}>Ikuti langkah-langkah berikut untuk menyelesaikan pendaftaran</p>
          <div className={styles.alurGrid}>
            {ALUR.map((item, idx) => (
              <div key={item.step} className={styles.alurItem}>
                <div className={styles.alurIconWrap}>{item.icon}</div>
                {idx < ALUR.length - 1 && <div className={styles.alurConnector} />}
                <div className={styles.alurStepNum}>{item.step}</div>
                <h5 className={styles.alurItemTitle}>{item.title}</h5>
                <p className={styles.alurItemDesc}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div className={styles.alurCta}>
            <Link href="/app/register" className={styles.btnPrimary}>
              <UserPlus size={18} /> Mulai Pendaftaran
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
