import { Prisma } from '@prisma/client'

const MAX_PPDB_RETRIES = 3

function extractNumericSuffix(value: string, prefix: string) {
  if (!value.startsWith(prefix)) return 0

  const parsed = Number.parseInt(value.slice(prefix.length), 10)
  return Number.isFinite(parsed) ? parsed : 0
}

export function isRetryablePpdbError(error: unknown) {
  if (!error || typeof error !== 'object') return false

  const code = 'code' in error ? (error as { code?: string }).code : undefined
  return code === 'P2002' || code === 'P2034'
}

export async function runWithPpdbRetry<T>(operation: () => Promise<T>) {
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

export async function generateNextPpdbRegistrationNumber(
  tx: Prisma.TransactionClient,
  tenantId: string,
  now = new Date(),
) {
  const prefix = `PPDB-${now.getFullYear()}-`
  const latest = await tx.pendaftarPpdb.findFirst({
    where: {
      tenantId,
      noPendaftaran: {
        startsWith: prefix,
      },
    },
    orderBy: {
      noPendaftaran: 'desc',
    },
    select: {
      noPendaftaran: true,
    },
  })

  const nextNumber = extractNumericSuffix(latest?.noPendaftaran ?? '', prefix) + 1
  return `${prefix}${String(nextNumber).padStart(4, '0')}`
}

export async function generateNextStudentNis(
  tx: Prisma.TransactionClient,
  tenantId: string,
  now = new Date(),
) {
  const prefix = String(now.getFullYear())
  const latest = await tx.siswa.findFirst({
    where: {
      tenantId,
      nis: {
        startsWith: prefix,
      },
    },
    orderBy: {
      nis: 'desc',
    },
    select: {
      nis: true,
    },
  })

  const nextNumber = extractNumericSuffix(latest?.nis ?? '', prefix) + 1
  return `${prefix}${String(nextNumber).padStart(4, '0')}`
}
