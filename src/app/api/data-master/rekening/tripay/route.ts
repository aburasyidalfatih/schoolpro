import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSessionUser, hasAnyRole } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

type TripaySettings = {
  merchantCode?: string
  apiKey?: string
  privateKey?: string
  isSandbox?: boolean
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = getSessionUser(session)
    if (!userSession?.tenantId || !hasAnyRole(userSession, ['SUPER_ADMIN', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { merchantCode, apiKey, privateKey, isSandbox } = body

    const tenant = await prisma.tenant.findUnique({
      where: { id: userSession.tenantId },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 404 })
    }

    const currentPengaturan = tenant.pengaturan && typeof tenant.pengaturan === 'object'
      ? (tenant.pengaturan as Record<string, unknown>)
      : {}
    const currentTripay = (currentPengaturan.tripay as TripaySettings | undefined) || {}

    // Logic: If the user didn't change the masked fields (they contain '...'), keep current values
    const finalApiKey = (apiKey && apiKey.includes('...')) ? currentTripay.apiKey : apiKey
    const finalPrivateKey = (privateKey && privateKey.includes('...')) ? currentTripay.privateKey : privateKey

    const updatedTripay = {
        merchantCode: merchantCode || currentTripay.merchantCode,
        apiKey: finalApiKey,
        privateKey: finalPrivateKey,
        isSandbox: isSandbox !== undefined ? !!isSandbox : currentTripay.isSandbox,
    }

    await prisma.tenant.update({
      where: { id: userSession.tenantId },
      data: {
        pengaturan: {
            ...currentPengaturan,
            tripay: updatedTripay
        }
      }
    })

    return NextResponse.json({ message: 'Pengaturan Tripay Berhasil diperbarui' })
  } catch (error) {
    console.error('[TRIPAY_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
