import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { ensureDefaultPlans, isSuperAdmin, resolveTenantStatus } from '@/lib/super-admin'

export async function GET() {
  try {
    const session = await auth()
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await ensureDefaultPlans()

    const [tenants, plansCount, featureOverrides, auditLogs, pendingOrders] = await Promise.all([
      prisma.tenant.findMany({
        select: {
          id: true,
          nama: true,
          slug: true,
          paket: true,
          isActive: true,
          tenantStatus: true,
          berlanggananSampai: true,
          trialEndsAt: true,
          createdAt: true,
          activeSubscription: {
            select: {
              status: true,
              studentCapacity: true,
              endsAt: true,
              plan: {
                select: {
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.plan.count({ where: { isActive: true } }),
      prisma.tenantFeatureOverride.count(),
      prisma.platformAuditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          action: true,
          summary: true,
          createdAt: true,
          actorName: true,
        },
      }),
      prisma.subscriptionOrder.findMany({
        where: {
          status: {
            in: ['WAITING_VERIFICATION', 'VERIFIED'],
          },
        },
        orderBy: { submittedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          status: true,
          amount: true,
          submittedAt: true,
          studentCapacity: true,
          tenant: {
            select: {
              id: true,
              nama: true,
              slug: true,
            },
          },
          targetPlan: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      }),
    ])

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7)
    const thirtyDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30)

    const decorated = tenants.map((tenant) => ({
      ...tenant,
      status: resolveTenantStatus(tenant),
    }))

    const expiringSubscriptions = decorated
      .filter((tenant) => {
        if (!tenant.activeSubscription?.endsAt) return false
        const diff = tenant.activeSubscription.endsAt.getTime() - now.getTime()
        return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 14
      })
      .sort((a, b) => {
        const left = a.activeSubscription?.endsAt?.getTime() || 0
        const right = b.activeSubscription?.endsAt?.getTime() || 0
        return left - right
      })
      .slice(0, 5)

    const data = {
      stats: {
        totalTenants: decorated.length,
        activeTenants: decorated.filter((tenant) => tenant.status === 'ACTIVE').length,
        trialTenants: decorated.filter((tenant) => tenant.status === 'TRIAL').length,
        suspendedTenants: decorated.filter((tenant) => tenant.status === 'SUSPENDED').length,
        expiredTenants: decorated.filter((tenant) => tenant.status === 'EXPIRED').length,
        newLast7Days: decorated.filter((tenant) => tenant.createdAt >= sevenDaysAgo).length,
        newLast30Days: decorated.filter((tenant) => tenant.createdAt >= thirtyDaysAgo).length,
        plansCount,
        featureOverrides,
        tenantsWithSubscription: decorated.filter((tenant) => tenant.activeSubscription).length,
        totalStudentCapacity: decorated.reduce((sum, tenant) => sum + (tenant.activeSubscription?.studentCapacity || 0), 0),
        expiringSoon: decorated.filter((tenant) => {
          if (!tenant.activeSubscription?.endsAt) return false
          const diff = tenant.activeSubscription.endsAt.getTime() - now.getTime()
          return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 14
        }).length,
      },
      expiringSubscriptions: expiringSubscriptions.map((tenant) => ({
        id: tenant.id,
        nama: tenant.nama,
        slug: tenant.slug,
        status: tenant.status,
        planName: tenant.activeSubscription?.plan?.name || tenant.paket,
        planCode: tenant.activeSubscription?.plan?.code || tenant.paket,
        studentCapacity: tenant.activeSubscription?.studentCapacity || 0,
        endsAt: tenant.activeSubscription?.endsAt,
      })),
      pendingOrders: pendingOrders.map((order) => ({
        id: order.id,
        status: order.status,
        amount: Number(order.amount),
        submittedAt: order.submittedAt,
        studentCapacity: order.studentCapacity,
        tenant: order.tenant,
        targetPlan: order.targetPlan,
      })),
      recentAuditLogs: auditLogs,
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[SUPER_ADMIN_DASHBOARD_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
