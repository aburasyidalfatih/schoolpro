import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, BadgeDollarSign, Building2, CreditCard, ShieldCheck, Sparkles, TimerReset, UsersRound } from 'lucide-react'
import { auth } from '@/lib/auth'
import { ensureDefaultPlans, isSuperAdmin } from '@/lib/super-admin'
import { getSuperAdminDashboardData } from '@/features/super-admin/lib/dashboard'
import shared from '@/styles/page.module.css'
import styles from './page.module.css'

const roadmap = [
  'Tenant management lintas sekolah',
  'Plan dan feature access control',
  'Subscription lifecycle, quota guard, dan billing manual',
  'Audit log platform dan support tooling internal',
]

const quickActions = [
  { label: 'Review Subscription Orders', href: '/super-admin/subscription-orders', desc: 'Verifikasi pembayaran tenant yang masuk.' },
  { label: 'Kelola Tenant', href: '/super-admin/tenants', desc: 'Lihat status tenant, paket, dan sinkronisasi subscription.' },
  { label: 'Kelola Plans', href: '/super-admin/plans', desc: 'Atur paket publik, harga tahunan, dan kapasitas siswa.' },
]

function formatCurrency(value: number) {
  return `Rp${new Intl.NumberFormat('id-ID').format(value)}`
}

function formatDate(value: Date | null) {
  if (!value) return '-'
  return value.toLocaleDateString('id-ID')
}

function getStatusLabel(status: string) {
  if (status === 'WAITING_VERIFICATION') return 'Menunggu Verifikasi'
  if (status === 'VERIFIED') return 'Terverifikasi'
  if (status === 'EXPIRED') return 'Expired'
  if (status === 'SUSPENDED') return 'Suspended'
  if (status === 'TRIAL') return 'Trial'
  return status
}

function getStatusClass(status: string) {
  if (status === 'WAITING_VERIFICATION' || status === 'VERIFIED' || status === 'TRIAL') return shared.statusPending
  if (status === 'EXPIRED' || status === 'SUSPENDED' || status === 'REJECTED') return shared.statusInactive
  return shared.statusActive
}

export default async function SuperAdminDashboardPage() {
  const session = await auth()
  const role = typeof session?.user === 'object' && session?.user && 'role' in session.user ? session.user.role : undefined
  if (!isSuperAdmin(session)) {
    if (role === 'WALI' || role === 'SISWA' || role === 'USER') {
      redirect('/app/beranda')
    }
    if (role) {
      redirect('/app/dashboard')
    }
    redirect('/app/login')
  }

  await ensureDefaultPlans()
  const data = await getSuperAdminDashboardData()

  const stats = [
    {
      label: 'Total Tenant',
      value: data.stats.totalTenants,
      desc: `${data.stats.newLast30Days} tenant baru dalam 30 hari terakhir.`,
      icon: Building2,
    },
    {
      label: 'Tenant Berlangganan',
      value: data.stats.tenantsWithSubscription,
      desc: `${data.stats.activeTenants} tenant aktif dan ${data.stats.trialTenants} tenant trial.`,
      icon: CreditCard,
    },
    {
      label: 'Kapasitas Siswa',
      value: new Intl.NumberFormat('id-ID').format(data.stats.totalStudentCapacity),
      desc: 'Total slot siswa aktif dari seluruh subscription tenant yang sudah tersinkron.',
      icon: UsersRound,
    },
    {
      label: 'Tenant Perlu Atensi',
      value: data.stats.suspendedTenants + data.stats.expiredTenants,
      desc: `${data.stats.suspendedTenants} suspend dan ${data.stats.expiredTenants} expired.`,
      icon: TimerReset,
    },
  ]

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div className={shared.headerLeft}>
          <h2 className={shared.title}>Super Admin Dashboard</h2>
          <p className={shared.subtitle}>
            Fondasi awal panel internal SchoolPro untuk mengelola tenant, paket, dan operasional SaaS.
          </p>
        </div>
      </div>

      <section className={styles.heroCard}>
        <div>
          <div className={styles.heroBadge}>
            <Sparkles size={14} />
            Phase 2: Billing Control
          </div>
          <h3 className={styles.heroTitle}>Panel ini sekarang sudah memegang tenant, subscription, quota siswa, dan verifikasi billing.</h3>
          <p className={styles.heroDesc}>
            Fondasi plan slot siswa, subscription tenant, order billing manual, resubmission pembayaran, dan guard kuota
            siswa aktif sudah tersedia di development. Dashboard ini mulai menampilkan metrik operasional intinya.
          </p>
        </div>
        <div className={styles.heroMetrics}>
          <div className={styles.heroMetric}>
            <span>Jatuh tempo 14 hari</span>
            <strong>{data.stats.expiringSoon}</strong>
          </div>
          <div className={styles.heroMetric}>
            <span>Plan aktif</span>
            <strong>{data.stats.plansCount}</strong>
          </div>
          <div className={styles.heroMetric}>
            <span>Feature override</span>
            <strong>{data.stats.featureOverrides}</strong>
          </div>
        </div>
      </section>

      <section className={styles.statsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <article key={stat.label} className={styles.statCard}>
              <div className={styles.statIcon}>
                <Icon size={18} />
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
              <p className={styles.statDesc}>{stat.desc}</p>
            </article>
          )
        })}
      </section>

      <section className={styles.contentGrid}>
        <article className={styles.panelCard}>
          <h3 className={styles.panelTitle}>Quick Actions</h3>
          <div className={styles.quickActionList}>
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className={styles.quickActionItem}>
                <div>
                  <strong>{action.label}</strong>
                  <span>{action.desc}</span>
                </div>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </article>

        <article className={styles.panelCard}>
          <h3 className={styles.panelTitle}>Scope Berikutnya</h3>
          <ul className={styles.roadmapList}>
            {roadmap.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className={styles.panelCard}>
          <h3 className={styles.panelTitle}>Ringkasan Billing</h3>
          <div className={styles.decisionList}>
            <div>
              <strong className={styles.decisionTitle}>Plan publik berbasis slot siswa</strong>
              <span>{data.stats.plansCount} plan aktif tersedia untuk kontrol super admin.</span>
            </div>
            <div>
              <strong className={styles.decisionTitle}>Billing tenant self-service</strong>
              <span>Tenant memilih paket dari halaman langganan, lalu super admin memverifikasi order pembayaran.</span>
            </div>
            <div>
              <strong className={styles.decisionTitle}>Quota siswa aktif</strong>
              <span>Total kapasitas seluruh tenant saat ini {new Intl.NumberFormat('id-ID').format(data.stats.totalStudentCapacity)} slot siswa.</span>
            </div>
          </div>
        </article>

        <article className={styles.panelCard}>
          <h3 className={styles.panelTitle}>Keputusan Arsitektur</h3>
          <div className={styles.decisionList}>
            <div>
              <strong className={styles.decisionTitle}>Akses platform terpisah</strong>
              <span>Role `SUPER_ADMIN` diarahkan ke `/super-admin/dashboard` dan tidak bercampur dengan area tenant `/app/*`.</span>
            </div>
            <div>
              <strong className={styles.decisionTitle}>Source of truth langganan</strong>
              <span>`TenantSubscription` memegang status aktif, kapasitas siswa, dan masa berlaku subscription tenant.</span>
            </div>
            <div>
              <strong className={styles.decisionTitle}>Kontrol fitur tetap fleksibel</strong>
              <span>Plan berbayar bisa full access, sedangkan feature override tetap dipakai untuk kasus khusus internal.</span>
            </div>
          </div>
        </article>

        <article className={styles.panelCard}>
          <h3 className={styles.panelTitle}>Aktivitas Terkini</h3>
          <div className={styles.activityList}>
            {data.recentAuditLogs.length === 0 ? (
              <div className={styles.emptyActivity}>Belum ada audit log platform.</div>
            ) : (
              data.recentAuditLogs.map((item) => (
                <div key={item.id} className={styles.activityItem}>
                  <strong>{item.summary}</strong>
                  <span>{item.actorName || 'System'} · {item.createdAt.toLocaleString('id-ID')}</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className={styles.panelCard}>
          <h3 className={styles.panelTitle}>Subscription Perlu Atensi</h3>
          <div className={styles.activityList}>
            {data.expiringSubscriptions.length === 0 ? (
              <div className={styles.emptyActivity}>Belum ada subscription yang jatuh tempo dalam 14 hari ke depan.</div>
            ) : (
              data.expiringSubscriptions.map((item) => (
                <Link
                  key={item.id}
                  href={`/super-admin/tenants?search=${encodeURIComponent(item.slug)}`}
                  className={`${styles.activityItem} ${styles.linkCard}`}
                >
                  <div className={styles.itemRow}>
                    <strong>{item.nama}</strong>
                    <span className={`${shared.statusBadge} ${getStatusClass(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  <span>{item.planName} · {item.studentCapacity} siswa · jatuh tempo {formatDate(item.endsAt)}</span>
                </Link>
              ))
            )}
          </div>
        </article>

        <article className={styles.panelCard}>
          <h3 className={styles.panelTitle}>Order Billing Menunggu Verifikasi</h3>
          <div className={styles.activityList}>
            {data.pendingOrders.length === 0 ? (
              <div className={styles.emptyActivity}>Belum ada order billing yang menunggu verifikasi.</div>
            ) : (
              data.pendingOrders.map((item) => (
                <Link
                  key={item.id}
                  href={`/super-admin/subscription-orders?status=${encodeURIComponent(item.status)}&search=${encodeURIComponent(item.tenant.slug)}`}
                  className={`${styles.activityItem} ${styles.linkCard}`}
                >
                  <div className={styles.itemRow}>
                    <strong>{item.tenant.nama} · {item.targetPlan.name}</strong>
                    <span className={`${shared.statusBadge} ${getStatusClass(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  <span>{formatCurrency(item.amount)} · {item.studentCapacity} siswa · masuk {formatDate(item.submittedAt)}</span>
                </Link>
              ))
            )}
          </div>
        </article>

        <article className={styles.panelCard}>
          <h3 className={styles.panelTitle}>Operasional Saat Ini</h3>
          <div className={styles.operationalList}>
            <div className={styles.operationalItem}>
              <div className={styles.operationalIcon}>
                <BadgeDollarSign size={16} />
              </div>
              <div>
                <strong>{data.stats.expiringSoon} subscription mendekati jatuh tempo</strong>
                <span>Siapkan follow-up renewal atau verifikasi upgrade bila tenant perlu tambah slot siswa.</span>
              </div>
            </div>
            <div className={styles.operationalItem}>
              <div className={styles.operationalIcon}>
                <ShieldCheck size={16} />
              </div>
              <div>
                <strong>{data.stats.featureOverrides} feature override aktif</strong>
                <span>Pertahankan override hanya untuk kebutuhan support, beta feature, atau pengecualian bisnis.</span>
              </div>
            </div>
            <div className={styles.operationalItem}>
              <div className={styles.operationalIcon}>
                <CreditCard size={16} />
              </div>
              <div>
                <strong>{data.stats.tenantsWithSubscription} tenant sudah tersinkron ke subscription</strong>
                <span>Sinkronisasi ini menjadi dasar quota enforcement, billing inbox, dan monitoring subscription lintas sekolah.</span>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}
