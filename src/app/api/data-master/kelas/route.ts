import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSessionUser, hasAnyRole } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const unitId = searchParams.get('unitId')
    const tahunAjaranId = searchParams.get('tahunAjaranId')

    const userSession = getSessionUser(session)
    if (!userSession?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const whereClause: Prisma.KelasWhereInput = {
      tenantId: userSession.tenantId,
    }

    if (search) {
      whereClause.nama = { contains: search }
    }
    if (unitId) {
      whereClause.unitId = unitId
    }
    if (tahunAjaranId) {
      whereClause.tahunAjaranId = tahunAjaranId
    }

    const kelases = await prisma.kelas.findMany({
      where: whereClause,
      include: {
        unit: {
          select: { nama: true, kode: true }
        },
        tahunAjaran: {
          select: { nama: true }
        },
      },
      orderBy: { nama: 'asc' },
    })

    return NextResponse.json({ data: kelases })
  } catch (error) {
    console.error('[KELAS_GET]', error)
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
    const { nama, unitId, tahunAjaranId, tingkat, kapasitas } = body

    if (!nama || !unitId || !tahunAjaranId) {
      return NextResponse.json({ error: 'Nama, Unit, dan Tahun Ajaran wajib diisi' }, { status: 400 })
    }

    const newKelas = await prisma.kelas.create({
      data: {
        tenantId: userSession.tenantId,
        nama,
        unitId,
        tahunAjaranId,
        tingkat: tingkat || null,
        kapasitas: kapasitas ? parseInt(kapasitas.toString()) : 32,
      },
      include: {
        unit: true,
        tahunAjaran: true,
      },
    })

    return NextResponse.json({ data: newKelas, message: 'Kelas berhasil ditambahkan' }, { status: 201 })
  } catch (error) {
    console.error('[KELAS_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
