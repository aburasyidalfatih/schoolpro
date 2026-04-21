import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSessionUser, hasAnyRole } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { logPlatformAudit } from '@/lib/super-admin'
import { buildOrderExpiryDate, getPlatformSettings } from '@/features/super-admin/lib/settings'

const TENANT_BILLING_ROLES = ['ADMIN', 'KEUANGAN', 'TU']
const OPEN_ORDER_STATUSES = ['PENDING_PAYMENT', 'WAITING_VERIFICATION', 'VERIFIED']

export async function POST(req: Request) {
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
    const body = await req.json()
    const { targetPlanId, paymentMethod, paymentProofUrl, notes } = body

    if (!targetPlanId) {
      return NextResponse.json({ error: 'Plan tujuan wajib dipilih' }, { status: 400 })
    }

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Metode pembayaran wajib dipilih' }, { status: 400 })
    }

    if (!paymentProofUrl) {
      return NextResponse.json({ error: 'Bukti pembayaran wajib diunggah' }, { status: 400 })
    }

    const [tenant, targetPlan, existingOpenOrder, platformSettings] = await Promise.all([
      prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
          activeSubscription: true,
          plan: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      }),
      prisma.plan.findFirst({
        where: {
          id: targetPlanId,
          isActive: true,
          isPublic: true,
        },
      }),
      prisma.subscriptionOrder.findFirst({
        where: {
          tenantId,
          status: { in: OPEN_ORDER_STATUSES },
        },
        orderBy: { submittedAt: 'desc' },
      }),
      getPlatformSettings(),
    ])

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 404 })
    }

    if (!targetPlan) {
      return NextResponse.json({ error: 'Plan tujuan tidak ditemukan atau tidak tersedia' }, { status: 404 })
    }

    if (targetPlan.price.lte(new Prisma.Decimal(0))) {
      return NextResponse.json({ error: 'Plan free tidak memerlukan checkout billing' }, { status: 400 })
    }

    if (existingOpenOrder) {
      return NextResponse.json({ error: 'Masih ada order billing yang belum selesai diverifikasi' }, { status: 400 })
    }

    const currentPlanId = tenant.activeSubscription?.planId || tenant.planId || null
    const currentCapacity = tenant.activeSubscription?.studentCapacity || 0
    const orderType =
      currentPlanId && currentPlanId === targetPlan.id
        ? 'RENEWAL'
        : currentCapacity > 0
          ? 'UPGRADE'
          : 'NEW_SUBSCRIPTION'

    const order = await prisma.subscriptionOrder.create({
      data: {
        tenantId,
        currentPlanId,
        targetPlanId: targetPlan.id,
        orderType,
        status: 'WAITING_VERIFICATION',
        amount: targetPlan.price,
        billingPeriod: targetPlan.billingPeriod,
        studentCapacity: targetPlan.studentCapacity,
        paymentMethod: String(paymentMethod).trim(),
        paymentProofUrl: String(paymentProofUrl).trim(),
        submittedAt: new Date(),
        paidAt: new Date(),
        expiresAt: buildOrderExpiryDate(platformSettings.billing.orderExpiryDays),
        notes: notes ? String(notes).trim() : null,
        createdByUserId: typeof userSession.id === 'string' ? userSession.id : null,
      },
      include: {
        currentPlan: {
          select: {
            id: true,
            code: true,
            name: true,
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
    })

    await logPlatformAudit({
      actorUserId: typeof userSession.id === 'string' ? userSession.id : null,
      actorName: userSession.nama || userSession.name || null,
      actorRole: userSession.role || null,
      tenantId,
      action: 'SUBSCRIPTION_ORDER_CREATED',
      targetType: 'SUBSCRIPTION_ORDER',
      targetId: order.id,
      summary: `Order subscription tenant ${tenant.nama} dibuat untuk plan ${targetPlan.name}`,
      metadata: {
        orderType,
        targetPlanCode: targetPlan.code,
        amount: Number(targetPlan.price),
        studentCapacity: targetPlan.studentCapacity,
        orderExpiryDays: platformSettings.billing.orderExpiryDays,
      },
    })

    return NextResponse.json({
      data: {
        id: order.id,
        status: order.status,
      },
      message: 'Order billing berhasil dibuat dan menunggu verifikasi',
    })
  } catch (error) {
    console.error('[TENANT_BILLING_ORDER_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
