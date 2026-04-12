import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'

type SessionUser = {
  id: string
  tenantId?: string | null
}

type PendingTagihan = {
  id: string
  jenis: string
  status: string
  nominal: Prisma.Decimal
  createdAt: Date
  pembayarans: Array<{ id: string; status: string }>
}

type PendingPendaftar = {
  id: string
  noPendaftaran: string
  tagihanPpdbs: PendingTagihan[]
}

function pickPendingTagihan(tagihanPpdbs: PendingTagihan[]) {
  const ordered = [...tagihanPpdbs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    ordered.find((t) => t.jenis === 'PENDAFTARAN' && t.status === 'BELUM_LUNAS') ??
    ordered.find((t) => t.jenis === 'DAFTAR_ULANG' && t.status === 'BELUM_LUNAS') ??
    ordered.find((t) => t.status === 'BELUM_LUNAS') ??
    null
  )
}

// POST — pendaftar kirim bukti transfer, status jadi MENUNGGU_VERIFIKASI
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const userSession = session.user as SessionUser
    const tenantId = userSession.tenantId
    const userId = session.user.id
    const body = await req.json()
    const buktiUrl = typeof body?.buktiUrl === 'string' ? body.buktiUrl.trim() : ''

    if (!tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!buktiUrl) return NextResponse.json({ error: 'Bukti transfer wajib diupload' }, { status: 400 })

    const pendaftar = (await prisma.pendaftarPpdb.findFirst({
      where: { id, tenantId, userId },
      include: {
        tagihanPpdbs: {
          orderBy: { createdAt: 'desc' },
          include: {
            pembayarans: {
              where: { status: 'PENDING' },
              select: { id: true, status: true },
            },
          },
        },
      },
    })) as PendingPendaftar | null

    if (!pendaftar) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    const tagihan = pickPendingTagihan(pendaftar.tagihanPpdbs)

    if (!tagihan) return NextResponse.json({ error: 'Tidak ada tagihan yang perlu dibayar' }, { status: 400 })

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.tagihanPpdb.updateMany({
        where: {
          id: tagihan.id,
          tenantId,
          pendaftarId: pendaftar.id,
          status: 'BELUM_LUNAS',
        },
        data: { status: 'MENUNGGU_VERIFIKASI' },
      })

      if (updated.count !== 1) {
        return { error: 'Bukti transfer sudah dikirim, menunggu verifikasi admin', status: 409 as const }
      }

      await tx.pembayaranPpdb.create({
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

      await tx.logAktivitas.create({
        data: {
          tenantId,
          userId,
          aksi: 'KIRIM_BUKTI_BAYAR',
          modul: 'PPDB',
          detail: `Bukti transfer dikirim untuk ${pendaftar.noPendaftaran}`,
        },
      })

      return { message: 'Bukti transfer berhasil dikirim', status: 200 as const }
    })

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ message: result.message }, { status: result.status })
  } catch (error) {
    console.error('[INVOICE_KONFIRMASI]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
