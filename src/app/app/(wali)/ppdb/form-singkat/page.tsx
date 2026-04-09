'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, ChevronRight, GraduationCap, School, AlertCircle, Loader2 } from 'lucide-react'
import { submitFormSingkat } from '@/actions/ppdb-actions'
import styles from './page.module.css'

const STEPS = [
  { step: 1, label: 'Form Singkat' },
  { step: 2, label: 'Pembayaran' },
  { step: 3, label: 'Form Lengkap' },
]

export default function FormSingkatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedPeriodeId = searchParams.get('periode')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [periodes, setPeriodes] = useState<any[]>([])
  const [fetchingPeriodes, setFetchingPeriodes] = useState(true)
  const [activePeriode, setActivePeriode] = useState(selectedPeriodeId || '')

  useEffect(() => {
    async function fetchPeriodes() {
      try {
        const res = await fetch('/api/ppdb/periode?active=true')
        const json = await res.json()
        const data = json.data || []
        setPeriodes(data)
        // Auto-select first if none selected
        if (!activePeriode && data.length > 0) setActivePeriode(data[0].id)
      } catch { console.error('Failed to fetch periodes') }
      finally { setFetchingPeriodes(false) }
    }
    fetchPeriodes()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const periodeId = formData.get('periode_id') as string
    const periode = periodes.find(p => p.id === periodeId)
    if (periode) formData.append('unit_id', periode.unitId)

    try {
      const result = await submitFormSingkat(formData)
      if (result.error) { setError(result.error); setLoading(false) }
      else router.push('/beranda')
    } catch {
      setError('Terjadi kesalahan sistem')
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* Stepper */}
      <div className={styles.stepper}>
        {STEPS.map((s, idx) => (
          <div key={s.step} className={styles.stepWrapper}>
            <div className={s.step === 1 ? styles.stepActive : styles.stepInactive}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>{s.step}</div>
                <span className={styles.stepLabel}>{s.label}</span>
              </div>
            </div>
            {idx < STEPS.length - 1 && <div className={styles.stepLine} />}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Pendaftaran Baru</h2>
          <p className={styles.cardSubtitle}>Lengkapi data awal untuk mendapatkan nomor pendaftaran.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorAlert}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Nama Lengkap */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <User size={14} /> Nama Lengkap Calon Siswa
            </label>
            <input
              name="nama_lengkap"
              type="text"
              placeholder="Masukkan nama lengkap sesuai akta kelahiran"
              className={styles.formInput}
              required
              disabled={loading}
            />
          </div>

          {/* Pilih Gelombang */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <GraduationCap size={14} /> Pilih Gelombang Pendaftaran
            </label>

            {fetchingPeriodes ? (
              <div className={styles.loadingState}>
                <Loader2 size={24} className={styles.spinner} style={{ color: 'var(--primary-600)' }} />
              </div>
            ) : (
              <div className={styles.periodeGrid}>
                {periodes.map((p) => (
                  <label
                    key={p.id}
                    className={`${styles.periodeOption} ${activePeriode === p.id ? styles.periodeOptionActive : ''}`}
                    onClick={() => setActivePeriode(p.id)}
                  >
                    <input
                      type="radio"
                      name="periode_id"
                      value={p.id}
                      checked={activePeriode === p.id}
                      onChange={() => setActivePeriode(p.id)}
                      required
                      style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    />
                    <div className={styles.periodeIcon}>
                      <School size={22} />
                    </div>
                    <div className={styles.periodeInfo}>
                      <div className={styles.periodeName}>{p.nama}</div>
                      <div className={styles.periodeMeta}>
                        {p.unit?.nama} • TP {p.tahunAjaran?.nama}
                      </div>
                    </div>
                    <div className={styles.periodeRadio}>
                      {activePeriode === p.id && <div className={styles.periodeRadioDot} />}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading || fetchingPeriodes} className={styles.submitBtn}>
            {loading
              ? <Loader2 size={20} className={styles.spinner} />
              : <><span>Lanjutkan Pembayaran</span><ChevronRight size={20} /></>
            }
          </button>
        </form>
      </div>
    </div>
  )
}
