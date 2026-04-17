'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Building2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, Pagination, SearchInput } from '@/components/ui'
import type { Column } from '@/components/ui'
import { TenantEditModal } from '@/features/super-admin/components/TenantEditModal'
import type { PlanOption, TenantFormData, TenantPaginationState, TenantRow, TenantSummary } from '@/features/super-admin/types/tenants'
import { getTenantHost } from '@/lib/runtime/app-context'
import shared from '@/styles/page.module.css'
import styles from './page.module.css'

const initialSummary: TenantSummary = {
  total: 0,
  active: 0,
  free: 0,
  trial: 0,
  suspended: 0,
  expiringSoon: 0,
}

const initialPagination: TenantPaginationState = {
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
}

function formatDateInput(value: string | null) {
  if (!value) return ''
  return value.slice(0, 10)
}

function getStatusLabel(status: TenantRow['status']) {
  switch (status) {
    case 'ACTIVE':
      return 'Aktif'
    case 'FREE':
      return 'Free'
    case 'TRIAL':
      return 'Trial'
    case 'SUSPENDED':
      return 'Suspend'
    case 'EXPIRED':
      return 'Expired'
    case 'ARCHIVED':
      return 'Archived'
    default:
      return status
  }
}

export default function SuperAdminTenantsPage() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<TenantRow[]>([])
  const [plans, setPlans] = useState<PlanOption[]>([])
  const [summary, setSummary] = useState<TenantSummary>(initialSummary)
  const [pagination, setPagination] = useState<TenantPaginationState>(initialPagination)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [page, setPage] = useState(Number.parseInt(searchParams.get('page') || '1', 10) || 1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [currentHostname, setCurrentHostname] = useState('schoolpro.id')
  const [editTarget, setEditTarget] = useState<TenantRow | null>(null)
  const [formData, setFormData] = useState<TenantFormData>({
    nama: '',
    email: '',
    telepon: '',
    paket: 'FREE',
    planId: '',
    tenantStatus: 'TRIAL',
    isActive: true,
    berlanggananSampai: '',
    trialEndsAt: '',
  })

  const fetchTenants = useCallback(async () => {
    setLoading(true)
    try {
      const url = searchQuery
        ? `/api/super-admin/tenants?search=${encodeURIComponent(searchQuery)}&page=${page}&pageSize=${pagination.pageSize}`
        : `/api/super-admin/tenants?page=${page}&pageSize=${pagination.pageSize}`
      const res = await fetch(url)
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Gagal memuat tenant')
        return
      }
      setData(json.data || [])
      setSummary(json.summary || initialSummary)
      setPagination(json.pagination || initialPagination)
      if (json.pagination?.page && json.pagination.page !== page) {
        setPage(json.pagination.page)
      }
    } catch {
      toast.error('Gagal memuat tenant')
    } finally {
      setLoading(false)
    }
  }, [page, pagination.pageSize, searchQuery])

  useEffect(() => {
    const timer = setTimeout(fetchTenants, 300)
    return () => clearTimeout(timer)
  }, [fetchTenants])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHostname(window.location.hostname)
    }
  }, [])

  const formatTenantHost = (slug: string) => getTenantHost(slug, currentHostname)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/super-admin/plans')
        const json = await res.json()
        if (!res.ok) return
        setPlans(json.data || [])
      } catch {}
    }

    fetchPlans()
  }, [])

  const openEditModal = (tenant: TenantRow) => {
    setEditTarget(tenant)
    setFormData({
      nama: tenant.nama,
      email: tenant.email || '',
      telepon: tenant.telepon || '',
      paket: tenant.paket,
      planId: tenant.planId || '',
      tenantStatus: tenant.tenantStatus,
      isActive: tenant.isActive,
      berlanggananSampai: formatDateInput(tenant.berlanggananSampai),
      trialEndsAt: formatDateInput(tenant.trialEndsAt),
    })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (name === 'planId') {
      const selectedPlan = plans.find((plan) => plan.id === value)
      setFormData((prev) => ({
        ...prev,
        planId: value,
        paket: selectedPlan?.code || prev.paket,
        tenantStatus:
          selectedPlan?.code === 'FREE'
            ? 'TRIAL'
            : prev.tenantStatus === 'TRIAL'
              ? 'ACTIVE'
              : prev.tenantStatus,
      }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTarget) return
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch(`/api/super-admin/tenants/${editTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error || 'Gagal memperbarui tenant')
        return
      }
      toast.success(json.message || 'Tenant berhasil diperbarui')
      setIsModalOpen(false)
      setEditTarget(null)
      fetchTenants()
    } catch {
      setErrorMsg('Terjadi kesalahan server')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: Column<TenantRow>[] = [
    {
      header: 'Tenant',
      accessor: (row) => (
        <div className={shared.userCell}>
          <div className={shared.avatar}>
            <Building2 size={16} />
          </div>
          <div>
            <div className={shared.cellName}>{row.nama}</div>
            <div className={shared.cellSub}>{formatTenantHost(row.slug)}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Owner',
      accessor: (row) => (
        <div>
          <div className={shared.cellName}>{row.owner?.nama || 'Belum ada owner'}</div>
          <div className={shared.cellSub}>{row.owner?.email || row.email || '-'}</div>
        </div>
      ),
    },
    {
      header: 'Paket',
      accessor: (row) => (
        <span className={styles.planBadge} data-plan={row.paket}>
          {row.planName}
          {row.studentCapacity > 0 ? ` · ${row.studentCapacity} siswa` : ' · CMS'}
        </span>
      ),
      align: 'center',
      width: '120px',
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`${shared.statusBadge} ${
            row.status === 'ACTIVE'
              ? shared.statusActive
              : row.status === 'FREE' || row.status === 'TRIAL'
                ? shared.statusPending
                : shared.statusInactive
          }`}
        >
          {getStatusLabel(row.status)}
        </span>
      ),
      align: 'center',
      width: '110px',
    },
    {
      header: 'Ringkasan',
      accessor: (row) => (
        <div className={styles.summaryCell}>
          <span>{row.stats.users} user</span>
          <span>{row.stats.siswas} siswa</span>
          <span>{row.stats.tagihans} tagihan</span>
          <span>{row.overridesCount} override</span>
        </div>
      ),
    },
    {
      header: 'Aksi',
      align: 'center',
      width: '100px',
      accessor: (row) => (
        <button
          className={shared.actionBtn}
          onClick={() => openEditModal(row)}
          title="Kelola tenant"
        >
          <Pencil size={14} />
        </button>
      ),
    },
  ]

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div className={shared.headerLeft}>
          <h2 className={shared.title}>Tenant Management</h2>
          <p className={shared.subtitle}>
            Kelola tenant, paket aktif, dan status operasional tenant dari satu panel.
          </p>
        </div>
      </div>

      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total Tenant</div>
          <div className={styles.summaryValue}>{summary.total}</div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Tenant Aktif</div>
          <div className={styles.summaryValue}>{summary.active}</div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Paket Free</div>
          <div className={styles.summaryValue}>{summary.free}</div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Tenant Trial</div>
          <div className={styles.summaryValue}>{summary.trial}</div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Suspend</div>
          <div className={styles.summaryValue}>{summary.suspended}</div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Jatuh Tempo Dekat</div>
          <div className={styles.summaryValue}>{summary.expiringSoon}</div>
        </article>
      </section>

      <div className={shared.toolbar}>
        <SearchInput
          placeholder="Cari nama tenant, slug, atau email..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={loading}
        emptyMessage="Belum ada tenant yang dapat ditampilkan"
      />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={pagination.pageSize}
        onPageChange={setPage}
      />

      <TenantEditModal
        editTarget={editTarget}
        formData={formData}
        plans={plans}
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        errorMsg={errorMsg}
        formatTenantHost={formatTenantHost}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
      />
    </div>
  )
}
