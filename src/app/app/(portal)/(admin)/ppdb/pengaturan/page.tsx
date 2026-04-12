'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, Info, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import shared from '@/styles/page.module.css'

type PpdbSettings = {
  biayaPendaftaran: number
  biayaDaftarUlang: number
  jalurPendaftaran: string[]
  jurusanTersedia: string[]
  kuota: number
  catatan: string
}

type PpdbPeriodeWithPengaturan = {
  id: string
  nama: string
  isActive: boolean
  tahunAjaran?: {
    nama?: string | null
  } | null
  unit?: {
    nama?: string | null
  } | null
  pengaturan?: Partial<PpdbSettings> | null
}

export default function PengaturanPpdbPage() {
  const [periodes, setPeriodes] = useState<PpdbPeriodeWithPengaturan[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  // Per-periode settings state
  const [settings, setSettings] = useState<Record<string, PpdbSettings>>({})

  useEffect(() => {
    fetch('/api/ppdb/periode')
      .then(r => r.json())
      .then(j => {
        if (j.data) {
          setPeriodes(j.data)
          // Init settings dari data yang ada
          const init: Record<string, PpdbSettings> = {}
          j.data.forEach((p: PpdbPeriodeWithPengaturan) => {
            init[p.id] = {
              biayaPendaftaran: p.pengaturan?.biayaPendaftaran || 0,
              biayaDaftarUlang: p.pengaturan?.biayaDaftarUlang || 0,
              jalurPendaftaran: p.pengaturan?.jalurPendaftaran || ['Reguler'],
              jurusanTersedia: p.pengaturan?.jurusanTersedia || [],
              kuota: p.pengaturan?.kuota || 0,
              catatan: p.pengaturan?.catatan || '',
            }
          })
          setSettings(init)
          // Auto-expand periode aktif
          const aktif = j.data.find((p: PpdbPeriodeWithPengaturan) => p.isActive)
          if (aktif) setExpanded(aktif.id)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const updateSetting = <K extends keyof PpdbSettings>(periodeId: string, key: K, value: PpdbSettings[K]) => {
    setSettings(prev => ({ ...prev, [periodeId]: { ...prev[periodeId], [key]: value } }))
  }

  const handleSave = async (periodeId: string) => {
    setSaving(periodeId)
    try {
      const res = await fetch(`/api/ppdb/periode/${periodeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pengaturan: settings[periodeId] }),
      })
      const json = await res.json()
      if (!res.ok) toast.error(json.error || 'Gagal menyimpan')
      else toast.success('Pengaturan berhasil disimpan')
    } catch { toast.error('Terjadi kesalahan') }
    finally { setSaving(null) }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <Loader2 size={28} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--primary-600)' }} />
    </div>
  )

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div>
          <h1 className={shared.title}>Pengaturan PPDB</h1>
          <p className={shared.subtitle}>Konfigurasi biaya, kuota, dan jalur pendaftaran per gelombang</p>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-5)', background: 'var(--primary-50)', border: '1px solid var(--primary-100)', borderRadius: 'var(--sp-radius-lg)', fontSize: 'var(--sp-text-sm)', color: 'var(--primary-700)' }}>
        <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
        <p>Pengaturan biaya di sini akan otomatis digunakan saat pendaftar mengisi form singkat. Biaya formulir juga bisa diatur langsung di halaman <strong>Gelombang PPDB</strong>.</p>
      </div>

      {periodes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
          Belum ada gelombang PPDB. Buat gelombang terlebih dahulu.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {periodes.map(p => {
            const isOpen = expanded === p.id
            const s = settings[p.id] || {}

            return (
              <div key={p.id} style={{ background: 'var(--bg-secondary)', border: `1px solid ${p.isActive ? 'var(--primary-200)' : 'var(--border-color)'}`, borderRadius: 'var(--sp-radius-xl)', overflow: 'hidden', boxShadow: 'var(--sp-shadow-xs)' }}>
                {/* Accordion Header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : p.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-5) var(--space-6)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 'var(--space-4)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--sp-radius-lg)', background: p.isActive ? 'var(--primary-100)' : 'var(--bg-tertiary)', color: p.isActive ? 'var(--primary-600)' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Settings size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--sp-text-sm)', color: 'var(--text-primary)' }}>{p.nama}</div>
                      <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-tertiary)' }}>
                        {p.tahunAjaran?.nama}{p.unit ? ` • ${p.unit.nama}` : ''}
                        {' — '}Biaya formulir: <strong>Rp {Number(s.biayaPendaftaran || 0).toLocaleString('id-ID')}</strong>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    {p.isActive && <span className="badge badge-success">Aktif</span>}
                    {isOpen ? <ChevronUp size={16} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-tertiary)' }} />}
                  </div>
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div style={{ padding: 'var(--space-6)', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

                    {/* Biaya */}
                    <div>
                      <div style={{ fontSize: 'var(--sp-text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-color)' }}>
                        Biaya Pendaftaran
                      </div>
                      <div className={shared.formRow}>
                        <div className={shared.formGroup}>
                          <label className={shared.formLabel}>Biaya Formulir (Pendaftaran)</label>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: 'var(--sp-text-sm)', fontWeight: 700, color: 'var(--text-secondary)' }}>Rp</span>
                            <input
                              type="number" min="0"
                              value={s.biayaPendaftaran || ''}
                              onChange={e => updateSetting(p.id, 'biayaPendaftaran', Number(e.target.value))}
                              className={shared.formInput}
                              style={{ paddingLeft: '2.5rem' }}
                              placeholder="150000"
                            />
                          </div>
                          <span className="form-hint">Ditagihkan saat form singkat disubmit</span>
                        </div>
                        <div className={shared.formGroup}>
                          <label className={shared.formLabel}>Biaya Daftar Ulang</label>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: 'var(--sp-text-sm)', fontWeight: 700, color: 'var(--text-secondary)' }}>Rp</span>
                            <input
                              type="number" min="0"
                              value={s.biayaDaftarUlang || ''}
                              onChange={e => updateSetting(p.id, 'biayaDaftarUlang', Number(e.target.value))}
                              className={shared.formInput}
                              style={{ paddingLeft: '2.5rem' }}
                              placeholder="500000"
                            />
                          </div>
                          <span className="form-hint">Ditagihkan setelah dinyatakan diterima</span>
                        </div>
                      </div>
                    </div>

                    {/* Kuota & Catatan */}
                    <div>
                      <div style={{ fontSize: 'var(--sp-text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-color)' }}>
                        Kuota & Informasi
                      </div>
                      <div className={shared.formRow}>
                        <div className={shared.formGroup}>
                          <label className={shared.formLabel}>Kuota Penerimaan</label>
                          <input
                            type="number" min="0"
                            value={s.kuota || ''}
                            onChange={e => updateSetting(p.id, 'kuota', Number(e.target.value))}
                            className={shared.formInput}
                            placeholder="0 = tidak terbatas"
                          />
                        </div>
                        <div className={shared.formGroup}>
                          <label className={shared.formLabel}>Jalur Pendaftaran</label>
                          <input
                            type="text"
                            value={(s.jalurPendaftaran || []).join(', ')}
                            onChange={e => updateSetting(p.id, 'jalurPendaftaran', e.target.value.split(',').map((v: string) => v.trim()).filter(Boolean))}
                            className={shared.formInput}
                            placeholder="Reguler, Prestasi, Afirmasi"
                          />
                          <span className="form-hint">Pisahkan dengan koma</span>
                        </div>
                      </div>
                      <div className={shared.formGroup} style={{ marginTop: 'var(--space-4)' }}>
                        <label className={shared.formLabel}>Catatan / Informasi Tambahan</label>
                        <textarea
                          value={s.catatan || ''}
                          onChange={e => updateSetting(p.id, 'catatan', e.target.value)}
                          className={shared.formInput}
                          rows={3}
                          placeholder="Informasi tambahan yang ditampilkan ke pendaftar..."
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                    </div>

                    {/* Save Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
                      <Button
                        leftIcon={<Save size={15} />}
                        onClick={() => handleSave(p.id)}
                        isLoading={saving === p.id}
                      >
                        Simpan Pengaturan
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
