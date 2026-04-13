'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Building2, Pencil, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button, DataTable, Modal, SearchInput } from '@/components/ui'
import type { Column } from '@/components/ui'
import { getTenantHost } from '@/lib/runtime/app-context'
import shared from '@/styles/page.module.css'
import styles from './page.module.css'

type TenantRow = {
  id: string
  nama: string
  slug: string
  email: string | null
  telepon: string | null
  paket: string
  planId: string | null
  planName: string
  isActive: boolean
  tenantStatus: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'ARCHIVED'
  berlanggananSampai: string | null
  trialEndsAt: string | null
  status: 'ACTIVE' | 'TRIAL' | 'FREE' | 'SUSPENDED' | 'EXPIRED' | 'ARCHIVED'
  subscriptionStatus: string | null
  studentCapacity: number
  subscriptionStartsAt: string | null
  subscriptionEndsAt: string | null
  owner: {
    id: string
    nama: string
    email: string
    username: string
  } | null
  stats: {
    users: number
    siswas: number
    tagihans: number
  }
  overridesCount: number
}

type Summary = {
  total: number
  active: number
  free: number
  trial: number
  suspended: number
  expiringSoon: number
}

type PlanOption = {
  id: string
  code: string
  name: string
  studentCapacity: number
}

const initialSummary: Summary = {
  total: 0,
  active: 0,
  free: 0,
  trial: 0,
  suspended: 0,
  expiringSoon: 0,
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
  const [summary, setSummary] = useState<Summary>(initialSummary)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [currentHostname, setCurrentHostname] = useState('schoolpro.id')
  const [editTarget, setEditTarget] = useState<TenantRow | null>(null)
  const [formData, setFormData] = useState({
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

  const fetchTenants = async () => {
    setLoading(true)
    try {
      const url = searchQuery
        ? `/api/super-admin/tenants?search=${encodeURIComponent(searchQuery)}`
        : '/api/super-admin/tenants'
      const res = await fetch(url)
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Gagal memuat tenant')
        return
      }
      setData(json.data || [])
      setSummary(json.summary || initialSummary)
    } catch {
      toast.error('Gagal memuat tenant')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(fetchTenants, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

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
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={loading}
        emptyMessage="Belum ada tenant yang dapat ditampilkan"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Kelola Tenant"
        maxWidth="680px"
      >
        <form className={shared.form} onSubmit={handleSubmit}>
          {errorMsg && <div className={shared.errorAlert}>{errorMsg}</div>}

          <div className={shared.formRow}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Nama Tenant</label>
              <input
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                className={shared.formInput}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Plan</label>
              <select
                name="planId"
                value={formData.planId}
                onChange={handleInputChange}
                className={shared.formInput}
                disabled={isSubmitting}
              >
                <option value="">Pilih plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} ({plan.code}){plan.studentCapacity > 0 ? ` · ${plan.studentCapacity} siswa` : ' · Free'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={shared.formRow}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Email Tenant</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={shared.formInput}
                disabled={isSubmitting}
                placeholder="email@sekolah.sch.id"
              />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Telepon</label>
              <input
                name="telepon"
                value={formData.telepon}
                onChange={handleInputChange}
                className={shared.formInput}
                disabled={isSubmitting}
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          <div className={shared.formRow}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Berlangganan Sampai</label>
              <input
                name="berlanggananSampai"
                type="date"
                value={formData.berlanggananSampai}
                onChange={handleInputChange}
                className={shared.formInput}
                disabled={isSubmitting}
              />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Trial Sampai</label>
              <input
                name="trialEndsAt"
                type="date"
                value={formData.trialEndsAt}
                onChange={handleInputChange}
                className={shared.formInput}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className={shared.formRow}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Tenant Status</label>
              <select
                name="tenantStatus"
                value={formData.tenantStatus}
                onChange={handleInputChange}
                className={shared.formInput}
                disabled={isSubmitting}
              >
                <option value="TRIAL">TRIAL</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Fallback Package</label>
              <select
                name="paket"
                value={formData.paket}
                onChange={handleInputChange}
                className={shared.formInput}
                disabled={isSubmitting}
              >
                {plans.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.name} ({option.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={shared.formRow}>
            <div className={styles.toggleWrap}>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="toggle-input"
                  disabled={isSubmitting}
                />
                <div className="toggle-slider" />
                <span className="toggle-label">Tenant Aktif</span>
              </label>
            </div>
          </div>

          <div className={styles.infoPanel}>
            <div>
              <strong>Slug</strong>
              <span>{editTarget ? formatTenantHost(editTarget.slug) : '-'}</span>
            </div>
            <div>
              <strong>Owner</strong>
              <span>{editTarget?.owner?.nama || 'Belum ada owner tenant'}</span>
            </div>
            <div>
              <strong>Subscription</strong>
              <span>
                {editTarget?.subscriptionStatus || 'Belum tersinkronisasi'}
                {editTarget?.studentCapacity ? ` · ${editTarget.studentCapacity} siswa` : ' · tanpa kuota'}
              </span>
            </div>
            <div>
              <strong>Statistik</strong>
              <span>
                <Users size={14} />
                {editTarget?.stats.users || 0} user aktif terdaftar
              </span>
            </div>
          </div>

          <div className={shared.modalFooter}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Simpan Tenant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
