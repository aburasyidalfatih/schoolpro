
export default function DashboardPage() {
  const stats = [
    { label: 'Total Siswa', value: '1.247', icon: '👨‍🎓', variant: 'primary' },
    { label: 'Tagihan Belum Lunas', value: 'Rp 45.6 Jt', icon: '📋', variant: 'warning' },
    { label: 'Pembayaran Hari Ini', value: 'Rp 8.2 Jt', icon: '💳', variant: 'success' },
    { label: 'Saldo Tabungan', value: 'Rp 124.3 Jt', icon: '🏦', variant: 'accent' },
  ]

  const recentPayments = [
    { siswa: 'Ahmad Fauzi', kelas: 'X-IPA-1', jenis: 'SPP', nominal: 'Rp 500.000', status: 'Lunas', waktu: '08:30' },
    { siswa: 'Siti Nurhaliza', kelas: 'XI-IPS-2', jenis: 'Buku', nominal: 'Rp 350.000', status: 'Lunas', waktu: '09:15' },
    { siswa: 'Budi Santoso', kelas: 'XII-IPA-3', jenis: 'SPP', nominal: 'Rp 500.000', status: 'Pending', waktu: '10:00' },
    { siswa: 'Dewi Anggraini', kelas: 'X-IPS-1', jenis: 'Kegiatan', nominal: 'Rp 200.000', status: 'Lunas', waktu: '10:30' },
    { siswa: 'Rizky Pratama', kelas: 'XI-IPA-1', jenis: 'SPP', nominal: 'Rp 500.000', status: 'Lunas', waktu: '11:00' },
  ]

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Selamat datang kembali! Berikut ringkasan hari ini.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm">📅 Hari Ini</button>
          <button className="btn btn-primary btn-sm">+ Pembayaran Baru</button>
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
            </div>
          </div>
        ))}
      </div>

      {/* Recent Payments */}
      <div className="card animate-fade-in stagger-5">
        <div className="card-header">
          <h3 className="card-title">Transaksi Pembayaran Terbaru</h3>
          <button className="btn btn-ghost btn-sm">Lihat Semua →</button>
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
                  <td style={{ fontWeight: 600 }}>{p.nominal}</td>
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
