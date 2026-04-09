import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = session.user as any
    if (userSession.role !== 'SUPER_ADMIN' && userSession.role !== 'ADMIN') {
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

    const currentPengaturan = (tenant.pengaturan as any) || {}
    const currentTripay = currentPengaturan.tripay || {}

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
