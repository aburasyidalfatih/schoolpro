'use server'

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import {
  generateNextPpdbRegistrationNumber,
  isRetryablePpdbError,
  runWithPpdbRetry,
} from '@/features/ppdb/lib/ppdb-identifiers'

const ACTIVE_PENDAFTAR_STATUSES = ['MENUNGGU', 'TERVERIFIKASI', 'DITERIMA'] as const
const DEFAULT_BIAYA_PENDAFTARAN = 150000

type SessionUser = {
  id?: string
  tenantId?: string | null
}

function cleanRequiredString(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function cleanOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return ''

  const normalized = value.trim()
  if (!normalized || normalized === 'undefined' || normalized === 'null') {
    return ''
  }

  return normalized
}

function readTenantId(user: SessionUser) {
  const tenantId = typeof user.tenantId === 'string' ? user.tenantId.trim() : ''
  return tenantId || null
}

function toPositiveNumber(value: unknown) {
  const parsed = typeof value === 'string'
    ? Number(value)
    : typeof value === 'number'
      ? value
      : NaN

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export async function submitFormSingkat(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Anda harus login terlebih dahulu' }

  const user = session.user as SessionUser
  const tenantId = readTenantId(user)
  if (!tenantId) return { error: 'Tenant tidak ditemukan di sesi pengguna' }

  const namaLengkap = cleanRequiredString(formData.get('nama_lengkap'))
  const periodeId = cleanRequiredString(formData.get('periode_id'))
  const unitId = cleanOptionalString(formData.get('unit_id'))

  if (!namaLengkap || !periodeId) {
    return { error: 'Semua field wajib diisi' }
  }

  try {
    const result = await runWithPpdbRetry(() =>
      prisma.$transaction(
        async (tx) => {
          const existingActivePendaftar = await tx.pendaftarPpdb.findFirst({
            where: {
              tenantId,
              periodeId,
              userId: session.user.id,
              status: { in: [...ACTIVE_PENDAFTAR_STATUSES] }
            },
            select: {
              id: true
            }
          })

          if (existingActivePendaftar) {
            return {
              success: true,
              pendaftarId: existingActivePendaftar.id,
              alreadyExists: true,
              message: 'Pendaftaran untuk gelombang ini sudah ada dan akan dilanjutkan.'
            }
          }

          const periode = await tx.periodePpdb.findFirst({
            where: {
              id: periodeId,
              tenantId
            },
            select: {
              id: true,
              unitId: true,
              pengaturan: true
            }
          })

          if (!periode) {
            return { error: 'Gelombang tidak valid' }
          }

          if (unitId && periode.unitId && periode.unitId !== unitId) {
            return { error: 'Unit gelombang tidak sesuai' }
          }

          const pengaturan = (periode.pengaturan as {
            kuota?: unknown
            biayaPendaftaran?: unknown
          } | null) ?? {}

          const kuota = toPositiveNumber(pengaturan.kuota)
          if (kuota) {
            const jumlahPendaftar = await tx.pendaftarPpdb.count({
              where: { periodeId, tenantId }
            })

            if (jumlahPendaftar >= kuota) {
              return { error: `Kuota pendaftaran gelombang ini sudah penuh (${kuota} pendaftar)` }
            }
          }

          const noPendaftaran = await generateNextPpdbRegistrationNumber(tx, tenantId)

          const pendaftar = await tx.pendaftarPpdb.create({
            data: {
              tenantId,
              periodeId,
              userId: session.user.id,
              noPendaftaran,
              namaLengkap,
              status: 'MENUNGGU'
            },
            select: {
              id: true
            }
          })

          const nominal = toPositiveNumber(pengaturan.biayaPendaftaran) ?? DEFAULT_BIAYA_PENDAFTARAN

          await tx.tagihanPpdb.create({
            data: {
              tenantId,
              pendaftarId: pendaftar.id,
              jenis: 'PENDAFTARAN',
              nominal,
              status: 'BELUM_LUNAS'
            }
          })

          return {
            success: true,
            pendaftarId: pendaftar.id
          }
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        }
      )
    )

    if (!('error' in result)) {
      revalidatePath('/app/dashboard')
      revalidatePath('/app/beranda')
    }

    return result
  } catch (err) {
    console.error('PPDB Form Singkat error:', err)
    if (isRetryablePpdbError(err)) {
      return { error: 'Pendaftaran sedang diproses. Silakan coba lagi.' }
    }

    return { error: 'Gagal menyimpan pendaftaran. Silakan coba lagi.' }
  }
}

export async function confirmPaymentManual(pendaftarId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  try {
    const user = session.user as SessionUser
    const tenantId = readTenantId(user)
    if (!tenantId) return { error: 'Tenant tidak ditemukan di sesi pengguna' }

    const normalizedPendaftarId = cleanRequiredString(pendaftarId)
    if (!normalizedPendaftarId) return { error: 'Pendaftar tidak valid' }

    const result = await runWithPpdbRetry(() =>
      prisma.$transaction(
        async (tx) => {
          const tagihan = await tx.tagihanPpdb.findFirst({
            where: {
              pendaftarId: normalizedPendaftarId,
              tenantId,
              jenis: 'PENDAFTARAN',
              pendaftar: {
                tenantId,
                userId: session.user.id
              }
            },
            select: {
              id: true,
              status: true
            }
          })

          if (!tagihan) return { error: 'Tagihan tidak ditemukan' }
          if (tagihan.status === 'LUNAS') {
            return { success: true, message: 'Sudah lunas' }
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
            return { success: true, message: 'Sudah lunas' }
          }

          await tx.logAktivitas.create({
            data: {
              tenantId,
              userId: session.user.id,
              aksi: 'KONFIRMASI_BAYAR_PPDB',
              modul: 'PPDB',
              detail: `Konfirmasi pembayaran manual pendaftar ID: ${normalizedPendaftarId}`
            }
          })

          return { success: true }
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        }
      )
    )

    if (!('error' in result)) {
      revalidatePath('/app/beranda')
    }

    return result
  } catch (err) {
    console.error('Confirm Payment error:', err)
    return { error: 'Gagal melakukan konfirmasi. Silakan hubungi admin.' }
  }
}
