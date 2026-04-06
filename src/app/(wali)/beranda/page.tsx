import { FileText, CreditCard, BookOpen, TrendingUp, ArrowUpRight, Calendar, AlertTriangle, Megaphone, Clock, CheckCircle2 } from 'lucide-react'

export default function BerandaWali() {
  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Selamat Datang, Bunda Siti! 👋</h1>
          <p className="subtitle">Portal informasi akademik dan keuangan anak Anda.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card danger animate-fade-in stagger-1">
          <div className="stat-icon"><FileText size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Tagihan Aktif</div>
            <div className="stat-value">Rp 1.500.000</div>
            <div className="stat-change down">
              <AlertTriangle size={12} /> 2 belum lunas
            </div>
          </div>
        </div>
        
        <div className="stat-card success animate-fade-in stagger-2">
          <div className="stat-icon"><CreditCard size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Saldo Tabungan</div>
            <div className="stat-value">Rp 350.000</div>
            <div className="stat-change up">
              <TrendingUp size={12} /> +Rp 50.000
            </div>
          </div>
        </div>

        <div className="stat-card primary animate-fade-in stagger-3">
          <div className="stat-icon"><BookOpen size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Kelas</div>
            <div className="stat-value">XI IPA-1</div>
            <div className="stat-change up">
              <CheckCircle2 size={12} /> Semester Genap
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 'var(--space-6)' }}>
        {/* Left: Tagihan Belum Lunas */}
        <div className="card animate-fade-in stagger-4">
          <div className="card-header">
            <h3 className="card-title">Tagihan Belum Lunas</h3>
            <button className="btn btn-ghost btn-sm">
              Riwayat <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Bill Item 1 */}
          <div style={{
            padding: 'var(--space-4)',
            background: 'var(--danger-50)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(239,68,68,0.1)',
            marginBottom: 'var(--space-3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>SPP Bulan November</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Calendar size={12} /> Jatuh tempo: 10 Nov 2026
                </p>
              </div>
              <span className="badge badge-danger">Belum Lunas</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontWeight: 800, fontSize: 'var(--text-lg)', fontFamily: 'var(--font-heading)', color: 'var(--danger-600)' }}>Rp 500.000</p>
              {/* Progress bar */}
              <div style={{ width: '100px', height: '6px', background: 'rgba(239,68,68,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '0%', height: '100%', background: 'var(--danger-500)', borderRadius: '3px' }} />
              </div>
            </div>
          </div>

          {/* Bill Item 2 */}
          <div style={{
            padding: 'var(--space-4)',
            background: 'var(--warning-50)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(245,158,11,0.1)',
            marginBottom: 'var(--space-4)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>SPP Bulan Desember</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Calendar size={12} /> Jatuh tempo: 10 Des 2026
                </p>
              </div>
              <span className="badge badge-warning">Mendekati</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontWeight: 800, fontSize: 'var(--text-lg)', fontFamily: 'var(--font-heading)', color: 'var(--warning-600)' }}>Rp 500.000</p>
              <div style={{ width: '100px', height: '6px', background: 'rgba(245,158,11,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '0%', height: '100%', background: 'var(--warning-500)', borderRadius: '3px' }} />
              </div>
            </div>
          </div>

          {/* Total & CTA */}
          <div style={{
            padding: 'var(--space-4)',
            background: 'linear-gradient(135deg, var(--primary-50), rgba(99,102,241,0.05))',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--primary-100)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Tagihan</p>
              <p style={{ fontWeight: 800, fontSize: 'var(--text-xl)', fontFamily: 'var(--font-heading)', color: 'var(--primary-700)' }}>Rp 1.000.000</p>
            </div>
            <button className="btn btn-primary">
              <CreditCard size={18} />
              Bayar Sekarang
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Pengumuman Card */}
          <div className="card animate-fade-in stagger-5">
            <div className="card-header">
              <h3 className="card-title">Pengumuman</h3>
              <Megaphone size={18} style={{ color: 'var(--primary-500)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gray-50)',
                borderLeft: '3px solid var(--primary-500)',
              }}>
                <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '2px' }}>Libur Semester Genap</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} /> 2 jam yang lalu
                </p>
              </div>
              <div style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gray-50)',
                borderLeft: '3px solid var(--accent-500)',
              }}>
                <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '2px' }}>Jadwal UAS Semester 2</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} /> 1 hari yang lalu
                </p>
              </div>
              <div style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gray-50)',
                borderLeft: '3px solid var(--success-500)',
              }}>
                <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '2px' }}>Pendaftaran Ekskul Baru</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} /> 3 hari yang lalu
                </p>
              </div>
            </div>
          </div>

          {/* Info Siswa Card */}
          <div className="card animate-fade-in stagger-5">
            <div className="card-header">
              <h3 className="card-title">Profil Siswa</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: 'var(--radius-xl)',
                background: 'linear-gradient(135deg, var(--primary-100), var(--accent-100))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--primary-600)',
                fontFamily: 'var(--font-heading)',
                boxShadow: '0 0 0 3px var(--primary-50)',
              }}>
                AN
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Ahmad Nurhadi</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>NIS: 2024001 · NISN: 0089765432</p>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: '4px' }}>
                  <span className="badge badge-primary">XI IPA-1</span>
                  <span className="badge badge-success">Aktif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
