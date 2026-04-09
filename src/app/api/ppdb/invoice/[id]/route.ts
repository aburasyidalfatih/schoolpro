import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — data invoice untuk halaman pembayaran pendaftar
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const tenantId = (session.user as any).tenantId

    const pendaftar = await prisma.pendaftarPpdb.findUnique({
      where: { id, tenantId },
      include: {
        periode: { include: { unit: true } },
        tagihanPpdbs: {
          include: { pembayarans: { orderBy: { createdAt: 'desc' } } }
        },
      },
    })

    if (!pendaftar) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    // Hanya pemilik yang bisa akses
    if (pendaftar.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Ambil tagihan yang belum lunas (prioritas PENDAFTARAN dulu)
    const tagihan =
      pendaftar.tagihanPpdbs.find(t => t.jenis === 'PENDAFTARAN' && t.status !== 'LUNAS') ??
      pendaftar.tagihanPpdbs.find(t => t.jenis === 'DAFTAR_ULANG' && t.status !== 'LUNAS') ??
      pendaftar.tagihanPpdbs.find(t => t.status !== 'LUNAS')

    const rekenings = await prisma.rekening.findMany({
      where: { tenantId, isActive: true },
    })

    return NextResponse.json({ data: { pendaftar, tagihan, rekenings } })
  } catch (error) {
    console.error('[INVOICE_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
