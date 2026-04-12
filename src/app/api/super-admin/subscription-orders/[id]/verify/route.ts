import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { isSuperAdmin, logPlatformAudit, syncTenantSubscription } from '@/lib/super-admin'

function addOneYear(date: Date) {
  const next = new Date(date)
  next.setFullYear(next.getFullYear() + 1)
  return next
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const actor = session?.user as { id?: unknown; nama?: unknown; name?: unknown; role?: unknown } | undefined
    const { id } = await params
    const body = await req.json()
    const decision = body?.decision === 'reject' ? 'reject' : 'approve'
    const rejectionReason = body?.rejectionReason ? String(body.rejectionReason).trim() : ''

    const order = await prisma.subscriptionOrder.findUnique({
      where: { id },
      include: {
        tenant: true,
        targetPlan: true,
        currentPlan: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    }

    if (!['WAITING_VERIFICATION', 'VERIFIED'].includes(order.status)) {
      return NextResponse.json({ error: 'Order ini tidak bisa diverifikasi lagi' }, { status: 400 })
    }

    if (decision === 'reject' && !rejectionReason) {
      return NextResponse.json({ error: 'Alasan penolakan wajib diisi' }, { status: 400 })
    }

    if (decision === 'reject') {
      const rejected = await prisma.subscriptionOrder.update({
        where: { id: order.id },
        data: {
          status: 'REJECTED',
          verifiedAt: new Date(),
          rejectionReason,
          verifiedByUserId: typeof actor?.id === 'string' ? actor.id : null,
        },
      })

      await logPlatformAudit({
        actorUserId: typeof actor?.id === 'string' ? actor.id : null,
        actorName:
          typeof actor?.nama === 'string'
            ? actor.nama
            : typeof actor?.name === 'string'
              ? actor.name
              : null,
        actorRole: typeof actor?.role === 'string' ? actor.role : null,
        tenantId: order.tenantId,
        action: 'SUBSCRIPTION_ORDER_REJECTED',
        targetType: 'SUBSCRIPTION_ORDER',
        targetId: order.id,
        summary: `Order subscription tenant ${order.tenant.nama} ditolak`,
        metadata: {
          targetPlanCode: order.targetPlan.code,
          rejectionReason,
        },
      })

      return NextResponse.json({
        data: rejected,
        message: 'Order subscription ditolak',
      })
    }

    const activatedAt = new Date()
    const endsAt = addOneYear(activatedAt)

    const activated = await prisma.$transaction(async (tx) => {
      await tx.tenant.update({
        where: { id: order.tenantId },
        data: {
          planId: order.targetPlanId,
          paket: order.targetPlan.code,
          tenantStatus: order.targetPlan.code === 'FREE' ? 'TRIAL' : 'ACTIVE',
          isActive: true,
          berlanggananSampai: order.targetPlan.code === 'FREE' ? null : endsAt,
          trialEndsAt: order.targetPlan.code === 'FREE' ? endsAt : null,
        },
      })

      await syncTenantSubscription({
        db: tx,
        tenantId: order.tenantId,
        planId: order.targetPlanId,
        tenantStatus: order.targetPlan.code === 'FREE' ? 'TRIAL' : 'ACTIVE',
        isActive: true,
        packageCode: order.targetPlan.code,
        studentCapacity: order.targetPlan.studentCapacity,
        createdAt: activatedAt,
        updatedAt: activatedAt,
        berlanggananSampai: order.targetPlan.code === 'FREE' ? null : endsAt,
        trialEndsAt: order.targetPlan.code === 'FREE' ? endsAt : null,
      })

      return tx.subscriptionOrder.update({
        where: { id: order.id },
        data: {
          status: 'ACTIVATED',
          verifiedAt: activatedAt,
          activatedAt,
          verifiedByUserId: typeof actor?.id === 'string' ? actor.id : null,
        },
        include: {
          tenant: {
            select: {
              id: true,
              nama: true,
              slug: true,
              planId: true,
              paket: true,
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
    })

    await logPlatformAudit({
      actorUserId: typeof actor?.id === 'string' ? actor.id : null,
      actorName:
        typeof actor?.nama === 'string'
          ? actor.nama
          : typeof actor?.name === 'string'
            ? actor.name
            : null,
      actorRole: typeof actor?.role === 'string' ? actor.role : null,
      tenantId: order.tenantId,
      action: 'SUBSCRIPTION_ORDER_ACTIVATED',
      targetType: 'SUBSCRIPTION_ORDER',
      targetId: order.id,
      summary: `Subscription tenant ${order.tenant.nama} diaktifkan ke plan ${order.targetPlan.name}`,
      metadata: {
        targetPlanCode: order.targetPlan.code,
        studentCapacity: order.targetPlan.studentCapacity,
        endsAt,
      },
    })

    return NextResponse.json({
      data: activated,
      message: 'Pembayaran diverifikasi dan subscription tenant sudah aktif',
    })
  } catch (error) {
    console.error('[SUPER_ADMIN_SUBSCRIPTION_ORDER_VERIFY_PUT]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
