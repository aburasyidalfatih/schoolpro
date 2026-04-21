'use client'

import { useEffect, useState } from 'react'
import { Mail, MessageCircleMore, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui'
import type { TenantNotificationGatewaySettings } from '@/features/settings/lib/notification-gateway'
import shared from '@/styles/page.module.css'
import styles from '@/app/app/(portal)/(admin)/pengaturan/notifikasi/page.module.css'

type Props = {
  tenantName: string
}

const initialSettings: TenantNotificationGatewaySettings = {
  emailGateway: {
    provider: 'smtp_marketing',
    isActive: false,
    host: '',
    port: 587,
    username: '',
    password: '',
    fromName: '',
    fromEmail: '',
    secure: false,
  },
  whatsappGateway: {
    provider: 'starsender',
    isActive: false,
    baseUrl: 'https://api.starsender.online',
    apiKey: '',
    deviceId: '',
    senderName: '',
  },
}

export function TenantNotificationSettingsClient({ tenantName }: Props) {
  const [settings, setSettings] = useState<TenantNotificationGatewaySettings>(initialSettings)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/pengaturan/notifikasi')
        const json = await res.json()
        if (!res.ok) {
          toast.error(json.error || 'Gagal memuat pengaturan notifikasi')
          return
        }
        setSettings(json.data?.settings || initialSettings)
      } catch {
        toast.error('Gagal memuat pengaturan notifikasi')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const updateEmail = (field: keyof TenantNotificationGatewaySettings['emailGateway'], value: string | number | boolean) => {
    setSettings((prev) => ({
      ...prev,
      emailGateway: {
        ...prev.emailGateway,
        [field]: value,
      },
    }))
  }

  const updateWhatsapp = (field: keyof TenantNotificationGatewaySettings['whatsappGateway'], value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      whatsappGateway: {
        ...prev.whatsappGateway,
        [field]: value,
      },
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/pengaturan/notifikasi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Gagal menyimpan pengaturan notifikasi')
        return
      }
      setSettings(json.data?.settings || settings)
      toast.success(json.message || 'Pengaturan notifikasi berhasil disimpan')
    } catch {
      toast.error('Gagal menyimpan pengaturan notifikasi')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div className={styles.loadingCard}>Memuat pengaturan notifikasi...</div>
  }

  return (
    <form className={styles.formLayout} onSubmit={handleSave}>
      <section className={styles.heroCard}>
        <div>
          <span className={styles.heroBadge}>Tenant Scope</span>
          <h3 className={styles.heroTitle}>Pengaturan gateway notifikasi untuk {tenantName}</h3>
          <p className={styles.heroDesc}>
            Halaman ini menyimpan kredensial pengiriman tenant untuk SMTP Marketing dan StarSender.
            Data tetap terscope ke tenant aktif dan tidak dibagikan ke tenant lain.
          </p>
        </div>
        <Button type="submit" isLoading={isSubmitting} leftIcon={<Save size={16} />}>
          Simpan Pengaturan
        </Button>
      </section>

      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}><Mail size={18} /></div>
          <div>
            <h3 className={styles.sectionTitle}>SMTP Marketing</h3>
            <p className={styles.sectionDesc}>Konfigurasi email outbound tenant untuk notifikasi yang dikirim lewat SMTP Marketing.</p>
          </div>
        </div>

        <label className={styles.toggleRow}>
          <input
            type="checkbox"
            checked={settings.emailGateway.isActive}
            onChange={(e) => updateEmail('isActive', e.target.checked)}
          />
          <span>Aktifkan pengiriman email tenant</span>
        </label>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span>SMTP Host</span>
            <input className={shared.formInput} value={settings.emailGateway.host} onChange={(e) => updateEmail('host', e.target.value)} placeholder="smtp.mailketing.com" />
          </label>
          <label className={styles.field}>
            <span>SMTP Port</span>
            <input className={shared.formInput} type="number" value={settings.emailGateway.port} onChange={(e) => updateEmail('port', Number(e.target.value))} placeholder="587" />
          </label>
          <label className={styles.field}>
            <span>Username</span>
            <input className={shared.formInput} value={settings.emailGateway.username} onChange={(e) => updateEmail('username', e.target.value)} placeholder="username SMTP Marketing" />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <input className={shared.formInput} value={settings.emailGateway.password} onChange={(e) => updateEmail('password', e.target.value)} type="password" placeholder="Password SMTP Marketing" />
          </label>
          <label className={styles.field}>
            <span>From Name</span>
            <input className={shared.formInput} value={settings.emailGateway.fromName} onChange={(e) => updateEmail('fromName', e.target.value)} placeholder="SchoolPro / Nama Sekolah" />
          </label>
          <label className={styles.field}>
            <span>From Email</span>
            <input className={shared.formInput} type="email" value={settings.emailGateway.fromEmail} onChange={(e) => updateEmail('fromEmail', e.target.value)} placeholder="no-reply@domainsekolah.id" />
          </label>
        </div>

        <label className={styles.toggleRow}>
          <input
            type="checkbox"
            checked={settings.emailGateway.secure}
            onChange={(e) => updateEmail('secure', e.target.checked)}
          />
          <span>Gunakan koneksi secure SSL/TLS</span>
        </label>
      </section>

      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}><MessageCircleMore size={18} /></div>
          <div>
            <h3 className={styles.sectionTitle}>StarSender WhatsApp Gateway</h3>
            <p className={styles.sectionDesc}>Konfigurasi gateway WhatsApp tenant untuk pengiriman notifikasi melalui StarSender.</p>
          </div>
        </div>

        <label className={styles.toggleRow}>
          <input
            type="checkbox"
            checked={settings.whatsappGateway.isActive}
            onChange={(e) => updateWhatsapp('isActive', e.target.checked)}
          />
          <span>Aktifkan pengiriman WhatsApp tenant</span>
        </label>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span>Base URL</span>
            <input className={shared.formInput} value={settings.whatsappGateway.baseUrl} onChange={(e) => updateWhatsapp('baseUrl', e.target.value)} placeholder="https://api.starsender.online" />
          </label>
          <label className={styles.field}>
            <span>API Key</span>
            <input className={shared.formInput} value={settings.whatsappGateway.apiKey} onChange={(e) => updateWhatsapp('apiKey', e.target.value)} type="password" placeholder="API Key StarSender" />
          </label>
          <label className={styles.field}>
            <span>Device ID</span>
            <input className={shared.formInput} value={settings.whatsappGateway.deviceId} onChange={(e) => updateWhatsapp('deviceId', e.target.value)} placeholder="Device ID / Instance ID" />
          </label>
          <label className={styles.field}>
            <span>Sender Name</span>
            <input className={shared.formInput} value={settings.whatsappGateway.senderName} onChange={(e) => updateWhatsapp('senderName', e.target.value)} placeholder="Nama pengirim / label tenant" />
          </label>
        </div>
      </section>
    </form>
  )
}
