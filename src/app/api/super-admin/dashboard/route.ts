import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { ensureDefaultPlans, isSuperAdmin } from '@/lib/super-admin'
import { getSuperAdminDashboardData } from '@/features/super-admin/lib/dashboard'

export async function GET() {
  try {
    const session = await auth()
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await ensureDefaultPlans()
    const data = await getSuperAdminDashboardData()

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[SUPER_ADMIN_DASHBOARD_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
