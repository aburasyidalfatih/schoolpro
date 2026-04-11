'use client'

import { useState } from 'react'
import { Search, CheckCircle2, Clock, XCircle, AlertCircle, Loader2 } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  MENUNGGU:      { label: 'Menunggu Verifikasi', color: 'var(--warning-600)', icon: <Clock size={20} /> },
  TERVERIFIKASI: { label: 'Berkas Terverifikasi', color: 'var(--primary-600)', icon: <AlertCircle size={20} /> },
  DITERIMA:      { label: 'Diterima', color: 'var(--success-600)', icon: <CheckCircle2 size={20} /> },
  DITOLAK:       { label: 'Tidak Diterima', color: 'var(--danger-600)', icon: <XCircle size={20} /> },
}

export default function CekStatusPage() {
  const [noPendaftaran, setNoPendaftaran] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCek = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noPendaftaran.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`/api/ppdb/cek-status?no=${encodeURIComponent(noPendaftaran.trim())}`)
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Data tidak ditemukan'); return }
      setResult(json.data)
    } catch {
      setError('Gagal terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

  const statusCfg = result ? STATUS_CONFIG[result.status] || STATUS_CONFIG.MENUNGGU : null

  return (
    <div style={{ maxWidth: 560, margin: '3rem auto', padding: '0 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 8 }}>Cek Status Pendaftaran</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Masukkan nomor pendaftaran untuk melihat status terkini.
        </p>
      </div>

      <form onSubmit={handleCek} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <input
          value={noPendaftaran}
          onChange={e => setNoPendaftaran(e.target.value)}
          placeholder="Contoh: PPDB-2026-0001"
          style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--sp-radius-lg)', border: '1.5px solid var(--border-color)', fontSize: '0.9rem', outline: 'none' }}
          required
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.75rem 1.25rem', background: 'var(--primary-600)', color: 'white', border: 'none', borderRadius: 'var(--sp-radius-lg)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
        >
          {loading ? <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Search size={18} />}
          Cek
        </button>
      </form>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--danger-50)', border: '1px solid var(--danger-200)', borderRadius: 'var(--sp-radius-lg)', color: 'var(--danger-700)', fontSize: '0.875rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {result && statusCfg && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--sp-radius-xl)', overflow: 'hidden' }}>
          {/* Status Banner */}
          <div style={{ padding: '1.5rem', background: `color-mix(in srgb, ${statusCfg.color} 10%, white)`, borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ color: statusCfg.color }}>{statusCfg.icon}</div>
            <div>
              <div style={{ fontWeight: 800, color: statusCfg.color, fontSize: '1rem' }}>{statusCfg.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                No. Pendaftaran: <strong>{result.noPendaftaran}</strong>
              </div>
            </div>
          </div>

          {/* Detail */}
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Nama Calon Siswa', value: result.namaLengkap },
              { label: 'Gelombang', value: result.periode?.nama },
              { label: 'Unit / Jenjang', value: result.periode?.unit?.nama || 'Umum' },
              { label: 'Tanggal Daftar', value: new Date(result.tanggalDaftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                <span style={{ fontWeight: 600 }}>{f.value || '-'}</span>
              </div>
            ))}

            {/* Pengumuman jika ada */}
            {result.pengumuman && (
              <div style={{ marginTop: '0.5rem', padding: '0.875rem', background: result.pengumuman.status === 'DITERIMA' ? 'var(--success-50)' : 'var(--danger-50)', borderRadius: 'var(--sp-radius-lg)', fontSize: '0.8rem', color: result.pengumuman.status === 'DITERIMA' ? 'var(--success-700)' : 'var(--danger-700)' }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Pesan dari Sekolah:</div>
                <p>{result.pengumuman.pesan}</p>
                {result.pengumuman.jadwalDaftarUlang && (
                  <div style={{ marginTop: 6, fontWeight: 700 }}>
                    📅 Jadwal Daftar Ulang: {new Date(result.pengumuman.jadwalDaftarUlang).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
