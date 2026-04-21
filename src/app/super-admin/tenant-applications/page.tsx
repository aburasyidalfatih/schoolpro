'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, FileSearch, RotateCcw, ShieldCheck, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button, DataTable, Modal, SearchInput } from '@/components/ui'
import type { Column } from '@/components/ui'
import shared from '@/styles/page.module.css'
import styles from './page.module.css'

type TenantApplicationRow = {
  id: string
  applicationCode: string
  namaSekolah: string
  jenjang: string
  statusSekolah: string
  npsn: string | null
  emailSekolah: string
  teleponSekolah: string
  alamat: string
  provinsi: string
  kotaKabupaten: string
  websiteSaatIni: string | null
  jumlahSiswaSaatIni: number | null
  namaPic: string
  jabatanPic: string
  emailPic: string
  whatsappPic: string
  slugRequest: string
  slugApproved: string | null
  kebutuhanUtama: string
  catatanTambahan: string | null
  sumberLead: string | null
  status: string
  submittedAt: string | null
  reviewedAt: string | null
  reviewedByUserId: string | null
  reviewNotes: string | null
  revisionNotes: string | null
  rejectedReason: string | null
  approvedTenantId: string | null
  provisionedAt: string | null
  createdAt: string
}

type Summary = {
  total: number
  submitted: number
  revisionRequested: number
  approved: number
  rejected: number
  provisioned: number
}

const initialSummary: Summary = {
  total: 0,
  submitted: 0,
  revisionRequested: 0,
  approved: 0,
  rejected: 0,
  provisioned: 0,
}

function formatDateTime(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID')
}

function getStatusLabel(status: string) {
  if (status === 'DRAFT') return 'Draft'
  if (status === 'SUBMITTED') return 'Submitted'
  if (status === 'UNDER_REVIEW') return 'Under Review'
  if (status === 'REVISION_REQUESTED') return 'Perlu Revisi'
  if (status === 'APPROVED') return 'Approved'
  if (status === 'REJECTED') return 'Rejected'
  if (status === 'PROVISIONED') return 'Provisioned'
  return status
}

function getStatusClass(status: string) {
  if (status === 'APPROVED' || status === 'PROVISIONED') return `${shared.statusBadge} ${shared.statusActive}`
  if (status === 'REJECTED') return `${shared.statusBadge} ${shared.statusInactive}`
  if (status === 'REVISION_REQUESTED') return `${shared.statusBadge} ${styles.statusWarning}`
  return `${shared.statusBadge} ${shared.statusPending}`
}

export default function TenantApplicationsPage() {
  const searchParams = useSearchParams()
  const [applications, setApplications] = useState<TenantApplicationRow[]>([])
  const [summary, setSummary] = useState<Summary>(initialSummary)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL')
  const [selectedApplication, setSelectedApplication] = useState<TenantApplicationRow | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProvisioning, setIsProvisioning] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [revisionNotes, setRevisionNotes] = useState('')
  const [rejectedReason, setRejectedReason] = useState('')
  const [slugApproved, setSlugApproved] = useState('')
  const [provisionResult, setProvisionResult] = useState<null | {
    tenantSlug: string
    adminEmail: string
    tempPassword: string
    isActive: boolean
  }>(null)

  const loadApplications = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter)
      const query = params.toString() ? `?${params.toString()}` : ''
      const res = await fetch(`/api/super-admin/tenant-applications${query}`)
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Gagal memuat aplikasi tenant')
        return
      }
      setApplications(json.data || [])
      setSummary(json.summary || initialSummary)
    } catch {
      toast.error('Gagal memuat aplikasi tenant')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, statusFilter])

  useEffect(() => {
    const timer = setTimeout(loadApplications, 300)
    return () => clearTimeout(timer)
  }, [loadApplications])

  const openReview = (application: TenantApplicationRow) => {
    setSelectedApplication(application)
    setReviewNotes(application.reviewNotes || '')
    setRevisionNotes(application.revisionNotes || '')
    setRejectedReason(application.rejectedReason || '')
    setSlugApproved(application.slugApproved || application.slugRequest)
    setProvisionResult(null)
    setIsModalOpen(true)
  }

  const handleDecision = async (decision: 'approve' | 'reject' | 'request_revision') => {
    if (!selectedApplication) return
    if (decision === 'request_revision' && !revisionNotes.trim()) {
      toast.error('Catatan revisi wajib diisi')
      return
    }
    if (decision === 'reject' && !rejectedReason.trim()) {
      toast.error('Alasan penolakan wajib diisi')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/super-admin/tenant-applications/${selectedApplication.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          reviewNotes,
          revisionNotes,
          rejectedReason,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Gagal memproses aplikasi tenant')
        return
      }
      toast.success(json.message || 'Aplikasi tenant berhasil diproses')
      setIsModalOpen(false)
      setSelectedApplication(null)
      loadApplications()
    } catch {
      toast.error('Gagal memproses aplikasi tenant')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProvision = async () => {
    if (!selectedApplication) return
    if (selectedApplication.status !== 'APPROVED') {
      toast.error('Aplikasi harus approved sebelum diprovision')
      return
    }
    if (!slugApproved.trim()) {
      toast.error('Slug tenant final wajib diisi')
      return
    }

    setIsProvisioning(true)
    try {
      const res = await fetch(`/api/super-admin/tenant-applications/${selectedApplication.id}/provision`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugApproved }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Gagal memprovision tenant')
        return
      }

      setProvisionResult({
        tenantSlug: json.data.tenantSlug,
        adminEmail: json.data.adminEmail,
        tempPassword: json.data.tempPassword,
        isActive: json.data.isActive,
      })
      toast.success(json.message || 'Tenant berhasil diprovision')
      await loadApplications()
    } catch {
      toast.error('Gagal memprovision tenant')
    } finally {
      setIsProvisioning(false)
    }
  }

  const columns: Column<TenantApplicationRow>[] = [
    {
      header: 'Sekolah',
      accessor: (row) => (
        <div>
          <div className={shared.cellName}>{row.namaSekolah}</div>
          <div className={shared.cellSub}>
            {row.applicationCode} · {row.jenjang} · {row.slugRequest}
          </div>
        </div>
      ),
    },
    {
      header: 'PIC',
      accessor: (row) => (
        <div>
          <div className={shared.cellName}>{row.namaPic}</div>
          <div className={shared.cellSub}>
            {row.jabatanPic} · {row.emailPic}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => <span className={getStatusClass(row.status)}>{getStatusLabel(row.status)}</span>,
      align: 'center',
      width: '160px',
    },
    {
      header: 'Submitted',
      accessor: (row) => (
        <div>
          <div className={shared.cellName}>{formatDateTime(row.submittedAt)}</div>
          <div className={shared.cellSub}>{row.sumberLead || 'Tanpa sumber lead'}</div>
        </div>
      ),
      width: '220px',
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
    <div className={shared.container}>
      <div className={shared.header}>
        <div className={shared.headerLeft}>
          <h2 className={shared.title}>Tenant Applications</h2>
          <p className={shared.subtitle}>
            Review aplikasi tenant baru sebelum sekolah masuk ke tahap approval dan provisioning.
          </p>
        </div>
      </div>

      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}><div className={styles.summaryLabel}>Total</div><div className={styles.summaryValue}>{summary.total}</div></article>
        <article className={styles.summaryCard}><div className={styles.summaryLabel}>Submitted</div><div className={styles.summaryValue}>{summary.submitted}</div></article>
        <article className={styles.summaryCard}><div className={styles.summaryLabel}>Perlu Revisi</div><div className={styles.summaryValue}>{summary.revisionRequested}</div></article>
        <article className={styles.summaryCard}><div className={styles.summaryLabel}>Approved</div><div className={styles.summaryValue}>{summary.approved}</div></article>
        <article className={styles.summaryCard}><div className={styles.summaryLabel}>Rejected</div><div className={styles.summaryValue}>{summary.rejected}</div></article>
        <article className={styles.summaryCard}><div className={styles.summaryLabel}>Provisioned</div><div className={styles.summaryValue}>{summary.provisioned}</div></article>
      </section>

      <div className={shared.toolbar}>
        <SearchInput
          placeholder="Cari kode aplikasi, sekolah, slug, atau PIC..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className={shared.formInput}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '220px', maxWidth: '100%' }}
        >
          <option value="ALL">Semua Status</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="REVISION_REQUESTED">Perlu Revisi</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="PROVISIONED">Provisioned</option>
        </select>
      </div>

      <DataTable columns={columns} data={applications} isLoading={loading} emptyMessage="Belum ada aplikasi tenant" />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (isSubmitting) return
          setIsModalOpen(false)
          setSelectedApplication(null)
        }}
        title={selectedApplication ? `Review ${selectedApplication.namaSekolah}` : 'Review aplikasi tenant'}
        maxWidth="860px"
        footer={
          <div className={styles.modalActions}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Tutup
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleDecision('request_revision')}
              isLoading={isSubmitting}
              leftIcon={<RotateCcw size={16} />}
            >
              Minta Revisi
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDecision('reject')}
              isLoading={isSubmitting}
              leftIcon={<XCircle size={16} />}
            >
              Tolak
            </Button>
            <Button
              onClick={() => handleDecision('approve')}
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 size={16} />}
            >
              Approve
            </Button>
            {selectedApplication?.status === 'APPROVED' ? (
              <Button
                onClick={handleProvision}
                isLoading={isProvisioning}
                leftIcon={<ShieldCheck size={16} />}
              >
                Provision Tenant
              </Button>
            ) : null}
          </div>
        }
      >
        {selectedApplication ? (
          <div>
            <div className={styles.reviewCard}>
              <div>
                <strong>Sekolah</strong>
                <span>{selectedApplication.namaSekolah}</span>
              </div>
              <div>
                <strong>Kode Aplikasi</strong>
                <span>{selectedApplication.applicationCode}</span>
              </div>
              <div>
                <strong>Jenjang</strong>
                <span>{selectedApplication.jenjang} · {selectedApplication.statusSekolah}</span>
              </div>
              <div>
                <strong>Slug Request</strong>
                <span>{selectedApplication.slugRequest}</span>
              </div>
              <div>
                <strong>Kontak Sekolah</strong>
                <span>{selectedApplication.emailSekolah} · {selectedApplication.teleponSekolah}</span>
              </div>
              <div>
                <strong>Wilayah</strong>
                <span>{selectedApplication.kotaKabupaten}, {selectedApplication.provinsi}</span>
              </div>
              <div>
                <strong>PIC</strong>
                <span>{selectedApplication.namaPic} · {selectedApplication.jabatanPic}</span>
              </div>
              <div>
                <strong>Kontak PIC</strong>
                <span>{selectedApplication.emailPic} · {selectedApplication.whatsappPic}</span>
              </div>
              <div>
                <strong>Estimasi Siswa</strong>
                <span>{selectedApplication.jumlahSiswaSaatIni ?? 0} siswa</span>
              </div>
              <div>
                <strong>Submitted</strong>
                <span>{formatDateTime(selectedApplication.submittedAt)}</span>
              </div>
            </div>

            <div className={styles.notesBox}>
              <strong>Alamat Sekolah</strong>
              <span>{selectedApplication.alamat}</span>
            </div>

            <div className={styles.notesBox}>
              <strong>Kebutuhan Utama</strong>
              <span>{selectedApplication.kebutuhanUtama}</span>
            </div>

            {selectedApplication.catatanTambahan ? (
              <div className={styles.notesBox}>
                <strong>Catatan Tambahan</strong>
                <span>{selectedApplication.catatanTambahan}</span>
              </div>
            ) : null}

            <div className={styles.notesBox}>
              <strong>Status Saat Ini</strong>
              <span>{getStatusLabel(selectedApplication.status)}</span>
            </div>

            <label className={styles.field}>
              <span>Catatan internal review</span>
              <textarea
                className={shared.formInput}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                placeholder="Catatan internal untuk review aplikasi ini."
              />
            </label>

            <label className={styles.field}>
              <span>Catatan revisi ke applicant</span>
              <textarea
                className={shared.formInput}
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                rows={3}
                placeholder="Isi jika aplikasi perlu diperbaiki sebelum approval."
              />
            </label>

            <label className={styles.field}>
              <span>Alasan penolakan</span>
              <textarea
                className={shared.formInput}
                value={rejectedReason}
                onChange={(e) => setRejectedReason(e.target.value)}
                rows={3}
                placeholder="Isi jika aplikasi perlu ditolak."
              />
            </label>

            {(selectedApplication.reviewNotes || selectedApplication.revisionNotes || selectedApplication.rejectedReason) ? (
              <div className={styles.historyGrid}>
                {selectedApplication.reviewNotes ? (
                  <div className={styles.notesBox}>
                    <strong>Review Notes Sebelumnya</strong>
                    <span>{selectedApplication.reviewNotes}</span>
                  </div>
                ) : null}
                {selectedApplication.revisionNotes ? (
                  <div className={styles.notesBox}>
                    <strong>Revision Notes Sebelumnya</strong>
                    <span>{selectedApplication.revisionNotes}</span>
                  </div>
                ) : null}
                {selectedApplication.rejectedReason ? (
                  <div className={styles.notesBox}>
                    <strong>Rejection Reason Sebelumnya</strong>
                    <span>{selectedApplication.rejectedReason}</span>
                  </div>
                ) : null}
              </div>
            ) : null}

            {selectedApplication.status === 'APPROVED' ? (
              <div className={styles.readyBox}>
                <FileSearch size={18} />
                <span>Aplikasi ini sudah approved dan siap dilanjutkan ke flow provisioning tenant.</span>
              </div>
            ) : null}

            {selectedApplication.status === 'APPROVED' ? (
              <label className={styles.field}>
                <span>Slug tenant final</span>
                <input
                  className={shared.formInput}
                  value={slugApproved}
                  onChange={(e) => setSlugApproved(e.target.value)}
                  placeholder="slug-tenant-final"
                />
              </label>
            ) : null}

            {provisionResult ? (
              <div className={styles.notesBox}>
                <strong>Hasil Provisioning</strong>
                <span>Tenant slug: {provisionResult.tenantSlug}</span>
                <span>Admin email: {provisionResult.adminEmail}</span>
                <span>Password sementara: {provisionResult.tempPassword}</span>
                <span>Status tenant: {provisionResult.isActive ? 'Aktif' : 'Perlu aktivasi manual'}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
