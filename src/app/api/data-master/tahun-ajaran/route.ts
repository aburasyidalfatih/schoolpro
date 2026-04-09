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
      whereClause.nama = { contains: search }
    }

    const tahunAjarans = await prisma.tahunAjaran.findMany({
      where: whereClause,
      orderBy: { tanggalMulai: 'desc' },
    })

    return NextResponse.json({ data: tahunAjarans })
  } catch (error) {
    console.error('[TAHUN_AJARAN_GET]', error)
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
    const { nama, tanggalMulai, tanggalSelesai, isActive } = body

    if (!nama || !tanggalMulai || !tanggalSelesai) {
      return NextResponse.json({ error: 'Nama, tanggal mulai, dan tanggal selesai wajib diisi' }, { status: 400 })
    }

    // Validation: Start Date < End Date
    if (new Date(tanggalMulai) >= new Date(tanggalSelesai)) {
      return NextResponse.json({ error: 'Tanggal mulai harus sebelum tanggal selesai' }, { status: 400 })
    }

    // Check if name already exists for this tenant
    const existing = await prisma.tahunAjaran.findFirst({
      where: { tenantId: userSession.tenantId, nama },
    })
    if (existing) {
      return NextResponse.json({ error: 'Nama tahun ajaran sudah ada' }, { status: 400 })
    }

    // Single Active Year Logic
    if (isActive) {
      await prisma.tahunAjaran.updateMany({
        where: { tenantId: userSession.tenantId, isActive: true },
        data: { isActive: false },
      })
    }

    const newTA = await prisma.tahunAjaran.create({
      data: {
        tenantId: userSession.tenantId as string,
        nama,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: new Date(tanggalSelesai),
        isActive: !!isActive,
      },
    })

    return NextResponse.json({ data: newTA, message: 'Tahun Ajaran berhasil ditambahkan' }, { status: 201 })
  } catch (error) {
    console.error('[TAHUN_AJARAN_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
