'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FileText, CreditCard, CheckCircle2, Clock, AlertCircle,
  Receipt, GraduationCap, Loader2, Building2, ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import shared from '@/styles/page.module.css'
import styles from './page.module.css'

type FilterType = 'semua' | 'belum' | 'lunas'

type TagihanRow = {
  id: string
  tipe: string
  jenis: string
  keterangan: string
  nominal: number
  status: 'BELUM_LUNAS' | 'SEBAGIAN' | 'LUNAS' | string
  createdAt: string | Date
  jatuhTempo?: string | Date | null
  noPendaftaran?: string | null
  pendaftarId?: string | null
  pembayarans?: Array<{ tanggalBayar: string | Date }>
}

type RekeningRow = {
  id: string
  namaBank: string
  noRekening: string
  atasNama: string
  isActive: boolean
}

type TagihanStats = {
  total: number
  belumLunas: number
  lunas: number
  totalNominal: number
}

function formatRp(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function TagihanSayaPage() {
  const [tagihans, setTagihans] = useState<TagihanRow[]>([])
  const [stats, setStats] = useState<TagihanStats>({ total: 0, belumLunas: 0, lunas: 0, totalNominal: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('semua')

  // Modal konfirmasi bayar
  const [konfirmasiTarget, setKonfirmasiTarget] = useState<TagihanRow | null>(null)
  const [rekenings, setRekenings] = useState<RekeningRow[]>([])
  const [submitting, setSubmitting] = useState(false)

  const fetchTagihan = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/wali/tagihan')
      const json = await res.json()
      if (json.data) { setTagihans(json.data); setStats(json.stats) }
    } catch { toast.error('Gagal memuat tagihan') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchTagihan() }, [fetchTagihan])

  useEffect(() => {
    fetch('/api/data-master/rekening')
      .then(r => r.json())
      .then(j => setRekenings(j.data?.filter((rekening: RekeningRow) => rekening.isActive) || []))
  }, [])

  const filtered = tagihans.filter(t => {
    if (filter === 'belum') return t.status === 'BELUM_LUNAS'
    if (filter === 'lunas') return t.status === 'LUNAS'
    return true
  })

  const handleKonfirmasi = async () => {
    if (!konfirmasiTarget) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/wali/tagihan/konfirmasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagihanId: konfirmasiTarget.id, tipe: konfirmasiTarget.tipe }),
      })
      const json = await res.json()
      if (!res.ok) toast.error(json.error)
      else {
        toast.success(json.message)
        setKonfirmasiTarget(null)
        fetchTagihan()
      }
    } catch { toast.error('Terjadi kesalahan') }
    finally { setSubmitting(false) }
  }

  const FILTER_TABS: { key: FilterType; label: string; count?: number }[] = [
    { key: 'semua',  label: 'Semua',        count: stats.total },
    { key: 'belum',  label: 'Belum Lunas',  count: stats.belumLunas },
    { key: 'lunas',  label: 'Sudah Lunas',  count: stats.lunas },
  ]

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Tagihan Saya</h1>
        <p className={styles.subtitle}>Semua tagihan pendaftaran dan biaya sekolah Anda</p>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className="stat-card warning">
          <div className="stat-icon"><AlertCircle size={22} /></div>
          <div className="stat-content">
            <div className="stat-label">Belum Lunas</div>
            <div className="stat-value">{stats.belumLunas}</div>
            {stats.totalNominal > 0 && (
              <div className="stat-change down">{formatRp(stats.totalNominal)}</div>
            )}
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon"><CheckCircle2 size={22} /></div>
          <div className="stat-content">
            <div className="stat-label">Sudah Lunas</div>
            <div className="stat-value">{stats.lunas}</div>
          </div>
        </div>
        <div className="stat-card primary">
          <div className="stat-icon"><Receipt size={22} /></div>
          <div className="stat-content">
            <div className="stat-label">Total Tagihan</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            className={`${styles.filterTab} ${filter === tab.key ? styles.filterTabActive : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span style={{ marginLeft: 6, padding: '0 6px', background: filter === tab.key ? 'var(--primary-100)' : 'var(--bg-tertiary)', borderRadius: 'var(--sp-radius-full)', fontSize: '11px', fontWeight: 700, color: filter === tab.key ? 'var(--primary-700)' : 'var(--text-tertiary)' }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 size={28} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--primary-600)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <Receipt size={40} style={{ opacity: 0.3, marginBottom: 'var(--space-3)' }} />
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            {filter === 'belum' ? 'Tidak ada tagihan yang belum lunas' : filter === 'lunas' ? 'Belum ada tagihan yang lunas' : 'Belum ada tagihan'}
          </p>
        </div>
      ) : (
        <div className={styles.tagihanList}>
          {filtered.map(t => {
            const isLunas = t.status === 'LUNAS'
            const isPpdb = t.tipe === 'PPDB'

            return (
              <div key={t.id} className={`${styles.tagihanCard} ${isLunas ? styles.tagihanCardLunas : ''}`}>
                {/* Icon */}
                <div className={`${styles.tagihanIcon} ${isLunas ? styles.iconLunas : isPpdb ? styles.iconPpdb : styles.iconSiswa}`}>
                  {isLunas ? <CheckCircle2 size={18} /> : isPpdb ? <FileText size={18} /> : <GraduationCap size={18} />}
                </div>

                {/* Info */}
                <div className={styles.tagihanInfo}>
                  <div className={styles.tagihanJenis}>{t.jenis}</div>
                  <div className={styles.tagihanKet}>{t.keterangan}</div>
                  {t.noPendaftaran && (
                    <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                      No. Daftar: {t.noPendaftaran}
                    </div>
                  )}
                  {t.jatuhTempo && !isLunas && (
                    <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--warning-600)', fontWeight: 600, marginTop: 2 }}>
                      <Clock size={11} style={{ display: 'inline', marginRight: 3 }} />
                      Jatuh tempo: {formatDate(t.jatuhTempo)}
                    </div>
                  )}
                </div>

                {/* Nominal */}
                <div className={styles.tagihanNominal}>
                  <div className={`${styles.nominalValue} ${isLunas ? styles.nominalLunas : ''}`}>
                    {formatRp(t.nominal)}
                  </div>
                  <div className={styles.nominalDate}>{formatDate(t.createdAt)}</div>
                </div>

                {/* Status + Aksi */}
                <div className={styles.tagihanActions}>
                  <span className={`${styles.statusBadge} ${isLunas ? styles.statusLunas : t.status === 'SEBAGIAN' ? styles.statusSebagian : styles.statusBelum}`}>
                    {isLunas ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                    {isLunas ? 'Lunas' : t.status === 'SEBAGIAN' ? 'Sebagian' : 'Belum Lunas'}
                  </span>

                  {!isLunas && (
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      {/* Lihat Invoice (PPDB) */}
                      {isPpdb && t.pendaftarId && (
                        <Link
                          href={`/ppdb/invoice/${t.pendaftarId}`}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--sp-text-xs)' }}
                        >
                          <ExternalLink size={12} /> Invoice
                        </Link>
                      )}
                      {/* Konfirmasi Bayar */}
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<CreditCard size={12} />}
                        onClick={() => setKonfirmasiTarget(t)}
                        style={{ fontSize: 'var(--sp-text-xs)' }}
                      >
                        Konfirmasi Bayar
                      </Button>
                    </div>
                  )}

                  {(() => {
                    const latestPembayaran = t.pembayarans?.[t.pembayarans.length - 1]

                    return isLunas && latestPembayaran ? (
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                      Dibayar {formatDate(latestPembayaran.tanggalBayar)}
                    </span>
                    ) : null
                  })()}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Konfirmasi Pembayaran */}
      <Modal
        isOpen={!!konfirmasiTarget}
        onClose={() => !submitting && setKonfirmasiTarget(null)}
        title="Konfirmasi Pembayaran"
      >
        {konfirmasiTarget && (
          <>
            {/* Detail Tagihan */}
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--sp-radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
              <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-tertiary)', marginBottom: 4 }}>Tagihan</div>
              <div style={{ fontWeight: 700 }}>{konfirmasiTarget.jenis}</div>
              <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-secondary)' }}>{konfirmasiTarget.keterangan}</div>
              <div style={{ fontSize: 'var(--sp-text-xl)', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--primary-600)', marginTop: 'var(--space-2)' }}>
                {formatRp(konfirmasiTarget.nominal)}
              </div>
            </div>

            {/* Rekening Tujuan */}
            {rekenings.length > 0 && (
              <>
                <p style={{ fontSize: 'var(--sp-text-sm)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                  Transfer ke salah satu rekening berikut:
                </p>
                <div className={styles.rekeningList}>
                  {rekenings.map((r) => (
                    <div key={r.id} className={styles.rekeningItem}>
                      <div className={styles.rekeningBank}>
                        <Building2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                        {r.namaBank}
                      </div>
                      <div className={styles.rekeningNo}>{r.noRekening}</div>
                      <div className={styles.rekeningAn}>a.n. {r.atasNama}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <p style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
              Setelah transfer, klik tombol di bawah untuk mengkonfirmasi pembayaran Anda.
            </p>

            <div className={shared.modalFooter}>
              <Button variant="secondary" onClick={() => setKonfirmasiTarget(null)} disabled={submitting}>Batal</Button>
              <Button onClick={handleKonfirmasi} isLoading={submitting} leftIcon={<CheckCircle2 size={15} />}>
                Sudah Transfer, Konfirmasi
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
