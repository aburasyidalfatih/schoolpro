import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/super-admin'
import { getSubscriptionOrderList } from '@/features/super-admin/lib/subscription-orders'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const data = await getSubscriptionOrderList({
      status: searchParams.get('status'),
      search: searchParams.get('search'),
      page: Number.parseInt(searchParams.get('page') || '1', 10),
      pageSize: Number.parseInt(searchParams.get('pageSize') || '20', 10),
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('[SUPER_ADMIN_SUBSCRIPTION_ORDERS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
