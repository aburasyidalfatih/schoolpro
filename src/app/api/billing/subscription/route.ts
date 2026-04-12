import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSessionUser, hasAnyRole } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

const TENANT_BILLING_ROLES = ['ADMIN', 'KEUANGAN', 'TU']

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

    const [tenant, plans, orders, activeStudents] = await Promise.all([
      prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
          plan: {
            select: {
              id: true,
              code: true,
              name: true,
              studentCapacity: true,
              price: true,
            },
          },
          activeSubscription: {
            include: {
              plan: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  studentCapacity: true,
                  price: true,
                  billingPeriod: true,
                },
              },
            },
          },
        },
      }),
      prisma.plan.findMany({
        where: {
          isActive: true,
          isPublic: true,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          price: true,
          studentCapacity: true,
          billingPeriod: true,
          isDefault: true,
          fullAccess: true,
        },
      }),
      prisma.subscriptionOrder.findMany({
        where: { tenantId },
        orderBy: { submittedAt: 'desc' },
        take: 10,
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
      }),
      prisma.siswa.count({
        where: {
          tenantId,
          status: 'AKTIF',
        },
      }),
    ])

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 404 })
    }

    const studentCapacity = tenant.activeSubscription?.studentCapacity ?? tenant.plan?.studentCapacity ?? 0
    const usagePercent = studentCapacity > 0 ? Math.min(100, Math.round((activeStudents / studentCapacity) * 100)) : 0
    const warningLevel =
      studentCapacity <= 0
        ? 'NONE'
        : usagePercent >= 100
          ? 'FULL'
          : usagePercent >= 90
            ? 'WARNING_90'
            : usagePercent >= 80
              ? 'WARNING_80'
              : 'NORMAL'

    return NextResponse.json({
      data: {
        tenant: {
          id: tenant.id,
          nama: tenant.nama,
          slug: tenant.slug,
        },
        subscription: tenant.activeSubscription
          ? {
              id: tenant.activeSubscription.id,
              status: tenant.activeSubscription.status,
              studentCapacity: tenant.activeSubscription.studentCapacity,
              startsAt: tenant.activeSubscription.startsAt,
              endsAt: tenant.activeSubscription.endsAt,
              activatedAt: tenant.activeSubscription.activatedAt,
              lastPaidAt: tenant.activeSubscription.lastPaidAt,
              plan: tenant.activeSubscription.plan
                ? {
                    id: tenant.activeSubscription.plan.id,
                    code: tenant.activeSubscription.plan.code,
                    name: tenant.activeSubscription.plan.name,
                    price: Number(tenant.activeSubscription.plan.price),
                    studentCapacity: tenant.activeSubscription.plan.studentCapacity,
                    billingPeriod: tenant.activeSubscription.plan.billingPeriod,
                  }
                : null,
            }
          : null,
        usage: {
          activeStudents,
          studentCapacity,
          remainingSlots: Math.max(0, studentCapacity - activeStudents),
          usagePercent,
          warningLevel,
        },
        plans: plans.map((plan) => ({
          id: plan.id,
          code: plan.code,
          name: plan.name,
          description: plan.description,
          price: Number(plan.price),
          studentCapacity: plan.studentCapacity,
          billingPeriod: plan.billingPeriod,
          isDefault: plan.isDefault,
          fullAccess: plan.fullAccess,
        })),
        recentOrders: orders.map((order) => ({
          id: order.id,
          orderType: order.orderType,
          status: order.status,
          canResubmit: ['REJECTED', 'PENDING_PAYMENT', 'EXPIRED'].includes(order.status),
          amount: Number(order.amount),
          billingPeriod: order.billingPeriod,
          studentCapacity: order.studentCapacity,
          paymentMethod: order.paymentMethod,
          paymentProofUrl: order.paymentProofUrl,
          notes: order.notes,
          rejectionReason: order.rejectionReason,
          submittedAt: order.submittedAt,
          verifiedAt: order.verifiedAt,
          activatedAt: order.activatedAt,
          currentPlan: order.currentPlan,
          targetPlan: order.targetPlan,
        })),
      },
    })
  } catch (error) {
    console.error('[TENANT_BILLING_SUBSCRIPTION_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
