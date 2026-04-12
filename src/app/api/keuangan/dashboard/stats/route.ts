import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { getTenantStudentQuotaSnapshot } from '@/lib/student-quota'
import { getSessionUser } from '@/lib/auth/session'

export async function GET() {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = getSessionUser(session)
    const tenantId = userSession?.tenantId
    if (!tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 1. Pembayaran Hari Ini
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [quota, tagihanBelumLunas, pembayaranHariIni, totalTabungan, recentPayments] = await Promise.all([
      getTenantStudentQuotaSnapshot(prisma, tenantId),
      prisma.tagihan.aggregate({
        where: { tenantId, status: 'BELUM_LUNAS' },
        _sum: { total: true }
      }),
      prisma.pembayaran.aggregate({
        where: {
          tenantId,
          status: 'BERHASIL',
          tanggalBayar: { gte: today }
        },
        _sum: { jumlahBayar: true }
      }),
      prisma.tabungan.aggregate({
        where: { tenantId },
        _sum: { saldo: true }
      }),
      prisma.pembayaran.findMany({
        where: { tenantId },
        include: {
          tagihan: {
            include: {
              siswa: {
                include: { kelas: true }
              },
              kategori: true
            }
          }
        },
        orderBy: { tanggalBayar: 'desc' },
        take: 5
      }),
    ])

    const formattedPayments = recentPayments.map(p => ({
      siswa: p.tagihan.siswa.namaLengkap,
      kelas: p.tagihan.siswa.kelas?.nama || '-',
      jenis: p.tagihan.kategori.nama,
      nominal: `Rp ${new Intl.NumberFormat('id-ID').format(Number(p.jumlahBayar))}`,
      status: 'Lunas', // If recorded in Pembayaran it's usually successful
      waktu: new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(p.tanggalBayar)
    }))

    return NextResponse.json({
      stats: [
        { label: 'Total Siswa', value: quota.activeStudents.toString(), variant: 'primary' },
        { label: 'Tagihan Belum Lunas', value: `Rp ${new Intl.NumberFormat('id-ID').format(Number(tagihanBelumLunas._sum.total || 0))}`, variant: 'warning' },
        { label: 'Pembayaran Hari Ini', value: `Rp ${new Intl.NumberFormat('id-ID').format(Number(pembayaranHariIni._sum.jumlahBayar || 0))}`, variant: 'success' },
        { label: 'Saldo Tabungan', value: `Rp ${new Intl.NumberFormat('id-ID').format(Number(totalTabungan._sum.saldo || 0))}`, variant: 'accent' },
      ],
      recentPayments: formattedPayments,
      studentQuota: quota.studentCapacity > 0
        ? {
            activeStudents: quota.activeStudents,
            studentCapacity: quota.studentCapacity,
            remainingSlots: quota.remainingSlots,
            usagePercent: quota.usagePercent,
            warningLevel: quota.warningLevel,
          }
        : null,
    })
  } catch (error) {
    console.error('[DASHBOARD_STATS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
