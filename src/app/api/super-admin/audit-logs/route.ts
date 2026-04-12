import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { isSuperAdmin } from '@/lib/super-admin'

export async function GET() {
  try {
    const session = await auth()
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const logs = await prisma.platformAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        tenant: {
          select: {
            id: true,
            nama: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json({
      data: logs,
    })
  } catch (error) {
    console.error('[SUPER_ADMIN_AUDIT_LOGS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
