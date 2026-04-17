import { prisma } from '@/lib/db/prisma'
import { getTenantStudentQuotaSnapshot } from '@/lib/student-quota'

export type TenantAdminDashboardData = {
  stats: Array<{
    label: string
    value: string
    variant: string
  }>
  recentPayments: Array<{
    siswa: string
    kelas: string
    jenis: string
    nominal: string
    status: string
    waktu: string
  }>
  studentQuota: {
    activeStudents: number
    studentCapacity: number
    remainingSlots: number
    usagePercent: number
    warningLevel: 'NONE' | 'NORMAL' | 'WARNING_80' | 'WARNING_90' | 'FULL'
  } | null
}

export async function getTenantAdminDashboardData(tenantId: string): Promise<TenantAdminDashboardData> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [quota, tagihanBelumLunas, pembayaranHariIni, totalTabungan, recentPayments] = await Promise.all([
    getTenantStudentQuotaSnapshot(prisma, tenantId),
    prisma.tagihan.aggregate({
      where: { tenantId, status: 'BELUM_LUNAS' },
      _sum: { total: true },
    }),
    prisma.pembayaran.aggregate({
      where: {
        tenantId,
        status: 'BERHASIL',
        tanggalBayar: { gte: today },
      },
      _sum: { jumlahBayar: true },
    }),
    prisma.tabungan.aggregate({
      where: { tenantId },
      _sum: { saldo: true },
    }),
    prisma.pembayaran.findMany({
      where: { tenantId },
      include: {
        tagihan: {
          include: {
            siswa: {
              include: { kelas: true },
            },
            kategori: true,
          },
        },
      },
      orderBy: { tanggalBayar: 'desc' },
      take: 5,
    }),
  ])

  return {
    stats: [
      { label: 'Total Siswa', value: quota.activeStudents.toString(), variant: 'primary' },
      { label: 'Tagihan Belum Lunas', value: `Rp ${new Intl.NumberFormat('id-ID').format(Number(tagihanBelumLunas._sum.total || 0))}`, variant: 'warning' },
      { label: 'Pembayaran Hari Ini', value: `Rp ${new Intl.NumberFormat('id-ID').format(Number(pembayaranHariIni._sum.jumlahBayar || 0))}`, variant: 'success' },
      { label: 'Saldo Tabungan', value: `Rp ${new Intl.NumberFormat('id-ID').format(Number(totalTabungan._sum.saldo || 0))}`, variant: 'accent' },
    ],
    recentPayments: recentPayments.map((payment) => ({
      siswa: payment.tagihan.siswa.namaLengkap,
      kelas: payment.tagihan.siswa.kelas?.nama || '-',
      jenis: payment.tagihan.kategori.nama,
      nominal: `Rp ${new Intl.NumberFormat('id-ID').format(Number(payment.jumlahBayar))}`,
      status: 'Lunas',
      waktu: new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(payment.tanggalBayar),
    })),
    studentQuota: quota.studentCapacity > 0
      ? {
          activeStudents: quota.activeStudents,
          studentCapacity: quota.studentCapacity,
          remainingSlots: quota.remainingSlots,
          usagePercent: quota.usagePercent,
          warningLevel: quota.warningLevel,
        }
      : null,
  }
}
