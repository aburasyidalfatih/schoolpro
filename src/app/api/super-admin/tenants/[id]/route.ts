import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { ensureDefaultPlans, isSuperAdmin, logPlatformAudit, syncTenantSubscription } from '@/lib/super-admin'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await ensureDefaultPlans()

    const { id } = await params
    const body = await req.json()
    const { nama, email, telepon, paket, planId, tenantStatus, isActive, berlanggananSampai, trialEndsAt } = body

    if (!nama) {
      return NextResponse.json({ error: 'Nama tenant wajib diisi' }, { status: 400 })
    }

    if (!paket) {
      return NextResponse.json({ error: 'Paket tenant wajib diisi' }, { status: 400 })
    }

    const tenant = await prisma.tenant.findUnique({ where: { id } })
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 404 })
    }

    let resolvedPlanId = planId || null
    let resolvedPackage = paket

    if (resolvedPlanId) {
      const plan = await prisma.plan.findUnique({ where: { id: resolvedPlanId } })
      if (!plan) {
        return NextResponse.json({ error: 'Plan tidak ditemukan' }, { status: 404 })
      }
      resolvedPackage = plan.code
    }

    if (!resolvedPlanId && paket) {
      const matchingPlan = await prisma.plan.findUnique({ where: { code: paket } })
      resolvedPlanId = matchingPlan?.id || null
    }

    const resolvedTenantStatus = tenantStatus || (resolvedPackage === 'FREE' ? 'TRIAL' : 'ACTIVE')
    const resolvedEndsAt = berlanggananSampai ? new Date(berlanggananSampai) : null
    const resolvedTrialEndsAt = trialEndsAt ? new Date(trialEndsAt) : null
    const resolvedPlan =
      resolvedPlanId
        ? await prisma.plan.findUnique({
            where: { id: resolvedPlanId },
            select: { id: true, code: true, name: true, studentCapacity: true },
          })
        : null

    const updated = await prisma.$transaction(async (tx) => {
      const nextTenant = await tx.tenant.update({
        where: { id },
        data: {
          nama,
          email: email || null,
          telepon: telepon || null,
          paket: resolvedPackage,
          planId: resolvedPlanId,
          tenantStatus: resolvedTenantStatus,
          isActive: Boolean(isActive),
          berlanggananSampai: resolvedEndsAt,
          trialEndsAt: resolvedTrialEndsAt,
        },
        include: {
          plan: true,
        },
      })

      await syncTenantSubscription({
        db: tx,
        tenantId: nextTenant.id,
        planId: resolvedPlanId,
        tenantStatus: resolvedTenantStatus,
        isActive: nextTenant.isActive,
        packageCode: resolvedPackage,
        studentCapacity: resolvedPlan?.studentCapacity ?? 0,
        createdAt: nextTenant.createdAt,
        updatedAt: nextTenant.updatedAt,
        berlanggananSampai: nextTenant.berlanggananSampai,
        trialEndsAt: nextTenant.trialEndsAt,
      })

      return tx.tenant.findUniqueOrThrow({
        where: { id: nextTenant.id },
        include: {
          plan: true,
          activeSubscription: {
            include: {
              plan: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
      })
    })

    const actor = session?.user as { id?: unknown; nama?: unknown; name?: unknown; role?: unknown } | undefined
    await logPlatformAudit({
      actorUserId: typeof actor?.id === 'string' ? actor.id : null,
      actorName:
        typeof actor?.nama === 'string'
          ? actor.nama
          : typeof actor?.name === 'string'
            ? actor.name
            : null,
      actorRole: typeof actor?.role === 'string' ? actor.role : null,
      tenantId: updated.id,
      action: 'TENANT_UPDATED',
      targetType: 'TENANT',
      targetId: updated.id,
      summary: `Tenant ${updated.nama} diperbarui ke plan ${updated.plan?.name || updated.paket}`,
      metadata: {
        paket: updated.paket,
        tenantStatus: updated.tenantStatus,
        isActive: updated.isActive,
        subscriptionStatus: updated.activeSubscription?.status || null,
        studentCapacity: updated.activeSubscription?.studentCapacity || 0,
      },
    })

    return NextResponse.json({
      data: updated,
      message: 'Tenant berhasil diperbarui',
    })
  } catch (error) {
    console.error('[SUPER_ADMIN_TENANT_PUT]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
