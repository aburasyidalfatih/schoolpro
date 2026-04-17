import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'

export type SubscriptionOrderListData = {
  data: Array<{
    id: string
    orderType: string
    status: string
    amount: number
    billingPeriod: string
    studentCapacity: number
    paymentMethod: string | null
    paymentProofUrl: string | null
    notes: string | null
    rejectionReason: string | null
    submittedAt: Date
    paidAt: Date | null
    verifiedAt: Date | null
    activatedAt: Date | null
    tenant: {
      id: string
      nama: string
      slug: string
    }
    currentPlan: {
      id: string
      code: string
      name: string
    } | null
    targetPlan: {
      id: string
      code: string
      name: string
      studentCapacity: number
    }
  }>
  summary: {
    total: number
    waitingVerification: number
    activated: number
    rejected: number
  }
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

export async function getSubscriptionOrderList(params: { status?: string | null; search?: string | null; page?: number | null; pageSize?: number | null }): Promise<SubscriptionOrderListData> {
  const status = params.status?.trim()
  const search = params.search?.trim()
  const pageSize = Number.isFinite(params.pageSize) ? Math.min(Math.max(params.pageSize || 20, 1), 100) : 20

  const where: Prisma.SubscriptionOrderWhereInput = {}
  if (status && status !== 'ALL') {
    where.status = status
  }

  if (search) {
    where.OR = [
      { tenant: { nama: { contains: search, mode: 'insensitive' } } },
      { tenant: { slug: { contains: search, mode: 'insensitive' } } },
      { targetPlan: { name: { contains: search, mode: 'insensitive' } } },
      { targetPlan: { code: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const [totalItems, waitingVerification, activated, rejected] = await Promise.all([
    prisma.subscriptionOrder.count({ where }),
    prisma.subscriptionOrder.count({ where: { ...where, status: 'WAITING_VERIFICATION' } }),
    prisma.subscriptionOrder.count({ where: { ...where, status: 'ACTIVATED' } }),
    prisma.subscriptionOrder.count({ where: { ...where, status: 'REJECTED' } }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const page = Math.min(Math.max(params.page || 1, 1), totalPages)

  const orders = await prisma.subscriptionOrder.findMany({
    where,
    orderBy: { submittedAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      tenant: {
        select: {
          id: true,
          nama: true,
          slug: true,
        },
      },
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

  return {
    data: orders.map((order) => ({
      id: order.id,
      orderType: order.orderType,
      status: order.status,
      amount: Number(order.amount),
      billingPeriod: order.billingPeriod,
      studentCapacity: order.studentCapacity,
      paymentMethod: order.paymentMethod,
      paymentProofUrl: order.paymentProofUrl,
      notes: order.notes,
      rejectionReason: order.rejectionReason,
      submittedAt: order.submittedAt,
      paidAt: order.paidAt,
      verifiedAt: order.verifiedAt,
      activatedAt: order.activatedAt,
      tenant: order.tenant,
      currentPlan: order.currentPlan,
      targetPlan: order.targetPlan,
    })),
    summary: {
      total: totalItems,
      waitingVerification,
      activated,
      rejected,
    },
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
    },
  }
}
