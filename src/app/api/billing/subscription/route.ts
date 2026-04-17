import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSessionUser, hasAnyRole } from '@/lib/auth/session'
import { getTenantBillingSubscriptionData, TENANT_BILLING_ROLES } from '@/features/billing/lib/tenant-subscription'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = getSessionUser(session)
    if (!userSession?.tenantId || !hasAnyRole(userSession, TENANT_BILLING_ROLES)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const tenantId = userSession.tenantId

    const data = await getTenantBillingSubscriptionData(tenantId)
    if (!data) {
      return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ data })
  } catch (error) {
    console.error('[TENANT_BILLING_SUBSCRIPTION_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
