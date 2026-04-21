import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/super-admin'
import { getPlatformSettings } from '@/features/super-admin/lib/settings'
import { PlatformSettingsClient } from '@/features/super-admin/components/PlatformSettingsClient'
import { prisma } from '@/lib/db/prisma'
import { availableFeatures } from '@/lib/super-admin'
import shared from '@/styles/page.module.css'
import styles from './page.module.css'

export default async function SuperAdminSettingsPage() {
  const session = await auth()
  const role = typeof session?.user === 'object' && session?.user && 'role' in session.user ? session.user.role : undefined

  if (!isSuperAdmin(session)) {
    if (role === 'WALI' || role === 'SISWA' || role === 'USER') {
      redirect('/app/beranda')
    }
    if (role) {
      redirect('/app/dashboard')
    }
    redirect('/app/login')
  }

  const [settings, plans] = await Promise.all([
    getPlatformSettings(),
    prisma.plan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        code: true,
        name: true,
        studentCapacity: true,
        isDefault: true,
      },
    }),
  ])

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div className={shared.headerLeft}>
          <h2 className={shared.title}>Platform Settings</h2>
          <p className={shared.subtitle}>
            Pengaturan global internal untuk default provisioning, billing manual, dan notifikasi operasional SchoolPro.
          </p>
        </div>
      </div>

      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Plan Default</div>
          <div className={styles.summaryValue}>{settings.provisioning.defaultPlanCode}</div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Trial Default</div>
          <div className={styles.summaryValue}>{settings.provisioning.defaultTrialDays} hari</div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Expiry Billing</div>
          <div className={styles.summaryValue}>{settings.billing.orderExpiryDays} hari</div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Notifikasi Aktif</div>
          <div className={styles.summaryValue}>
            {[
              settings.notifications.notifyNewTenantApplication,
              settings.notifications.notifySubscriptionOrder,
              settings.notifications.notifyExpiringSubscription,
            ].filter(Boolean).length}
          </div>
        </article>
      </section>

      <PlatformSettingsClient
        initialSettings={settings}
        plans={plans}
        availableFeatures={availableFeatures}
      />
    </div>
  )
}
