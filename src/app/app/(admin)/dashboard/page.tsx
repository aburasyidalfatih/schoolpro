'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, FileWarning, CreditCard, PiggyBank, Plus, CalendarDays, ArrowUpRight, Receipt, Users, BarChart3, Loader2 } from 'lucide-react'
import Link from 'next/link'

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
  const [data, setData] = useState<any>(null)
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

  const quickActions = [
    { label: 'Buat Tagihan', href: '/tagihan', icon: <Plus size={18} />, color: 'var(--primary-600)', bg: 'var(--primary-50)' },
    { label: 'Data Siswa', href: '/data-master/siswa', icon: <Users size={18} />, color: 'var(--accent-600)', bg: 'var(--accent-50)' },
    { label: 'Kategori Tagihan', href: '/data-master/kategori-tagihan', icon: <Receipt size={18} />, color: 'var(--success-600)', bg: 'var(--success-50)' },
    { label: 'Pengaturan', href: '/pengaturan/umum', icon: <BarChart3 size={18} />, color: 'var(--warning-600)', bg: 'var(--warning-50)' },
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
        {stats.map((stat: any, i: number) => (
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
                recentPayments.map((p: any, i: number) => (
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
