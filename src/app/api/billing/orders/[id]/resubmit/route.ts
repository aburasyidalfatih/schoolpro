import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSessionUser, hasAnyRole } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { logPlatformAudit } from '@/lib/super-admin'
import { buildOrderExpiryDate, getPlatformSettings } from '@/features/super-admin/lib/settings'

const TENANT_BILLING_ROLES = ['ADMIN', 'KEUANGAN', 'TU']
const RESUBMITTABLE_ORDER_STATUSES = ['REJECTED', 'PENDING_PAYMENT', 'EXPIRED']

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = getSessionUser(session)
    if (!userSession?.tenantId || !hasAnyRole(userSession, TENANT_BILLING_ROLES)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const tenantId = userSession.tenantId as string
    const body = await req.json()
    const paymentMethod = body?.paymentMethod ? String(body.paymentMethod).trim() : ''
    const paymentProofUrl = body?.paymentProofUrl ? String(body.paymentProofUrl).trim() : ''
    const notes = body?.notes ? String(body.notes).trim() : ''

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Metode pembayaran wajib dipilih' }, { status: 400 })
    }

    if (!paymentProofUrl) {
      return NextResponse.json({ error: 'Bukti pembayaran wajib diunggah' }, { status: 400 })
    }

    const [order, platformSettings] = await Promise.all([
      prisma.subscriptionOrder.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          tenant: {
            select: {
              id: true,
              nama: true,
            },
          },
          targetPlan: {
            select: {
              id: true,
              code: true,
              name: true,
              studentCapacity: true,
            },
          },
        },
      }),
      getPlatformSettings(),
    ])

    if (!order) {
      return NextResponse.json({ error: 'Order billing tidak ditemukan' }, { status: 404 })
    }

    if (!RESUBMITTABLE_ORDER_STATUSES.includes(order.status)) {
      return NextResponse.json({ error: 'Order ini tidak bisa dikirim ulang' }, { status: 400 })
    }

    const otherOpenOrder = await prisma.subscriptionOrder.findFirst({
      where: {
        tenantId,
        id: { not: order.id },
        status: {
          in: ['WAITING_VERIFICATION', 'VERIFIED'],
        },
      },
      select: { id: true },
    })

    if (otherOpenOrder) {
      return NextResponse.json({ error: 'Masih ada order billing lain yang sedang menunggu verifikasi' }, { status: 400 })
    }

    const resubmittedAt = new Date()

    const updated = await prisma.subscriptionOrder.update({
      where: { id: order.id },
      data: {
        status: 'WAITING_VERIFICATION',
        paymentMethod,
        paymentProofUrl,
        paidAt: resubmittedAt,
        submittedAt: resubmittedAt,
        verifiedAt: null,
        activatedAt: null,
        expiresAt: buildOrderExpiryDate(platformSettings.billing.orderExpiryDays, resubmittedAt),
        notes: notes || null,
        rejectionReason: null,
        verifiedByUserId: null,
      },
      include: {
        targetPlan: {
          select: {
            id: true,
            code: true,
            name: true,
            studentCapacity: true,
          },
        },
      },
    })

    await logPlatformAudit({
      actorUserId: typeof userSession.id === 'string' ? userSession.id : null,
      actorName: userSession.nama || userSession.name || null,
      actorRole: userSession.role || null,
      tenantId,
      action: 'SUBSCRIPTION_ORDER_RESUBMITTED',
      targetType: 'SUBSCRIPTION_ORDER',
      targetId: order.id,
      summary: `Order subscription tenant ${order.tenant.nama} dikirim ulang untuk plan ${order.targetPlan.name}`,
      metadata: {
        targetPlanCode: order.targetPlan.code,
        studentCapacity: order.targetPlan.studentCapacity,
        previousStatus: order.status,
        orderExpiryDays: platformSettings.billing.orderExpiryDays,
      },
    })

    return NextResponse.json({
      data: {
        id: updated.id,
        status: updated.status,
      },
      message: 'Bukti pembayaran berhasil dikirim ulang dan menunggu verifikasi',
    })
  } catch (error) {
    console.error('[TENANT_BILLING_ORDER_RESUBMIT_PUT]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
