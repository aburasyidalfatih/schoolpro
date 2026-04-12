import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { getSessionUser } from '@/lib/auth/session'
import { FeatureOverrideState, availableFeatures, getFeatureLabel, isSuperAdmin, logPlatformAudit } from '@/lib/super-admin'

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
    const { overrides } = body

    const tenant = await prisma.tenant.findUnique({
      where: { id },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 404 })
    }

    const validFeatureKeys = new Set(availableFeatures.map((feature) => feature.key))
    const safeOverrides = Array.isArray(overrides)
      ? overrides.filter(
          (item) =>
            validFeatureKeys.has(item?.featureKey) &&
            ['DEFAULT', 'ENABLED', 'DISABLED'].includes(item?.state as FeatureOverrideState)
        )
      : []

    await prisma.$transaction(async (tx) => {
      await tx.tenantFeatureOverride.deleteMany({
        where: { tenantId: id },
      })

      const toCreate = safeOverrides
        .filter((item) => item.state !== 'DEFAULT')
        .map((item) => ({
          tenantId: id,
          featureKey: item.featureKey,
          isEnabled: item.state === 'ENABLED',
          reason: item.reason ? String(item.reason).trim() : null,
        }))

      if (toCreate.length > 0) {
        await tx.tenantFeatureOverride.createMany({
          data: toCreate,
        })
      }
    })

    const actor = getSessionUser(session)
    const changedLabels = safeOverrides
      .filter((item) => item.state !== 'DEFAULT')
      .map((item) => `${getFeatureLabel(item.featureKey)}: ${item.state}`)

    await logPlatformAudit({
      actorUserId: actor?.id ?? null,
      actorName: actor?.nama || actor?.name || null,
      actorRole: actor?.role ?? null,
      tenantId: tenant.id,
      action: 'TENANT_FEATURE_OVERRIDE_UPDATED',
      targetType: 'TENANT',
      targetId: tenant.id,
      summary: `Override fitur tenant ${tenant.nama} diperbarui`,
      metadata: {
        overrides: changedLabels,
      },
    })

    return NextResponse.json({
      message: 'Feature access tenant berhasil diperbarui',
    })
  } catch (error) {
    console.error('[SUPER_ADMIN_TENANT_FEATURES_PUT]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
