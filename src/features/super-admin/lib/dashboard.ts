import { prisma } from '@/lib/db/prisma'
import { resolveTenantStatus } from '@/lib/super-admin'

export type SuperAdminDashboardData = {
  stats: {
    totalTenants: number
    activeTenants: number
    trialTenants: number
    suspendedTenants: number
    expiredTenants: number
    newLast7Days: number
    newLast30Days: number
    plansCount: number
    featureOverrides: number
    tenantsWithSubscription: number
    totalStudentCapacity: number
    expiringSoon: number
  }
  recentAuditLogs: Array<{
    id: string
    action: string
    summary: string
    createdAt: Date
    actorName: string | null
  }>
  expiringSubscriptions: Array<{
    id: string
    nama: string
    slug: string
    status: string
    planName: string
    planCode: string
    studentCapacity: number
    endsAt: Date | null
  }>
  pendingOrders: Array<{
    id: string
    status: string
    amount: number
    submittedAt: Date
    studentCapacity: number
    tenant: {
      id: string
      nama: string
      slug: string
    }
    targetPlan: {
      code: string
      name: string
    }
  }>
}

export async function getSuperAdminDashboardData(): Promise<SuperAdminDashboardData> {
  const fourteenDaysAhead = new Date()
  fourteenDaysAhead.setDate(fourteenDaysAhead.getDate() + 14)

  const [tenantSummaries, plansCount, featureOverrides, auditLogs, pendingOrders, expiringSubscriptions] = await Promise.all([
    prisma.tenant.findMany({
      select: {
        paket: true,
        isActive: true,
        tenantStatus: true,
        berlanggananSampai: true,
        trialEndsAt: true,
        createdAt: true,
        activeSubscription: {
          select: {
            studentCapacity: true,
            endsAt: true,
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
    prisma.tenant.findMany({
      where: {
        activeSubscription: {
          is: {
            endsAt: {
              gte: new Date(),
              lte: fourteenDaysAhead,
            },
          },
        },
      },
      orderBy: {
        activeSubscription: {
          endsAt: 'asc',
        },
      },
      take: 5,
      select: {
        id: true,
        nama: true,
        slug: true,
        paket: true,
        isActive: true,
        tenantStatus: true,
        berlanggananSampai: true,
        trialEndsAt: true,
        activeSubscription: {
          select: {
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
  ])

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7)
  const thirtyDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30)

  const decorated = tenantSummaries.map((tenant) => ({
    ...tenant,
    status: resolveTenantStatus(tenant),
  }))

  return {
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
      status: resolveTenantStatus(tenant),
      planName: tenant.activeSubscription?.plan?.name || tenant.paket,
      planCode: tenant.activeSubscription?.plan?.code || tenant.paket,
      studentCapacity: tenant.activeSubscription?.studentCapacity || 0,
      endsAt: tenant.activeSubscription?.endsAt ?? null,
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
}
