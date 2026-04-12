'use client'

import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Button, DataTable, Modal, SearchInput } from '@/components/ui'
import type { Column } from '@/components/ui'
import shared from '@/styles/page.module.css'
import styles from './page.module.css'

type FeatureState = {
  key: string
  label: string
  description: string
  source: 'PLAN' | 'OVERRIDE'
  overrideState: 'DEFAULT' | 'ENABLED' | 'DISABLED'
  enabled: boolean
}

type TenantFeatureRow = {
  id: string
  nama: string
  slug: string
  paket: string
  planName: string
  status: string
  featureStates: FeatureState[]
}

export default function SuperAdminFeatureAccessPage() {
  const [tenants, setTenants] = useState<TenantFeatureRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTenant, setSelectedTenant] = useState<TenantFeatureRow | null>(null)
  const [localStates, setLocalStates] = useState<Record<string, 'DEFAULT' | 'ENABLED' | 'DISABLED'>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const loadFeatureAccess = async () => {
    setLoading(true)
    try {
      const url = searchQuery
        ? `/api/super-admin/feature-access?search=${encodeURIComponent(searchQuery)}`
        : '/api/super-admin/feature-access'
      const res = await fetch(url)
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Gagal memuat feature access')
        return
      }
      setTenants(json.data || [])
    } catch {
      toast.error('Gagal memuat feature access')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadFeatureAccess, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const openModal = (tenant: TenantFeatureRow) => {
    setSelectedTenant(tenant)
    setLocalStates(
      Object.fromEntries(tenant.featureStates.map((feature) => [feature.key, feature.overrideState]))
    )
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleStateChange = (featureKey: string, value: 'DEFAULT' | 'ENABLED' | 'DISABLED') => {
    setLocalStates((prev) => ({
      ...prev,
      [featureKey]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTenant) return
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch(`/api/super-admin/tenants/${selectedTenant.id}/features`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overrides: selectedTenant.featureStates.map((feature) => ({
            featureKey: feature.key,
            state: localStates[feature.key] || 'DEFAULT',
          })),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error || 'Gagal memperbarui feature access')
        return
      }
      toast.success(json.message || 'Feature access berhasil diperbarui')
      setIsModalOpen(false)
      loadFeatureAccess()
    } catch {
      setErrorMsg('Terjadi kesalahan server')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: Column<TenantFeatureRow>[] = [
    {
      header: 'Tenant',
      accessor: (row) => (
        <div>
          <div className={shared.cellName}>{row.nama}</div>
          <div className={shared.cellSub}>{row.slug}.schoolpro.id</div>
        </div>
      ),
    },
    {
      header: 'Plan',
      accessor: (row) => (
        <div>
          <div className={shared.cellName}>{row.planName}</div>
          <div className={shared.cellSub}>{row.paket}</div>
        </div>
      ),
      width: '150px',
    },
    {
      header: 'Fitur Aktif',
      accessor: (row) => (
        <div className={styles.featurePills}>
          {row.featureStates.filter((feature) => feature.enabled).slice(0, 4).map((feature) => (
            <span key={feature.key} className={styles.featurePill}>{feature.label}</span>
          ))}
        </div>
      ),
    },
    {
      header: 'Override',
      accessor: (row) => row.featureStates.filter((feature) => feature.source === 'OVERRIDE').length,
      align: 'center',
      width: '90px',
    },
    {
      header: 'Aksi',
      accessor: (row) => (
        <button className={shared.actionBtn} onClick={() => openModal(row)} title="Kelola feature access">
          <Pencil size={14} />
        </button>
      ),
      align: 'center',
      width: '90px',
    },
  ]

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div className={shared.headerLeft}>
          <h2 className={shared.title}>Feature Access</h2>
          <p className={shared.subtitle}>Atur override fitur per tenant di atas mapping default dari plan.</p>
        </div>
      </div>

      <div className={shared.toolbar}>
        <SearchInput
          placeholder="Cari tenant atau slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <DataTable columns={columns} data={tenants} isLoading={loading} emptyMessage="Belum ada tenant yang bisa dikelola" />

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={`Feature Access: ${selectedTenant?.nama || ''}`}
        maxWidth="760px"
      >
        <form className={shared.form} onSubmit={handleSubmit}>
          {errorMsg && <div className={shared.errorAlert}>{errorMsg}</div>}

          <div className={styles.infoPanel}>
            <div>
              <strong>Plan</strong>
              <span>{selectedTenant?.planName || '-'}</span>
            </div>
            <div>
              <strong>Slug</strong>
              <span>{selectedTenant?.slug}.schoolpro.id</span>
            </div>
            <div>
              <strong>Mode</strong>
              <span>DEFAULT mengikuti plan, ENABLED/DISABLED membuat override tenant</span>
            </div>
          </div>

          <div className={styles.featureList}>
            {selectedTenant?.featureStates.map((feature) => (
              <div key={feature.key} className={styles.featureRow}>
                <div>
                  <strong>{feature.label}</strong>
                  <span>{feature.description}</span>
                </div>
                <select
                  className={shared.formInput}
                  value={localStates[feature.key] || 'DEFAULT'}
                  onChange={(e) => handleStateChange(feature.key, e.target.value as 'DEFAULT' | 'ENABLED' | 'DISABLED')}
                  disabled={isSubmitting}
                >
                  <option value="DEFAULT">DEFAULT</option>
                  <option value="ENABLED">ENABLED</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
              </div>
            ))}
          </div>

          <div className={shared.modalFooter}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>Simpan Override</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
