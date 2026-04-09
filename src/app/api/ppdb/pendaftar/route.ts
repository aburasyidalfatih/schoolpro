import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PPDB']

// GET — Admin: list semua pendaftar dengan filter
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userSession = session.user as any
    const tenantId = userSession.tenantId
    const { searchParams } = new URL(req.url)

    const status = searchParams.get('status')
    const periodeId = searchParams.get('periodeId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = { tenantId }
    if (status) where.status = status
    if (periodeId) where.periodeId = periodeId
    if (search) where.namaLengkap = { contains: search }

    const [data, total] = await Promise.all([
      prisma.pendaftarPpdb.findMany({
        where,
        include: {
          periode: { include: { unit: true, tahunAjaran: true } },
          tagihanPpdbs: true,
          berkas: { include: { persyaratan: true } },
        },
        orderBy: { tanggalDaftar: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.pendaftarPpdb.count({ where }),
    ])

    return NextResponse.json({ data, total, page, limit })
  } catch (error) {
    console.error('[PPDB_PENDAFTAR_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
