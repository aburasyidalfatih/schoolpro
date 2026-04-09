'use client'

import { useState, useEffect, useCallback } from 'react'
import { Eye, Users, Clock, CheckCircle2, XCircle, AlertCircle, Search } from 'lucide-react'
import Link from 'next/link'
import { DataTable, Column } from '@/components/ui/DataTable'
import { SearchInput } from '@/components/ui/SearchInput'
import shared from '@/styles/page.module.css'

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

export default function PendaftarPpdbPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [periodes, setPeriodes] = useState<any[]>([])
  const [periodeId, setPeriodeId] = useState('')
  const [stats, setStats] = useState({ total: 0, menunggu: 0, terverifikasi: 0, diterima: 0, ditolak: 0 })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      if (periodeId) params.set('periodeId', periodeId)
      params.set('limit', '50')

      const res = await fetch(`/api/ppdb/pendaftar?${params}`)
      const json = await res.json()
      if (json.data) {
        setData(json.data)
        // Hitung stats
        const all = json.data
        setStats({
          total: json.total || all.length,
          menunggu: all.filter((d: any) => d.status === 'MENUNGGU').length,
          terverifikasi: all.filter((d: any) => d.status === 'TERVERIFIKASI').length,
          diterima: all.filter((d: any) => d.status === 'DITERIMA').length,
          ditolak: all.filter((d: any) => d.status === 'DITOLAK').length,
        })
      }
    } catch { console.error('Gagal memuat data') }
    finally { setLoading(false) }
  }, [search, status, periodeId])

  useEffect(() => {
    fetch('/api/ppdb/periode').then(r => r.json()).then(j => setPeriodes(j.data || []))
  }, [])

  useEffect(() => {
    const t = setTimeout(fetchData, 300)
    return () => clearTimeout(t)
  }, [fetchData])

  const columns: Column<any>[] = [
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
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{row.periode?.nama}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{row.periode?.unit?.nama}</div>
        </div>
      ),
    },
    {
      header: 'Formulir',
      accessor: (row) => {
        const lunas = row.tagihanPpdbs?.some((t: any) => t.jenis === 'PENDAFTARAN' && t.status === 'LUNAS')
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
        const diterima = row.berkas?.filter((b: any) => b.status === 'DITERIMA').length || 0
        return total > 0
          ? <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{diterima}/{total} disetujui</span>
          : <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>—</span>
      },
    },
    {
      header: 'Status',
      accessor: (row) => {
        const cfg = STATUS_BADGE[row.status] || STATUS_BADGE.MENUNGGU
        return <span className={cfg.cls}>{cfg.label}</span>
      },
    },
    {
      header: 'Tanggal Daftar',
      accessor: (row) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          {new Date(row.tanggalDaftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Aksi', align: 'center', width: '80px',
      accessor: (row) => (
        <Link href={`/ppdb/pendaftar/${row.id}`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-4)' }}>
        {[
          { label: 'Total', value: stats.total, icon: <Users size={18} />, variant: 'primary' },
          { label: 'Menunggu', value: stats.menunggu, icon: <Clock size={18} />, variant: 'warning' },
          { label: 'Terverifikasi', value: stats.terverifikasi, icon: <AlertCircle size={18} />, variant: 'primary' },
          { label: 'Diterima', value: stats.diterima, icon: <CheckCircle2 size={18} />, variant: 'success' },
          { label: 'Ditolak', value: stats.ditolak, icon: <XCircle size={18} />, variant: 'danger' },
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
            {periodes.map((p: any) => <option key={p.id} value={p.id}>{p.nama}</option>)}
          </select>
          <select className="form-input" style={{ width: 'auto' }} value={status} onChange={e => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Belum ada pendaftar" />
    </div>
  )
}
