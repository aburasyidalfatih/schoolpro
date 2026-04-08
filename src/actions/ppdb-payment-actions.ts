'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function simulatePayment(tagihanId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    const tenantId = (session.user as any).tenantId
    const userId = session.user.id

    // 1. Find the tagihan and ensure it belongs to the user
    const tagihan = await prisma.tagihanPpdb.findFirst({
      where: {
        id: tagihanId,
        tenantId,
        pendaftar: {
          userId
        }
      },
      include: {
        pendaftar: true
      }
    })

    if (!tagihan) {
      return { error: 'Tagihan tidak ditemukan' }
    }

    if (tagihan.status === 'LUNAS') {
      return { success: true, message: 'Tagihan sudah lunas' }
    }

    // 2. Perform payment transaction
    await prisma.$transaction(async (tx) => {
      // Create pembayaran record
      await tx.pembayaranPpdb.create({
        data: {
          tenantId,
          tagihanId,
          nominal: tagihan.nominal,
          metode: 'SIMULASI_MANUAL',
          tanggalBayar: new Date(),
          status: 'BERHASIL',
          keterangan: 'Pembayaran simulasi via portal pendaftar'
        }
      })

      // Update tagihan status
      await tx.tagihanPpdb.update({
        where: { id: tagihanId },
        data: {
          status: 'LUNAS'
        }
      })
    })

    revalidatePath('/beranda')
    revalidatePath(`/ppdb/invoice/${tagihanId}`)

    return { 
      success: true, 
      message: 'Pembayaran berhasil disimulasikan' 
    }
  } catch (error) {
    console.error('[SIMULATE_PAYMENT_ERROR]', error)
    return { error: 'Gagal memproses simulasi pembayaran' }
  }
}
