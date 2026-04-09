'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import {
  User, Users, MapPin, FileText, Upload, CheckCircle2,
  AlertCircle, ChevronRight, ChevronLeft, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import styles from './page.module.css'

type Tab = 'siswa' | 'orangtua' | 'berkas'

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'siswa', label: 'Data Siswa', icon: <User size={15} /> },
  { key: 'orangtua', label: 'Data Orang Tua', icon: <Users size={15} /> },
  { key: 'berkas', label: 'Upload Berkas', icon: <FileText size={15} /> },
]

export default function FormLengkapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<Tab>('siswa')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [pendaftar, setPendaftar] = useState<any>(null)
  const [persyaratans, setPersyaratans] = useState<any[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({})

  const [siswaData, setSiswaData] = useState({
    nisn: '', jenisKelamin: 'LAKI_LAKI', tempatLahir: '',
    tanggalLahir: '', alamat: '', telepon: '',
  })

  const [orangtuaData, setOrangtuaData] = useState({
    namaAyah: '', pekerjaanAyah: '', teleponAyah: '',
    namaIbu: '', pekerjaanIbu: '', teleponIbu: '',
    email: '', penghasilan: '',
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/ppdb/pendaftar/${id}`)
        const json = await res.json()
        if (!res.ok) { toast.error(json.error); return }

        const p = json.data
        setPendaftar(p)
        setPersyaratans(p.periode?.persyaratanBerkas || [])

        // Pre-fill jika sudah ada data
        if (p.dataFormulir) {
          const f = p.dataFormulir as any
          setSiswaData({
            nisn: f.nisn || '', jenisKelamin: f.jenisKelamin || 'LAKI_LAKI',
            tempatLahir: f.tempatLahir || '', tanggalLahir: f.tanggalLahir || '',
            alamat: f.alamat || '', telepon: f.telepon || '',
          })
        }
        if (p.dataOrangtua) {
          const o = p.dataOrangtua as any
          setOrangtuaData({
            namaAyah: o.namaAyah || '', pekerjaanAyah: o.pekerjaanAyah || '',
            teleponAyah: o.teleponAyah || '', namaIbu: o.namaIbu || '',
            pekerjaanIbu: o.pekerjaanIbu || '', teleponIbu: o.teleponIbu || '',
            email: o.email || '', penghasilan: o.penghasilan || '',
          })
        }

        // Map berkas yang sudah diupload
        const uploaded: Record<string, string> = {}
        p.berkas?.forEach((b: any) => {
          if (b.fileUrl) uploaded[b.persyaratanId] = b.fileUrl
        })
        setUploadedFiles(uploaded)
      } catch {
        toast.error('Gagal memuat data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Cek apakah tagihan pendaftaran sudah lunas
  const isFormulirLunas = pendaftar?.tagihanPpdbs?.some(
    (t: any) => t.jenis === 'PENDAFTARAN' && t.status === 'LUNAS'
  )

  const handleFileUpload = async (persyaratanId: string, file: File) => {
    // Simulasi upload — di production gunakan S3/storage
    // Untuk sekarang simpan sebagai data URL (demo)
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setUploadedFiles(prev => ({ ...prev, [persyaratanId]: dataUrl }))
      toast.success('File berhasil dipilih')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')

    try {
      // 1. Submit data formulir
      const res = await fetch(`/api/ppdb/pendaftar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataFormulir: siswaData,
          dataOrangtua: orangtuaData,
        }),
      })

      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Gagal menyimpan'); setSubmitting(false); return }

      // 2. Submit berkas (jika ada)
      for (const [persyaratanId, fileUrl] of Object.entries(uploadedFiles)) {
        await fetch('/api/ppdb/berkas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pendaftarId: id, persyaratanId, fileUrl }),
        })
      }

      toast.success('Formulir berhasil dikirim! Menunggu verifikasi admin.')
      router.push('/beranda')
    } catch {
      setError('Gagal terhubung ke server')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader2 size={32} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--primary-600)' }} />
      </div>
    )
  }

  if (!isFormulirLunas) {
    return (
      <div style={{ maxWidth: 560, margin: '4rem auto', textAlign: 'center', padding: '0 var(--space-6)' }}>
        <div style={{ width: '4rem', height: '4rem', borderRadius: 'var(--radius-xl)', background: 'var(--warning-100)', color: 'var(--warning-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
          <AlertCircle size={28} />
        </div>
        <h2 style={{ fontWeight: 800, marginBottom: 'var(--space-3)' }}>Formulir Belum Terbuka</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          Anda perlu melunasi biaya pendaftaran terlebih dahulu sebelum mengisi formulir lengkap.
        </p>
        <Button onClick={() => router.push(`/ppdb/invoice/${id}`)}>
          Bayar Sekarang
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Stepper */}
      <div className={styles.stepper}>
        {[
          { label: 'Form Singkat', done: true },
          { label: 'Pembayaran', done: true },
          { label: 'Form Lengkap', active: true },
        ].map((s, idx) => (
          <div key={s.label} className={styles.stepWrapper}>
            <div className={s.active ? styles.stepActive : s.done ? styles.stepCompleted : styles.stepInactive}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>
                  {s.done ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <span className={styles.stepLabel}>{s.label}</span>
              </div>
            </div>
            {idx < 2 && <div className={`${styles.stepLine} ${s.done ? styles.stepLineCompleted : ''}`} />}
          </div>
        ))}
      </div>

      <div className={styles.card}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Formulir Pendaftaran Lengkap</h2>
          <p className={styles.cardSubtitle}>
            {pendaftar?.namaLengkap} — No. {pendaftar?.noPendaftaran}
          </p>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Tab: Data Siswa */}
        {activeTab === 'siswa' && (
          <div className={styles.formBody}>
            <div className={styles.section}>
              <div className={styles.sectionTitle}><User size={14} /> Identitas Calon Siswa</div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>NISN</label>
                  <input value={siswaData.nisn} onChange={e => setSiswaData(p => ({ ...p, nisn: e.target.value }))} className={styles.formInput} placeholder="Nomor Induk Siswa Nasional" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Jenis Kelamin</label>
                  <select value={siswaData.jenisKelamin} onChange={e => setSiswaData(p => ({ ...p, jenisKelamin: e.target.value }))} className={styles.formInput}>
                    <option value="LAKI_LAKI">Laki-laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tempat Lahir</label>
                  <input value={siswaData.tempatLahir} onChange={e => setSiswaData(p => ({ ...p, tempatLahir: e.target.value }))} className={styles.formInput} placeholder="Nama kota" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tanggal Lahir</label>
                  <input type="date" value={siswaData.tanggalLahir} onChange={e => setSiswaData(p => ({ ...p, tanggalLahir: e.target.value }))} className={styles.formInput} />
                </div>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label className={styles.formLabel}>Alamat Lengkap</label>
                  <textarea value={siswaData.alamat} onChange={e => setSiswaData(p => ({ ...p, alamat: e.target.value }))} className={styles.formInput} rows={3} placeholder="Alamat tempat tinggal saat ini" style={{ resize: 'vertical' }} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nomor Telepon</label>
                  <input value={siswaData.telepon} onChange={e => setSiswaData(p => ({ ...p, telepon: e.target.value }))} className={styles.formInput} placeholder="08xxxx" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Data Orang Tua */}
        {activeTab === 'orangtua' && (
          <div className={styles.formBody}>
            <div className={styles.section}>
              <div className={styles.sectionTitle}><Users size={14} /> Data Ayah</div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nama Ayah</label>
                  <input value={orangtuaData.namaAyah} onChange={e => setOrangtuaData(p => ({ ...p, namaAyah: e.target.value }))} className={styles.formInput} placeholder="Nama lengkap ayah" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Pekerjaan</label>
                  <input value={orangtuaData.pekerjaanAyah} onChange={e => setOrangtuaData(p => ({ ...p, pekerjaanAyah: e.target.value }))} className={styles.formInput} placeholder="Pekerjaan ayah" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Telepon Ayah</label>
                  <input value={orangtuaData.teleponAyah} onChange={e => setOrangtuaData(p => ({ ...p, teleponAyah: e.target.value }))} className={styles.formInput} placeholder="08xxxx" />
                </div>
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.sectionTitle}><Users size={14} /> Data Ibu</div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nama Ibu</label>
                  <input value={orangtuaData.namaIbu} onChange={e => setOrangtuaData(p => ({ ...p, namaIbu: e.target.value }))} className={styles.formInput} placeholder="Nama lengkap ibu" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Pekerjaan</label>
                  <input value={orangtuaData.pekerjaanIbu} onChange={e => setOrangtuaData(p => ({ ...p, pekerjaanIbu: e.target.value }))} className={styles.formInput} placeholder="Pekerjaan ibu" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Telepon Ibu</label>
                  <input value={orangtuaData.teleponIbu} onChange={e => setOrangtuaData(p => ({ ...p, teleponIbu: e.target.value }))} className={styles.formInput} placeholder="08xxxx" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email Keluarga</label>
                  <input type="email" value={orangtuaData.email} onChange={e => setOrangtuaData(p => ({ ...p, email: e.target.value }))} className={styles.formInput} placeholder="email@example.com" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Penghasilan Bulanan</label>
                  <select value={orangtuaData.penghasilan} onChange={e => setOrangtuaData(p => ({ ...p, penghasilan: e.target.value }))} className={styles.formInput}>
                    <option value="">Pilih rentang</option>
                    <option value="<1jt">Di bawah Rp 1.000.000</option>
                    <option value="1-3jt">Rp 1.000.000 – Rp 3.000.000</option>
                    <option value="3-5jt">Rp 3.000.000 – Rp 5.000.000</option>
                    <option value=">5jt">Di atas Rp 5.000.000</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Upload Berkas */}
        {activeTab === 'berkas' && (
          <div className={styles.formBody}>
            <div className={styles.section}>
              <div className={styles.sectionTitle}><FileText size={14} /> Berkas Persyaratan</div>
              {persyaratans.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontStyle: 'italic' }}>
                  Tidak ada berkas yang dipersyaratkan untuk gelombang ini.
                </p>
              ) : (
                <div className={styles.berkasGrid}>
                  {persyaratans.map((p: any) => {
                    const isUploaded = !!uploadedFiles[p.id]
                    return (
                      <div key={p.id} className={styles.berkasItem}>
                        <div className={styles.berkasInfo}>
                          <div className={styles.berkasName}>{p.nama}</div>
                          <div className={styles.berkasMeta}>{p.tipeFile || 'PDF, JPG, PNG'}</div>
                        </div>
                        <span className={p.isWajib ? styles.berkasWajib : styles.berkasOpsional}>
                          {p.isWajib ? 'Wajib' : 'Opsional'}
                        </span>
                        <div className={styles.berkasUpload}>
                          {isUploaded ? (
                            <span className={styles.uploadedBadge}>
                              <CheckCircle2 size={14} /> Terupload
                            </span>
                          ) : null}
                          <label className={styles.uploadBtn}>
                            <Upload size={13} />
                            {isUploaded ? 'Ganti' : 'Pilih File'}
                            <input
                              type="file"
                              accept={p.tipeFile || 'image/*,application/pdf'}
                              style={{ display: 'none' }}
                              onChange={e => {
                                const file = e.target.files?.[0]
                                if (file) handleFileUpload(p.id, file)
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={styles.formFooter}>
          <Button variant="secondary" onClick={() => router.push('/beranda')}>
            <ChevronLeft size={16} /> Simpan & Lanjutkan Nanti
          </Button>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {activeTab !== 'siswa' && (
              <Button variant="secondary" onClick={() => {
                const idx = TABS.findIndex(t => t.key === activeTab)
                setActiveTab(TABS[idx - 1].key)
              }}>
                Sebelumnya
              </Button>
            )}
            {activeTab !== 'berkas' ? (
              <Button onClick={() => {
                const idx = TABS.findIndex(t => t.key === activeTab)
                setActiveTab(TABS[idx + 1].key)
              }}>
                Berikutnya <ChevronRight size={16} />
              </Button>
            ) : (
              <Button onClick={handleSubmit} isLoading={submitting}>
                <CheckCircle2 size={16} /> Kirim Formulir
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
