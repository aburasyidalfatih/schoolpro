'use client'

import { GraduationCap, FileWarning, CreditCard, PiggyBank, TrendingUp, TrendingDown, Plus, CalendarDays, ArrowUpRight, Receipt, Users, BarChart3 } from 'lucide-react'

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

export default function DashboardPage() {
  const stats = [
    { label: 'Total Siswa', value: '1.247', icon: <GraduationCap size={24} />, variant: 'primary', change: '+12', changeDir: 'up' },
    { label: 'Tagihan Belum Lunas', value: 'Rp 45.6 Jt', icon: <FileWarning size={24} />, variant: 'warning', change: '-8%', changeDir: 'down' },
    { label: 'Pembayaran Hari Ini', value: 'Rp 8.2 Jt', icon: <CreditCard size={24} />, variant: 'success', change: '+23%', changeDir: 'up' },
    { label: 'Saldo Tabungan', value: 'Rp 124.3 Jt', icon: <PiggyBank size={24} />, variant: 'accent', change: '+5%', changeDir: 'up' },
  ]

  const recentPayments = [
    { siswa: 'Ahmad Fauzi', kelas: 'X-IPA-1', jenis: 'SPP', nominal: 'Rp 500.000', status: 'Lunas', waktu: '08:30' },
    { siswa: 'Siti Nurhaliza', kelas: 'XI-IPS-2', jenis: 'Buku', nominal: 'Rp 350.000', status: 'Lunas', waktu: '09:15' },
    { siswa: 'Budi Santoso', kelas: 'XII-IPA-3', jenis: 'SPP', nominal: 'Rp 500.000', status: 'Pending', waktu: '10:00' },
    { siswa: 'Dewi Anggraini', kelas: 'X-IPS-1', jenis: 'Kegiatan', nominal: 'Rp 200.000', status: 'Lunas', waktu: '10:30' },
    { siswa: 'Rizky Pratama', kelas: 'XI-IPA-1', jenis: 'SPP', nominal: 'Rp 500.000', status: 'Lunas', waktu: '11:00' },
  ]

  const quickActions = [
    { label: 'Pembayaran Baru', icon: <Plus size={18} />, color: 'var(--primary-600)', bg: 'var(--primary-50)' },
    { label: 'Input Transaksi', icon: <Receipt size={18} />, color: 'var(--success-600)', bg: 'var(--success-50)' },
    { label: 'Data Siswa', icon: <Users size={18} />, color: 'var(--accent-600)', bg: 'var(--accent-50)' },
    { label: 'Laporan', icon: <BarChart3 size={18} />, color: 'var(--warning-600)', bg: 'var(--warning-50)' },
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
          <button className="btn btn-secondary btn-sm">
            <CalendarDays size={16} />
            Hari Ini
          </button>
          <button className="btn btn-primary btn-sm">
            <Plus size={16} />
            Pembayaran Baru
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`stat-card ${stat.variant} animate-fade-in stagger-${i + 1}`}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              <div className={`stat-change ${stat.changeDir === 'up' ? 'up' : 'down'}`}>
                {stat.changeDir === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card animate-fade-in stagger-5" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <h3 className="card-title">Aksi Cepat</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
          {quickActions.map((action) => (
            <button
              key={action.label}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.875rem 1rem',
                background: action.bg,
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: action.color,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <span style={{
                width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}>{action.icon}</span>
              {action.label}
              <ArrowUpRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
            </button>
          ))}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="card animate-fade-in stagger-5">
        <div className="card-header">
          <h3 className="card-title">Transaksi Pembayaran Terbaru</h3>
          <button className="btn btn-ghost btn-sm">
            Lihat Semua
            <ArrowUpRight size={14} />
          </button>
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
              {recentPayments.map((p, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{p.siswa}</td>
                  <td><span className="badge badge-gray">{p.kelas}</span></td>
                  <td>{p.jenis}</td>
                  <td style={{ fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{p.nominal}</td>
                  <td>
                    <span className={`badge ${p.status === 'Lunas' ? 'badge-success' : 'badge-warning'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-tertiary)' }}>{p.waktu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
