import { prisma } from '@/lib/db/prisma'

type StudentQuotaDb = Pick<typeof prisma, 'tenant' | 'siswa'>

export type StudentQuotaWarningLevel = 'NONE' | 'NORMAL' | 'WARNING_80' | 'WARNING_90' | 'FULL'

export type StudentQuotaSnapshot = {
  tenantId: string
  packageCode: string
  studentCapacity: number
  activeStudents: number
  remainingSlots: number
  usagePercent: number
  warningLevel: StudentQuotaWarningLevel
}

export function shouldConsumeStudentSlot(status?: string | null) {
  return (status || 'AKTIF').toUpperCase() === 'AKTIF'
}

export async function getTenantStudentQuotaSnapshot(db: StudentQuotaDb, tenantId: string): Promise<StudentQuotaSnapshot> {
  const [tenant, activeStudents] = await Promise.all([
    db.tenant.findUnique({
      where: { id: tenantId },
      select: {
        paket: true,
        plan: {
          select: {
            studentCapacity: true,
          },
        },
        activeSubscription: {
          select: {
            studentCapacity: true,
          },
        },
      },
    }),
    db.siswa.count({
      where: {
        tenantId,
        status: 'AKTIF',
      },
    }),
  ])

  const studentCapacity = tenant?.activeSubscription?.studentCapacity ?? tenant?.plan?.studentCapacity ?? 0
  const usagePercent = studentCapacity > 0 ? Math.min(100, Math.round((activeStudents / studentCapacity) * 100)) : 0
  const warningLevel: StudentQuotaWarningLevel =
    studentCapacity <= 0
      ? 'NONE'
      : usagePercent >= 100
        ? 'FULL'
        : usagePercent >= 90
          ? 'WARNING_90'
          : usagePercent >= 80
            ? 'WARNING_80'
            : 'NORMAL'

  return {
    tenantId,
    packageCode: tenant?.paket || 'FREE',
    studentCapacity,
    activeStudents,
    remainingSlots: Math.max(0, studentCapacity - activeStudents),
    usagePercent,
    warningLevel,
  }
}

export async function hasAvailableStudentSlot(db: StudentQuotaDb, tenantId: string, neededSlots = 1) {
  const snapshot = await getTenantStudentQuotaSnapshot(db, tenantId)
  return {
    snapshot,
    allowed: snapshot.studentCapacity > 0 && snapshot.activeStudents + neededSlots <= snapshot.studentCapacity,
  }
}

export function buildStudentQuotaErrorMessage(snapshot: StudentQuotaSnapshot) {
  if (snapshot.studentCapacity <= 0 || snapshot.packageCode === 'FREE') {
    return 'Paket saat ini belum memiliki kuota siswa aktif. Silakan upgrade langganan terlebih dahulu.'
  }

  return `Kuota siswa aktif sudah penuh (${snapshot.activeStudents}/${snapshot.studentCapacity}). Upgrade paket terlebih dahulu untuk menambah siswa aktif baru.`
}
