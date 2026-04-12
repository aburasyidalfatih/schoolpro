'use client'

import { useEffect, useState } from 'react'
import { Pencil, Sparkles, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button, DataTable, Modal } from '@/components/ui'
import type { Column } from '@/components/ui'
import shared from '@/styles/page.module.css'
import styles from './page.module.css'

type AvailableFeature = {
  key: string
  label: string
  description: string
}

type PlanRow = {
  id: string
  code: string
  name: string
  description: string | null
  price: number
  studentCapacity: number
  billingPeriod: string
  isDefault: boolean
  isActive: boolean
  isPublic: boolean
  fullAccess: boolean
  sortOrder: number
  features: string[]
  tenantCount: number
}

const initialForm = {
  id: '',
  code: '',
  name: '',
  description: '',
  price: '0',
  studentCapacity: '0',
  billingPeriod: 'YEARLY',
  isDefault: false,
  isActive: true,
  isPublic: true,
  fullAccess: false,
  sortOrder: '0',
  features: [] as string[],
}

function formatCurrency(value: number) {
  return `Rp${new Intl.NumberFormat('id-ID').format(value)}`
}

export default function SuperAdminPlansPage() {
  const [plans, setPlans] = useState<PlanRow[]>([])
  const [availableFeatures, setAvailableFeatures] = useState<AvailableFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PlanRow | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<PlanRow | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [formData, setFormData] = useState(initialForm)

  const loadPlans = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/super-admin/plans')
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Gagal memuat plans')
        return
      }
      setPlans(json.data || [])
      setAvailableFeatures(json.availableFeatures || [])
    } catch {
      toast.error('Gagal memuat plans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [])

  const openCreateModal = () => {
    setEditingPlan(null)
    setFormData(initialForm)
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const openEditModal = (plan: PlanRow) => {
    setEditingPlan(plan)
    setFormData({
      id: plan.id,
      code: plan.code,
      name: plan.name,
      description: plan.description || '',
      price: String(plan.price),
      studentCapacity: String(plan.studentCapacity),
      billingPeriod: plan.billingPeriod,
      isDefault: plan.isDefault,
      isActive: plan.isActive,
      isPublic: plan.isPublic,
      fullAccess: plan.fullAccess,
      sortOrder: String(plan.sortOrder),
      features: plan.features,
    })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const toggleFeature = (featureKey: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(featureKey)
        ? prev.features.filter((item) => item !== featureKey)
        : [...prev.features, featureKey],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const url = editingPlan ? `/api/super-admin/plans/${editingPlan.id}` : '/api/super-admin/plans'
      const method = editingPlan ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price || 0),
          studentCapacity: Number(formData.studentCapacity || 0),
          sortOrder: Number(formData.sortOrder || 0),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error || 'Gagal menyimpan plan')
        return
      }
      toast.success(json.message || 'Plan berhasil disimpan')
      setIsModalOpen(false)
      loadPlans()
    } catch {
      setErrorMsg('Terjadi kesalahan server')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteModal = (plan: PlanRow) => {
    setDeletingPlan(plan)
    setErrorMsg('')
  }

  const handleDelete = async () => {
    if (!deletingPlan) return

    setIsDeleting(true)
    setErrorMsg('')

    try {
      const res = await fetch(`/api/super-admin/plans/${deletingPlan.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error || 'Gagal menghapus plan')
        return
      }

      toast.success(json.message || 'Plan berhasil dihapus')
      setDeletingPlan(null)
      await loadPlans()
    } catch {
      setErrorMsg('Terjadi kesalahan server')
    } finally {
      setIsDeleting(false)
    }
  }

  const annualPrice = Number(formData.price || 0)
  const capacity = Number(formData.studentCapacity || 0)
  const effectivePerStudent = capacity > 0 ? Math.round(annualPrice / capacity) : 0

  const columns: Column<PlanRow>[] = [
    {
      header: 'Plan',
      accessor: (row) => (
        <div>
          <div className={shared.cellName}>{row.name}</div>
          <div className={shared.cellSub}>
            {row.code}
            {row.isDefault ? ' · Default' : ''}
          </div>
        </div>
      ),
    },
    {
      header: 'Kapasitas',
      accessor: (row) => (
        <div>
          <div className={shared.cellName}>
            {row.studentCapacity > 0 ? `${new Intl.NumberFormat('id-ID').format(row.studentCapacity)} siswa` : 'Free'}
          </div>
          <div className={shared.cellSub}>
            {row.studentCapacity > 0 ? `${formatCurrency(Math.round(row.price / row.studentCapacity))}/siswa/tahun` : 'CMS only'}
          </div>
        </div>
      ),
      width: '160px',
    },
    {
      header: 'Harga Tahunan',
      accessor: (row) => (
        <div>
          <div className={shared.cellName}>{formatCurrency(row.price)}</div>
          <div className={shared.cellSub}>{row.billingPeriod}</div>
        </div>
      ),
      width: '160px',
    },
    {
      header: 'Access',
      accessor: (row) => (
        <div className={styles.planMetaStack}>
          <span className={styles.metaBadge} data-tone={row.fullAccess ? 'success' : 'info'}>
            {row.fullAccess ? 'Full Access' : `${row.features.length} fitur`}
          </span>
          <span className={styles.metaBadge} data-tone={row.isPublic ? 'neutral' : 'warning'}>
            {row.isPublic ? 'Public' : 'Internal'}
          </span>
        </div>
      ),
    },
    {
      header: 'Tenant',
      accessor: (row) => row.tenantCount,
      align: 'center',
      width: '90px',
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`${shared.statusBadge} ${row.isActive ? shared.statusActive : shared.statusInactive}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
      align: 'center',
      width: '110px',
    },
    {
      header: 'Aksi',
      accessor: (row) => (
        <div className={styles.actionGroup}>
          <button className={shared.actionBtn} onClick={() => openEditModal(row)} title="Edit plan">
            <Pencil size={14} />
          </button>
          <button
            className={`${shared.actionBtn} ${shared.actionBtnDanger}`}
            onClick={() => openDeleteModal(row)}
            title="Hapus plan"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
      align: 'center',
      width: '110px',
    },
  ]

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div className={shared.headerLeft}>
          <h2 className={shared.title}>Plan Management</h2>
          <p className={shared.subtitle}>Kelola plan berbasis slot siswa, harga tahunan, dan visibilitas billing tenant.</p>
        </div>
        <Button onClick={openCreateModal}>Tambah Plan</Button>
      </div>

      <section className={styles.heroCard}>
        <div className={styles.heroBadge}>
          <Sparkles size={14} />
          Slot Pricing
        </div>
        <h3 className={styles.heroTitle}>Plan menjadi katalog kapasitas siswa dan harga tahunan tenant.</h3>
        <p className={styles.heroDesc}>
          Paket `Free` tetap untuk CMS website, sedangkan paket berbayar mengarah ke full access dengan kapasitas siswa aktif yang jelas
          untuk billing tenant self-service.
        </p>
      </section>

      <DataTable columns={columns} data={plans} isLoading={loading} emptyMessage="Belum ada plan yang dapat ditampilkan" />

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingPlan ? 'Edit Plan' : 'Tambah Plan'}
        maxWidth="760px"
      >
        <form className={shared.form} onSubmit={handleSubmit}>
          {errorMsg && <div className={shared.errorAlert}>{errorMsg}</div>}

          <div className={shared.formRow}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Kode</label>
              <input name="code" value={formData.code} onChange={handleChange} className={shared.formInput} required disabled={isSubmitting} />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Nama</label>
              <input name="name" value={formData.name} onChange={handleChange} className={shared.formInput} required disabled={isSubmitting} />
            </div>
          </div>

          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Deskripsi</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className={shared.formInput} disabled={isSubmitting} rows={3} />
          </div>

          <div className={shared.formRow}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Harga Tahunan</label>
              <input name="price" type="number" min="0" value={formData.price} onChange={handleChange} className={shared.formInput} disabled={isSubmitting} />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Kapasitas Siswa</label>
              <input name="studentCapacity" type="number" min="0" value={formData.studentCapacity} onChange={handleChange} className={shared.formInput} disabled={isSubmitting} />
            </div>
          </div>

          <div className={shared.formRow}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Billing Period</label>
              <select name="billingPeriod" value={formData.billingPeriod} onChange={handleChange} className={shared.formInput} disabled={isSubmitting}>
                <option value="YEARLY">YEARLY</option>
              </select>
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Sort Order</label>
              <input name="sortOrder" type="number" min="0" value={formData.sortOrder} onChange={handleChange} className={shared.formInput} disabled={isSubmitting} />
            </div>
          </div>

          <div className={styles.pricingHint}>
            <strong>Preview billing</strong>
            <span>
              {capacity > 0
                ? `${formatCurrency(annualPrice)} per tahun untuk ${new Intl.NumberFormat('id-ID').format(capacity)} siswa aktif, sekitar ${formatCurrency(effectivePerStudent)}/siswa/tahun.`
                : 'Plan tanpa kapasitas siswa cocok untuk free website/CMS atau plan internal.'}
            </span>
          </div>

          <div className={shared.formRow}>
            <label className={styles.checkboxItem}>
              <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} disabled={isSubmitting} />
              <span>Jadikan default plan</span>
            </label>
            <label className={styles.checkboxItem}>
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} disabled={isSubmitting} />
              <span>Plan aktif</span>
            </label>
          </div>

          <div className={shared.formRow}>
            <label className={styles.checkboxItem}>
              <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} disabled={isSubmitting} />
              <span>Tampilkan di billing tenant</span>
            </label>
            <label className={styles.checkboxItem}>
              <input type="checkbox" name="fullAccess" checked={formData.fullAccess} onChange={handleChange} disabled={isSubmitting} />
              <span>Full access semua fitur tenant</span>
            </label>
          </div>

          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Feature Mapping Internal</label>
            <p className={styles.fieldHint}>
              Jika `Full access` aktif, semua fitur platform dianggap aktif untuk tenant berbayar. Mapping di bawah tetap disimpan untuk kompatibilitas
              dan kontrol internal.
            </p>
            <div className={styles.featureGrid}>
              {availableFeatures.map((feature) => (
                <label key={feature.key} className={styles.featureCard}>
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature.key)}
                    onChange={() => toggleFeature(feature.key)}
                    disabled={isSubmitting}
                  />
                  <div>
                    <strong>{feature.label}</strong>
                    <span>{feature.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className={shared.modalFooter}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>{editingPlan ? 'Simpan Perubahan' : 'Buat Plan'}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(deletingPlan)}
        onClose={() => !isDeleting && setDeletingPlan(null)}
        title="Hapus Plan"
        maxWidth="520px"
      >
        <div className={styles.deleteDialog}>
          {errorMsg && <div className={shared.errorAlert}>{errorMsg}</div>}

          <div className={styles.deleteAlert}>
            <strong>{deletingPlan?.name}</strong>
            <span>
              Plan hanya bisa dihapus jika belum dipakai tenant, subscription, atau order billing. Aksi ini tidak bisa dibatalkan.
            </span>
          </div>

          <div className={shared.modalFooter}>
            <Button type="button" variant="secondary" onClick={() => setDeletingPlan(null)} disabled={isDeleting}>
              Batal
            </Button>
            <Button type="button" variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Hapus Plan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
