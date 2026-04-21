import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSessionUser, hasAnyRole } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import {
  maskTenantNotificationGatewaySettings,
  mergeTenantNotificationGatewaySettings,
  normalizeTenantNotificationGatewaySettings,
} from '@/features/settings/lib/notification-gateway'

const TENANT_SETTINGS_ROLES = ['SUPER_ADMIN', 'ADMIN']

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = getSessionUser(session)
    if (!userSession?.tenantId || !hasAnyRole(userSession, TENANT_SETTINGS_ROLES)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: userSession.tenantId },
      select: {
        id: true,
        nama: true,
        pengaturan: true,
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 404 })
    }

    const normalized = normalizeTenantNotificationGatewaySettings(tenant.pengaturan)

    return NextResponse.json({
      data: {
        tenantId: tenant.id,
        tenantName: tenant.nama,
        settings: maskTenantNotificationGatewaySettings(normalized),
      },
    })
  } catch (error) {
    console.error('[PENGATURAN_NOTIFIKASI_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = getSessionUser(session)
    if (!userSession?.tenantId || !hasAnyRole(userSession, TENANT_SETTINGS_ROLES)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const incomingSettings = normalizeTenantNotificationGatewaySettings(body?.settings)

    if (incomingSettings.emailGateway.isActive) {
      if (
        !incomingSettings.emailGateway.host ||
        !incomingSettings.emailGateway.username ||
        !incomingSettings.emailGateway.password ||
        !incomingSettings.emailGateway.fromEmail
      ) {
        return NextResponse.json({ error: 'Konfigurasi SMTP Marketing belum lengkap' }, { status: 400 })
      }
    }

    if (incomingSettings.whatsappGateway.isActive) {
      if (
        !incomingSettings.whatsappGateway.baseUrl ||
        !incomingSettings.whatsappGateway.apiKey ||
        !incomingSettings.whatsappGateway.deviceId
      ) {
        return NextResponse.json({ error: 'Konfigurasi StarSender belum lengkap' }, { status: 400 })
      }
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: userSession.tenantId },
      select: {
        id: true,
        pengaturan: true,
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 404 })
    }

    const currentPengaturan =
      tenant.pengaturan && typeof tenant.pengaturan === 'object'
        ? (tenant.pengaturan as Record<string, unknown>)
        : {}

    const mergedPengaturan = mergeTenantNotificationGatewaySettings({
      currentPengaturan,
      incoming: incomingSettings,
    })

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        pengaturan: mergedPengaturan as Prisma.InputJsonValue,
      },
    })

    return NextResponse.json({
      message: 'Pengaturan email dan WhatsApp gateway berhasil diperbarui',
      data: {
        settings: maskTenantNotificationGatewaySettings(normalizeTenantNotificationGatewaySettings(mergedPengaturan)),
      },
    })
  } catch (error) {
    console.error('[PENGATURAN_NOTIFIKASI_PUT]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
