import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = session.user as any
    
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

    const pengaturan = (tenant?.pengaturan as any) || {}
    const tripay = pengaturan.tripay || {
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

    const userSession = session.user as any
    if (userSession.role !== 'SUPER_ADMIN' && userSession.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { namaBank, noRekening, atasNama, isActive } = body

    if (!namaBank || !noRekening || !atasNama) {
      return NextResponse.json({ error: 'Data Rekening Belum Lengkap' }, { status: 400 })
    }

    const newRekening = await prisma.rekening.create({
      data: {
        tenantId: userSession.tenantId as string,
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
