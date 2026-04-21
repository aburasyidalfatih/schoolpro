import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { availableFeatures, isSuperAdmin, logPlatformAudit } from '@/lib/super-admin'
import { getPlatformSettings, normalizePlatformSettings, savePlatformSettings } from '@/features/super-admin/lib/settings'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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

    return NextResponse.json({
      data: settings,
      availableFeatures,
      plans,
    })
  } catch (error) {
    console.error('[SUPER_ADMIN_SETTINGS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const settings = normalizePlatformSettings(body)

    if (!settings.provisioning.defaultPlanCode) {
      return NextResponse.json({ error: 'Plan default wajib dipilih' }, { status: 400 })
    }

    const matchingPlan = await prisma.plan.findFirst({
      where: {
        code: settings.provisioning.defaultPlanCode,
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    })

    if (!matchingPlan) {
      return NextResponse.json({ error: 'Plan default tidak ditemukan atau tidak aktif' }, { status: 400 })
    }

    await savePlatformSettings(settings)

    const actor = session?.user as { id?: unknown; nama?: unknown; name?: unknown; role?: unknown } | undefined
    await logPlatformAudit({
      actorUserId: typeof actor?.id === 'string' ? actor.id : null,
      actorName:
        typeof actor?.nama === 'string'
          ? actor.nama
          : typeof actor?.name === 'string'
            ? actor.name
            : null,
      actorRole: typeof actor?.role === 'string' ? actor.role : null,
      action: 'PLATFORM_SETTINGS_UPDATED',
      targetType: 'PLATFORM_SETTINGS',
      targetId: 'super_admin_settings',
      summary: 'Pengaturan platform super admin diperbarui',
      metadata: {
        provisioning: settings.provisioning,
        billing: {
          paymentBankName: settings.billing.paymentBankName,
          paymentAccountName: settings.billing.paymentAccountName,
          orderExpiryDays: settings.billing.orderExpiryDays,
          renewalReminderDays: settings.billing.renewalReminderDays,
        },
        notifications: settings.notifications,
      },
    })

    return NextResponse.json({
      data: settings,
      message: 'Pengaturan platform berhasil disimpan',
    })
  } catch (error) {
    console.error('[SUPER_ADMIN_SETTINGS_PUT]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
