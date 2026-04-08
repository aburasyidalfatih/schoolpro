import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = session.user as any
    const tenantId = userSession.tenantId

    const periodes = await prisma.periodePpdb.findMany({
      where: { tenantId },
      include: {
        tahunAjaran: true,
        unit: true,
        _count: {
          select: { pendaftars: true }
        }
      },
      orderBy: { tanggalBuka: 'desc' }
    })

    return NextResponse.json({ data: periodes })
  } catch (error) {
    console.error('[PPDB_PERIODE_GET]', error)
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
    const tenantId = userSession.tenantId

    if (userSession.role !== 'SUPER_ADMIN' && userSession.role !== 'ADMIN' && userSession.role !== 'PPDB') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { 
      nama, 
      tahunAjaranId, 
      unitId, 
      tanggalBuka, 
      tanggalTutup, 
      biayaPendaftaran,
      isActive 
    } = body

    if (!nama || !tahunAjaranId || !tanggalBuka || !tanggalTutup) {
      return NextResponse.json({ error: 'Nama, Tahun Ajaran, dan Tanggal wajib diisi' }, { status: 400 })
    }

    const newPeriode = await prisma.periodePpdb.create({
      data: {
        tenantId,
        nama,
        tahunAjaranId,
        unitId: unitId || null,
        tanggalBuka: new Date(tanggalBuka),
        tanggalTutup: new Date(tanggalTutup),
        isActive: isActive ?? true,
        pengaturan: {
          biayaPendaftaran: Number(biayaPendaftaran) || 0
        }
      }
    })

    return NextResponse.json({ 
      data: newPeriode, 
      message: 'Gelombang PPDB berhasil dibuat' 
    }, { status: 201 })
  } catch (error) {
    console.error('[PPDB_PERIODE_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
