'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import {
  User, Users, FileText, Upload, CheckCircle2,
  AlertCircle, ChevronRight, ChevronLeft, Loader2, Save
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import styles from './page.module.css'

type Tab = 'siswa' | 'orangtua' | 'berkas'

type FormulirSiswaValue = {
  nisn?: string
  jenisKelamin?: string
  tempatLahir?: string
  tanggalLahir?: string
  alamat?: string
  telepon?: string
}

type FormulirOrangtuaValue = {
  namaAyah?: string
  pekerjaanAyah?: string
  teleponAyah?: string
  namaIbu?: string
  pekerjaanIbu?: string
  teleponIbu?: string
  email?: string
  penghasilan?: string
}

type PpdbPersyaratan = {
  id: string
  nama: string
  isWajib: boolean
  tipeFile?: string | null
}

type PpdbBerkas = {
  persyaratanId: string
  fileUrl?: string | null
}

type PpdbTagihan = {
  jenis: string
  status: string
}

type PpdbPendaftarDetail = {
  id: string
  namaLengkap: string
  noPendaftaran: string
  dataFormulir?: FormulirSiswaValue | null
  dataOrangtua?: FormulirOrangtuaValue | null
  periode?: {
    persyaratanBerkas?: PpdbPersyaratan[]
  } | null
  berkas?: PpdbBerkas[]
  tagihanPpdbs?: PpdbTagihan[]
  workflow?: {
    label: string
    description: string
    nextAction: string
    flags: {
      hasStartedFullForm: boolean
      hasSubmittedFullForm: boolean
      requiredDocumentsUploadedCount: number
      requiredDocumentsTotal: number
    }
  } | null
}

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'siswa', label: 'Data Siswa', icon: <User size={15} /> },
  { key: 'orangtua', label: 'Data Orang Tua', icon: <Users size={15} /> },
  { key: 'berkas', label: 'Upload Berkas', icon: <FileText size={15} /> },
]

const TAB_COPY: Record<Tab, { title: string; desc: string }> = {
  siswa: {
    title: 'Lengkapi identitas calon siswa',
    desc: 'Field utama seperti NISN, jenis kelamin, tempat lahir, tanggal lahir, dan alamat akan diperiksa saat kirim final.',
  },
  orangtua: {
    title: 'Isi data kontak orang tua',
    desc: 'Nama dan nomor telepon ayah serta ibu diperlukan agar admin bisa meninjau formulir dengan lengkap.',
  },
  berkas: {
    title: 'Upload semua berkas wajib',
    desc: 'Anda bisa simpan draft terlebih dahulu. Gunakan kirim final jika data dan berkas sudah siap direview admin.',
  },
}

export default function FormLengkapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<Tab>('siswa')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [pendaftar, setPendaftar] = useState<PpdbPendaftarDetail | null>(null)
  const [persyaratans, setPersyaratans] = useState<PpdbPersyaratan[]>([])
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

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/ppdb/pendaftar/${id}`)
      const json = await res.json()
      if (!res.ok) { toast.error(json.error); return }

      const p = json.data
      setPendaftar(p)
      setPersyaratans(p.periode?.persyaratanBerkas || [])

      if (p.dataFormulir) {
        const f = p.dataFormulir as FormulirSiswaValue
        setSiswaData({
          nisn: f.nisn || '', jenisKelamin: f.jenisKelamin || 'LAKI_LAKI',
          tempatLahir: f.tempatLahir || '', tanggalLahir: f.tanggalLahir || '',
          alamat: f.alamat || '', telepon: f.telepon || '',
        })
      }
      if (p.dataOrangtua) {
        const o = p.dataOrangtua as FormulirOrangtuaValue
        setOrangtuaData({
          namaAyah: o.namaAyah || '', pekerjaanAyah: o.pekerjaanAyah || '',
          teleponAyah: o.teleponAyah || '', namaIbu: o.namaIbu || '',
          pekerjaanIbu: o.pekerjaanIbu || '', teleponIbu: o.teleponIbu || '',
          email: o.email || '', penghasilan: o.penghasilan || '',
        })
      }

      const uploaded: Record<string, string> = {}
      p.berkas?.forEach((b: PpdbBerkas) => {
        if (b.fileUrl) uploaded[b.persyaratanId] = b.fileUrl
      })
      setUploadedFiles(uploaded)
    } catch {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Cek apakah tagihan pendaftaran sudah lunas
  const isFormulirLunas = pendaftar?.tagihanPpdbs?.some(
    (t) => t.jenis === 'PENDAFTARAN' && t.status === 'LUNAS'
  )
  const workflow = pendaftar?.workflow
  const readinessSummary = workflow ? [
    {
      label: 'Form lengkap',
      value: workflow.flags.hasSubmittedFullForm ? 'Sudah dikirim' : workflow.flags.hasStartedFullForm ? 'Masih draft' : 'Belum dimulai',
    },
    {
      label: 'Berkas wajib',
      value: `${workflow.flags.requiredDocumentsUploadedCount}/${workflow.flags.requiredDocumentsTotal} terupload`,
    },
  ] : []
  const activeTabCopy = TAB_COPY[activeTab]
  const lifecycleSteps = [
    {
      key: 'registrasi',
      label: 'Registrasi Awal',
      status: 'done' as const,
      note: 'Form singkat sudah dibuat.',
    },
    {
      key: 'pembayaran',
      label: 'Pembayaran Formulir',
      status: isFormulirLunas ? 'done' as const : 'active' as const,
      note: isFormulirLunas ? 'Pembayaran formulir sudah valid.' : 'Tagihan formulir masih perlu diselesaikan.',
    },
    {
      key: 'formulir',
      label: 'Form Lengkap',
      status: workflow?.flags.hasSubmittedFullForm ? 'done' as const : 'active' as const,
      note: workflow?.flags.hasSubmittedFullForm
        ? 'Form lengkap sudah dikirim.'
        : workflow?.flags.hasStartedFullForm
          ? 'Masih berupa draft.'
          : 'Belum mulai diisi.',
    },
    {
      key: 'review',
      label: 'Review Admin',
      status: workflow?.flags.hasSubmittedFullForm ? 'active' as const : 'pending' as const,
      note: workflow?.flags.hasSubmittedFullForm
        ? 'Admin akan meninjau setelah kirim final.'
        : 'Tahap ini aktif setelah kirim final.',
    },
  ]
  const requiredDocumentsLeft = workflow
    ? Math.max(0, workflow.flags.requiredDocumentsTotal - workflow.flags.requiredDocumentsUploadedCount)
    : 0

  const handleFileUpload = async (persyaratanId: string, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    setUploading(persyaratanId)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error || 'Gagal upload'); return }
      setUploadedFiles(prev => ({ ...prev, [persyaratanId]: json.url }))
      toast.success('File berhasil diupload')
    } catch {
      toast.error('Gagal mengupload file')
    } finally {
      setUploading(null)
    }
  }

  const syncUploadedFiles = async () => {
    for (const [persyaratanId, fileUrl] of Object.entries(uploadedFiles)) {
      const res = await fetch('/api/ppdb/berkas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendaftarId: id, persyaratanId, fileUrl }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Gagal menyimpan berkas')
      }
    }
  }

  const handleSubmit = async (submitMode: 'draft' | 'final') => {
    setSubmitting(true)
    setError('')

    try {
      await syncUploadedFiles()

      const res = await fetch(`/api/ppdb/pendaftar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataFormulir: siswaData,
          dataOrangtua: orangtuaData,
          submitMode,
        }),
      })

      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Gagal menyimpan'); setSubmitting(false); return }

      toast.success(json.message || (submitMode === 'final' ? 'Formulir berhasil dikirim' : 'Draft berhasil disimpan'))
      await fetchData()

      if (submitMode === 'final') {
        router.push('/app/beranda')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal terhubung ke server')
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
        <div style={{ width: '4rem', height: '4rem', borderRadius: 'var(--sp-radius-xl)', background: 'var(--warning-100)', color: 'var(--warning-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
          <AlertCircle size={28} />
        </div>
        <h2 style={{ fontWeight: 800, marginBottom: 'var(--space-3)' }}>Formulir Belum Terbuka</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          Anda perlu melunasi biaya pendaftaran terlebih dahulu sebelum mengisi formulir lengkap.
        </p>
        <Button onClick={() => router.push(`/app/ppdb/invoice/${id}`)}>
          Bayar Sekarang
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Stepper */}
      <div className={styles.stepper}>
        {lifecycleSteps.map((step, idx) => (
          <div key={step.key} className={styles.stepWrapper}>
            <div className={step.status === 'active' ? styles.stepActive : step.status === 'done' ? styles.stepCompleted : styles.stepInactive}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>
                  {step.status === 'done' ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <span className={styles.stepLabel}>{step.label}</span>
                <span className={styles.stepNote}>{step.note}</span>
              </div>
            </div>
            {idx < lifecycleSteps.length - 1 && (
              <div className={`${styles.stepLine} ${step.status === 'done' ? styles.stepLineCompleted : ''}`} />
            )}
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

        {workflow && (
          <div className={styles.workflowBanner}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
              <div style={{ maxWidth: 520 }}>
                <div style={{ fontSize: 'var(--sp-text-xs)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary-600)', marginBottom: 6 }}>
                  Tahap Saat Ini
                </div>
                <div style={{ fontWeight: 800, fontSize: 'var(--sp-text-base)', marginBottom: 4 }}>{workflow.label}</div>
                <div style={{ fontSize: 'var(--sp-text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
                  {workflow.description}
                </div>
                <div style={{ fontSize: 'var(--sp-text-sm)', fontWeight: 700, color: 'var(--primary-600)' }}>
                  Langkah berikutnya: {workflow.nextAction}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', minWidth: 200 }}>
                {readinessSummary.map((item) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', fontSize: 'var(--sp-text-sm)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={styles.helperBanner}>
          <div>
            <strong>{activeTabCopy.title}</strong>
            <p>{activeTabCopy.desc}</p>
          </div>
          {workflow && (
            <div className={styles.helperStats}>
              <span>{workflow.flags.requiredDocumentsUploadedCount}/{workflow.flags.requiredDocumentsTotal} berkas wajib</span>
              <span>{requiredDocumentsLeft > 0 ? `${requiredDocumentsLeft} berkas wajib belum lengkap` : 'Berkas wajib sudah lengkap'}</span>
            </div>
          )}
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
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--sp-text-sm)', fontStyle: 'italic' }}>
                  Tidak ada berkas yang dipersyaratkan untuk gelombang ini.
                </p>
              ) : (
                <div className={styles.berkasGrid}>
                  {persyaratans.map((p) => {
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
                          <label className={styles.uploadBtn} style={{ opacity: uploading === p.id ? 0.6 : 1, pointerEvents: uploading === p.id ? 'none' : 'auto' }}>
                            {uploading === p.id ? <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Upload size={13} />}
                            {uploading === p.id ? 'Mengupload...' : isUploaded ? 'Ganti' : 'Pilih File'}
                            <input
                              type="file"
                              accept={p.tipeFile || 'image/*,application/pdf'}
                              style={{ display: 'none' }}
                              disabled={!!uploading}
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
          <div className={styles.footerInfo}>
            <Button variant="secondary" onClick={() => router.push('/app/beranda')}>
              <ChevronLeft size={16} /> Kembali ke Beranda
            </Button>
            <p className={styles.footerNote}>
              Simpan draft bila Anda masih melengkapi data. Gunakan kirim final jika formulir dan berkas sudah siap direview admin.
            </p>
          </div>
          <div className={styles.footerActions}>
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
              <>
                <Button variant="secondary" onClick={() => handleSubmit('draft')} isLoading={submitting}>
                  <Save size={16} /> Simpan Draft Dulu
                </Button>
                <Button onClick={() => handleSubmit('final')} isLoading={submitting}>
                  <CheckCircle2 size={16} /> Kirim Final untuk Review
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
