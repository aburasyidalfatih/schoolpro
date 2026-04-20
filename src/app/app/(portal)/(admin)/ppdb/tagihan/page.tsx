'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, CreditCard, Eye, Receipt, RefreshCw, Users } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import shared from '@/styles/page.module.css'

type PpdbPeriodeOption = {
  id: string
  nama: string
}

type BillingStage = 'AWAITING_BILL' | 'AWAITING_PAYMENT' | 'READY_TO_SYNC' | 'SYNCED'

type BillingStats = {
  total: number
  awaitingBill: number
  awaitingPayment: number
  readyToSync: number
  synced: number
}

type BillingRow = {
  id: string
  namaLengkap: string
  noPendaftaran: string
  tanggalDaftar: string
  periode?: {
    nama?: string | null
    unit?: {
      nama?: string | null
    } | null
    tahunAjaran?: {
      nama?: string | null
    } | null
  } | null
  reenrollmentBill?: {
    id: string
    status: string
    nominal: number | string
    createdAt: string
    updatedAt: string
  } | null
  workflow?: {
    state: string
    label: string
    description: string
    nextAction: string
  } | null
  billingStage: BillingStage
  billingStageLabel: string
  syncedStudent?: {
    id: string
    nis: string
    namaLengkap: string
    createdAt: string
  } | null
}

const PAGE_SIZE = 20

const BILLING_STAGE_OPTIONS: Array<{ value: '' | BillingStage; label: string }> = [
  { value: '', label: 'Semua Tahap Daftar Ulang' },
  { value: 'AWAITING_BILL', label: 'Perlu Tagihan' },
  { value: 'AWAITING_PAYMENT', label: 'Menunggu Pembayaran' },
  { value: 'READY_TO_SYNC', label: 'Siap Sinkron' },
  { value: 'SYNCED', label: 'Sudah Sinkron' },
]

const STAGE_BADGE: Record<BillingStage, string> = {
  AWAITING_BILL: 'badge badge-warning',
  AWAITING_PAYMENT: 'badge badge-warning',
  READY_TO_SYNC: 'badge badge-success',
  SYNCED: 'badge badge-primary',
}

const PAYMENT_BADGE: Record<string, string> = {
  BELUM_LUNAS: 'badge badge-warning',
  MENUNGGU_VERIFIKASI: 'badge badge-primary',
  LUNAS: 'badge badge-success',
  DITOLAK: 'badge badge-danger',
}

function formatCurrency(value: number | string | null | undefined) {
  const nominal = Number(value || 0)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(nominal)
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getActionLabel(stage: BillingStage) {
  if (stage === 'AWAITING_BILL') return 'Buat Tagihan'
  if (stage === 'AWAITING_PAYMENT') return 'Review Bayar'
  if (stage === 'READY_TO_SYNC') return 'Sinkronkan'
  return 'Lihat Detail'
}

export default function PpdbTagihanPage() {
  const [data, setData] = useState<BillingRow[]>([])
  const [error, setError] = useState('')
  const [stats, setStats] = useState<BillingStats>({
    total: 0,
    awaitingBill: 0,
    awaitingPayment: 0,
    readyToSync: 0,
    synced: 0,
  })
  const [periodes, setPeriodes] = useState<PpdbPeriodeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [periodeId, setPeriodeId] = useState('')
  const [billingStage, setBillingStage] = useState<'' | BillingStage>('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (periodeId) params.set('periodeId', periodeId)
      if (billingStage) params.set('billingStage', billingStage)
      params.set('page', String(page))
      params.set('limit', String(PAGE_SIZE))

      const res = await fetch(`/api/ppdb/tagihan?${params}`)
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Gagal memuat tagihan PPDB')
      }

      if (json.data) {
        setData(json.data)
        setStats(json.stats || {
          total: json.total || 0,
          awaitingBill: 0,
          awaitingPayment: 0,
          readyToSync: 0,
          synced: 0,
        })
        setTotal(json.total || 0)
      }
    } catch (err) {
      console.error('Gagal memuat tagihan PPDB', err)
      setData([])
      setTotal(0)
      setStats({
        total: 0,
        awaitingBill: 0,
        awaitingPayment: 0,
        readyToSync: 0,
        synced: 0,
      })
      setError('Data tagihan PPDB tidak berhasil dimuat. Coba refresh halaman atau ulangi beberapa saat lagi.')
    } finally {
      setLoading(false)
    }
  }, [billingStage, page, periodeId, search])

  useEffect(() => {
    fetch('/api/ppdb/periode')
      .then((res) => res.json())
      .then((json) => setPeriodes(json.data || []))
  }, [])

  useEffect(() => {
    const timer = setTimeout(fetchData, 300)
    return () => clearTimeout(timer)
  }, [fetchData])

  useEffect(() => {
    setPage(1)
  }, [search, periodeId, billingStage])

  const summaryCards = useMemo(
    () => [
      {
        label: 'Total Diterima',
        value: stats.total,
        icon: <Users size={18} />,
        variant: 'primary',
        helper: 'Semua pendaftar yang sudah masuk tahap daftar ulang',
      },
      {
        label: 'Perlu Tagihan',
        value: stats.awaitingBill,
        icon: <Receipt size={18} />,
        variant: 'warning',
        helper: 'Sudah diterima, tetapi tagihan daftar ulang belum dibuat',
      },
      {
        label: 'Menunggu Pembayaran',
        value: stats.awaitingPayment,
        icon: <CreditCard size={18} />,
        variant: 'warning',
        helper: 'Tagihan sudah ada, tetapi daftar ulang belum lunas',
      },
      {
        label: 'Siap Sinkron',
        value: stats.readyToSync,
        icon: <CheckCircle2 size={18} />,
        variant: 'success',
        helper: 'Daftar ulang lunas dan bisa dilanjutkan ke data siswa',
      },
      {
        label: 'Sudah Sinkron',
        value: stats.synced,
        icon: <ArrowRight size={18} />,
        variant: 'primary',
        helper: 'Pendaftar sudah dipindahkan ke data siswa aktif',
      },
    ],
    [stats],
  )

  const columns: Column<BillingRow>[] = [
    {
      header: 'Pendaftar',
      accessor: (row) => (
        <div className={shared.userCell}>
          <div className={shared.avatar} style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', fontWeight: 700 }}>
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
          <div style={{ fontWeight: 700, fontSize: 'var(--sp-text-sm)' }}>{row.periode?.nama || '—'}</div>
          <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-tertiary)' }}>
            {row.periode?.unit?.nama || 'Tanpa Unit'}{row.periode?.tahunAjaran?.nama ? ` • ${row.periode.tahunAjaran.nama}` : ''}
          </div>
        </div>
      ),
    },
    {
      header: 'Tagihan Daftar Ulang',
      accessor: (row) => {
        if (!row.reenrollmentBill) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span className="badge badge-warning" style={{ width: 'fit-content' }}>Belum Dibuat</span>
              <span style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-tertiary)' }}>
                Buat dari halaman detail pendaftar
              </span>
            </div>
          )
        }

        const paymentBadge = PAYMENT_BADGE[row.reenrollmentBill.status] || 'badge badge-primary'

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--sp-text-sm)' }}>
              {formatCurrency(row.reenrollmentBill.nominal)}
            </div>
            <span className={paymentBadge} style={{ width: 'fit-content' }}>
              {row.reenrollmentBill.status.replaceAll('_', ' ')}
            </span>
            <span style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-tertiary)' }}>
              Update {formatDate(row.reenrollmentBill.updatedAt)}
            </span>
          </div>
        )
      },
    },
    {
      header: 'Tahap Operasional',
      accessor: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className={STAGE_BADGE[row.billingStage]} style={{ width: 'fit-content' }}>
            {row.billingStageLabel}
          </span>
          <span style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {row.workflow?.nextAction || 'Lanjutkan dari halaman detail pendaftar'}
          </span>
        </div>
      ),
    },
    {
      header: 'Sinkronisasi',
      accessor: (row) => {
        if (!row.syncedStudent) {
          return <span style={{ fontSize: 'var(--sp-text-sm)', color: 'var(--text-tertiary)' }}>Belum sinkron</span>
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="badge badge-success" style={{ width: 'fit-content' }}>Siswa Aktif</span>
            <span style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-secondary)' }}>
              NIS {row.syncedStudent.nis}
            </span>
          </div>
        )
      },
    },
    {
      header: 'Aksi',
      align: 'center',
      width: '120px',
      accessor: (row) => (
        <Link
          href={`/app/ppdb/pendaftar/${row.id}`}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Eye size={13} />
          {getActionLabel(row.billingStage)}
        </Link>
      ),
    },
  ]

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div>
          <h1 className={shared.title}>Tagihan PPDB</h1>
          <p className={shared.subtitle}>Pantau tagihan daftar ulang, pembayaran masuk, dan kesiapan sinkronisasi siswa.</p>
        </div>
      </div>

      <div
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 0.8fr)',
          gap: 'var(--space-5)',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <h3 className="card-title" style={{ margin: 0 }}>Meja kerja daftar ulang</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--sp-text-sm)', lineHeight: 1.7 }}>
            Halaman ini hanya menampilkan pendaftar yang sudah <strong>DITERIMA</strong>. Admin bisa cepat melihat mana yang perlu dibuatkan tagihan,
            mana yang masih menunggu pembayaran, dan mana yang sudah siap disinkronkan ke data siswa.
          </p>
        </div>
        <div
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--sp-radius-lg)',
            background: 'var(--primary-50)',
            border: '1px solid var(--primary-100)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          <div style={{ fontSize: 'var(--sp-text-xs)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary-700)' }}>
            Alur Ringkas
          </div>
          <div style={{ fontSize: 'var(--sp-text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Diterima <ArrowRight size={14} style={{ verticalAlign: 'middle' }} /> Buat tagihan <ArrowRight size={14} style={{ verticalAlign: 'middle' }} /> Verifikasi pembayaran <ArrowRight size={14} style={{ verticalAlign: 'middle' }} /> Sinkron ke siswa
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: 'var(--space-4)' }}>
        {summaryCards.map((card) => (
          <div key={card.label} className={`stat-card ${card.variant}`}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-content">
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
              <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                {card.helper}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={shared.toolbar}>
        <SearchInput placeholder="Cari nama atau nomor pendaftaran..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <select className="form-input" style={{ width: 'auto' }} value={periodeId} onChange={(e) => setPeriodeId(e.target.value)}>
            <option value="">Semua Gelombang</option>
            {periodes.map((periode) => (
              <option key={periode.id} value={periode.id}>
                {periode.nama}
              </option>
            ))}
          </select>
          <select className="form-input" style={{ width: 'auto' }} value={billingStage} onChange={(e) => setBillingStage(e.target.value as '' | BillingStage)}>
            {BILLING_STAGE_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setSearch('')
              setPeriodeId('')
              setBillingStage('')
            }}
          >
            <RefreshCw size={14} /> Reset
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={loading}
        emptyMessage="Belum ada pendaftar diterima yang masuk tahap tagihan daftar ulang."
      />

      {!loading && error && (
        <div
          className="card"
          style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-5)',
            borderColor: 'var(--danger-200)',
            background: 'var(--danger-50)',
          }}
        >
          <h3 className="card-title" style={{ marginBottom: 'var(--space-2)', color: 'var(--danger-700)' }}>Gagal memuat meja tagihan</h3>
          <p style={{ margin: 0, color: 'var(--danger-700)', fontSize: 'var(--sp-text-sm)', lineHeight: 1.7 }}>
            {error}
          </p>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div
          className="card"
          style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-5)',
            borderStyle: 'dashed',
          }}
        >
          <h3 className="card-title" style={{ marginBottom: 'var(--space-2)' }}>Belum ada pekerjaan pada meja tagihan</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--sp-text-sm)', lineHeight: 1.7 }}>
            Pendaftar baru akan muncul di sini setelah statusnya <strong>DITERIMA</strong>. Jika sudah ada yang diterima tetapi tabel masih kosong,
            periksa filter gelombang atau tahap daftar ulang di atas.
          </p>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <Link href="/app/ppdb/pendaftar" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Eye size={14} /> Buka Meja Pendaftar
            </Link>
          </div>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        totalItems={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  )
}
