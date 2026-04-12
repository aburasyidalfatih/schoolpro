import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { availableFeatures, buildTenantFeatureState, ensureDefaultPlans, isSuperAdmin, resolveTenantStatus } from '@/lib/super-admin'

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
      ]
    }

    const tenants = await prisma.tenant.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        plan: {
          include: {
            features: {
              where: { isEnabled: true },
            },
          },
        },
        featureOverrides: {
          orderBy: { featureKey: 'asc' },
        },
      },
    })

    const data = tenants.map((tenant) => {
      const planFeatures = tenant.plan?.features.map((feature) => feature.featureKey) || []
      return {
        id: tenant.id,
        nama: tenant.nama,
        slug: tenant.slug,
        paket: tenant.paket,
        planId: tenant.planId,
        planName: tenant.plan?.name || tenant.paket,
        status: resolveTenantStatus(tenant),
        featureStates: buildTenantFeatureState({
          planFeatures,
          fullAccess: tenant.plan?.fullAccess,
          overrides: tenant.featureOverrides,
        }),
      }
    })

    return NextResponse.json({
      data,
      availableFeatures,
    })
  } catch (error) {
    console.error('[SUPER_ADMIN_FEATURE_ACCESS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
