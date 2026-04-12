import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PPDB']

type SessionUser = {
  id: string
  tenantId?: string | null
  role?: string | null
  nama?: string | null
}

// POST — admin approve/tolak bukti pembayaran
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userSession = session.user as SessionUser
    const tenantId = userSession.tenantId
    if (!tenantId || typeof userSession.role !== 'string' || !ADMIN_ROLES.includes(userSession.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const approve = body?.approve

    if (typeof approve !== 'boolean') {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const pembayaran = await prisma.pembayaranPpdb.findFirst({
      where: { id, tenantId },
      include: {
        tagihan: {
          include: {
            pendaftar: true,
            pembayarans: {
              where: { status: 'PENDING' },
              select: { id: true, status: true },
            },
          },
        },
      },
    })

    if (!pembayaran) return NextResponse.json({ error: 'Pembayaran tidak ditemukan' }, { status: 404 })
    if (pembayaran.status !== 'PENDING') {
      return NextResponse.json({ error: 'Pembayaran sudah diproses sebelumnya' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const pendingCount = await tx.pembayaranPpdb.count({
        where: {
          tenantId,
          tagihanId: pembayaran.tagihanId,
          status: 'PENDING',
        },
      })

      if (pendingCount !== 1) {
        return {
          error: 'Status pembayaran tidak konsisten. Harap muat ulang data tagihan.',
          status: 409 as const,
        }
      }

      if (approve) {
        const tagihanUpdated = await tx.tagihanPpdb.updateMany({
          where: {
            id: pembayaran.tagihanId,
            tenantId,
            status: { in: ['BELUM_LUNAS', 'MENUNGGU_VERIFIKASI'] },
          },
          data: { status: 'LUNAS' },
        })

        if (tagihanUpdated.count !== 1) {
          return {
            error: 'Tagihan sudah diproses sebelumnya',
            status: 409 as const,
          }
        }

        const pembayaranUpdated = await tx.pembayaranPpdb.updateMany({
          where: {
            id,
            tenantId,
            tagihanId: pembayaran.tagihanId,
            status: 'PENDING',
          },
          data: {
            status: 'BERHASIL',
            keterangan: `Diverifikasi oleh ${userSession.nama || 'Admin'}`,
          },
        })

        if (pembayaranUpdated.count !== 1) {
          return {
            error: 'Pembayaran sudah diproses sebelumnya',
            status: 409 as const,
          }
        }

        await tx.logAktivitas.create({
          data: {
            tenantId,
            userId: session.user.id,
            aksi: 'VERIFIKASI_BAYAR_PPDB',
            modul: 'PPDB',
            detail: `Pembayaran disetujui untuk ${pembayaran.tagihan.pendaftar.noPendaftaran}`,
          },
        })

        return {
          message: 'Pembayaran berhasil diverifikasi dan tagihan ditandai LUNAS',
          status: 200 as const,
        }
      }

      const pembayaranUpdated = await tx.pembayaranPpdb.updateMany({
        where: {
          id,
          tenantId,
          tagihanId: pembayaran.tagihanId,
          status: 'PENDING',
        },
        data: {
          status: 'GAGAL',
          keterangan: 'Ditolak oleh admin',
        },
      })

      if (pembayaranUpdated.count !== 1) {
        return {
          error: 'Pembayaran sudah diproses sebelumnya',
          status: 409 as const,
        }
      }

      const pendingAfterReview = await tx.pembayaranPpdb.count({
        where: {
          tenantId,
          tagihanId: pembayaran.tagihanId,
          status: 'PENDING',
        },
      })

      await tx.tagihanPpdb.update({
        where: { id: pembayaran.tagihanId },
        data: {
          status: pendingAfterReview > 0 ? 'MENUNGGU_VERIFIKASI' : 'BELUM_LUNAS',
        },
      })

      await tx.logAktivitas.create({
        data: {
          tenantId,
          userId: session.user.id,
          aksi: 'VERIFIKASI_BAYAR_PPDB',
          modul: 'PPDB',
          detail: `Pembayaran ditolak untuk ${pembayaran.tagihan.pendaftar.noPendaftaran}`,
        },
      })

      return {
        message: 'Bukti pembayaran ditolak. Pendaftar perlu mengirim ulang.',
        status: 200 as const,
      }
    })

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ message: result.message }, { status: result.status })
  } catch (error) {
    console.error('[VERIFIKASI_BAYAR]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
