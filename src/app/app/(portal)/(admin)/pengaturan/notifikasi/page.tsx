import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getSessionUser, hasAnyRole } from '@/lib/auth/session'
import { TenantNotificationSettingsClient } from '@/features/settings/components/TenantNotificationSettingsClient'
import shared from '@/styles/page.module.css'

export default async function NotificationSettingsPage() {
  const session = await auth()
  const userSession = getSessionUser(session)

  if (!userSession) {
    redirect('/app/login')
  }

  if (userSession.role === 'SUPER_ADMIN') {
    redirect('/super-admin/dashboard')
  }

  if (userSession.role === 'WALI' || userSession.role === 'SISWA' || userSession.role === 'USER') {
    redirect('/app/beranda')
  }

  if (!userSession.tenantId || !hasAnyRole(userSession, ['ADMIN'])) {
    redirect('/app/dashboard')
  }

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div className={shared.headerLeft}>
          <h2 className={shared.title}>Pengaturan Notifikasi</h2>
          <p className={shared.subtitle}>
            Kelola gateway email SMTP Marketing dan WhatsApp StarSender untuk tenant sekolah Anda.
          </p>
        </div>
      </div>

      <TenantNotificationSettingsClient tenantName={userSession.tenantNama || 'tenant aktif'} />
    </div>
  )
}
