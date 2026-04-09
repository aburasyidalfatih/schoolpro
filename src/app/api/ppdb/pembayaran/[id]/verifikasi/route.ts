import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PPDB']

// POST — admin approve/tolak bukti pembayaran
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
    const { approve } = await req.json()

    const pembayaran = await prisma.pembayaranPpdb.findFirst({
      where: { id, tenantId },
      include: { tagihan: { include: { pendaftar: true } } },
    })

    if (!pembayaran) return NextResponse.json({ error: 'Pembayaran tidak ditemukan' }, { status: 404 })
    if (pembayaran.status !== 'PENDING') {
      return NextResponse.json({ error: 'Pembayaran sudah diproses sebelumnya' }, { status: 400 })
    }

    if (approve) {
      await prisma.$transaction([
        prisma.pembayaranPpdb.update({
          where: { id },
          data: { status: 'BERHASIL', keterangan: `Diverifikasi oleh ${userSession.nama || 'Admin'}` },
        }),
        prisma.tagihanPpdb.update({
          where: { id: pembayaran.tagihanId },
          data: { status: 'LUNAS' },
        }),
      ])

      await prisma.logAktivitas.create({
        data: {
          tenantId,
          userId: session.user.id,
          aksi: 'VERIFIKASI_BAYAR_PPDB',
          modul: 'PPDB',
          detail: `Pembayaran disetujui untuk ${pembayaran.tagihan.pendaftar.noPendaftaran}`,
        },
      })

      return NextResponse.json({ message: 'Pembayaran berhasil diverifikasi dan tagihan ditandai LUNAS' })
    } else {
      await prisma.pembayaranPpdb.update({
        where: { id },
        data: { status: 'GAGAL', keterangan: 'Ditolak oleh admin' },
      })

      return NextResponse.json({ message: 'Bukti pembayaran ditolak. Pendaftar perlu mengirim ulang.' })
    }
  } catch (error) {
    console.error('[VERIFIKASI_BAYAR]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
