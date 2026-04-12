'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, User, Users, FileText, CheckCircle2, XCircle,
  AlertCircle, RefreshCw, Loader2, ExternalLink, Megaphone,
  Receipt, Calendar, Send, CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import shared from '@/styles/page.module.css'

type WorkflowInfo = {
  state: string
  label: string
  description: string
  nextAction: string
  flags: {
    isRegistrationFeePaid: boolean
    hasStartedFullForm: boolean
    hasSubmittedFullForm: boolean
    requiredDocumentsUploadedCount: number
    requiredDocumentsApprovedCount: number
    requiredDocumentsTotal: number
    hasRejectedRequiredDocument: boolean
    isEligibleForVerification: boolean
    isEligibleForAcceptance: boolean
    hasReenrollmentBill: boolean
    isReenrollmentPaid: boolean
    isSyncedToStudent: boolean
  }
}

type PpdbBerkas = {
  id: string
  status: string
  catatan?: string | null
  fileUrl?: string | null
  persyaratanId: string
  persyaratan: {
    nama: string
  }
}

type PpdbPembayaran = {
  id: string
  status: string
  nominal: number | string
  buktiUrl?: string | null
}

type PpdbTagihan = {
  id: string
  jenis: string
  nominal: number | string
  status: string
  pembayarans?: PpdbPembayaran[]
}

type PpdbPengumuman = {
  status: string
  pesan: string
  jadwalDaftarUlang?: string | null
  tanggalPengumuman: string
}

type PpdbFormulir = {
  nisn?: string
  jenisKelamin?: string
  tempatLahir?: string
  tanggalLahir?: string
  telepon?: string
  alamat?: string
  pengumuman?: PpdbPengumuman
}

type PpdbOrangtua = {
  namaAyah?: string
  pekerjaanAyah?: string
  namaIbu?: string
  pekerjaanIbu?: string
  email?: string
  penghasilan?: string
}

type PpdbKelas = {
  id: string
  nama: string
  unit?: {
    nama?: string
  } | null
}

type PpdbDetail = {
  id: string
  namaLengkap: string
  noPendaftaran: string
  status: string
  dataFormulir?: PpdbFormulir | null
  dataOrangtua?: PpdbOrangtua | null
  berkas?: PpdbBerkas[]
  tagihanPpdbs?: PpdbTagihan[]
  workflow?: WorkflowInfo
  periode?: {
    nama?: string
    pengaturan?: {
      biayaDaftarUlang?: number | string
    } | null
  } | null
}

const STATUS_OPTIONS = [
  { value: 'MENUNGGU', label: 'Menunggu' },
  { value: 'TERVERIFIKASI', label: 'Terverifikasi' },
  { value: 'DITERIMA', label: 'Diterima' },
  { value: 'DITOLAK', label: 'Ditolak' },
]

const WORKFLOW_TONE: Record<string, { color: string; background: string; border: string }> = {
  REGISTRATION_CREATED: { color: 'var(--primary-700)', background: 'var(--primary-50)', border: 'var(--primary-200)' },
  PAYMENT_PENDING: { color: 'var(--warning-700)', background: 'var(--warning-50)', border: 'var(--warning-200)' },
  PAYMENT_REVIEW: { color: 'var(--warning-700)', background: 'var(--warning-50)', border: 'var(--warning-200)' },
  FULL_FORM_UNLOCKED: { color: 'var(--primary-700)', background: 'var(--primary-50)', border: 'var(--primary-200)' },
  FULL_FORM_IN_PROGRESS: { color: 'var(--warning-700)', background: 'var(--warning-50)', border: 'var(--warning-200)' },
  SUBMITTED_FOR_REVIEW: { color: 'var(--primary-700)', background: 'var(--primary-50)', border: 'var(--primary-200)' },
  VERIFIED_READY_FOR_DECISION: { color: 'var(--primary-700)', background: 'var(--primary-50)', border: 'var(--primary-200)' },
  REJECTED: { color: 'var(--danger-700)', background: 'var(--danger-50)', border: 'var(--danger-200)' },
  ACCEPTED_AWAITING_REENROLLMENT_BILL: { color: 'var(--success-700)', background: 'var(--success-50)', border: 'var(--success-200)' },
  REENROLLMENT_PAYMENT_PENDING: { color: 'var(--warning-700)', background: 'var(--warning-50)', border: 'var(--warning-200)' },
  READY_TO_SYNC: { color: 'var(--success-700)', background: 'var(--success-50)', border: 'var(--success-200)' },
  SYNCED_TO_STUDENT: { color: 'var(--success-700)', background: 'var(--success-50)', border: 'var(--success-200)' },
}

export default function DetailPendaftarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [data, setData] = useState<PpdbDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [berkasUpdates, setBerkasUpdates] = useState<Record<string, { status: string; catatan: string }>>({})
  const [showSinkronModal, setShowSinkronModal] = useState(false)
  const [showPengumumanModal, setShowPengumumanModal] = useState(false)
  const [showTagihanModal, setShowTagihanModal] = useState(false)
  const [kelasId, setKelasId] = useState('')
  const [kelases, setKelases] = useState<PpdbKelas[]>([])
  const [pengumumanForm, setPengumumanForm] = useState({ status: 'DITERIMA', pesan: '', jadwalDaftarUlang: '' })
  const [nominalDaftarUlang, setNominalDaftarUlang] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/ppdb/pendaftar/${id}`)
      const json = await res.json()
      if (json.data) {
        const detail = json.data as PpdbDetail
        setData(detail)
        setNewStatus(detail.status)
        // Init berkas updates
        const init: Record<string, { status: string; catatan: string }> = {}
        detail.berkas?.forEach((b) => { init[b.id] = { status: b.status, catatan: b.catatan || '' } })
        setBerkasUpdates(init)
      }
    } catch { toast.error('Gagal memuat data') }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => {
    fetch('/api/data-master/kelas').then(r => r.json()).then(j => setKelases((j.data || []) as PpdbKelas[]))
  }, [])

  const handleVerifikasiBayar = async (pembayaranId: string, approve: boolean) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/ppdb/pembayaran/${pembayaranId}/verifikasi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve }),
      })
      const json = await res.json()
      if (!res.ok) toast.error(json.error)
      else { toast.success(json.message); fetchData() }
    } catch { toast.error('Terjadi kesalahan') }
    finally { setSubmitting(false) }
  }

  const handleVerifikasi = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/ppdb/pendaftar/${id}/verifikasi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          berkasUpdates: Object.entries(berkasUpdates).map(([berkasId, v]) => ({ berkasId, ...v })),
        }),
      })
      const json = await res.json()
      if (!res.ok) toast.error(json.error)
      else { toast.success('Verifikasi berhasil disimpan'); fetchData() }
    } catch { toast.error('Terjadi kesalahan') }
    finally { setSubmitting(false) }
  }

  const handleSinkron = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/ppdb/pendaftar/${id}/sinkron`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kelasId: kelasId || null }),
      })
      const json = await res.json()
      if (!res.ok) toast.error(json.error)
      else {
        toast.success(json.message)
        setShowSinkronModal(false)
        router.push('/app/ppdb/pendaftar')
      }
    } catch { toast.error('Terjadi kesalahan') }
    finally { setSubmitting(false) }
  }

  const handleKirimPengumuman = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/ppdb/pendaftar/${id}/pengumuman`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pengumumanForm),
      })
      const json = await res.json()
      if (!res.ok) toast.error(json.error)
      else { toast.success(json.message); setShowPengumumanModal(false); fetchData() }
    } catch { toast.error('Terjadi kesalahan') }
    finally { setSubmitting(false) }
  }

  const handleGenerateTagihanDaftarUlang = async () => {
    if (!nominalDaftarUlang || Number(nominalDaftarUlang) <= 0) {
      toast.error('Masukkan nominal yang valid')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/ppdb/pendaftar/${id}/tagihan-daftar-ulang`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nominal: Number(nominalDaftarUlang) }),
      })
      const json = await res.json()
      if (!res.ok) toast.error(json.error)
      else { toast.success(json.message); setShowTagihanModal(false); fetchData() }
    } catch { toast.error('Terjadi kesalahan') }
    finally { setSubmitting(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <Loader2 size={32} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--primary-600)' }} />
    </div>
  )

  if (!data) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Data tidak ditemukan.</div>

  const formulir = data.dataFormulir || {}
  const orangtua = data.dataOrangtua || {}
  const workflow = data.workflow
  const workflowTone = workflow ? (WORKFLOW_TONE[workflow.state] || WORKFLOW_TONE.SUBMITTED_FOR_REVIEW) : null
  const readinessItems = workflow ? [
    { label: 'Biaya formulir', value: workflow.flags.isRegistrationFeePaid ? 'Lunas' : 'Belum lunas', ok: workflow.flags.isRegistrationFeePaid },
    { label: 'Form lengkap', value: workflow.flags.hasSubmittedFullForm ? 'Sudah dikirim' : workflow.flags.hasStartedFullForm ? 'Masih draft' : 'Belum dimulai', ok: workflow.flags.hasSubmittedFullForm },
    { label: 'Berkas wajib', value: `${workflow.flags.requiredDocumentsApprovedCount}/${workflow.flags.requiredDocumentsTotal} diterima`, ok: workflow.flags.requiredDocumentsTotal === 0 || workflow.flags.requiredDocumentsApprovedCount === workflow.flags.requiredDocumentsTotal },
    { label: 'Daftar ulang', value: !workflow.flags.hasReenrollmentBill ? 'Belum dibuat' : workflow.flags.isReenrollmentPaid ? 'Lunas' : 'Belum lunas', ok: !workflow.flags.hasReenrollmentBill || workflow.flags.isReenrollmentPaid },
    { label: 'Sinkron siswa', value: workflow.flags.isSyncedToStudent ? 'Sudah sinkron' : 'Belum sinkron', ok: workflow.flags.isSyncedToStudent },
  ] : []
  const blockers = workflow ? [
    !workflow.flags.isRegistrationFeePaid ? 'Tagihan formulir belum lunas.' : null,
    !workflow.flags.hasSubmittedFullForm ? 'Form lengkap belum siap direview.' : null,
    workflow.flags.hasRejectedRequiredDocument ? 'Masih ada berkas wajib yang ditolak.' : null,
    workflow.flags.requiredDocumentsUploadedCount < workflow.flags.requiredDocumentsTotal ? 'Masih ada berkas wajib yang belum diupload.' : null,
    workflow.flags.hasReenrollmentBill && !workflow.flags.isReenrollmentPaid ? 'Tagihan daftar ulang belum lunas.' : null,
  ].filter(Boolean) as string[] : []

  return (
    <div className={shared.container}>
      {/* Header */}
      <div className={shared.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link href="/app/ppdb/pendaftar" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-tertiary)', textDecoration: 'none', fontSize: 'var(--sp-text-sm)', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Kembali
          </Link>
          <div>
            <h1 className={shared.title}>{data.namaLengkap}</h1>
            <p className={shared.subtitle}>{data.noPendaftaran} — {data.periode?.nama}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {/* Kirim Pengumuman — tersedia jika sudah TERVERIFIKASI */}
          {['TERVERIFIKASI', 'DITERIMA', 'DITOLAK'].includes(data.status) && (
            <Button
              variant="secondary"
              leftIcon={<Megaphone size={15} />}
              onClick={() => {
                setPengumumanForm({
                  status: data.status === 'DITOLAK' ? 'DITOLAK' : 'DITERIMA',
                  pesan: '',
                  jadwalDaftarUlang: '',
                })
                setShowPengumumanModal(true)
              }}
            >
              Kirim Pengumuman
            </Button>
          )}
          {/* Generate Tagihan Daftar Ulang */}
          {data.status === 'DITERIMA' && !data.tagihanPpdbs?.find((t) => t.jenis === 'DAFTAR_ULANG') && (
            <Button
              variant="secondary"
              leftIcon={<Receipt size={15} />}
              onClick={() => {
                const biayaDaftarUlang = data.periode?.pengaturan?.biayaDaftarUlang || ''
                setNominalDaftarUlang(String(biayaDaftarUlang))
                setShowTagihanModal(true)
              }}
            >
              Buat Tagihan Daftar Ulang
            </Button>
          )}
          {data.status === 'DITERIMA' && (
            <Button variant="success" leftIcon={<RefreshCw size={15} />} onClick={() => setShowSinkronModal(true)}>
              Sinkronkan ke Siswa
            </Button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Left: Data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* Data Siswa */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><User size={16} /> Data Calon Siswa</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              {[
                { label: 'Nama Lengkap', value: data.namaLengkap },
                { label: 'NISN', value: formulir.nisn || '—' },
                { label: 'Jenis Kelamin', value: formulir.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : formulir.jenisKelamin === 'PEREMPUAN' ? 'Perempuan' : '—' },
                { label: 'Tempat Lahir', value: formulir.tempatLahir || '—' },
                { label: 'Tanggal Lahir', value: formulir.tanggalLahir ? new Date(formulir.tanggalLahir).toLocaleDateString('id-ID') : '—' },
                { label: 'Telepon', value: formulir.telepon || '—' },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--sp-text-sm)' }}>{f.value}</div>
                </div>
              ))}
              {formulir.alamat && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Alamat</div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--sp-text-sm)' }}>{formulir.alamat}</div>
                </div>
              )}
            </div>
          </div>

          {/* Data Orang Tua */}
          {Object.keys(orangtua).length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={16} /> Data Orang Tua</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                {[
                  { label: 'Nama Ayah', value: orangtua.namaAyah || '—' },
                  { label: 'Pekerjaan Ayah', value: orangtua.pekerjaanAyah || '—' },
                  { label: 'Nama Ibu', value: orangtua.namaIbu || '—' },
                  { label: 'Pekerjaan Ibu', value: orangtua.pekerjaanIbu || '—' },
                  { label: 'Email', value: orangtua.email || '—' },
                  { label: 'Penghasilan', value: orangtua.penghasilan || '—' },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--sp-text-sm)' }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Berkas */}
          {(data.berkas?.length ?? 0) > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={16} /> Berkas Persyaratan</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {(data.berkas ?? []).map((b) => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--sp-radius-lg)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--sp-text-sm)' }}>{b.persyaratan.nama}</div>
                      {b.fileUrl && (
                        <a href={b.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--primary-600)', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          Lihat File <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', minWidth: 200 }}>
                      <select
                        className="form-input"
                        style={{ fontSize: 'var(--sp-text-xs)', padding: '0.375rem 0.75rem' }}
                        value={berkasUpdates[b.id]?.status || b.status}
                        onChange={e => setBerkasUpdates(prev => ({ ...prev, [b.id]: { ...prev[b.id], status: e.target.value } }))}
                      >
                        <option value="MENUNGGU">Menunggu</option>
                        <option value="DITERIMA">Diterima</option>
                        <option value="DITOLAK">Ditolak</option>
                      </select>
                      {berkasUpdates[b.id]?.status === 'DITOLAK' && (
                        <input
                          className="form-input"
                          style={{ fontSize: 'var(--sp-text-xs)', padding: '0.375rem 0.75rem' }}
                          placeholder="Alasan penolakan..."
                          value={berkasUpdates[b.id]?.catatan || ''}
                          onChange={e => setBerkasUpdates(prev => ({ ...prev, [b.id]: { ...prev[b.id], catatan: e.target.value } }))}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Aksi Verifikasi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', position: 'sticky', top: 'calc(var(--header-height) + var(--space-6))' }}>
          {workflow && workflowTone && (
            <div className="card" style={{ borderColor: workflowTone.border }}>
              <div className="card-header">
                <h3 className="card-title">Workflow PPDB</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--sp-radius-lg)', background: workflowTone.background, border: `1px solid ${workflowTone.border}` }}>
                  <div style={{ fontSize: 'var(--sp-text-xs)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: workflowTone.color, marginBottom: 6 }}>
                    Tahap Saat Ini
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 'var(--sp-text-base)', color: workflowTone.color, marginBottom: 4 }}>
                    {workflow.label}
                  </div>
                  <p style={{ fontSize: 'var(--sp-text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>
                    {workflow.description}
                  </p>
                  <div style={{ fontSize: 'var(--sp-text-sm)', fontWeight: 700, color: workflowTone.color }}>
                    Langkah berikutnya: {workflow.nextAction}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {readinessItems.map((item) => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--sp-text-sm)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span className={item.ok ? 'badge badge-success' : 'badge badge-warning'}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {blockers.length > 0 && (
                  <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--sp-radius-lg)', background: 'var(--warning-50)', border: '1px solid var(--warning-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--warning-700)', marginBottom: 'var(--space-2)', fontSize: 'var(--sp-text-sm)' }}>
                      <AlertCircle size={14} /> Blocker Saat Ini
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'var(--sp-text-sm)', color: 'var(--warning-700)' }}>
                      {blockers.map((blocker) => (
                        <div key={blocker}>{blocker}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Keputusan Verifikasi</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className={shared.formGroup}>
                <label className={shared.formLabel}>Ubah Status</label>
                <select className={shared.formInput} value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Status indicator */}
              <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--sp-radius-lg)', background: newStatus === 'DITERIMA' ? 'var(--success-50)' : newStatus === 'DITOLAK' ? 'var(--danger-50)' : 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--sp-text-sm)', fontWeight: 600, color: newStatus === 'DITERIMA' ? 'var(--success-700)' : newStatus === 'DITOLAK' ? 'var(--danger-700)' : 'var(--text-secondary)' }}>
                {newStatus === 'DITERIMA' ? <CheckCircle2 size={16} /> : newStatus === 'DITOLAK' ? <XCircle size={16} /> : <AlertCircle size={16} />}
                {STATUS_OPTIONS.find(o => o.value === newStatus)?.label}
              </div>

              <Button onClick={handleVerifikasi} isLoading={submitting} style={{ width: '100%' }}>
                Simpan Keputusan
              </Button>
            </div>
          </div>

          {/* Verifikasi Bukti Pembayaran */}
          {(() => {
            const allPembayaran = data.tagihanPpdbs?.flatMap((t) =>
              (t.pembayarans || []).map((p) => ({ ...p, tagihanJenis: t.jenis }))
            ) || []
            const pending = allPembayaran.filter((p) => p.status === 'PENDING')
            if (pending.length === 0) return null
            return (
              <div className="card" style={{ borderColor: 'var(--warning-200)' }}>
                <div className="card-header">
                  <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CreditCard size={15} style={{ color: 'var(--warning-600)' }} /> Verifikasi Pembayaran
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {pending.map((p) => (
                    <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-secondary)' }}>
                        {p.tagihanJenis === 'PENDAFTARAN' ? 'Biaya Formulir' : 'Daftar Ulang'} — <strong>Rp {Number(p.nominal).toLocaleString('id-ID')}</strong>
                      </div>
                      {p.buktiUrl && (
                        <a href={p.buktiUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--sp-text-xs)', color: 'var(--primary-600)', fontWeight: 600 }}>
                          <ExternalLink size={11} /> Lihat Bukti Transfer
                        </a>
                      )}
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <Button variant="success" onClick={() => handleVerifikasiBayar(p.id, true)} isLoading={submitting} style={{ flex: 1, fontSize: 'var(--sp-text-xs)' }}>
                          <CheckCircle2 size={13} /> Setujui
                        </Button>
                        <Button variant="danger" onClick={() => handleVerifikasiBayar(p.id, false)} isLoading={submitting} style={{ flex: 1, fontSize: 'var(--sp-text-xs)' }}>
                          <XCircle size={13} /> Tolak
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Info tagihan */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Info Tagihan</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {data.tagihanPpdbs?.length === 0 && (
                <p style={{ fontSize: 'var(--sp-text-sm)', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Belum ada tagihan</p>
              )}
              {data.tagihanPpdbs?.map((t) => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--sp-text-sm)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t.jenis === 'PENDAFTARAN' ? 'Biaya Formulir' : 'Daftar Ulang'}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    <span style={{ fontWeight: 700 }}>Rp {Number(t.nominal).toLocaleString('id-ID')}</span>
                    <span className={t.status === 'LUNAS' ? 'badge badge-success' : 'badge badge-warning'} style={{ fontSize: '10px' }}>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pengumuman yang sudah dikirim */}
          {(() => {
            const pengumuman = data.dataFormulir?.pengumuman
            if (!pengumuman) return null
            return (
              <div className="card" style={{ borderColor: pengumuman.status === 'DITERIMA' ? 'var(--success-200)' : 'var(--danger-200)' }}>
                <div className="card-header">
                  <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Megaphone size={15} /> Pengumuman Terkirim
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--sp-text-sm)' }}>
                  <span className={pengumuman.status === 'DITERIMA' ? 'badge badge-success' : 'badge badge-danger'} style={{ width: 'fit-content' }}>
                    {pengumuman.status}
                  </span>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{pengumuman.pesan}</p>
                  {pengumuman.jadwalDaftarUlang && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary-600)', fontWeight: 600 }}>
                      <Calendar size={13} />
                      Daftar ulang: {new Date(pengumuman.jadwalDaftarUlang).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                  <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-tertiary)' }}>
                    Dikirim: {new Date(pengumuman.tanggalPengumuman).toLocaleDateString('id-ID')}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Modal Sinkronisasi */}
      <Modal isOpen={showSinkronModal} onClose={() => setShowSinkronModal(false)} title="Sinkronisasi ke Data Siswa">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-5)', fontSize: 'var(--sp-text-sm)' }}>
          Data pendaftar <strong>{data.namaLengkap}</strong> akan disalin ke tabel Siswa. Pilih kelas (opsional):
        </p>
        <div className={shared.formGroup} style={{ marginBottom: 'var(--space-6)' }}>
          <label className={shared.formLabel}>Kelas (Opsional)</label>
          <select className={shared.formInput} value={kelasId} onChange={e => setKelasId(e.target.value)}>
            <option value="">Belum ditentukan</option>
            {kelases.map((k) => <option key={k.id} value={k.id}>{k.nama} — {k.unit?.nama}</option>)}
          </select>
        </div>
        <div className={shared.modalFooter}>
          <Button variant="secondary" onClick={() => setShowSinkronModal(false)}>Batal</Button>
          <Button variant="success" onClick={handleSinkron} isLoading={submitting} leftIcon={<RefreshCw size={15} />}>
            Sinkronkan Sekarang
          </Button>
        </div>
      </Modal>

      {/* Modal Kirim Pengumuman */}
      <Modal isOpen={showPengumumanModal} onClose={() => !submitting && setShowPengumumanModal(false)} title="Kirim Pengumuman Hasil Seleksi" maxWidth="520px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Hasil Seleksi <span className="required">*</span></label>
            <select className={shared.formInput} value={pengumumanForm.status} onChange={e => setPengumumanForm(p => ({ ...p, status: e.target.value }))}>
              <option value="DITERIMA">DITERIMA</option>
              <option value="DITOLAK">DITOLAK</option>
            </select>
          </div>
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Pesan Pengumuman</label>
            <textarea
              className={shared.formInput}
              rows={4}
              style={{ resize: 'vertical' }}
              value={pengumumanForm.pesan}
              onChange={e => setPengumumanForm(p => ({ ...p, pesan: e.target.value }))}
              placeholder={pengumumanForm.status === 'DITERIMA'
                ? 'Selamat! Anda dinyatakan DITERIMA. Silakan lakukan daftar ulang sesuai jadwal.'
                : 'Mohon maaf, Anda dinyatakan tidak lolos seleksi pada gelombang ini.'}
            />
            <span className="form-hint">Kosongkan untuk menggunakan pesan default.</span>
          </div>
          {pengumumanForm.status === 'DITERIMA' && (
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Jadwal Daftar Ulang</label>
              <input
                type="date"
                className={shared.formInput}
                value={pengumumanForm.jadwalDaftarUlang}
                onChange={e => setPengumumanForm(p => ({ ...p, jadwalDaftarUlang: e.target.value }))}
              />
            </div>
          )}
          <div style={{ padding: 'var(--space-4)', background: pengumumanForm.status === 'DITERIMA' ? 'var(--success-50)' : 'var(--danger-50)', borderRadius: 'var(--sp-radius-lg)', fontSize: 'var(--sp-text-sm)', color: pengumumanForm.status === 'DITERIMA' ? 'var(--success-700)' : 'var(--danger-700)', fontWeight: 600 }}>
            {pengumumanForm.status === 'DITERIMA' ? '✓ Pendaftar akan dinyatakan DITERIMA dan dapat melanjutkan ke tahap daftar ulang.' : '✕ Pendaftar akan dinyatakan DITOLAK dan tidak dapat melanjutkan proses.'}
          </div>
        </div>
        <div className={shared.modalFooter}>
          <Button variant="secondary" onClick={() => setShowPengumumanModal(false)} disabled={submitting}>Batal</Button>
          <Button
            variant={pengumumanForm.status === 'DITERIMA' ? 'success' : 'danger'}
            onClick={handleKirimPengumuman}
            isLoading={submitting}
            leftIcon={<Send size={15} />}
          >
            Kirim Pengumuman
          </Button>
        </div>
      </Modal>

      {/* Modal Generate Tagihan Daftar Ulang */}
      <Modal isOpen={showTagihanModal} onClose={() => !submitting && setShowTagihanModal(false)} title="Buat Tagihan Daftar Ulang">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-5)', fontSize: 'var(--sp-text-sm)' }}>
          Buat tagihan daftar ulang untuk <strong>{data.namaLengkap}</strong>. Tagihan ini akan muncul di halaman Tagihan Saya pendaftar.
        </p>
        <div className={shared.formGroup} style={{ marginBottom: 'var(--space-6)' }}>
          <label className={shared.formLabel}>Nominal Daftar Ulang <span className="required">*</span></label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: 'var(--sp-text-sm)', fontWeight: 700, color: 'var(--text-secondary)' }}>Rp</span>
            <input
              type="number" min="1"
              className={shared.formInput}
              style={{ paddingLeft: '2.5rem' }}
              value={nominalDaftarUlang}
              onChange={e => setNominalDaftarUlang(e.target.value)}
              placeholder="500000"
            />
          </div>
          <span className="form-hint">Default dari pengaturan PPDB. Bisa diubah sesuai kebutuhan.</span>
        </div>
        <div className={shared.modalFooter}>
          <Button variant="secondary" onClick={() => setShowTagihanModal(false)} disabled={submitting}>Batal</Button>
          <Button onClick={handleGenerateTagihanDaftarUlang} isLoading={submitting} leftIcon={<Receipt size={15} />}>
            Buat Tagihan
          </Button>
        </div>
      </Modal>
    </div>
  )
}
