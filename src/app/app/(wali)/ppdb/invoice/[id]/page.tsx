'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Building2, Receipt, User, CheckCircle2,
  AlertCircle, ChevronRight, Upload, Clock, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import styles from '../page.module.css'

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [buktiFile, setBuktiFile] = useState<File | null>(null)
  const [buktiPreview, setBuktiPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/ppdb/invoice/${id}`)
      .then(r => r.json())
      .then(j => { if (j.data) setData(j.data) })
      .catch(() => toast.error('Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBuktiFile(file)
    setBuktiPreview(URL.createObjectURL(file))
  }

  const handleKirimBukti = async () => {
    if (!buktiFile) { toast.error('Pilih file bukti transfer terlebih dahulu'); return }
    setSubmitting(true)
    try {
      // 1. Upload file
      const fd = new FormData()
      fd.append('file', buktiFile)
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
      const uploadJson = await uploadRes.json()
      if (!uploadRes.ok) { toast.error(uploadJson.error || 'Gagal upload'); return }

      // 2. Kirim konfirmasi dengan bukti URL
      const res = await fetch(`/api/ppdb/invoice/${id}/konfirmasi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buktiUrl: uploadJson.url }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error); return }

      toast.success('Bukti transfer berhasil dikirim! Menunggu verifikasi admin.')
      router.refresh()
      // Reload data
      const fresh = await fetch(`/api/ppdb/invoice/${id}`).then(r => r.json())
      if (fresh.data) setData(fresh.data)
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <Loader2 size={32} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--primary-600)' }} />
    </div>
  )

  if (!data) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Data tidak ditemukan.</div>

  const { pendaftar, tagihan, rekenings } = data
  const isLunas = tagihan?.status === 'LUNAS'
  const isPending = tagihan?.status === 'MENUNGGU_VERIFIKASI'

  // Cek apakah sudah ada pembayaran pending
  const pembayaranPending = tagihan?.pembayarans?.find((p: any) => p.status === 'PENDING')

  return (
    <div className={styles.container}>
      {/* Stepper */}
      <div className={styles.stepper}>
        <div className={styles.stepWrapper}>
          <div className={`${styles.step} ${styles.stepCompleted}`}>
            <div className={styles.stepNumber}>1</div>
            <span className={styles.stepLabel}>Form Singkat</span>
          </div>
          <div className={styles.stepLine} />
        </div>
        <div className={styles.stepWrapper}>
          <div className={`${styles.step} ${isLunas ? styles.stepCompleted : styles.stepActive}`}>
            <div className={styles.stepNumber}>{isLunas ? <CheckCircle2 size={16} /> : 2}</div>
            <span className={styles.stepLabel}>Pembayaran</span>
          </div>
          <div className={styles.stepLine} />
        </div>
        <div className={styles.stepWrapper}>
          <div className={`${styles.step} ${isLunas ? styles.stepActive : styles.stepInactive}`}>
            <div className={styles.stepNumber}>3</div>
            <span className={styles.stepLabel}>Form Lengkap</span>
          </div>
        </div>
      </div>

      <div className={styles.invoiceCard}>
        {/* Header */}
        <div className={styles.invoiceHeader}>
          <div className={styles.brandInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ background: 'var(--primary-600)', color: 'white', padding: '0.5rem', borderRadius: '0.75rem' }}>
                <Receipt size={24} />
              </div>
              <h2 style={{ margin: 0 }}>INVOICE {tagihan?.jenis === 'DAFTAR_ULANG' ? 'DAFTAR ULANG' : 'PENDAFTARAN'}</h2>
            </div>
            <p>Sistem Informasi Sekolah Profesional</p>
          </div>
          <div className={styles.invoiceMeta}>
            <div className={styles.metaItem}>
              <label>No. Pendaftaran</label>
              <span>{pendaftar?.noPendaftaran}</span>
            </div>
            <div className={styles.metaItem}>
              <label>Tanggal Terbit</label>
              <span>{pendaftar?.createdAt ? new Date(pendaftar.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
            </div>
          </div>
        </div>

        <div className={styles.invoiceBody}>
          {/* Info Grid */}
          <div className={styles.grid}>
            <div>
              <h4 className={styles.sectionTitle}><User size={14} /> Data Calon Siswa</h4>
              <div className={styles.infoBox}>
                <strong>{pendaftar?.namaLengkap}</strong>
                <p>{pendaftar?.periode?.unit?.nama || 'Umum'} — {pendaftar?.periode?.nama}</p>
              </div>
            </div>
            <div>
              <h4 className={styles.sectionTitle}><CheckCircle2 size={14} /> Status Invoice</h4>
              <div className={styles.infoBox}>
                <div className={styles.statusPlate}>
                  <div className={`${styles.statusIcon} ${isLunas ? styles.statusPaid : styles.statusPending}`}>
                    {isLunas ? <CheckCircle2 size={24} /> : isPending ? <Clock size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <div>
                    <strong style={{ fontSize: '1rem' }}>
                      {isLunas ? 'SUDAH LUNAS' : isPending ? 'MENUNGGU VERIFIKASI' : 'BELUM DIBAYAR'}
                    </strong>
                    <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {tagihan?.jenis === 'DAFTAR_ULANG' ? 'Biaya Daftar Ulang' : 'Biaya Formulir Administrasi'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bill Table */}
          <table className={styles.billTable}>
            <thead>
              <tr>
                <th>DESKRIPSI TAGIHAN</th>
                <th style={{ textAlign: 'right' }}>SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Biaya {tagihan?.jenis === 'PENDAFTARAN' ? 'Pendaftaran' : 'Daftar Ulang'} ({pendaftar?.periode?.nama})</td>
                <td style={{ textAlign: 'right' }}>Rp {Number(tagihan?.nominal || 0).toLocaleString('id-ID')}</td>
              </tr>
              <tr className={styles.totalRow}>
                <td className={styles.totalLabel}>TOTAL PEMBAYARAN</td>
                <td style={{ textAlign: 'right' }} className={styles.totalAmount}>
                  Rp {Number(tagihan?.nominal || 0).toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Belum bayar — tampilkan rekening + form upload bukti */}
          {!isLunas && !pembayaranPending && (
            <div className={styles.paymentSection}>
              <h4 className={styles.sectionTitle}><Building2 size={14} /> Instruksi Pembayaran</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Transfer sesuai nominal ke salah satu rekening berikut, lalu upload bukti transfer.
              </p>
              <div className={styles.bankGrid}>
                {rekenings?.map((rek: any) => (
                  <div key={rek.id} className={styles.bankCard}>
                    <div className={styles.bankName}>{rek.namaBank}</div>
                    <div className={styles.bankAcc}>{rek.noRekening}</div>
                    <div className={styles.bankOwner}>A.N. {rek.atasNama}</div>
                  </div>
                ))}
              </div>

              {/* Upload Bukti */}
              <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-5)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Upload size={15} /> Upload Bukti Transfer
                </h4>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                  Upload foto/screenshot bukti transfer. Format: JPG, PNG, PDF. Maks 5MB.
                </p>

                {buktiPreview && (
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <img src={buktiPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 'var(--radius-lg)', objectFit: 'contain', border: '1px solid var(--border-color)' }} />
                  </div>
                )}

                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                    <Upload size={14} /> {buktiFile ? buktiFile.name : 'Pilih File'}
                    <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleFileChange} />
                  </label>
                  <button
                    onClick={handleKirimBukti}
                    disabled={!buktiFile || submitting}
                    className={styles.confirmBtn}
                    style={{ opacity: !buktiFile || submitting ? 0.6 : 1 }}
                  >
                    {submitting ? <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} /> : <ChevronRight size={18} />}
                    {submitting ? 'Mengirim...' : 'Kirim Bukti Bayar'}
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
                <Link href="/app/beranda" className={styles.cancelLink}>
                  Bayar Nanti & Kembali ke Beranda
                </Link>
              </div>
            </div>
          )}

          {/* Menunggu verifikasi admin */}
          {pembayaranPending && !isLunas && (
            <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-5)', background: 'var(--warning-50)', border: '1px solid var(--warning-200)', borderRadius: 'var(--radius-xl)', display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
              <Clock size={22} style={{ color: 'var(--warning-600)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--warning-700)', marginBottom: 4 }}>Bukti Transfer Sedang Diverifikasi</div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--warning-700)' }}>
                  Bukti transfer Anda sudah diterima dan sedang diverifikasi oleh admin. Proses verifikasi biasanya memakan waktu 1×24 jam.
                </p>
                {pembayaranPending.buktiUrl && (
                  <a href={pembayaranPending.buktiUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 'var(--text-xs)', color: 'var(--primary-600)', fontWeight: 600 }}>
                    Lihat Bukti yang Dikirim →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Sudah lunas */}
          {isLunas && (
            <div style={{ marginTop: '2rem' }}>
              <Link href={`/app/ppdb/form-lengkap/${pendaftar.id}`} className={styles.confirmBtn}>
                Lanjut Isi Formulir Lengkap <ChevronRight size={20} />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link href="/app/beranda" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.875rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Kembali ke Beranda Utama
        </Link>
      </div>
    </div>
  )
}
