import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { availableFeatures, ensureDefaultPlans, isSuperAdmin, logPlatformAudit } from '@/lib/super-admin'

export async function GET() {
  try {
    const session = await auth()
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await ensureDefaultPlans()

    const plans = await prisma.plan.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        features: {
          where: { isEnabled: true },
          orderBy: { featureKey: 'asc' },
        },
        _count: {
          select: {
            tenants: true,
          },
        },
      },
    })

    const data = plans.map((plan) => ({
      id: plan.id,
      code: plan.code,
      name: plan.name,
      description: plan.description,
      price: Number(plan.price),
      studentCapacity: plan.studentCapacity,
      billingPeriod: plan.billingPeriod,
      isDefault: plan.isDefault,
      isActive: plan.isActive,
      isPublic: plan.isPublic,
      fullAccess: plan.fullAccess,
      sortOrder: plan.sortOrder,
      features: plan.features.map((feature) => feature.featureKey),
      tenantCount: plan._count.tenants,
    }))

    return NextResponse.json({
      data,
      availableFeatures,
    })
  } catch (error) {
    console.error('[SUPER_ADMIN_PLANS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { code, name, description, price, studentCapacity, billingPeriod, isDefault, isActive, isPublic, fullAccess, sortOrder, features } = body

    if (!code || !name) {
      return NextResponse.json({ error: 'Kode dan nama plan wajib diisi' }, { status: 400 })
    }

    const numericPrice = Number(price || 0)
    const numericCapacity = Number(studentCapacity || 0)
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json({ error: 'Harga tahunan plan tidak valid' }, { status: 400 })
    }
    if (Number.isNaN(numericCapacity) || numericCapacity < 0) {
      return NextResponse.json({ error: 'Kapasitas siswa plan tidak valid' }, { status: 400 })
    }
    if (numericPrice > 0 && numericCapacity <= 0) {
      return NextResponse.json({ error: 'Plan berbayar wajib memiliki kapasitas siswa lebih dari 0' }, { status: 400 })
    }

    const normalizedCode = String(code).trim().toUpperCase()
    const featureKeys = Array.isArray(features) ? features.filter(Boolean) : []
    const resolvedFullAccess = Boolean(fullAccess)
    const resolvedFeatures = resolvedFullAccess ? availableFeatures.map((feature) => feature.key) : featureKeys
    const actor = session?.user as { id?: unknown; nama?: unknown; name?: unknown; role?: unknown } | undefined

    const plan = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.plan.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        })
      }

      return tx.plan.create({
        data: {
          code: normalizedCode,
          name: String(name).trim(),
          description: description ? String(description).trim() : null,
          price: new Prisma.Decimal(numericPrice),
          studentCapacity: numericCapacity,
          billingPeriod: billingPeriod || 'YEARLY',
          isDefault: Boolean(isDefault),
          isActive: Boolean(isActive ?? true),
          isPublic: Boolean(isPublic ?? true),
          fullAccess: resolvedFullAccess,
          sortOrder: Number(sortOrder || 0),
          features: {
            create: resolvedFeatures.map((featureKey) => ({
              featureKey,
              isEnabled: true,
            })),
          },
        },
        include: {
          features: true,
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
      action: 'PLAN_CREATED',
      targetType: 'PLAN',
      targetId: plan.id,
      summary: `Plan ${plan.name} dibuat`,
      metadata: {
        code: plan.code,
        studentCapacity: plan.studentCapacity,
        fullAccess: plan.fullAccess,
        isPublic: plan.isPublic,
        billingPeriod: plan.billingPeriod,
        features: plan.features.map((feature) => feature.featureKey),
      },
    })

    return NextResponse.json({
      data: plan,
      message: 'Plan berhasil dibuat',
    })
  } catch (error: unknown) {
    console.error('[SUPER_ADMIN_PLAN_POST]', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Kode plan sudah digunakan' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
