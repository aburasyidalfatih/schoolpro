import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { availableFeatures, isSuperAdmin, logPlatformAudit, syncTenantSubscription } from '@/lib/super-admin'
import { buildProvisioningDefaultsSnapshot, getPlatformSettings } from '@/features/super-admin/lib/settings'

function sanitizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const actor = session?.user as { id?: unknown; nama?: unknown; name?: unknown; role?: unknown } | undefined
    const { id } = await params
    const body = await req.json()
    const slugApproved = sanitizeSlug(body?.slugApproved ? String(body.slugApproved) : '')

    if (!slugApproved) {
      return NextResponse.json({ error: 'Slug tenant wajib diisi' }, { status: 400 })
    }

    const [application, settings] = await Promise.all([
      prisma.tenantApplication.findUnique({
        where: { id },
      }),
      getPlatformSettings(),
    ])

    if (!application) {
      return NextResponse.json({ error: 'Aplikasi tenant tidak ditemukan' }, { status: 404 })
    }

    if (!['APPROVED', 'PROVISIONED'].includes(application.status)) {
      return NextResponse.json({ error: 'Hanya aplikasi yang sudah approved yang bisa diprovision' }, { status: 400 })
    }

    if (application.status === 'PROVISIONED' && application.approvedTenantId) {
      return NextResponse.json({ error: 'Aplikasi ini sudah pernah diprovision' }, { status: 400 })
    }

    const existingSlug = await prisma.tenant.findUnique({
      where: { slug: slugApproved },
      select: { id: true },
    })

    if (existingSlug) {
      return NextResponse.json({ error: 'Slug tenant sudah digunakan' }, { status: 400 })
    }

    const provisioningDefaults = buildProvisioningDefaultsSnapshot(settings)
    const defaultPlan = await prisma.plan.findFirst({
      where: {
        code: provisioningDefaults.planCode,
        isActive: true,
      },
      include: {
        features: {
          where: { isEnabled: true },
          select: { featureKey: true },
        },
      },
    })

    if (!defaultPlan) {
      return NextResponse.json({ error: 'Plan default provisioning tidak ditemukan atau tidak aktif' }, { status: 400 })
    }

    const now = new Date()
    const trialEndsAt =
      provisioningDefaults.trialDays > 0
        ? new Date(now.getTime() + 1000 * 60 * 60 * 24 * provisioningDefaults.trialDays)
        : null
    const effectiveStudentCapacity =
      provisioningDefaults.studentCapacity > 0 ? provisioningDefaults.studentCapacity : defaultPlan.studentCapacity
    const requiresManualActivation = provisioningDefaults.requiresManualActivation
    const tempPassword = `sp-${Math.random().toString(36).slice(2, 10)}`
    const passwordHash = await bcrypt.hash(tempPassword, 12)

    const provisioned = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          nama: application.namaSekolah,
          slug: slugApproved,
          alamat: application.alamat,
          telepon: application.teleponSekolah,
          email: application.emailSekolah,
          website: application.websiteSaatIni,
          paket: defaultPlan.code,
          planId: defaultPlan.id,
          tenantStatus: requiresManualActivation ? 'SUSPENDED' : (trialEndsAt ? 'TRIAL' : 'ACTIVE'),
          berlanggananSampai: trialEndsAt ? null : (defaultPlan.price.gt(0) ? new Date(now.getTime() + 1000 * 60 * 60 * 24 * 365) : null),
          trialEndsAt,
          isActive: !requiresManualActivation,
          pengaturan: {
            npsn: application.npsn,
            onboardingSource: 'tenant_application',
            onboardingPicName: application.namaPic,
            onboardingPicEmail: application.emailPic,
            onboardingPicWhatsapp: application.whatsappPic,
          },
        },
      })

      await syncTenantSubscription({
        db: tx,
        tenantId: tenant.id,
        planId: defaultPlan.id,
        tenantStatus: tenant.tenantStatus,
        isActive: tenant.isActive,
        packageCode: tenant.paket,
        studentCapacity: effectiveStudentCapacity,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        berlanggananSampai: tenant.berlanggananSampai,
        trialEndsAt: tenant.trialEndsAt,
      })

      const planFeatureSet = new Set<string>(
        defaultPlan.fullAccess
          ? availableFeatures.map((feature) => feature.key)
          : defaultPlan.features.map((feature) => feature.featureKey)
      )
      const desiredFeatureSet = new Set<string>(provisioningDefaults.featureKeys)
      const overrides = availableFeatures
        .map((feature) => {
          const planEnabled = planFeatureSet.has(feature.key)
          const desiredEnabled = desiredFeatureSet.has(feature.key)
          if (planEnabled === desiredEnabled) return null

          return {
            tenantId: tenant.id,
            featureKey: feature.key,
            isEnabled: desiredEnabled,
            reason: 'Default provisioning setting',
            createdById: typeof actor?.id === 'string' ? actor.id : null,
          }
        })
        .filter((value): value is NonNullable<typeof value> => value !== null)

      if (overrides.length > 0) {
        await tx.tenantFeatureOverride.createMany({
          data: overrides,
        })
      }

      const adminUser = await tx.user.create({
        data: {
          tenantId: tenant.id,
          nama: application.namaPic,
          email: application.emailPic,
          username: slugApproved.replace(/-/g, '.').slice(0, 40) || 'admin',
          passwordHash,
          role: 'ADMIN',
          isActive: !requiresManualActivation,
        },
      })

      const updatedApplication = await tx.tenantApplication.update({
        where: { id: application.id },
        data: {
          status: 'PROVISIONED',
          slugApproved,
          approvedTenantId: tenant.id,
          provisionedAt: now,
        },
      })

      return {
        tenant,
        adminUser,
        application: updatedApplication,
      }
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
      tenantId: provisioned.tenant.id,
      action: 'TENANT_APPLICATION_PROVISIONED',
      targetType: 'TENANT',
      targetId: provisioned.tenant.id,
      summary: `Tenant ${provisioned.tenant.nama} diprovision dari aplikasi ${application.applicationCode}`,
      metadata: {
        applicationCode: application.applicationCode,
        slugApproved,
        defaultPlanCode: defaultPlan.code,
        defaultTrialDays: provisioningDefaults.trialDays,
        studentCapacity: effectiveStudentCapacity,
        requiresManualActivation,
        adminEmail: provisioned.adminUser.email,
      },
    })

    return NextResponse.json({
      data: {
        tenantId: provisioned.tenant.id,
        tenantSlug: provisioned.tenant.slug,
        tenantStatus: provisioned.tenant.tenantStatus,
        isActive: provisioned.tenant.isActive,
        adminEmail: provisioned.adminUser.email,
        tempPassword,
        trialEndsAt: provisioned.tenant.trialEndsAt,
      },
      message: requiresManualActivation
        ? 'Tenant berhasil diprovision. Tenant dibuat dalam status nonaktif dan perlu aktivasi manual.'
        : 'Tenant berhasil diprovision dan siap dipakai untuk onboarding lanjutan.',
    })
  } catch (error) {
    console.error('[SUPER_ADMIN_TENANT_APPLICATION_PROVISION_PUT]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
