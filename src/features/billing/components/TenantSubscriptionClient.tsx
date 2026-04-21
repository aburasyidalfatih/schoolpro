'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, CreditCard, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button, DataTable, Modal } from '@/components/ui'
import type { Column } from '@/components/ui'
import type { TenantBillingSubscriptionData } from '@/features/billing/lib/tenant-subscription'
import shared from '@/styles/page.module.css'
import styles from '@/app/app/(portal)/(admin)/pengaturan/langganan/page.module.css'

type BillingPlan = TenantBillingSubscriptionData['plans'][number]
type BillingOrder = TenantBillingSubscriptionData['recentOrders'][number]

const initialCheckout = {
  paymentMethod: 'TRANSFER_BANK',
  paymentProofUrl: '',
  notes: '',
}

function formatCurrency(value: number) {
  return `Rp${new Intl.NumberFormat('id-ID').format(value)}`
}

function formatDate(value: Date | string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID')
}

function getBillingPeriodLabel(period: string | null | undefined) {
  if (period === 'YEARLY') return 'Tahunan'
  if (period === 'MONTHLY') return 'Bulanan'
  return period || '-'
}

function getPaymentMethodLabel(method: string | null | undefined) {
  if (method === 'TRANSFER_BANK') return 'Transfer Bank'
  if (method === 'QRIS') return 'QRIS'
  if (method === 'TUNAI') return 'Tunai'
  return method || '-'
}

function getBillingStatusLabel(status: string) {
  if (status === 'PENDING_PAYMENT') return 'Menunggu Pembayaran'
  if (status === 'WAITING_VERIFICATION') return 'Menunggu Verifikasi'
  if (status === 'VERIFIED') return 'Terverifikasi'
  if (status === 'ACTIVATED') return 'Aktif'
  if (status === 'REJECTED') return 'Ditolak'
  if (status === 'CANCELLED') return 'Dibatalkan'
  if (status === 'EXPIRED') return 'Kedaluwarsa'
  if (status === 'TRIAL') return 'Trial'
  if (status === 'ACTIVE') return 'Aktif'
  if (status === 'SUSPENDED') return 'Suspended'
  return status
}

function getBillingStatusClass(status: string) {
  if (status === 'ACTIVATED' || status === 'ACTIVE') return `${shared.statusBadge} ${shared.statusActive}`
  if (status === 'REJECTED' || status === 'EXPIRED' || status === 'CANCELLED' || status === 'SUSPENDED') {
    return `${shared.statusBadge} ${shared.statusInactive}`
  }
  return `${shared.statusBadge} ${shared.statusPending}`
}

function getOrderTypeLabel(orderType: string) {
  if (orderType === 'NEW_SUBSCRIPTION') return 'Langganan Baru'
  if (orderType === 'UPGRADE') return 'Upgrade Paket'
  if (orderType === 'RENEWAL') return 'Perpanjangan'
  return orderType
}

function getQuotaMessage(usage: TenantBillingSubscriptionData['usage'] | undefined) {
  if (!usage || usage.studentCapacity <= 0) {
    return {
      title: 'Paket saat ini belum memiliki kuota siswa aktif',
      description: 'Upgrade ke paket berbayar agar bisa menambah siswa aktif dan membuka seluruh modul operasional.',
      tone: 'full' as const,
    }
  }

  if (usage.warningLevel === 'FULL') {
    return {
      title: 'Kuota siswa aktif sudah penuh',
      description: `Saat ini ${usage.activeStudents}/${usage.studentCapacity} slot terpakai. Tenant tidak bisa menambah siswa aktif baru sampai upgrade dilakukan atau slot tersedia kembali.`,
      tone: 'full' as const,
    }
  }

  if (usage.warningLevel === 'WARNING_90') {
    return {
      title: 'Kuota siswa aktif hampir penuh',
      description: `Tersisa ${usage.remainingSlots} slot dari ${usage.studentCapacity}. Segera siapkan upgrade agar input siswa baru tidak terblokir.`,
      tone: 'warning' as const,
    }
  }

  if (usage.warningLevel === 'WARNING_80') {
    return {
      title: 'Penggunaan kuota sudah mencapai 80%',
      description: `Sisa kuota ${usage.remainingSlots} slot. Ini waktu yang tepat untuk mulai menyiapkan upgrade paket berikutnya.`,
      tone: 'warning' as const,
    }
  }

  return null
}

function getRenewalReminderMessage(days: number) {
  if (days <= 1) return 'Reminder perpanjangan dikirim H-1 sebelum jatuh tempo.'
  return `Reminder perpanjangan operasional disiapkan H-${days} sebelum jatuh tempo.`
}

export function TenantSubscriptionClient({ data }: { data: TenantBillingSubscriptionData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<BillingOrder | null>(null)
  const [checkout, setCheckout] = useState(initialCheckout)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const openCheckout = (plan: BillingPlan) => {
    setSelectedPlan(plan)
    setSelectedOrder(null)
    setCheckout(initialCheckout)
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const openResubmit = (order: BillingOrder) => {
    setSelectedPlan({
      id: order.targetPlan.id,
      code: order.targetPlan.code,
      name: order.targetPlan.name,
      description: null,
      price: order.amount,
      studentCapacity: order.studentCapacity,
      billingPeriod: order.billingPeriod,
      isDefault: false,
      fullAccess: true,
    })
    setSelectedOrder(order)
    setCheckout({
      paymentMethod: order.paymentMethod || 'TRANSFER_BANK',
      paymentProofUrl: order.paymentProofUrl || '',
      notes: order.notes || '',
    })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleUploadProof = async (file: File | null) => {
    if (!file) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Gagal mengunggah bukti pembayaran')
        return
      }
      setCheckout((prev) => ({
        ...prev,
        paymentProofUrl: json.url,
      }))
      toast.success('Bukti pembayaran berhasil diunggah')
    } catch {
      toast.error('Gagal mengunggah bukti pembayaran')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlan) return

    setIsSubmitting(true)
    setErrorMsg('')
    try {
      const endpoint = selectedOrder
        ? `/api/billing/orders/${selectedOrder.id}/resubmit`
        : '/api/billing/orders'
      const method = selectedOrder ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPlanId: selectedPlan.id,
          paymentMethod: checkout.paymentMethod,
          paymentProofUrl: checkout.paymentProofUrl,
          notes: checkout.notes,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error || 'Gagal membuat order billing')
        return
      }
      toast.success(json.message || (selectedOrder ? 'Bukti pembayaran berhasil dikirim ulang' : 'Order billing berhasil dibuat'))
      setIsModalOpen(false)
      setSelectedPlan(null)
      setSelectedOrder(null)
      startTransition(() => {
        router.refresh()
      })
    } catch {
      setErrorMsg('Terjadi kesalahan server')
    } finally {
      setIsSubmitting(false)
    }
  }

  const orderColumns: Column<BillingOrder>[] = [
    {
      header: 'Order',
      accessor: (row) => (
        <div>
          <div className={shared.cellName}>{row.targetPlan.name}</div>
          <div className={shared.cellSub}>{getOrderTypeLabel(row.orderType)}</div>
        </div>
      ),
    },
    {
      header: 'Nominal',
      accessor: (row) => (
        <div>
          <div className={shared.cellName}>{formatCurrency(row.amount)}</div>
          <div className={shared.cellSub}>{row.studentCapacity} siswa</div>
        </div>
      ),
      width: '160px',
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={getBillingStatusClass(row.status)}>
          {getBillingStatusLabel(row.status)}
        </span>
      ),
      width: '170px',
      align: 'center',
    },
    {
      header: 'Tanggal',
      accessor: (row) => formatDate(row.submittedAt),
      width: '140px',
    },
    {
      header: 'Aksi',
      accessor: (row) => (
        row.canResubmit ? (
          <Button size="sm" variant="secondary" onClick={() => openResubmit(row)}>
            Resubmit
          </Button>
        ) : (
          <span className={shared.cellSub}>-</span>
        )
      ),
      width: '130px',
      align: 'center',
    },
  ]

  const usage = data.usage
  const currentPlanId = data.subscription?.plan?.id || null
  const quotaNotice = getQuotaMessage(usage)

  return (
    <>
      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Plan Aktif</div>
          <div className={styles.summaryValue}>{data.subscription?.plan?.name || 'Free'}</div>
          <div className={styles.summaryMeta}>{getBillingStatusLabel(data.subscription?.status || 'TRIAL')}</div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Kuota Siswa</div>
          <div className={styles.summaryValue}>{usage?.studentCapacity || 0}</div>
          <div className={styles.summaryMeta}>{usage?.remainingSlots || 0} slot tersisa</div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Siswa Aktif</div>
          <div className={styles.summaryValue}>{usage?.activeStudents || 0}</div>
          <div className={styles.summaryMeta}>{usage?.usagePercent || 0}% terpakai</div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Jatuh Tempo</div>
          <div className={styles.summaryValue}>{formatDate(data.subscription?.endsAt || null)}</div>
          <div className={styles.summaryMeta}>{getBillingPeriodLabel(data.subscription?.plan?.billingPeriod || 'YEARLY')}</div>
        </article>
      </section>

      {quotaNotice ? (
        <section className={styles.noticeCard} data-tone={quotaNotice.tone}>
          <div>
            <h3 className={styles.noticeTitle}>{quotaNotice.title}</h3>
            <p className={styles.noticeDesc}>{quotaNotice.description}</p>
          </div>
          <div className={styles.noticeMeta}>
            <strong>{usage?.activeStudents || 0}/{usage?.studentCapacity || 0}</strong>
            <span>siswa aktif</span>
          </div>
        </section>
      ) : null}

      {usage && usage.studentCapacity > 0 ? (
        <section className={styles.usageCard}>
          <div className={styles.usageHeader}>
            <div>
              <h3 className={styles.sectionTitle}>Monitoring Kuota</h3>
              <p className={styles.sectionDesc}>Kuota dihitung dari jumlah siswa aktif tenant.</p>
            </div>
            <span className={styles.warningBadge} data-level={usage.warningLevel}>
              {usage.warningLevel === 'FULL'
                ? 'Kuota Penuh'
                : usage.warningLevel === 'WARNING_90'
                  ? 'Warning 90%'
                  : usage.warningLevel === 'WARNING_80'
                    ? 'Warning 80%'
                    : 'Normal'}
            </span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressBar} style={{ width: `${usage.usagePercent}%` }} />
          </div>
        </section>
      ) : null}

      <section className={styles.planGrid}>
        {data.plans.map((plan) => {
          const isCurrent = currentPlanId === plan.id
          return (
            <article key={plan.id} className={styles.planCard} data-current={isCurrent}>
              <div className={styles.planCardTop}>
                <div>
                  <h3 className={styles.planTitle}>{plan.name}</h3>
                  <p className={styles.planCode}>{plan.code}</p>
                </div>
                {plan.fullAccess ? (
                  <span className={styles.planTag}>
                    <ShieldCheck size={14} />
                    Full Access
                  </span>
                ) : null}
              </div>
              <div className={styles.planPrice}>{formatCurrency(plan.price)}</div>
              <div className={styles.planMeta}>
                {plan.studentCapacity > 0 ? `${plan.studentCapacity} siswa aktif / tahun` : 'CMS website only'}
              </div>
              <p className={styles.planDesc}>{plan.description}</p>
              <Button
                onClick={() => openCheckout(plan)}
                variant={isCurrent ? 'secondary' : 'primary'}
                disabled={isCurrent || isSubmitting || isPending}
              >
                {isCurrent ? 'Plan Aktif' : 'Pilih Paket'}
              </Button>
            </article>
          )
        })}
      </section>

      <section className={styles.ordersSection}>
        <div className={styles.instructionsCard}>
          <div className={styles.instructionsHeader}>
            <strong>Instruksi Pembayaran Platform</strong>
            <span>Default dari pengaturan platform SchoolPro</span>
          </div>
          <div className={styles.instructionsGrid}>
            <div>
              <strong>Bank</strong>
              <span>{data.billingDefaults.paymentBankName}</span>
            </div>
            <div>
              <strong>Atas Nama</strong>
              <span>{data.billingDefaults.paymentAccountName}</span>
            </div>
            <div>
              <strong>Nomor Rekening</strong>
              <span>{data.billingDefaults.paymentAccountNumber}</span>
            </div>
            <div>
              <strong>Expiry Order</strong>
              <span>{data.billingDefaults.orderExpiryDays} hari setelah submit pembayaran</span>
            </div>
          </div>
          <p className={styles.instructionsText}>{data.billingDefaults.paymentInstructions}</p>
          <p className={styles.instructionsHint}>{getRenewalReminderMessage(data.billingDefaults.renewalReminderDays)}</p>
        </div>

        <h3 className={styles.sectionTitle}>Riwayat Order</h3>
        {data.recentOrders.length > 0 ? (
          <DataTable
            columns={orderColumns}
            data={data.recentOrders}
            isLoading={isPending}
            emptyMessage="Belum ada order billing tenant"
          />
        ) : (
          <div className={styles.emptyOrders}>
            <strong>Belum ada order billing</strong>
            <p>
              Tenant belum pernah mengirim order upgrade atau perpanjangan. Pilih paket di atas untuk
              membuat order pertama dan kirim bukti pembayaran ke antrean verifikasi.
            </p>
          </div>
        )}
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={selectedPlan ? `Checkout ${selectedPlan.name}` : 'Checkout'}
        maxWidth="680px"
      >
        <form className={shared.form} onSubmit={handleSubmitOrder}>
          {errorMsg && <div className={shared.errorAlert}>{errorMsg}</div>}

          <div className={styles.checkoutCard}>
            <div>
              <strong>Plan tujuan</strong>
              <span>{selectedPlan?.name || '-'}</span>
            </div>
            <div>
              <strong>Nominal</strong>
              <span>{selectedPlan ? formatCurrency(selectedPlan.price) : '-'}</span>
            </div>
            <div>
              <strong>Kapasitas</strong>
              <span>{selectedPlan?.studentCapacity || 0} siswa aktif</span>
            </div>
            <div>
              <strong>{selectedOrder ? 'Status order' : 'Masa aktif baru'}</strong>
              <span>{selectedOrder ? getBillingStatusLabel(selectedOrder.status) : '1 tahun sejak pembayaran diverifikasi'}</span>
            </div>
            <div>
              <strong>Periode billing</strong>
              <span>{getBillingPeriodLabel(selectedPlan?.billingPeriod)}</span>
            </div>
            <div>
              <strong>Metode pembayaran</strong>
              <span>{getPaymentMethodLabel(checkout.paymentMethod)}</span>
            </div>
            <div>
              <strong>Order kedaluwarsa</strong>
              <span>{data.billingDefaults.orderExpiryDays} hari setelah bukti pembayaran dikirim</span>
            </div>
          </div>

          <div className={styles.instructionsCard}>
            <div className={styles.instructionsHeader}>
              <strong>Transfer ke rekening platform</strong>
              <span>Gunakan rekening default berikut saat mengirim pembayaran</span>
            </div>
            <div className={styles.instructionsGrid}>
              <div>
                <strong>Bank</strong>
                <span>{data.billingDefaults.paymentBankName}</span>
              </div>
              <div>
                <strong>Atas Nama</strong>
                <span>{data.billingDefaults.paymentAccountName}</span>
              </div>
              <div>
                <strong>Nomor Rekening</strong>
                <span>{data.billingDefaults.paymentAccountNumber}</span>
              </div>
            </div>
            <p className={styles.instructionsText}>{data.billingDefaults.paymentInstructions}</p>
          </div>

          {selectedOrder?.rejectionReason ? (
            <div className={styles.rejectionNote}>
              <strong>Alasan penolakan sebelumnya</strong>
              <span>{selectedOrder.rejectionReason}</span>
            </div>
          ) : null}

          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Metode Pembayaran</label>
            <select
              name="paymentMethod"
              value={checkout.paymentMethod}
              onChange={(e) => setCheckout((prev) => ({ ...prev, paymentMethod: e.target.value }))}
              className={shared.formInput}
              disabled={isSubmitting}
            >
              <option value="TRANSFER_BANK">Transfer Bank</option>
              <option value="QRIS">QRIS</option>
              <option value="TUNAI">Tunai</option>
            </select>
          </div>

          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Upload Bukti Pembayaran</label>
            <label className={styles.uploadBox}>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={(e) => handleUploadProof(e.target.files?.[0] || null)}
                disabled={isUploading || isSubmitting}
              />
              <span>
                <Upload size={18} />
                {isUploading ? 'Mengunggah...' : checkout.paymentProofUrl ? 'Ganti bukti pembayaran' : 'Pilih file bukti pembayaran'}
              </span>
            </label>
            {checkout.paymentProofUrl ? (
              <a href={checkout.paymentProofUrl} target="_blank" rel="noreferrer" className={styles.proofLink}>
                Lihat bukti terunggah
              </a>
            ) : null}
          </div>

          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Catatan</label>
            <textarea
              value={checkout.notes}
              onChange={(e) => setCheckout((prev) => ({ ...prev, notes: e.target.value }))}
              className={shared.formInput}
              rows={3}
              placeholder="Catatan tambahan untuk tim SchoolPro"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.infoBanner}>
            <CreditCard size={16} />
            <span>
              {selectedOrder
                ? 'Bukti pembayaran yang diperbarui akan masuk lagi ke antrean verifikasi super admin.'
                : 'Order akan masuk ke antrean verifikasi super admin sebelum plan baru aktif.'}
            </span>
          </div>

          <div className={shared.modalFooter}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting} disabled={isUploading || isPending}>
              {selectedOrder ? 'Kirim Ulang Pembayaran' : 'Kirim Order Billing'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
