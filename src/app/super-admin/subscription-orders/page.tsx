import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/super-admin'
import { SubscriptionOrdersClient } from '@/features/super-admin/components/SubscriptionOrdersClient'
import { getSubscriptionOrderList } from '@/features/super-admin/lib/subscription-orders'
import shared from '@/styles/page.module.css'

export default async function SubscriptionOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; status?: string; page?: string }>
}) {
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

  const resolvedSearchParams = await searchParams
  const initialSearch = resolvedSearchParams?.search || ''
  const initialStatus = resolvedSearchParams?.status || 'ALL'
  const initialPage = Number.parseInt(resolvedSearchParams?.page || '1', 10) || 1
  const initialData = await getSubscriptionOrderList({
    search: initialSearch,
    status: initialStatus,
    page: initialPage,
  })
  const currentHostname = (await headers()).get('host') || 'schoolpro.id'

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div className={shared.headerLeft}>
          <h2 className={shared.title}>Subscription Orders</h2>
          <p className={shared.subtitle}>Review order upgrade atau renewal tenant sebelum subscription diaktifkan.</p>
        </div>
      </div>

      <SubscriptionOrdersClient
        initialData={initialData}
        initialSearch={initialSearch}
        initialStatus={initialStatus}
        currentHostname={currentHostname}
      />
    </div>
  )
}
