import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  CreditCard, 
  ArrowLeft, 
  Building2, 
  Receipt, 
  User, 
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import styles from '../page.module.css'
import { confirmPaymentManual } from '@/actions/ppdb-actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InvoicePage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect('/app/login')

  const tenantId = (session.user as any).tenantId

  // Fetch Pendaftar and its bills
  const pendaftar = await prisma.pendaftarPpdb.findUnique({
    where: { id, tenantId },
    include: {
      periode: {
        include: {
          unit: true
        }
      },
      tagihanPpdbs: true
    }
  })

  if (!pendaftar) notFound()

  // Find the registration fee bill — support both PENDAFTARAN and DAFTAR_ULANG
  const jenisPriority = ['PENDAFTARAN', 'DAFTAR_ULANG']
  const tagihan = jenisPriority
    .map(j => pendaftar.tagihanPpdbs.find(t => t.jenis === j && t.status === 'BELUM_LUNAS'))
    .find(Boolean) ?? pendaftar.tagihanPpdbs.find(t => t.status === 'BELUM_LUNAS')

  if (!tagihan) {
    // Semua tagihan sudah lunas
    return (
      <div style={{ maxWidth: 560, margin: '4rem auto', textAlign: 'center', padding: '0 var(--space-6)' }}>
        <div style={{ width: '4rem', height: '4rem', borderRadius: 'var(--radius-xl)', background: 'var(--success-100)', color: 'var(--success-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
          <CheckCircle2 size={28} />
        </div>
        <h2 style={{ fontWeight: 800, marginBottom: 'var(--space-3)' }}>Semua Tagihan Lunas</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>Tidak ada tagihan yang perlu dibayar saat ini.</p>
        <a href="/beranda" className="btn btn-primary">Kembali ke Beranda</a>
      </div>
    )
  }

  // Fetch active bank accounts
  const rekenings = await prisma.rekening.findMany({
    where: { tenantId, isActive: true }
  })

  const isLunas = tagihan.status === 'LUNAS'

  // Standard server-side action handler for the "Confirm" button
  async function handleConfirm() {
    'use server'
    const res = await confirmPaymentManual(id)
    if (res.success) {
      redirect('/app/beranda')
    }
  }

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
          <div className={`${styles.step} ${styles.stepActive}`}>
            <div className={styles.stepNumber}>2</div>
            <span className={styles.stepLabel}>Pembayaran</span>
          </div>
          <div className={styles.stepLine} />
        </div>
        <div className={styles.stepWrapper}>
          <div className={`${styles.step} ${styles.stepInactive}`}>
            <div className={styles.stepNumber}>3</div>
            <span className={styles.stepLabel}>Form Lengkap</span>
          </div>
        </div>
      </div>

      <div className={styles.invoiceCard}>
        {/* Invoice Header */}
        <div className={styles.invoiceHeader}>
          <div className={styles.brandInfo}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ background: 'var(--primary-600)', color: 'white', padding: '0.5rem', borderRadius: '0.75rem' }}>
                   <Receipt size={24} />
                </div>
                <h2 style={{ margin: 0 }}>INVOICE {tagihan.jenis === 'DAFTAR_ULANG' ? 'DAFTAR ULANG' : 'PENDAFTARAN'}</h2>
             </div>
            <p>Sistem Informasi Sekolah Profesional</p>
            <p style={{ fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{(session.user as any).tenantNama}</p>
          </div>
          
          <div className={styles.invoiceMeta}>
            <div className={styles.metaItem}>
               <label>Nomer Pendaftaran</label>
               <span>{pendaftar.noPendaftaran}</span>
            </div>
            <div className={styles.metaItem}>
               <label>Tanggal Terbit</label>
               <span>{new Date(pendaftar.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className={styles.invoiceBody}>
          {/* Info Grid */}
          <div className={styles.grid}>
            <div>
              <h4 className={styles.sectionTitle}><User size={14} /> Data Calon Siswa</h4>
              <div className={styles.infoBox}>
                <strong>{pendaftar.namaLengkap}</strong>
                <p>{pendaftar.periode.unit?.nama || 'Umum'} — {pendaftar.periode.nama}</p>
              </div>
            </div>
            <div>
               <h4 className={styles.sectionTitle}><CheckCircle2 size={14} /> Status Invoice</h4>
               <div className={styles.infoBox}>
                  <div className={styles.statusPlate}>
                    <div className={`${styles.statusIcon} ${isLunas ? styles.statusPaid : styles.statusPending}`}>
                       {isLunas ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <div>
                       <strong style={{ fontSize: '1rem' }}>{isLunas ? 'SUDAH LUNAS' : 'MENUNGGU TRANSFER'}</strong>
                       <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Biaya Formulir Administrasi</p>
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
                <td>Biaya {tagihan.jenis === 'PENDAFTARAN' ? 'Pendaftaran' : 'Daftar Ulang'} ({pendaftar.periode.nama})</td>
                <td style={{ textAlign: 'right' }}>Rp {Number(tagihan.nominal).toLocaleString('id-ID')}</td>
              </tr>
              <tr className={styles.totalRow}>
                <td className={styles.totalLabel}>TOTAL PEMBAYARAN</td>
                <td style={{ textAlign: 'right' }} className={styles.totalAmount}>
                  Rp {Number(tagihan.nominal).toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
          </table>

          {!isLunas && (
            <div className={styles.paymentSection}>
              <h4 className={styles.sectionTitle}><Building2 size={14} /> Instruksi Pembayaran Manual</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Silakan lakukan transfer sesuai nominal di atas ke salah satu rekening resmi sekolah berikut:
              </p>
              
              <div className={styles.bankGrid}>
                {rekenings.map((rek) => (
                  <div key={rek.id} className={styles.bankCard}>
                    <div className={styles.bankName}>
                      {rek.namaBank}
                    </div>
                    <div className={styles.bankAcc}>{rek.noRekening}</div>
                    <div className={styles.bankOwner}>A.N. {rek.atasNama}</div>
                  </div>
                ))}
              </div>

              <div className={styles.footerActions}>
                <form action={handleConfirm}>
                  <button type="submit" className={styles.confirmBtn}>
                    Konfirmasi Sudah Bayar <ChevronRight size={20} />
                  </button>
                </form>
                <Link href="/beranda" className={styles.cancelLink}>
                  Bayar Nanti & Kembali ke Beranda
                </Link>
              </div>
            </div>
          )}

          {isLunas && (
            <div style={{ marginTop: '2rem' }}>
               <Link 
                href={`/ppdb/form-lengkap/${pendaftar.id}`}
                className={styles.confirmBtn}
               >
                 Lanjut Isi Formulir Lengkap <ChevronRight size={20} />
               </Link>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link href="/beranda" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.875rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Kembali ke Beranda Utama
        </Link>
      </div>
    </div>
  )
}
