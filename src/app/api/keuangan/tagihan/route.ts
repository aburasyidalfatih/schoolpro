import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { getSessionUser, hasAnyRole } from '@/lib/auth/session'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const siswaId = searchParams.get('siswaId')
    const kelasId = searchParams.get('kelasId')
    const kategoriId = searchParams.get('kategoriId')
    const status = searchParams.get('status')
    const tahunAjaranId = searchParams.get('tahunAjaranId')
    const search = searchParams.get('search') // Nama siswa

    const userSession = getSessionUser(session)
    const tenantId = userSession?.tenantId
    if (!tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const whereClause: Prisma.TagihanWhereInput = { tenantId }
    const siswaFilter: Prisma.SiswaWhereInput = {}

    if (siswaId) whereClause.siswaId = siswaId
    if (kategoriId) whereClause.kategoriId = kategoriId
    if (status) whereClause.status = status
    if (tahunAjaranId) whereClause.tahunAjaranId = tahunAjaranId
    
    // Filter by class (joining through siswa)
    if (kelasId) {
      siswaFilter.kelasId = kelasId
    }

    // Search by student name
    if (search) {
      siswaFilter.namaLengkap = { contains: search }
    }

    if (Object.keys(siswaFilter).length > 0) {
      whereClause.siswa = { is: siswaFilter }
    }

    const tagihans = await prisma.tagihan.findMany({
      where: whereClause,
      include: {
        siswa: {
          select: {
            namaLengkap: true,
            nis: true,
            kelas: { select: { nama: true } }
          }
        },
        kategori: {
          select: { nama: true, kode: true }
        },
        tahunAjaran: {
          select: { nama: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: tagihans })
  } catch (error: unknown) {
    console.error('[TAGIHAN_GET_ERROR]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = getSessionUser(session)
    const tenantId = userSession?.tenantId
    if (!tenantId || !hasAnyRole(userSession, ['SUPER_ADMIN', 'ADMIN', 'KEUANGAN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { 
      siswaId, kategoriId, tahunAjaranId, bulan, nominal, keterangan, jatuhTempo 
    } = body

    if (!siswaId || !kategoriId || !tahunAjaranId || !nominal) {
      return NextResponse.json({ error: 'Siswa, Kategori, Tahun Ajaran, dan Nominal wajib diisi' }, { status: 400 })
    }

    const newTagihan = await prisma.tagihan.create({
      data: {
        tenantId,
        siswaId,
        kategoriId,
        tahunAjaranId,
        bulan: bulan || null,
        nominal: parseFloat(nominal),
        total: parseFloat(nominal),
        keterangan: keterangan || null,
        jatuhTempo: jatuhTempo ? new Date(jatuhTempo) : null,
        status: 'BELUM_LUNAS'
      },
    })

    return NextResponse.json({ data: newTagihan, message: 'Tagihan berhasil dibuat' }, { status: 201 })
  } catch (error: unknown) {
    console.error('[TAGIHAN_POST_ERROR]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 })
  }
}
