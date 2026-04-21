'use client'

import { useState } from 'react'
import { BellRing, Building2, CreditCard, Save, Settings2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui'
import type { PlatformSettings } from '@/features/super-admin/lib/settings'
import shared from '@/styles/page.module.css'
import styles from '@/app/super-admin/settings/page.module.css'

type PlanOption = {
  id: string
  code: string
  name: string
  studentCapacity: number
  isDefault: boolean
}

type AvailableFeature = {
  key: string
  label: string
  description: string
}

type Props = {
  initialSettings: PlatformSettings
  plans: PlanOption[]
  availableFeatures: AvailableFeature[]
}

export function PlatformSettingsClient({ initialSettings, plans, availableFeatures }: Props) {
  const [formData, setFormData] = useState<PlatformSettings>(initialSettings)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTextChange = (
    section: keyof PlatformSettings,
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const toggleFeature = (featureKey: string) => {
    setFormData((prev) => ({
      ...prev,
      provisioning: {
        ...prev.provisioning,
        defaultFeatureKeys: prev.provisioning.defaultFeatureKeys.includes(featureKey)
          ? prev.provisioning.defaultFeatureKeys.filter((item) => item !== featureKey)
          : [...prev.provisioning.defaultFeatureKeys, featureKey],
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/super-admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Gagal menyimpan pengaturan platform')
        return
      }

      setFormData(json.data)
      toast.success(json.message || 'Pengaturan platform berhasil disimpan')
    } catch {
      toast.error('Gagal menyimpan pengaturan platform')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.formLayout}>
      <section className={styles.heroCard}>
        <div>
          <div className={styles.heroBadge}>
            <Settings2 size={14} />
            MVP Platform Settings
          </div>
          <h3 className={styles.heroTitle}>Pengaturan ini menjadi default operasional lintas tenant untuk batch onboarding dan billing berikutnya.</h3>
          <p className={styles.heroDesc}>
            Scope halaman ini dibatasi ke default provisioning tenant baru, parameter operasional billing manual,
            dan target notifikasi internal. Pengaturan tenant sekolah tetap berada di area tenant masing-masing.
          </p>
        </div>
        <div className={styles.heroActions}>
          <Button type="submit" isLoading={isSubmitting} leftIcon={<Save size={16} />}>
            Simpan Pengaturan
          </Button>
        </div>
      </section>

      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}><Building2 size={18} /></div>
          <div>
            <h3 className={styles.sectionTitle}>Provisioning Defaults</h3>
            <p className={styles.sectionDesc}>Default yang dipakai saat tenant baru mulai diaktifkan atau masuk masa trial.</p>
          </div>
        </div>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span>Plan Default</span>
            <select
              className={shared.formInput}
              value={formData.provisioning.defaultPlanCode}
              onChange={(e) => handleTextChange('provisioning', 'defaultPlanCode', e.target.value)}
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.code}>
                  {plan.name} ({plan.code}){plan.isDefault ? ' · default plan' : ''}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Durasi Trial Default (hari)</span>
            <input
              className={shared.formInput}
              type="number"
              min={0}
              value={formData.provisioning.defaultTrialDays}
              onChange={(e) => handleTextChange('provisioning', 'defaultTrialDays', Number(e.target.value))}
            />
          </label>

          <label className={styles.field}>
            <span>Kapasitas Trial Default</span>
            <input
              className={shared.formInput}
              type="number"
              min={0}
              value={formData.provisioning.defaultTrialStudentCapacity}
              onChange={(e) => handleTextChange('provisioning', 'defaultTrialStudentCapacity', Number(e.target.value))}
            />
          </label>
        </div>

        <div className={styles.checkboxRow}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.provisioning.requireManualTenantActivation}
              onChange={(e) => handleTextChange('provisioning', 'requireManualTenantActivation', e.target.checked)}
            />
            <span>Tenant baru tetap butuh aktivasi manual super admin</span>
          </label>
        </div>

        <div className={styles.featureSection}>
          <div>
            <strong className={styles.miniTitle}>Feature defaults tenant baru</strong>
            <p className={styles.miniDesc}>Dipakai sebagai baseline override default saat onboarding tenant baru membutuhkan kontrol khusus.</p>
          </div>
          <div className={styles.featureGrid}>
            {availableFeatures.map((feature) => (
              <label key={feature.key} className={styles.featureItem}>
                <input
                  type="checkbox"
                  checked={formData.provisioning.defaultFeatureKeys.includes(feature.key)}
                  onChange={() => toggleFeature(feature.key)}
                />
                <div>
                  <strong>{feature.label}</strong>
                  <span>{feature.description}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}><CreditCard size={18} /></div>
          <div>
            <h3 className={styles.sectionTitle}>Billing Defaults</h3>
            <p className={styles.sectionDesc}>Parameter dasar untuk order billing manual dan komunikasi pembayaran tenant.</p>
          </div>
        </div>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span>Bank Tujuan</span>
            <input
              className={shared.formInput}
              value={formData.billing.paymentBankName}
              onChange={(e) => handleTextChange('billing', 'paymentBankName', e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Atas Nama</span>
            <input
              className={shared.formInput}
              value={formData.billing.paymentAccountName}
              onChange={(e) => handleTextChange('billing', 'paymentAccountName', e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Nomor Rekening</span>
            <input
              className={shared.formInput}
              value={formData.billing.paymentAccountNumber}
              onChange={(e) => handleTextChange('billing', 'paymentAccountNumber', e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Order Expiry (hari)</span>
            <input
              className={shared.formInput}
              type="number"
              min={1}
              value={formData.billing.orderExpiryDays}
              onChange={(e) => handleTextChange('billing', 'orderExpiryDays', Number(e.target.value))}
            />
          </label>

          <label className={styles.field}>
            <span>Renewal Reminder (hari)</span>
            <input
              className={shared.formInput}
              type="number"
              min={1}
              value={formData.billing.renewalReminderDays}
              onChange={(e) => handleTextChange('billing', 'renewalReminderDays', Number(e.target.value))}
            />
          </label>
        </div>

        <label className={styles.field}>
          <span>Instruksi Pembayaran</span>
          <textarea
            className={styles.textarea}
            rows={4}
            value={formData.billing.paymentInstructions}
            onChange={(e) => handleTextChange('billing', 'paymentInstructions', e.target.value)}
          />
        </label>
      </section>

      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}><BellRing size={18} /></div>
          <div>
            <h3 className={styles.sectionTitle}>Platform Notifications</h3>
            <p className={styles.sectionDesc}>Kontak internal dan event yang perlu diberi notifikasi operasional.</p>
          </div>
        </div>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span>Email Operasional</span>
            <input
              className={shared.formInput}
              type="email"
              value={formData.notifications.operationsEmail}
              onChange={(e) => handleTextChange('notifications', 'operationsEmail', e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Email Billing</span>
            <input
              className={shared.formInput}
              type="email"
              value={formData.notifications.billingEmail}
              onChange={(e) => handleTextChange('notifications', 'billingEmail', e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>WhatsApp Support Internal</span>
            <input
              className={shared.formInput}
              value={formData.notifications.supportWhatsapp}
              onChange={(e) => handleTextChange('notifications', 'supportWhatsapp', e.target.value)}
            />
          </label>
        </div>

        <div className={styles.toggleGrid}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.notifications.notifyNewTenantApplication}
              onChange={(e) => handleTextChange('notifications', 'notifyNewTenantApplication', e.target.checked)}
            />
            <span>Alert aplikasi tenant baru</span>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.notifications.notifySubscriptionOrder}
              onChange={(e) => handleTextChange('notifications', 'notifySubscriptionOrder', e.target.checked)}
            />
            <span>Alert order subscription baru</span>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.notifications.notifyExpiringSubscription}
              onChange={(e) => handleTextChange('notifications', 'notifyExpiringSubscription', e.target.checked)}
            />
            <span>Alert subscription mendekati jatuh tempo</span>
          </label>
        </div>
      </section>
    </form>
  )
}
