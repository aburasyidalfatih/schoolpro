import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { availableFeatures, isSuperAdmin, logPlatformAudit } from '@/lib/super-admin'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
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

    const actor = session?.user as { id?: unknown; nama?: unknown; name?: unknown; role?: unknown } | undefined
    const featureKeys = Array.isArray(features) ? features.filter(Boolean) : []
    const resolvedFullAccess = Boolean(fullAccess)
    const resolvedFeatures = resolvedFullAccess ? availableFeatures.map((feature) => feature.key) : featureKeys

    const plan = await prisma.$transaction(async (tx) => {
      const existing = await tx.plan.findUnique({ where: { id } })
      if (!existing) {
        throw new Error('PLAN_NOT_FOUND')
      }

      if (isDefault) {
        await tx.plan.updateMany({
          where: { isDefault: true, id: { not: id } },
          data: { isDefault: false },
        })
      }

      await tx.planFeature.deleteMany({ where: { planId: id } })

      const updated = await tx.plan.update({
        where: { id },
        data: {
          code: String(code).trim().toUpperCase(),
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

      await tx.tenant.updateMany({
        where: { planId: id },
        data: {
          paket: updated.code,
        },
      })

      return updated
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
      action: 'PLAN_UPDATED',
      targetType: 'PLAN',
      targetId: plan.id,
      summary: `Plan ${plan.name} diperbarui`,
      metadata: {
        code: plan.code,
        studentCapacity: plan.studentCapacity,
        isDefault: plan.isDefault,
        isActive: plan.isActive,
        isPublic: plan.isPublic,
        fullAccess: plan.fullAccess,
      },
    })

    return NextResponse.json({
      data: plan,
      message: 'Plan berhasil diperbarui',
    })
  } catch (error: unknown) {
    console.error('[SUPER_ADMIN_PLAN_PUT]', error)
    if (error instanceof Error && error.message === 'PLAN_NOT_FOUND') {
      return NextResponse.json({ error: 'Plan tidak ditemukan' }, { status: 404 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Kode plan sudah digunakan' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const actor = session?.user as { id?: unknown; nama?: unknown; name?: unknown; role?: unknown } | undefined

    const plan = await prisma.plan.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        isDefault: true,
        _count: {
          select: {
            tenants: true,
            subscriptions: true,
            targetOrders: true,
          },
        },
      },
    })

    if (!plan) {
      return NextResponse.json({ error: 'Plan tidak ditemukan' }, { status: 404 })
    }

    if (plan.isDefault) {
      return NextResponse.json({ error: 'Plan default tidak dapat dihapus. Ubah default plan terlebih dahulu.' }, { status: 400 })
    }

    if (plan._count.tenants > 0 || plan._count.subscriptions > 0 || plan._count.targetOrders > 0) {
      return NextResponse.json({
        error: 'Plan masih terhubung ke tenant, subscription, atau order billing sehingga tidak dapat dihapus.',
      }, { status: 400 })
    }

    await prisma.plan.delete({
      where: { id },
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
      action: 'PLAN_DELETED',
      targetType: 'PLAN',
      targetId: plan.id,
      summary: `Plan ${plan.name} dihapus`,
      metadata: {
        code: plan.code,
      },
    })

    return NextResponse.json({
      message: 'Plan berhasil dihapus',
    })
  } catch (error: unknown) {
    console.error('[SUPER_ADMIN_PLAN_DELETE]', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({
        error: 'Plan masih dipakai relasi billing lain sehingga tidak dapat dihapus.',
      }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
