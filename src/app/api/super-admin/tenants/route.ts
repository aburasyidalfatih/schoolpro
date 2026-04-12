import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { ensureDefaultPlans, isSuperAdmin, resolveTenantStatus } from '@/lib/super-admin'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await ensureDefaultPlans()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')?.trim()

    const where: Prisma.TenantWhereInput = {}
    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const tenants = await prisma.tenant.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        plan: {
          select: {
            id: true,
            code: true,
            name: true,
            studentCapacity: true,
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
              },
            },
          },
        },
        featureOverrides: {
          select: {
            id: true,
          },
        },
        users: {
          where: {
            role: { in: ['ADMIN', 'SUPER_ADMIN'] },
            isActive: true,
          },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
        _count: {
          select: {
            users: true,
            siswas: true,
            tagihans: true,
          },
        },
      },
    })

    const data = tenants.map((tenant) => ({
      id: tenant.id,
      nama: tenant.nama,
      slug: tenant.slug,
      email: tenant.email,
      telepon: tenant.telepon,
      paket: tenant.paket,
      planId: tenant.planId,
      planName: tenant.activeSubscription?.plan?.name || tenant.plan?.name || tenant.paket,
      isActive: tenant.isActive,
      tenantStatus: tenant.tenantStatus,
      berlanggananSampai: tenant.berlanggananSampai,
      trialEndsAt: tenant.trialEndsAt,
      createdAt: tenant.createdAt,
      status: resolveTenantStatus(tenant),
      subscriptionStatus: tenant.activeSubscription?.status || null,
      studentCapacity: tenant.activeSubscription?.studentCapacity ?? tenant.plan?.studentCapacity ?? 0,
      subscriptionStartsAt: tenant.activeSubscription?.startsAt || null,
      subscriptionEndsAt: tenant.activeSubscription?.endsAt || tenant.berlanggananSampai || tenant.trialEndsAt || null,
      owner:
        tenant.users[0]
          ? {
              id: tenant.users[0].id,
              nama: tenant.users[0].nama,
              email: tenant.users[0].email,
              username: tenant.users[0].username,
            }
          : null,
      stats: tenant._count,
      overridesCount: tenant.featureOverrides.length,
    }))

    const now = new Date()
    const summary = {
      total: data.length,
      active: data.filter((tenant) => tenant.status === 'ACTIVE').length,
      free: data.filter((tenant) => tenant.status === 'FREE').length,
      trial: data.filter((tenant) => tenant.status === 'TRIAL').length,
      suspended: data.filter((tenant) => tenant.status === 'SUSPENDED').length,
      expiringSoon: data.filter((tenant) => {
        if (!tenant.subscriptionEndsAt || !['ACTIVE', 'TRIAL'].includes(tenant.status)) return false
        const diff = tenant.subscriptionEndsAt.getTime() - now.getTime()
        return diff <= 1000 * 60 * 60 * 24 * 14
      }).length,
    }

    return NextResponse.json({ data, summary })
  } catch (error) {
    console.error('[SUPER_ADMIN_TENANTS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
