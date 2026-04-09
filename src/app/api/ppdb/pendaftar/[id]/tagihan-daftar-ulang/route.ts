import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PPDB']

// POST — generate tagihan daftar ulang untuk pendaftar yang DITERIMA
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userSession = session.user as any
    if (!ADMIN_ROLES.includes(userSession.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const tenantId = userSession.tenantId
    const body = await req.json()
    const { nominal } = body

    if (!nominal || Number(nominal) <= 0) {
      return NextResponse.json({ error: 'Nominal daftar ulang wajib diisi' }, { status: 400 })
    }

    const pendaftar = await prisma.pendaftarPpdb.findUnique({
      where: { id, tenantId },
      include: { tagihanPpdbs: true, periode: true },
    })

    if (!pendaftar) return NextResponse.json({ error: 'Pendaftar tidak ditemukan' }, { status: 404 })
    if (pendaftar.status !== 'DITERIMA') {
      return NextResponse.json({ error: 'Hanya pendaftar berstatus DITERIMA yang bisa dibuatkan tagihan daftar ulang' }, { status: 400 })
    }

    // Cek apakah sudah ada tagihan daftar ulang
    const existing = pendaftar.tagihanPpdbs.find(t => t.jenis === 'DAFTAR_ULANG')
    if (existing) {
      return NextResponse.json({ error: 'Tagihan daftar ulang sudah pernah dibuat' }, { status: 409 })
    }

    const tagihan = await prisma.tagihanPpdb.create({
      data: {
        tenantId,
        pendaftarId: id,
        jenis: 'DAFTAR_ULANG',
        nominal: Number(nominal),
        status: 'BELUM_LUNAS',
      },
    })

    await prisma.logAktivitas.create({
      data: {
        tenantId,
        userId: session.user.id,
        aksi: 'GENERATE_TAGIHAN_DAFTAR_ULANG',
        modul: 'PPDB',
        detail: `Generate tagihan daftar ulang Rp ${Number(nominal).toLocaleString('id-ID')} untuk ${pendaftar.noPendaftaran}`,
      },
    })

    return NextResponse.json({ data: tagihan, message: 'Tagihan daftar ulang berhasil dibuat' }, { status: 201 })
  } catch (error) {
    console.error('[PPDB_TAGIHAN_DAFTAR_ULANG]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
