'use server'

import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

const MAX_PPDB_RETRIES = 3

type SessionUser = {
  id?: string
  tenantId?: string | null
}

function cleanRequiredString(value: string) {
  return value.trim()
}

function readTenantId(user: SessionUser) {
  const tenantId = typeof user.tenantId === 'string' ? user.tenantId.trim() : ''
  return tenantId || null
}

function isRetryablePpdbError(error: unknown) {
  if (!error || typeof error !== 'object') return false

  const code = 'code' in error ? (error as { code?: string }).code : undefined
  return code === 'P2002' || code === 'P2034'
}

async function runWithPpdbRetry<T>(operation: () => Promise<T>) {
  let lastError: unknown

  for (let attempt = 0; attempt < MAX_PPDB_RETRIES; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (!isRetryablePpdbError(error) || attempt === MAX_PPDB_RETRIES - 1) {
        throw error
      }

      await new Promise((resolve) => setTimeout(resolve, 25 * (attempt + 1)))
    }
  }

  throw lastError
}

export async function simulatePayment(tagihanId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const user = session.user as SessionUser
    const tenantId = readTenantId(user)
    if (!tenantId) {
      return { error: 'Tenant tidak ditemukan di sesi pengguna' }
    }

    const normalizedTagihanId = cleanRequiredString(tagihanId)
    if (!normalizedTagihanId) {
      return { error: 'Tagihan tidak valid' }
    }

    const result = await runWithPpdbRetry(() =>
      prisma.$transaction(
        async (tx) => {
          const tagihan = await tx.tagihanPpdb.findFirst({
            where: {
              id: normalizedTagihanId,
              tenantId,
              pendaftar: {
                tenantId,
                userId: session.user.id
              }
            },
            select: {
              id: true,
              nominal: true,
              status: true
            }
          })

          if (!tagihan) {
            return { error: 'Tagihan tidak ditemukan' }
          }

          if (tagihan.status === 'LUNAS') {
            return { success: true, message: 'Tagihan sudah lunas' }
          }

          const updated = await tx.tagihanPpdb.updateMany({
            where: {
              id: tagihan.id,
              tenantId,
              status: {
                not: 'LUNAS'
              }
            },
            data: {
              status: 'LUNAS'
            }
          })

          if (updated.count === 0) {
            return { success: true, message: 'Tagihan sudah lunas' }
          }

          await tx.pembayaranPpdb.create({
            data: {
              tenantId,
              tagihanId: tagihan.id,
              nominal: tagihan.nominal,
              metode: 'SIMULASI_MANUAL',
              tanggalBayar: new Date(),
              status: 'BERHASIL',
              keterangan: 'Pembayaran simulasi via portal pendaftar'
            }
          })

          return {
            success: true,
            message: 'Pembayaran berhasil disimulasikan'
          }
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        }
      )
    )

    if (!('error' in result)) {
      revalidatePath('/app/beranda')
      revalidatePath(`/app/ppdb/invoice/${normalizedTagihanId}`)
    }

    return result
  } catch (error) {
    console.error('[SIMULATE_PAYMENT_ERROR]', error)
    return { error: 'Gagal memproses simulasi pembayaran' }
  }
}
