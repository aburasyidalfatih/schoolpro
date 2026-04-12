import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import {
  Rocket, ArrowRight, CheckCircle2, FileText, CreditCard,
  BookOpen, TrendingUp, ArrowUpRight, AlertTriangle, Megaphone,
  Plus, Pencil, GraduationCap
} from 'lucide-react'
import styles from './page.module.css'
import { derivePpdbWorkflow } from '@/features/ppdb/lib/ppdb-workflow'

type SessionUser = {
  role?: string
  tenantId?: string | null
  tenantNama?: string | null
}

type WorkflowFlags = {
  isRegistrationFeePaid: boolean
  hasStartedFullForm: boolean
  hasSubmittedFullForm: boolean
  requiredDocumentsUploadedCount: number
  requiredDocumentsTotal: number
  hasReenrollmentBill: boolean
  isReenrollmentPaid: boolean
  isSyncedToStudent: boolean
}

type WorkflowSummary = {
  label: string
  description: string
  nextAction: string
  flags: WorkflowFlags
}

type PengumumanInfo = {
  status?: string
  pesan?: string
  jadwalDaftarUlang?: string | null
}

type DashboardPendaftaran = {
  id: string
  status: string
  noPendaftaran: string
  namaLengkap: string
  dataFormulir?: unknown
  periode: {
    nama: string
    unit: {
      nama: string
    } | null
  }
  workflow: WorkflowSummary
}

function getPengumuman(value: unknown): PengumumanInfo | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  const pengumuman = record.pengumuman
  if (!pengumuman || typeof pengumuman !== 'object' || Array.isArray(pengumuman)) return null
  return pengumuman as PengumumanInfo
}

function calcProgress(p: DashboardPendaftaran) {
  const workflow = p.workflow
  const isDiterima = p.status === 'DITERIMA'
  const isDitolak = p.status === 'DITOLAK'
  const isSiswa = workflow?.flags.isSyncedToStudent
  const steps = [
    { key: 'form_singkat',  label: 'Form Singkat',   done: true },
    { key: 'bayar',         label: 'Bayar Formulir', done: workflow?.flags.isRegistrationFeePaid, active: !workflow?.flags.isRegistrationFeePaid },
    { key: 'form_lengkap',  label: 'Form Lengkap',   done: workflow?.flags.hasSubmittedFullForm, active: workflow?.flags.isRegistrationFeePaid && !workflow?.flags.hasSubmittedFullForm },
    { key: 'verifikasi',    label: 'Verifikasi',     done: ['TERVERIFIKASI', 'DITERIMA', 'DITOLAK'].includes(p.status), active: workflow?.flags.hasSubmittedFullForm && !['TERVERIFIKASI', 'DITERIMA', 'DITOLAK'].includes(p.status) },
    { key: 'pengumuman',    label: 'Pengumuman',     done: isDiterima || isDitolak, active: p.status === 'TERVERIFIKASI', rejected: isDitolak },
    { key: 'daftar_ulang',  label: 'Daftar Ulang',   done: !workflow?.flags.hasReenrollmentBill || workflow?.flags.isReenrollmentPaid, active: isDiterima && workflow?.flags.hasReenrollmentBill && !workflow?.flags.isReenrollmentPaid },
    { key: 'siswa',         label: 'Resmi Siswa',    done: isSiswa,      active: workflow?.flags.isReenrollmentPaid && !isSiswa },
  ]
  const normalizedSteps = steps.map((step) =>
    step.key === 'siswa'
      ? { ...step, active: workflow?.flags.isReenrollmentPaid && !isSiswa }
      : step
  )

  const doneCount = normalizedSteps.filter(s => s.done).length
  const pct = Math.round((doneCount / normalizedSteps.length) * 100)
  const activeStep = normalizedSteps.find(s => s.active && !s.rejected)
  const currentLabel = isDitolak
    ? 'Tidak lolos seleksi'
    : isSiswa
    ? 'Resmi terdaftar sebagai siswa'
    : workflow?.label ?? activeStep?.label ?? 'Menunggu verifikasi'

  return { steps: normalizedSteps, pct, activeStep, currentLabel, isDiterima, isDitolak, isSiswa, workflow }
}

function getNextAction(p: DashboardPendaftaran, prog: ReturnType<typeof calcProgress>) {
  if (prog.isSiswa)      return null
  if (prog.isDitolak)    return null
  if (!prog.workflow?.flags.isRegistrationFeePaid) return { href: `/app/ppdb/invoice/${p.id}`, label: 'Bayar Formulir', variant: 'warning' }
  if (!prog.workflow?.flags.hasSubmittedFullForm) {
    return {
      href: `/app/ppdb/form-lengkap/${p.id}`,
      label: prog.workflow?.flags.hasStartedFullForm ? 'Lanjutkan Draft' : 'Lengkapi Formulir',
      variant: 'primary',
    }
  }
  if (prog.isDiterima && prog.workflow?.flags.hasReenrollmentBill && !prog.workflow.flags.isReenrollmentPaid) {
    return { href: `/app/ppdb/invoice/${p.id}`, label: 'Bayar Daftar Ulang', variant: 'primary' }
  }
  if (prog.workflow?.flags.hasSubmittedFullForm && !prog.isDiterima) {
    return { href: `/app/ppdb/form-lengkap/${p.id}`, label: 'Lihat Formulir', variant: 'secondary' }
  }
  return null
}

export default async function BerandaPage() {
  const session = await auth()
  if (!session?.user) return null

  const userSession = session.user as SessionUser
  const role = userSession.role
  const tenantId = userSession.tenantId
  const tenantNama = userSession.tenantNama
  if (!tenantId) return null

  const pendaftarans = await prisma.pendaftarPpdb.findMany({
    where: { userId: session.user.id, tenantId },
    include: {
      periode: {
        include: {
          unit: true,
          persyaratanBerkas: {
            select: {
              id: true,
              isWajib: true,
            },
          },
        },
      },
      tagihanPpdbs: {
        include: {
          pembayarans: {
            select: {
              status: true,
            },
          },
        },
      },
      berkas: {
        include: {
          persyaratan: {
            select: {
              isWajib: true,
            },
          },
        },
      },
    },
    orderBy: { tanggalDaftar: 'desc' },
  })

  const syncedStudents = pendaftarans.length > 0
    ? await prisma.siswa.findMany({
        where: {
          tenantId,
          OR: pendaftarans.map((pendaftaran) => ({
            dataTambahan: {
              path: ['sumberPpdb'],
              equals: pendaftaran.noPendaftaran,
            },
          })),
        },
        select: {
          dataTambahan: true,
        },
      })
    : []

  const syncedNoPendaftaranSet = new Set(
    syncedStudents
      .map((siswa) => (
        siswa.dataTambahan &&
        typeof siswa.dataTambahan === 'object' &&
        !Array.isArray(siswa.dataTambahan)
          ? (siswa.dataTambahan as Record<string, unknown>).sumberPpdb
          : null
      ))
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
  )

  const pendaftaransWithWorkflow = pendaftarans.map((pendaftaran) => ({
    ...pendaftaran,
    workflow: derivePpdbWorkflow(pendaftaran, {
      isSyncedToStudent: syncedNoPendaftaranSet.has(pendaftaran.noPendaftaran),
    }),
  }))

  const isApplicantOnly = role === 'USER' || (pendaftaransWithWorkflow.length > 0 && role !== 'ADMIN')

  return (
    <div className={styles.container}>
      {/* Welcome */}
      <div className={styles.welcomeHeader}>
        <h1 className={styles.welcomeTitle}>Halo, {session.user.name}! 👋</h1>
        <p className={styles.welcomeSubtitle}>
          {isApplicantOnly
            ? `Selamat datang di portal pendaftaran ${tenantNama}.`
            : 'Portal informasi akademik dan keuangan anak Anda.'}
        </p>
      </div>

      {isApplicantOnly ? (
        /* ── DASHBOARD PENDAFTAR ── */
        <div className={styles.pendaftaranSection}>
          {pendaftaransWithWorkflow.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.rocketIcon}><Rocket size={44} /></div>
              <div>
                <h2 className={styles.emptyTitle}>Belum Ada Pendaftaran</h2>
                <p className={styles.emptyDesc}>Mulai proses pendaftaran dengan mengisi form singkat.</p>
              </div>
              <Link href="/app/ppdb/form-singkat" className={`${styles.btnAction} ${styles.btnPrimary}`} style={{ width: 'auto', paddingLeft: '2rem', paddingRight: '2rem' }}>
                Mulai Pendaftaran <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                  <FileText size={18} style={{ color: 'var(--primary-600)' }} />
                  Pendaftaran Saya
                </h3>
                <Link href="/app/ppdb/form-singkat" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--sp-text-sm)', fontWeight: 700, color: 'var(--primary-600)', textDecoration: 'none' }}>
                  <Plus size={14} /> Daftarkan Lagi
                </Link>
              </div>

              <div className={styles.pendaftaranGrid}>
                {pendaftaransWithWorkflow.map((p) => {
                  const prog = calcProgress(p)
                  const nextAction = getNextAction(p, prog)
                  const unitNama = p.periode.unit?.nama || 'Umum'

                  return (
                    <div key={p.id} className={`${styles.pendaftaranCard} ${prog.isSiswa ? styles.cardSiswa : prog.isDitolak ? styles.cardDitolak : ''}`}>

                      {/* ── Header ── */}
                      <div className={styles.cardTop}>
                        <div className={styles.studentInfo}>
                          <div className={`${styles.studentAvatar} ${prog.isSiswa ? styles.avatarSiswa : ''}`}>
                            {prog.isSiswa ? <GraduationCap size={22} /> : unitNama.charAt(0)}
                          </div>
                          <div>
                            <h4 className={styles.studentName}>{p.namaLengkap}</h4>
                            <p className={styles.studentMeta}>{p.periode.nama} • {unitNama}</p>
                          </div>
                        </div>
                        <div className={styles.noDaftar}>
                          <span style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>No. Daftar</span>
                          <span style={{ fontWeight: 800, fontSize: 'var(--sp-text-sm)', fontFamily: 'var(--font-heading)' }}>{p.noPendaftaran}</span>
                        </div>
                      </div>

                      {/* ── Pengumuman Banner ── */}
                        {(() => {
                        const pengumuman = getPengumuman(p.dataFormulir)
                        if (!pengumuman) return null
                        const isDiterima = pengumuman.status === 'DITERIMA'
                        return (
                          <div style={{
                            padding: 'var(--space-3) var(--space-4)',
                            borderRadius: 'var(--sp-radius-lg)',
                            background: isDiterima ? 'var(--success-50)' : 'var(--danger-50)',
                            border: `1px solid ${isDiterima ? 'var(--success-200)' : 'var(--danger-200)'}`,
                            fontSize: 'var(--sp-text-sm)',
                          }}>
                            <div style={{ fontWeight: 800, color: isDiterima ? 'var(--success-700)' : 'var(--danger-700)', marginBottom: 4 }}>
                              {isDiterima ? '🎉 Selamat! Anda Diterima' : '📋 Hasil Seleksi'}
                            </div>
                            <p style={{ color: isDiterima ? 'var(--success-700)' : 'var(--danger-700)', lineHeight: 1.5, fontSize: 'var(--sp-text-xs)' }}>
                              {pengumuman.pesan}
                            </p>
                            {pengumuman.jadwalDaftarUlang && (
                              <div style={{ marginTop: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--sp-text-xs)', fontWeight: 700, color: 'var(--primary-600)' }}>
                                📅 Jadwal Daftar Ulang: {new Date(pengumuman.jadwalDaftarUlang).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>
                            )}
                          </div>
                        )
                      })()}

                      {prog.workflow && (
                        <div className={styles.workflowSummary}>
                          <div>
                            <div className={styles.workflowLabel}>Tahap Saat Ini</div>
                            <div className={styles.workflowTitle}>{prog.workflow.label}</div>
                            <p className={styles.workflowDesc}>{prog.workflow.description}</p>
                          </div>
                          <div className={styles.workflowMeta}>
                            <span>{prog.workflow.flags.requiredDocumentsUploadedCount}/{prog.workflow.flags.requiredDocumentsTotal} berkas wajib</span>
                            <span>{prog.workflow.nextAction}</span>
                          </div>
                        </div>
                      )}

                      {/* ── Progress Bar + Persentase ── */}
                      <div className={styles.progressBarWrap}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                          <span style={{ fontSize: 'var(--sp-text-xs)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            Progress Pendaftaran
                          </span>
                          <span style={{ fontSize: 'var(--sp-text-xs)', fontWeight: 800, color: prog.pct === 100 ? 'var(--success-600)' : 'var(--primary-600)' }}>
                            {prog.pct}%
                          </span>
                        </div>
                        <div className={styles.progressBarTrack}>
                          <div
                            className={`${styles.progressBarFill} ${prog.pct === 100 ? styles.fillComplete : ''}`}
                            style={{ width: `${prog.pct}%` }}
                          />
                        </div>
                        {prog.workflow && prog.workflow.flags.hasStartedFullForm && !prog.workflow.flags.hasSubmittedFullForm && (
                          <div style={{ marginTop: 'var(--space-1)', fontSize: '10px', color: 'var(--warning-600)', fontWeight: 600 }}>
                            Formulir masih berupa draft — <Link href={`/app/ppdb/form-lengkap/${p.id}`} style={{ color: 'var(--primary-600)' }}>lanjutkan pengisian</Link>
                          </div>
                        )}
                      </div>

                      {/* ── Stepper 7 Tahap ── */}
                      <div className={styles.progressStepper}>
                        {prog.steps.map((step, idx) => (
                          <div key={step.key} className={styles.progressStep}>
                            <div className={styles.progressDotWrap}>
                              <div className={`${styles.progressDot} ${step.done ? styles.dotDone : step.active ? (step.rejected ? styles.dotRejected : styles.dotActive) : styles.dotPending}`}>
                                {step.done ? <CheckCircle2 size={11} /> : step.rejected ? '✕' : idx + 1}
                              </div>
                              {idx < prog.steps.length - 1 && (
                                <div className={`${styles.progressLine} ${step.done ? styles.lineDone : ''}`} />
                              )}
                            </div>
                            <span className={`${styles.progressLabel} ${step.active && !step.rejected ? styles.labelActive : step.done ? styles.labelDone : step.rejected ? styles.labelRejected : ''}`}>
                              {step.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* ── Footer: Status + Aksi ── */}
                      <div className={styles.cardBottom}>
                        <div className={styles.currentStatus}>
                          {prog.isSiswa
                            ? <><GraduationCap size={13} style={{ color: 'var(--success-500)' }} /><span style={{ color: 'var(--success-700)', fontWeight: 700 }}>Resmi terdaftar sebagai siswa 🎓</span></>
                            : prog.isDitolak
                            ? <span style={{ color: 'var(--danger-600)', fontWeight: 600 }}>Tidak lolos seleksi</span>
                            : <><span style={{ color: 'var(--text-tertiary)' }}>Tahap:</span><strong>{prog.currentLabel}</strong></>
                          }
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                          {/* Tombol Edit Data — selalu ada selama belum jadi siswa & belum ditolak */}
                          {!prog.isSiswa && !prog.isDitolak && prog.workflow?.flags.isRegistrationFeePaid && (
                            <Link
                              href={`/app/ppdb/form-lengkap/${p.id}`}
                              className={`${styles.btnAction} ${styles.btnSecondary}`}
                              style={{ padding: '0.4rem 0.875rem', fontSize: 'var(--sp-text-xs)', gap: 4 }}
                            >
                              <Pencil size={12} /> Edit Data
                            </Link>
                          )}
                          {/* CTA utama */}
                          {nextAction && (
                            <Link
                              href={nextAction.href}
                              className={`${styles.btnAction} ${styles[`btn${nextAction.variant.charAt(0).toUpperCase() + nextAction.variant.slice(1)}` as keyof typeof styles] || styles.btnPrimary}`}
                              style={{ padding: '0.4rem 1rem', fontSize: 'var(--sp-text-xs)', gap: 4 }}
                            >
                              {nextAction.label} <ArrowRight size={12} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── DASHBOARD WALI/SISWA ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <div className={styles.statsGrid}>
            <div className="stat-card danger animate-fade-in stagger-1">
              <div className="stat-icon"><FileText size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Tagihan Aktif</div>
                <div className="stat-value">Rp 1.500.000</div>
                <div className="stat-change danger"><AlertTriangle size={12} /> 2 belum lunas</div>
              </div>
            </div>
            <div className="stat-card success animate-fade-in stagger-2">
              <div className="stat-icon"><CreditCard size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Saldo Tabungan</div>
                <div className="stat-value">Rp 350.000</div>
                <div className="stat-change success"><TrendingUp size={12} /> +Rp 50.000</div>
              </div>
            </div>
            <div className="stat-card primary animate-fade-in stagger-3">
              <div className="stat-icon"><BookOpen size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Kelas</div>
                <div className="stat-value">XI IPA-1</div>
                <div className="stat-change success"><CheckCircle2 size={12} /> Semester Genap</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
            <div className="card animate-fade-in stagger-4">
              <div className="card-header">
                <h3 className="card-title">Tagihan Belum Lunas</h3>
                <button className="btn btn-ghost btn-sm">Riwayat <ArrowUpRight size={14} /></button>
              </div>
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--sp-text-sm)' }}>
                Semua tagihan sudah lunas.
              </div>
            </div>
            <div className="card animate-fade-in stagger-5">
              <div className="card-header">
                <h3 className="card-title">Pengumuman</h3>
                <Megaphone size={18} style={{ color: 'var(--primary-500)' }} />
              </div>
              <div style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--sp-text-xs)', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                Belum ada pengumuman terbaru.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
