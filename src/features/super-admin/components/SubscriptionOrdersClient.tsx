'use client'

import { useEffect, useState, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Search, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button, DataTable, Modal, Pagination, SearchInput } from '@/components/ui'
import type { Column } from '@/components/ui'
import { getTenantHost } from '@/lib/runtime/app-context'
import type { SubscriptionOrderListData } from '@/features/super-admin/lib/subscription-orders'
import shared from '@/styles/page.module.css'
import styles from '@/app/super-admin/subscription-orders/page.module.css'

type SubscriptionOrdersClientProps = {
  initialData: SubscriptionOrderListData
  initialSearch: string
  initialStatus: string
  currentHostname: string
}

function formatCurrency(value: number) {
  return `Rp${new Intl.NumberFormat('id-ID').format(value)}`
}

function formatDateTime(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID')
}

function getStatusLabel(status: string) {
  if (status === 'PENDING_PAYMENT') return 'Menunggu Pembayaran'
  if (status === 'WAITING_VERIFICATION') return 'Menunggu Verifikasi'
  if (status === 'VERIFIED') return 'Terverifikasi'
  if (status === 'ACTIVATED') return 'Aktif'
  if (status === 'REJECTED') return 'Ditolak'
  if (status === 'CANCELLED') return 'Dibatalkan'
  if (status === 'EXPIRED') return 'Kedaluwarsa'
  return status
}

function getStatusClass(status: string) {
  if (status === 'ACTIVATED') return `${shared.statusBadge} ${shared.statusActive}`
  if (status === 'REJECTED' || status === 'CANCELLED' || status === 'EXPIRED') {
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

function getPaymentMethodLabel(method: string | null) {
  if (method === 'TRANSFER_BANK') return 'Transfer Bank'
  if (method === 'QRIS') return 'QRIS'
  if (method === 'TUNAI') return 'Tunai'
  return method || '-'
}

function getBillingPeriodLabel(period: string) {
  if (period === 'YEARLY') return 'Tahunan'
  if (period === 'MONTHLY') return 'Bulanan'
  return period
}

export function SubscriptionOrdersClient({
  initialData,
  initialSearch,
  initialStatus,
  currentHostname,
}: SubscriptionOrdersClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [orders, setOrders] = useState(initialData.data)
  const [summary, setSummary] = useState(initialData.summary)
  const [pagination, setPagination] = useState(initialData.pagination)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [page, setPage] = useState(initialData.pagination.page)
  const [selectedOrder, setSelectedOrder] = useState<(typeof initialData.data)[number] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    setOrders(initialData.data)
    setSummary(initialData.summary)
    setPagination(initialData.pagination)
    setPage(initialData.pagination.page)
  }, [initialData])

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter)
      params.set('page', String(page))
      params.set('pageSize', String(pagination.pageSize))
      const query = params.toString() ? `?${params.toString()}` : ''
      const res = await fetch(`/api/super-admin/subscription-orders${query}`)
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Gagal memuat order subscription')
        return
      }
      setOrders(json.data || [])
      setSummary(json.summary || { total: 0, waitingVerification: 0, activated: 0, rejected: 0 })
      setPagination(json.pagination || { page: 1, pageSize: 20, totalItems: 0, totalPages: 1 })
      if (json.pagination?.page && json.pagination.page !== page) {
        setPage(json.pagination.page)
      }
    } catch {
      toast.error('Gagal memuat order subscription')
    } finally {
      setLoading(false)
    }
  }, [page, pagination.pageSize, searchQuery, statusFilter])

  useEffect(() => {
    const currentSearch = searchParams.get('search') || ''
    const currentStatus = searchParams.get('status') || 'ALL'
    const currentPage = Number.parseInt(searchParams.get('page') || '1', 10) || 1
    setSearchQuery(currentSearch)
    setStatusFilter(currentStatus)
    setPage(currentPage)
  }, [searchParams])

  useEffect(() => {
    const timer = setTimeout(loadOrders, 300)
    return () => clearTimeout(timer)
  }, [loadOrders])

  const syncUrl = (nextSearch: string, nextStatus: string, nextPage = 1) => {
    const params = new URLSearchParams()
    if (nextSearch) params.set('search', nextSearch)
    if (nextStatus && nextStatus !== 'ALL') params.set('status', nextStatus)
    if (nextPage > 1) params.set('page', String(nextPage))
    const query = params.toString()
    startTransition(() => {
      router.replace(query ? `/super-admin/subscription-orders?${query}` : '/super-admin/subscription-orders')
    })
  }

  const formatTenantHost = (slug: string) => getTenantHost(slug, currentHostname)

  const openReview = (order: (typeof initialData.data)[number]) => {
    setSelectedOrder(order)
    setRejectionReason('')
    setIsModalOpen(true)
  }

  const handleDecision = async (decision: 'approve' | 'reject') => {
    if (!selectedOrder) return
    if (decision === 'reject' && !rejectionReason.trim()) {
      toast.error('Alasan penolakan wajib diisi')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/super-admin/subscription-orders/${selectedOrder.id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          rejectionReason,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Gagal memproses order subscription')
        return
      }
      toast.success(json.message || 'Order subscription berhasil diproses')
      setIsModalOpen(false)
      setSelectedOrder(null)
      startTransition(() => {
        router.refresh()
      })
      await loadOrders()
    } catch {
      toast.error('Gagal memproses order subscription')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: Column<(typeof initialData.data)[number]>[] = [
    {
      header: 'Tenant',
      accessor: (row) => (
        <div>
          <div className={shared.cellName}>{row.tenant.nama}</div>
          <div className={shared.cellSub}>{formatTenantHost(row.tenant.slug)}</div>
        </div>
      ),
    },
    {
      header: 'Perubahan Plan',
      accessor: (row) => (
        <div>
          <div className={shared.cellName}>{row.targetPlan.name}</div>
          <div className={shared.cellSub}>
            {getOrderTypeLabel(row.orderType)} · {row.currentPlan?.name || 'Belum ada'} → {row.targetPlan.code}
          </div>
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
      width: '150px',
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={getStatusClass(row.status)}>
          {getStatusLabel(row.status)}
        </span>
      ),
      align: 'center',
      width: '170px',
    },
    {
      header: 'Aksi',
      accessor: (row) => (
        <Button size="sm" variant="secondary" onClick={() => openReview(row)}>
          Review
        </Button>
      ),
      align: 'center',
      width: '120px',
    },
  ]

  return (
    <>
      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}><div className={styles.summaryLabel}>Total</div><div className={styles.summaryValue}>{summary.total}</div></article>
        <article className={styles.summaryCard}><div className={styles.summaryLabel}>Menunggu Verifikasi</div><div className={styles.summaryValue}>{summary.waitingVerification}</div></article>
        <article className={styles.summaryCard}><div className={styles.summaryLabel}>Aktif</div><div className={styles.summaryValue}>{summary.activated}</div></article>
        <article className={styles.summaryCard}><div className={styles.summaryLabel}>Ditolak</div><div className={styles.summaryValue}>{summary.rejected}</div></article>
      </section>

      <div className={shared.toolbar}>
        <SearchInput
          placeholder="Cari tenant atau plan..."
          value={searchQuery}
          onChange={(e) => {
            const next = e.target.value
            setSearchQuery(next)
            setPage(1)
            syncUrl(next, statusFilter, 1)
          }}
        />
        <select
          className={shared.formInput}
          value={statusFilter}
          onChange={(e) => {
            const next = e.target.value
            setStatusFilter(next)
            setPage(1)
            syncUrl(searchQuery, next, 1)
          }}
          style={{ width: '220px', maxWidth: '100%' }}
          disabled={isPending}
        >
          <option value="ALL">Semua Status</option>
          <option value="WAITING_VERIFICATION">Menunggu Verifikasi</option>
          <option value="VERIFIED">Terverifikasi</option>
          <option value="ACTIVATED">Aktif</option>
          <option value="REJECTED">Ditolak</option>
        </select>
      </div>

      <DataTable columns={columns} data={orders} isLoading={loading || isPending} emptyMessage="Belum ada order subscription tenant" />
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={pagination.pageSize}
        onPageChange={(nextPage) => {
          setPage(nextPage)
          syncUrl(searchQuery, statusFilter, nextPage)
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Review Subscription Order"
        maxWidth="720px"
      >
        <div className={styles.reviewCard}>
          <div><strong>Tenant</strong><span>{selectedOrder?.tenant.nama || '-'}</span></div>
          <div><strong>Order</strong><span>{selectedOrder ? getOrderTypeLabel(selectedOrder.orderType) : '-'}</span></div>
          <div><strong>Dari</strong><span>{selectedOrder?.currentPlan?.name || 'Belum ada plan aktif'}</span></div>
          <div><strong>Ke</strong><span>{selectedOrder?.targetPlan.name || '-'}</span></div>
          <div><strong>Nominal</strong><span>{selectedOrder ? formatCurrency(selectedOrder.amount) : '-'}</span></div>
          <div><strong>Kapasitas</strong><span>{selectedOrder?.studentCapacity || 0} siswa</span></div>
          <div><strong>Metode Bayar</strong><span>{getPaymentMethodLabel(selectedOrder?.paymentMethod || null)}</span></div>
          <div><strong>Periode Billing</strong><span>{selectedOrder ? getBillingPeriodLabel(selectedOrder.billingPeriod) : '-'}</span></div>
          <div><strong>Status</strong><span>{selectedOrder ? getStatusLabel(selectedOrder.status) : '-'}</span></div>
          <div><strong>Submitted</strong><span>{formatDateTime(selectedOrder?.submittedAt?.toString() || null)}</span></div>
        </div>

        {selectedOrder?.paymentProofUrl ? (
          <a href={selectedOrder.paymentProofUrl} target="_blank" rel="noreferrer" className={styles.proofLink}>
            <Search size={14} />
            Lihat bukti pembayaran
          </a>
        ) : null}

        <div className={shared.formGroup}>
          <label className={shared.formLabel}>Catatan / alasan penolakan</label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className={shared.formInput}
            rows={3}
            placeholder="Isi jika order perlu ditolak atau diberi catatan internal"
            disabled={isSubmitting}
          />
        </div>

        {selectedOrder?.notes ? (
          <div className={styles.notesBox}>
            <strong>Catatan tenant</strong>
            <span>{selectedOrder.notes}</span>
          </div>
        ) : null}

        <div className={shared.modalFooter}>
          <Button variant="danger" onClick={() => handleDecision('reject')} disabled={isSubmitting}>
            <XCircle size={16} />
            Tolak
          </Button>
          <Button onClick={() => handleDecision('approve')} isLoading={isSubmitting}>
            <CheckCircle2 size={16} />
            Verifikasi & Aktifkan
          </Button>
        </div>
      </Modal>
    </>
  )
}
