'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, FileWarning, CreditCard, PiggyBank, Plus, CalendarDays, ArrowUpRight, Receipt, Users, BarChart3, Loader2, TriangleAlert } from 'lucide-react'
import Link from 'next/link'

type StudentQuota = {
  activeStudents: number
  studentCapacity: number
  remainingSlots: number
  usagePercent: number
  warningLevel: 'NONE' | 'NORMAL' | 'WARNING_80' | 'WARNING_90' | 'FULL'
} | null

type DashboardStat = {
  label: string
  value: string
  variant: string
}

type DashboardData = {
  stats?: DashboardStat[]
  recentPayments?: Array<{
    siswa: string
    kelas: string
    jenis: string
    nominal: string
    status: string
    waktu: string
  }>
  studentQuota?: StudentQuota
} | null

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

function formatToday() {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date())
}

function getQuotaNotice(quota: StudentQuota) {
  if (!quota || !['WARNING_80', 'WARNING_90', 'FULL'].includes(quota.warningLevel)) {
    return null
  }

  if (quota.warningLevel === 'FULL') {
    return {
      title: 'Kuota siswa aktif sudah penuh',
      description: `Saat ini ${quota.activeStudents}/${quota.studentCapacity} slot terpakai. Penambahan siswa aktif baru akan ditolak sampai ada slot tersedia atau paket di-upgrade.`,
      tone: 'danger',
      cta: 'Upgrade langganan',
    } as const
  }

  if (quota.warningLevel === 'WARNING_90') {
    return {
      title: 'Kuota siswa aktif hampir penuh',
      description: `Tersisa ${quota.remainingSlots} slot dari ${quota.studentCapacity}. Segera siapkan upgrade agar input siswa baru tidak terhambat.`,
      tone: 'warning',
      cta: 'Cek paket',
    } as const
  }

  return {
    title: 'Penggunaan kuota sudah melewati 80%',
    description: `Sisa kuota tinggal ${quota.remainingSlots} slot. Ini saat yang tepat untuk menyiapkan upgrade paket berikutnya.`,
    tone: 'warning',
    cta: 'Lihat langganan',
  } as const
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/keuangan/dashboard/stats')
      const json = await res.json()
      if (json.stats) {
        setData(json)
      }
    } catch (e) {
      console.error('Error fetching dashboard stats', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const stats = data?.stats || [
    { label: 'Total Siswa', value: '...', icon: <GraduationCap size={24} />, variant: 'primary' },
    { label: 'Tagihan Belum Lunas', value: '...', icon: <FileWarning size={24} />, variant: 'warning' },
    { label: 'Pembayaran Hari Ini', value: '...', icon: <CreditCard size={24} />, variant: 'success' },
    { label: 'Saldo Tabungan', value: '...', icon: <PiggyBank size={24} />, variant: 'accent' },
  ]

  const recentPayments = data?.recentPayments || []
  const quotaNotice = getQuotaNotice(data?.studentQuota || null)

  const quickActions = [
    { label: 'Buat Tagihan', href: '/app/tagihan', icon: <Plus size={18} />, color: 'var(--primary-600)', bg: 'var(--primary-50)' },
    { label: 'Data Siswa', href: '/app/data-master/siswa', icon: <Users size={18} />, color: 'var(--accent-600)', bg: 'var(--accent-50)' },
    { label: 'Kategori Tagihan', href: '/app/data-master/kategori-tagihan', icon: <Receipt size={18} />, color: 'var(--success-600)', bg: 'var(--success-50)' },
    { label: 'Pengaturan', href: '/app/pengaturan/umum', icon: <BarChart3 size={18} />, color: 'var(--warning-600)', bg: 'var(--warning-50)' },
  ]

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>{getGreeting()}, Admin! 👋</h1>
          <p className="subtitle">{formatToday()} — Berikut ringkasan aktivitas hari ini.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchStats}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CalendarDays size={16} />}
            Refresh
          </button>
          <Link href="/app/tagihan" className="btn btn-primary btn-sm">
            <Plus size={16} />
            Buat Tagihan
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
        {stats.map((stat: DashboardStat, i: number) => (
          <div
            key={stat.label}
            className={`stat-card ${stat.variant} animate-fade-in stagger-${i + 1}`}
          >
            <div className="stat-icon">
              {stat.label === 'Total Siswa' && <GraduationCap size={24} />}
              {stat.label === 'Tagihan Belum Lunas' && <FileWarning size={24} />}
              {stat.label === 'Pembayaran Hari Ini' && <CreditCard size={24} />}
              {stat.label === 'Saldo Tabungan' && <PiggyBank size={24} />}
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {quotaNotice ? (
        <div
          className="card animate-fade-in stagger-5"
          style={{
            marginBottom: 'var(--space-6)',
            border: quotaNotice.tone === 'danger' ? '1px solid var(--danger-200)' : '1px solid var(--warning-200)',
            background: quotaNotice.tone === 'danger' ? 'var(--danger-50)' : 'var(--warning-50)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', flex: '1 1 420px', minWidth: 0 }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: quotaNotice.tone === 'danger' ? 'rgba(220, 38, 38, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                  color: quotaNotice.tone === 'danger' ? 'var(--danger-600)' : 'var(--warning-600)',
                  flexShrink: 0,
                }}
              >
                <TriangleAlert size={20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 className="card-title" style={{ marginBottom: '0.35rem' }}>{quotaNotice.title}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {quotaNotice.description}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
                  <span className="badge badge-gray">
                    {data?.studentQuota?.activeStudents || 0}/{data?.studentQuota?.studentCapacity || 0} siswa aktif
                  </span>
                  <span className={quotaNotice.tone === 'danger' ? 'badge badge-danger' : 'badge badge-warning'}>
                    {data?.studentQuota?.usagePercent || 0}% terpakai
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', alignItems: 'flex-end', flex: '0 0 auto' }}>
              <Link href="/app/pengaturan/langganan" className="btn btn-primary btn-sm">
                {quotaNotice.cta}
              </Link>
              <Link href="/app/data-master/siswa" className="btn btn-secondary btn-sm">
                Lihat Data Siswa
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Quick Actions */}
      <div className="card animate-fade-in stagger-5" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <h3 className="card-title">Aksi Cepat</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.875rem 1rem',
                background: action.bg,
                textDecoration: 'none',
                borderRadius: 'var(--sp-radius-lg)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--sp-text-sm)',
                fontWeight: 600,
                color: action.color,
              }}
            >
              <span style={{
                width: '36px', height: '36px', borderRadius: 'var(--sp-radius-md)',
                background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--sp-shadow-sm)',
              }}>{action.icon}</span>
              {action.label}
              <ArrowUpRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="card animate-fade-in stagger-5">
        <div className="card-header">
          <h3 className="card-title">Transaksi Pembayaran Terbaru</h3>
          <Link href="/app/pembayaran" className="btn btn-ghost btn-sm">
            Lihat Semua
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Siswa</th>
                <th>Kelas</th>
                <th>Jenis</th>
                <th>Nominal</th>
                <th>Status</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.length === 0 ? (
                <tr>
                   <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Belum ada transaksi pembayaran.
                   </td>
                </tr>
              ) : (
                recentPayments.map((p, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{p.siswa}</td>
                    <td><span className="badge badge-gray">{p.kelas}</span></td>
                    <td>{p.jenis}</td>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{p.nominal}</td>
                    <td>
                      <span className={`badge badge-success`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-tertiary)' }}>{p.waktu}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
