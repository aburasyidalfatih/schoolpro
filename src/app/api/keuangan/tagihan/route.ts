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
    const siswaId = searchParams.get('siswaId')
    const kelasId = searchParams.get('kelasId')
    const kategoriId = searchParams.get('kategoriId')
    const status = searchParams.get('status')
    const tahunAjaranId = searchParams.get('tahunAjaranId')
    const search = searchParams.get('search') // Nama siswa

    const userSession = session.user as any
    const whereClause: any = {
      tenantId: userSession.tenantId,
    }

    if (siswaId) whereClause.siswaId = siswaId
    if (kategoriId) whereClause.kategoriId = kategoriId
    if (status) whereClause.status = status
    if (tahunAjaranId) whereClause.tahunAjaranId = tahunAjaranId
    
    // Filter by class (joining through siswa)
    if (kelasId) {
      whereClause.siswa = {
        kelasId: kelasId
      }
    }

    // Search by student name
    if (search) {
      whereClause.siswa = {
        ...whereClause.siswa,
        namaLengkap: { contains: search }
      }
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
  } catch (error: any) {
    console.error('[TAGIHAN_GET_ERROR]', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = session.user as any
    // Only certain roles can manage billing
    if (userSession.role !== 'SUPER_ADMIN' && userSession.role !== 'ADMIN' && userSession.role !== 'KEUANGAN') {
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
        tenantId: userSession.tenantId,
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
  } catch (error: any) {
    console.error('[TAGIHAN_POST_ERROR]', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
