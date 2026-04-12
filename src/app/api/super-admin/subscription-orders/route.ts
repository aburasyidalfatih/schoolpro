import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { isSuperAdmin } from '@/lib/super-admin'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')?.trim()
    const search = searchParams.get('search')?.trim()

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

    const orders = await prisma.subscriptionOrder.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
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

    const summary = {
      total: orders.length,
      waitingVerification: orders.filter((order) => order.status === 'WAITING_VERIFICATION').length,
      activated: orders.filter((order) => order.status === 'ACTIVATED').length,
      rejected: orders.filter((order) => order.status === 'REJECTED').length,
    }

    return NextResponse.json({
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
      summary,
    })
  } catch (error) {
    console.error('[SUPER_ADMIN_SUBSCRIPTION_ORDERS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
