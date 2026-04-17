import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSessionUser } from '@/lib/auth/session'
import { getTenantAdminDashboardData } from '@/features/keuangan/lib/admin-dashboard'

export async function GET() {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = getSessionUser(session)
    const tenantId = userSession?.tenantId
    if (!tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await getTenantAdminDashboardData(tenantId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[DASHBOARD_STATS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
