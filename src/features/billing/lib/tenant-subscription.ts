import { prisma } from '@/lib/db/prisma'
import { getPlatformSettings } from '@/features/super-admin/lib/settings'

export const TENANT_BILLING_ROLES = ['ADMIN', 'KEUANGAN', 'TU']

export type TenantBillingSubscriptionData = {
  tenant: {
    id: string
    nama: string
    slug: string
  }
  subscription: {
    id: string
    status: string
    studentCapacity: number
    startsAt: Date
    endsAt: Date | null
    activatedAt: Date | null
    lastPaidAt: Date | null
    plan: {
      id: string
      code: string
      name: string
      price: number
      studentCapacity: number
      billingPeriod: string
    } | null
  } | null
  usage: {
    activeStudents: number
    studentCapacity: number
    remainingSlots: number
    usagePercent: number
    warningLevel: 'NONE' | 'NORMAL' | 'WARNING_80' | 'WARNING_90' | 'FULL'
  }
  plans: Array<{
    id: string
    code: string
    name: string
    description: string | null
    price: number
    studentCapacity: number
    billingPeriod: string
    isDefault: boolean
    fullAccess: boolean
  }>
  recentOrders: Array<{
    id: string
    orderType: string
    status: string
    canResubmit: boolean
    amount: number
    billingPeriod: string
    studentCapacity: number
    paymentMethod: string | null
    paymentProofUrl: string | null
    notes: string | null
    rejectionReason: string | null
    submittedAt: Date
    verifiedAt: Date | null
    activatedAt: Date | null
    currentPlan: { id: string; code: string; name: string } | null
    targetPlan: { id: string; code: string; name: string; studentCapacity: number }
  }>
  billingDefaults: {
    paymentBankName: string
    paymentAccountName: string
    paymentAccountNumber: string
    paymentInstructions: string
    orderExpiryDays: number
    renewalReminderDays: number
  }
}

export async function getTenantBillingSubscriptionData(tenantId: string): Promise<TenantBillingSubscriptionData | null> {
  const [tenant, plans, orders, activeStudents, platformSettings] = await Promise.all([
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
    getPlatformSettings(),
  ])

  if (!tenant) return null

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

  return {
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
    billingDefaults: {
      paymentBankName: platformSettings.billing.paymentBankName,
      paymentAccountName: platformSettings.billing.paymentAccountName,
      paymentAccountNumber: platformSettings.billing.paymentAccountNumber,
      paymentInstructions: platformSettings.billing.paymentInstructions,
      orderExpiryDays: platformSettings.billing.orderExpiryDays,
      renewalReminderDays: platformSettings.billing.renewalReminderDays,
    },
  }
}
