import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST — pendaftar kirim bukti transfer, status jadi MENUNGGU_VERIFIKASI
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const tenantId = (session.user as any).tenantId
    const { buktiUrl } = await req.json()

    if (!buktiUrl) return NextResponse.json({ error: 'Bukti transfer wajib diupload' }, { status: 400 })

    const pendaftar = await prisma.pendaftarPpdb.findUnique({
      where: { id, tenantId },
      include: { tagihanPpdbs: { include: { pembayarans: true } } },
    })

    if (!pendaftar) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    if (pendaftar.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Cari tagihan yang belum lunas
    const tagihan =
      pendaftar.tagihanPpdbs.find(t => t.jenis === 'PENDAFTARAN' && t.status === 'BELUM_LUNAS') ??
      pendaftar.tagihanPpdbs.find(t => t.status === 'BELUM_LUNAS')

    if (!tagihan) return NextResponse.json({ error: 'Tidak ada tagihan yang perlu dibayar' }, { status: 400 })

    // Cek apakah sudah ada pembayaran pending
    const existingPending = tagihan.pembayarans.find(p => p.status === 'PENDING')
    if (existingPending) return NextResponse.json({ error: 'Bukti transfer sudah dikirim, menunggu verifikasi admin' }, { status: 409 })

    await prisma.pembayaranPpdb.create({
      data: {
        tenantId,
        tagihanId: tagihan.id,
        nominal: tagihan.nominal,
        metode: 'TRANSFER',
        buktiUrl,
        status: 'PENDING',
        keterangan: 'Menunggu verifikasi admin',
      },
    })

    await prisma.logAktivitas.create({
      data: {
        tenantId,
        userId: session.user.id,
        aksi: 'KIRIM_BUKTI_BAYAR',
        modul: 'PPDB',
        detail: `Bukti transfer dikirim untuk ${pendaftar.noPendaftaran}`,
      },
    })

    return NextResponse.json({ message: 'Bukti transfer berhasil dikirim' })
  } catch (error) {
    console.error('[INVOICE_KONFIRMASI]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
