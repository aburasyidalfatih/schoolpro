'use client'

import { useState, useEffect, useCallback } from 'react'
import { Eye, Users, Clock, CheckCircle2, XCircle, CreditCard, FilePenLine, ClipboardCheck, GraduationCap, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { DataTable, Column } from '@/components/ui/DataTable'
import { SearchInput } from '@/components/ui/SearchInput'
import shared from '@/styles/page.module.css'

type PpdbPeriodeOption = {
  id: string
  nama: string
}

type PpdbTagihanRow = {
  jenis: string
  status: string
}

type PpdbBerkasRow = {
  status: string
}

type PpdbPendaftarRow = {
  id: string
  namaLengkap: string
  noPendaftaran: string
  status: string
  tanggalDaftar: string | Date
  dataFormulir?: unknown
  periode?: {
    nama?: string | null
    unit?: {
      nama?: string | null
    } | null
  } | null
  tagihanPpdbs?: PpdbTagihanRow[]
  berkas?: PpdbBerkasRow[]
  workflow: {
    state: string
    label: string
  }
}

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'MENUNGGU', label: 'Menunggu' },
  { value: 'TERVERIFIKASI', label: 'Terverifikasi' },
  { value: 'DITERIMA', label: 'Diterima' },
  { value: 'DITOLAK', label: 'Ditolak' },
]

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  MENUNGGU: { label: 'Menunggu', cls: 'badge badge-warning' },
  TERVERIFIKASI: { label: 'Terverifikasi', cls: 'badge badge-primary' },
  DITERIMA: { label: 'Diterima', cls: 'badge badge-success' },
  DITOLAK: { label: 'Ditolak', cls: 'badge badge-danger' },
}

const WORKFLOW_OPTIONS = [
  { value: '', label: 'Semua Tahap' },
  { value: 'PAYMENT', label: 'Pembayaran' },
  { value: 'FULL_FORM', label: 'Form Lengkap' },
  { value: 'REVIEW', label: 'Review Admin' },
  { value: 'VERIFIED', label: 'Siap Keputusan' },
  { value: 'ACCEPTED', label: 'Pasca Diterima' },
  { value: 'REJECTED', label: 'Ditolak' },
  { value: 'SYNCED', label: 'Sudah Jadi Siswa' },
]

const WORKFLOW_BADGE: Record<string, string> = {
  REGISTRATION_CREATED: 'badge badge-warning',
  PAYMENT_PENDING: 'badge badge-warning',
  PAYMENT_REVIEW: 'badge badge-warning',
  FULL_FORM_UNLOCKED: 'badge badge-primary',
  FULL_FORM_IN_PROGRESS: 'badge badge-warning',
  SUBMITTED_FOR_REVIEW: 'badge badge-primary',
  VERIFIED_READY_FOR_DECISION: 'badge badge-primary',
  REJECTED: 'badge badge-danger',
  ACCEPTED_AWAITING_REENROLLMENT_BILL: 'badge badge-success',
  REENROLLMENT_PAYMENT_PENDING: 'badge badge-warning',
  READY_TO_SYNC: 'badge badge-success',
  SYNCED_TO_STUDENT: 'badge badge-success',
}

export default function PendaftarPpdbPage() {
  const [data, setData] = useState<PpdbPendaftarRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [workflow, setWorkflow] = useState('')
  const [periodes, setPeriodes] = useState<PpdbPeriodeOption[]>([])
  const [periodeId, setPeriodeId] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    payment: 0,
    fullForm: 0,
    review: 0,
    verified: 0,
    accepted: 0,
    rejected: 0,
    synced: 0,
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      if (workflow) params.set('workflow', workflow)
      if (periodeId) params.set('periodeId', periodeId)
      params.set('limit', '50')

      const res = await fetch(`/api/ppdb/pendaftar?${params}`)
      const json = await res.json()
      if (json.data) {
        setData(json.data)
        setStats(json.stats || {
          total: json.total || json.data.length,
          payment: 0,
          fullForm: 0,
          review: 0,
          verified: 0,
          accepted: 0,
          rejected: 0,
          synced: 0,
        })
      }
    } catch { console.error('Gagal memuat data') }
    finally { setLoading(false) }
  }, [search, status, workflow, periodeId])

  useEffect(() => {
    fetch('/api/ppdb/periode').then(r => r.json()).then(j => setPeriodes(j.data || []))
  }, [])

  useEffect(() => {
    const t = setTimeout(fetchData, 300)
    return () => clearTimeout(t)
  }, [fetchData])

  const columns: Column<PpdbPendaftarRow>[] = [
    {
      header: 'Pendaftar',
      accessor: (row) => (
        <div className={shared.userCell}>
          <div className={shared.avatar} style={{ background: 'var(--primary-100)', color: 'var(--primary-600)', fontWeight: 700 }}>
            {row.namaLengkap.charAt(0)}
          </div>
          <div>
            <div className={shared.cellName}>{row.namaLengkap}</div>
            <div className={shared.cellSub}>{row.noPendaftaran}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Gelombang',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 'var(--sp-text-sm)' }}>{row.periode?.nama}</div>
          <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-tertiary)' }}>{row.periode?.unit?.nama}</div>
        </div>
      ),
    },
    {
      header: 'Formulir',
      accessor: (row) => {
        const lunas = row.tagihanPpdbs?.some((t) => t.jenis === 'PENDAFTARAN' && t.status === 'LUNAS')
        const hasForm = !!row.dataFormulir
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className={lunas ? 'badge badge-success' : 'badge badge-warning'} style={{ width: 'fit-content' }}>
              {lunas ? 'Bayar ✓' : 'Belum Bayar'}
            </span>
            <span className={hasForm ? 'badge badge-success' : 'badge badge-gray'} style={{ width: 'fit-content' }}>
              {hasForm ? 'Form ✓' : 'Belum Isi'}
            </span>
          </div>
        )
      },
    },
    {
      header: 'Berkas',
      accessor: (row) => {
        const total = row.berkas?.length || 0
        const diterima = row.berkas?.filter((b) => b.status === 'DITERIMA').length || 0
        return total > 0
          ? <span style={{ fontSize: 'var(--sp-text-sm)', fontWeight: 600 }}>{diterima}/{total} disetujui</span>
          : <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--sp-text-sm)' }}>—</span>
      },
    },
    {
      header: 'Tahap',
      accessor: (row) => {
        const workflowBadge = WORKFLOW_BADGE[row.workflow.state] || 'badge badge-primary'
        const statusCfg = STATUS_BADGE[row.status] || STATUS_BADGE.MENUNGGU
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className={workflowBadge} style={{ width: 'fit-content' }}>{row.workflow.label}</span>
            <span className={statusCfg.cls} style={{ width: 'fit-content' }}>{statusCfg.label}</span>
          </div>
        )
      },
    },
    {
      header: 'Tanggal Daftar',
      accessor: (row) => (
        <span style={{ fontSize: 'var(--sp-text-sm)', color: 'var(--text-secondary)' }}>
          {new Date(row.tanggalDaftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Aksi', align: 'center', width: '80px',
      accessor: (row) => (
        <Link href={`/app/ppdb/pendaftar/${row.id}`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Eye size={13} /> Review
        </Link>
      ),
    },
  ]

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div>
          <h1 className={shared.title}>Meja Pendaftar PPDB</h1>
          <p className={shared.subtitle}>Review dan verifikasi data pendaftar masuk</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 'var(--space-4)' }}>
        {[
          { label: 'Total', value: stats.total, icon: <Users size={18} />, variant: 'primary' },
          { label: 'Pembayaran', value: stats.payment, icon: <CreditCard size={18} />, variant: 'warning' },
          { label: 'Form Lengkap', value: stats.fullForm, icon: <FilePenLine size={18} />, variant: 'primary' },
          { label: 'Review Admin', value: stats.review, icon: <Clock size={18} />, variant: 'primary' },
          { label: 'Siap Keputusan', value: stats.verified, icon: <ClipboardCheck size={18} />, variant: 'primary' },
          { label: 'Pasca Diterima', value: stats.accepted, icon: <CheckCircle2 size={18} />, variant: 'success' },
          { label: 'Sudah Sinkron', value: stats.synced, icon: <GraduationCap size={18} />, variant: 'success' },
          { label: 'Ditolak', value: stats.rejected, icon: <XCircle size={18} />, variant: 'danger' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.variant}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-content">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className={shared.toolbar}>
        <SearchInput placeholder="Cari nama pendaftar..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <select className="form-input" style={{ width: 'auto' }} value={periodeId} onChange={e => setPeriodeId(e.target.value)}>
            <option value="">Semua Gelombang</option>
            {periodes.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
          </select>
          <select className="form-input" style={{ width: 'auto' }} value={workflow} onChange={e => setWorkflow(e.target.value)}>
            {WORKFLOW_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="form-input" style={{ width: 'auto' }} value={status} onChange={e => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setSearch('')
              setStatus('')
              setWorkflow('')
              setPeriodeId('')
            }}
          >
            <RefreshCw size={14} /> Reset
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Belum ada pendaftar" />
    </div>
  )
}
