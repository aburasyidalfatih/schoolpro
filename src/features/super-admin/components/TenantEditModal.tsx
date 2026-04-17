'use client'

import { Users } from 'lucide-react'
import { Button, Modal } from '@/components/ui'
import type { PlanOption, TenantFormData, TenantRow } from '@/features/super-admin/types/tenants'
import shared from '@/styles/page.module.css'
import styles from '@/app/super-admin/tenants/page.module.css'

type TenantEditModalProps = {
  editTarget: TenantRow | null
  formData: TenantFormData
  plans: PlanOption[]
  isOpen: boolean
  isSubmitting: boolean
  errorMsg: string
  formatTenantHost: (slug: string) => string
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export function TenantEditModal({
  editTarget,
  formData,
  plans,
  isOpen,
  isSubmitting,
  errorMsg,
  formatTenantHost,
  onClose,
  onSubmit,
  onInputChange,
}: TenantEditModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title="Kelola Tenant"
      maxWidth="680px"
    >
      <form className={shared.form} onSubmit={onSubmit}>
        {errorMsg && <div className={shared.errorAlert}>{errorMsg}</div>}

        <div className={shared.formRow}>
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Nama Tenant</label>
            <input
              name="nama"
              value={formData.nama}
              onChange={onInputChange}
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
              onChange={onInputChange}
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
              onChange={onInputChange}
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
              onChange={onInputChange}
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
              onChange={onInputChange}
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
              onChange={onInputChange}
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
              onChange={onInputChange}
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
              onChange={onInputChange}
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
                onChange={onInputChange}
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
            onClick={onClose}
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
  )
}
