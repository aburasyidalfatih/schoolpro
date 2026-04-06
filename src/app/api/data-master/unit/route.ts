import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')

    const userSession = session.user as any
    const whereClause: any = {
      tenantId: userSession.tenantId,
    }

    if (search) {
      whereClause.OR = [
        { nama: { contains: search } },
        { kode: { contains: search } },
      ]
    }

    const units = await prisma.unit.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: units })
  } catch (error) {
    console.error('[UNIT_GET]', error)
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
    const { nama, kode, isActive } = body

    if (!nama || !kode) {
      return NextResponse.json({ error: 'Nama dan kode unit wajib diisi' }, { status: 400 })
    }

    // Check if kode already exists in tenant
    const existingUnit = await prisma.unit.findFirst({
      where: {
        tenantId: userSession.tenantId,
        kode,
      },
    })

    if (existingUnit) {
      return NextResponse.json(
        { error: 'Kode unit sudah digunakan' },
        { status: 400 }
      )
    }

    const newUnit = await prisma.unit.create({
      data: {
        tenantId: userSession.tenantId as string,
        nama,
        kode,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({ data: newUnit, message: 'Unit berhasil ditambahkan' }, { status: 201 })
  } catch (error) {
    console.error('[UNIT_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
