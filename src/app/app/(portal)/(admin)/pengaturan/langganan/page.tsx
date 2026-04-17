import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getSessionUser, hasAnyRole } from '@/lib/auth/session'
import { TenantSubscriptionClient } from '@/features/billing/components/TenantSubscriptionClient'
import { getTenantBillingSubscriptionData, TENANT_BILLING_ROLES } from '@/features/billing/lib/tenant-subscription'
import shared from '@/styles/page.module.css'

export default async function TenantSubscriptionPage() {
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

  if (!userSession.tenantId || !hasAnyRole(userSession, TENANT_BILLING_ROLES)) {
    redirect('/app/dashboard')
  }

  const data = await getTenantBillingSubscriptionData(userSession.tenantId)
  if (!data) {
    redirect('/app/dashboard')
  }

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div className={shared.headerLeft}>
          <h2 className={shared.title}>Langganan</h2>
          <p className={shared.subtitle}>Kelola paket aktif, kuota siswa, dan order billing tenant dari satu halaman.</p>
        </div>
      </div>

      <TenantSubscriptionClient data={data} />
    </div>
  )
}
