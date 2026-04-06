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
    const kelasId = searchParams.get('kelasId')
    const unitId = searchParams.get('unitId')
    const status = searchParams.get('status')

    const userSession = session.user as any
    const whereClause: any = {
      tenantId: userSession.tenantId,
    }

    if (search) {
      whereClause.OR = [
        { namaLengkap: { contains: search } },
        { nis: { contains: search } },
        { nisn: { contains: search } },
      ]
    }
    if (kelasId) whereClause.kelasId = kelasId
    if (unitId) whereClause.unitId = unitId
    if (status) whereClause.status = status

    const siswas = await prisma.siswa.findMany({
      where: whereClause,
      include: {
        kelas: {
          select: { nama: true }
        },
        unit: {
          select: { nama: true, kode: true }
        },
      },
      orderBy: { namaLengkap: 'asc' },
    })

    return NextResponse.json({ data: siswas })
  } catch (error) {
    console.error('[SISWA_GET]', error)
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
    if (userSession.role !== 'SUPER_ADMIN' && userSession.role !== 'ADMIN' && userSession.role !== 'TU') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { 
        nis, nisn, namaLengkap, jenisKelamin, tempatLahir, tanggalLahir, 
        alamat, telepon, fotoUrl, namaWali, teleponWali, emailWali, 
        kelasId, unitId, status 
    } = body

    if (!nis || !namaLengkap) {
      return NextResponse.json({ error: 'NIS dan Nama Lengkap wajib diisi' }, { status: 400 })
    }

    // Check if NIS already exists for this tenant
    const existing = await prisma.siswa.findFirst({
      where: { tenantId: userSession.tenantId, nis },
    })
    if (existing) {
      return NextResponse.json({ error: 'NIS sudah digunakan oleh siswa lain' }, { status: 400 })
    }

    const newSiswa = await prisma.siswa.create({
      data: {
        tenantId: userSession.tenantId as string,
        nis,
        nisn: nisn || null,
        namaLengkap,
        jenisKelamin: jenisKelamin || null,
        tempatLahir: tempatLahir || null,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
        alamat: alamat || null,
        telepon: telepon || null,
        fotoUrl: fotoUrl || null,
        namaWali: namaWali || null,
        teleponWali: teleponWali || null,
        emailWali: emailWali || null,
        kelasId: kelasId || null,
        unitId: unitId || null,
        status: status || 'AKTIF',
      },
    })

    return NextResponse.json({ data: newSiswa, message: 'Siswa berhasil ditambahkan' }, { status: 201 })
  } catch (error) {
    console.error('[SISWA_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
