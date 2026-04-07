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
    if (userSession.role !== 'SUPER_ADMIN' && userSession.role !== 'ADMIN' && userSession.role !== 'KEUANGAN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { 
      kategoriId, tahunAjaranId, kelasId, bulan, nominal, keterangan, jatuhTempo 
    } = body

    if (!kategoriId || !tahunAjaranId || !nominal) {
      return NextResponse.json({ error: 'Kategori, Tahun Ajaran, dan Nominal wajib diisi' }, { status: 400 })
    }

    // 1. Get students to be processed
    const studentQuery: any = {
      tenantId: userSession.tenantId,
      status: 'AKTIF',
    }
    if (kelasId) {
      studentQuery.kelasId = kelasId
    }

    const students = await prisma.siswa.findMany({
      where: studentQuery,
      select: { id: true }
    })

    if (students.length === 0) {
      return NextResponse.json({ error: 'Tidak ada siswa aktif yang ditemukan' }, { status: 400 })
    }

    // 2. Filter out students who already have this exact tagihan to prevent duplicates
    // Duplicate = same siswa, kategori, tahunAjaran, and bulan
    const existingTagihans = await prisma.tagihan.findMany({
      where: {
        tenantId: userSession.tenantId,
        kategoriId,
        tahunAjaranId,
        bulan: bulan || null,
        siswaId: { in: students.map(s => s.id) }
      },
      select: { siswaId: true }
    })

    const existingStudentIds = new Set(existingTagihans.map(t => t.siswaId))
    const studentsToBill = students.filter(s => !existingStudentIds.has(s.id))

    if (studentsToBill.length === 0) {
      return NextResponse.json({ 
        message: 'Semua siswa di kriteria ini sudah memiliki tagihan tersebut.',
        createdCount: 0,
        skippedCount: students.length
      })
    }

    // 3. Create Tagihans in Bulk
    // Note: SQLite supports createMany in recent Prisma versions
    const dataToInsert = studentsToBill.map(s => ({
      tenantId: userSession.tenantId as string,
      siswaId: s.id,
      kategoriId,
      tahunAjaranId,
      bulan: bulan || null,
      nominal: parseFloat(nominal),
      total: parseFloat(nominal),
      status: 'BELUM_LUNAS' as any,
      keterangan: keterangan || null,
      jatuhTempo: jatuhTempo ? new Date(jatuhTempo) : null,
    }))

    const result = await prisma.tagihan.createMany({
      data: dataToInsert,
    })

    return NextResponse.json({ 
      message: `${result.count} tagihan berhasil dibuat.`,
      createdCount: result.count,
      skippedCount: students.length - result.count
    }, { status: 201 })

  } catch (error: any) {
    console.error('[TAGIHAN_GENERATE_ERROR]', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
