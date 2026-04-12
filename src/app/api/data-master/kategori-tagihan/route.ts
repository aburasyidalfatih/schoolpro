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

    const userSession = getSessionUser(session)
    if (!userSession?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const whereClause: Prisma.KategoriTagihanWhereInput = {
      tenantId: userSession.tenantId,
    }

    if (search) {
      whereClause.OR = [
        { nama: { contains: search } },
        { kode: { contains: search } },
      ]
    }

    const kategoriTagihans = await prisma.kategoriTagihan.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: kategoriTagihans })
  } catch (error) {
    console.error('[KATEGORI_TAGIHAN_GET]', error)
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
    const { nama, kode, isBulanan, isActive } = body

    if (!nama || !kode) {
      return NextResponse.json({ error: 'Nama dan Kode wajib diisi' }, { status: 400 })
    }

    // Check if code already exists for this tenant
    const existing = await prisma.kategoriTagihan.findFirst({
      where: { tenantId: userSession.tenantId, kode },
    })
    if (existing) {
        return NextResponse.json({ error: 'Kode kategori sudah digunakan' }, { status: 400 })
    }

    const newKategori = await prisma.kategoriTagihan.create({
      data: {
        tenantId: userSession.tenantId,
        nama,
        kode,
        isBulanan: !!isBulanan,
        isActive: isActive !== undefined ? !!isActive : true,
      },
    })

    return NextResponse.json({ data: newKategori, message: 'Kategori Berhasil ditambahkan' }, { status: 201 })
  } catch (error) {
    console.error('[KATEGORI_TAGIHAN_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
