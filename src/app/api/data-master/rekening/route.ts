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

export async function GET() {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = getSessionUser(session)
    if (!userSession?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 1. Fetch Manual Bank Accounts
    const rekenings = await prisma.rekening.findMany({
      where: { tenantId: userSession.tenantId },
      orderBy: { createdAt: 'desc' },
    })

    // 2. Fetch Tripay Settings from Tenant.pengaturan
    const tenant = await prisma.tenant.findUnique({
      where: { id: userSession.tenantId },
      select: { pengaturan: true },
    })

    const pengaturan = tenant?.pengaturan && typeof tenant.pengaturan === 'object'
      ? (tenant.pengaturan as Record<string, unknown>)
      : {}
    const tripay = (pengaturan.tripay as TripaySettings | undefined) || {
        merchantCode: '',
        apiKey: '',
        privateKey: '',
        isSandbox: true,
    }

    // Mask sensitive info for GET (Security best practice)
    const maskedTripay = {
        ...tripay,
        apiKey: tripay.apiKey ? `${tripay.apiKey.substring(0, 6)}...` : '',
        privateKey: tripay.privateKey ? `${tripay.privateKey.substring(0, 6)}...` : '',
    }

    return NextResponse.json({ 
        data: rekenings,
        tripay: maskedTripay
    })
  } catch (error) {
    console.error('[REKENING_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
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
    const { namaBank, noRekening, atasNama, isActive } = body

    if (!namaBank || !noRekening || !atasNama) {
      return NextResponse.json({ error: 'Data Rekening Belum Lengkap' }, { status: 400 })
    }

    const newRekening = await prisma.rekening.create({
      data: {
        tenantId: userSession.tenantId,
        namaBank,
        noRekening,
        atasNama,
        isActive: isActive !== undefined ? !!isActive : true,
      },
    })

    return NextResponse.json({ data: newRekening, message: 'Rekening Berhasil ditambahkan' }, { status: 201 })
  } catch (error) {
    console.error('[REKENING_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
