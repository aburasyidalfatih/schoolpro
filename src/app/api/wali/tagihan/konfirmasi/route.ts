import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST — konfirmasi pembayaran manual (upload bukti / konfirmasi sudah transfer)
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userSession = session.user as any
    const tenantId = userSession.tenantId
    const userId = session.user.id
    const body = await req.json()
    const { tagihanId, tipe, buktiUrl } = body

    if (!tagihanId || !tipe) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    if (tipe === 'PPDB') {
      // Verifikasi tagihan milik user ini
      const tagihan = await prisma.tagihanPpdb.findFirst({
        where: { id: tagihanId, tenantId, pendaftar: { userId } },
      })
      if (!tagihan) return NextResponse.json({ error: 'Tagihan tidak ditemukan' }, { status: 404 })
      if (tagihan.status === 'LUNAS') return NextResponse.json({ message: 'Sudah lunas' })

      await prisma.$transaction(async (tx) => {
        await tx.pembayaranPpdb.create({
          data: {
            tenantId,
            tagihanId,
            nominal: tagihan.nominal,
            metode: 'MANUAL',
            tanggalBayar: new Date(),
            status: 'PENDING', // Admin perlu verifikasi
            buktiUrl: buktiUrl || null,
            keterangan: 'Konfirmasi pembayaran manual oleh pendaftar',
          },
        })
        // Langsung LUNAS untuk demo — di production tunggu verifikasi admin
        await tx.tagihanPpdb.update({
          where: { id: tagihanId },
          data: { status: 'LUNAS' },
        })
      })

      return NextResponse.json({ message: 'Pembayaran berhasil dikonfirmasi' })
    }

    if (tipe === 'SISWA') {
      // Verifikasi tagihan milik siswa yang terhubung ke user ini
      const siswa = await prisma.siswa.findFirst({ where: { userId, tenantId } })
      if (!siswa) return NextResponse.json({ error: 'Data siswa tidak ditemukan' }, { status: 404 })

      const tagihan = await prisma.tagihan.findFirst({
        where: { id: tagihanId, tenantId, siswaId: siswa.id },
      })
      if (!tagihan) return NextResponse.json({ error: 'Tagihan tidak ditemukan' }, { status: 404 })
      if (tagihan.status === 'LUNAS') return NextResponse.json({ message: 'Sudah lunas' })

      // Buat pembayaran pending — admin yang approve
      const noTransaksi = `TRX-${Date.now()}`
      await prisma.pembayaran.create({
        data: {
          tenantId,
          tagihanId,
          noTransaksi,
          jumlahBayar: tagihan.total,
          metode: 'TRANSFER',
          status: 'PENDING',
          buktiUrl: buktiUrl || null,
          keterangan: 'Konfirmasi pembayaran manual oleh wali',
        },
      })

      return NextResponse.json({ message: 'Konfirmasi dikirim, menunggu verifikasi admin' })
    }

    return NextResponse.json({ error: 'Tipe tagihan tidak valid' }, { status: 400 })
  } catch (error) {
    console.error('[WALI_KONFIRMASI]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
