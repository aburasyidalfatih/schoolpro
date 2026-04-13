import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { isSuperAdmin } from '@/lib/super-admin'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')?.trim()
    const search = searchParams.get('search')?.trim()

    const where: Prisma.TenantApplicationWhereInput = {}
    if (status && status !== 'ALL') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { applicationCode: { contains: search, mode: 'insensitive' } },
        { namaSekolah: { contains: search, mode: 'insensitive' } },
        { slugRequest: { contains: search, mode: 'insensitive' } },
        { emailSekolah: { contains: search, mode: 'insensitive' } },
        { namaPic: { contains: search, mode: 'insensitive' } },
        { emailPic: { contains: search, mode: 'insensitive' } },
      ]
    }

    const applications = await prisma.tenantApplication.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
    })

    const summary = {
      total: applications.length,
      submitted: applications.filter((application) => application.status === 'SUBMITTED').length,
      revisionRequested: applications.filter((application) => application.status === 'REVISION_REQUESTED').length,
      approved: applications.filter((application) => application.status === 'APPROVED').length,
      rejected: applications.filter((application) => application.status === 'REJECTED').length,
      provisioned: applications.filter((application) => application.status === 'PROVISIONED').length,
    }

    return NextResponse.json({
      data: applications.map((application) => ({
        id: application.id,
        applicationCode: application.applicationCode,
        namaSekolah: application.namaSekolah,
        jenjang: application.jenjang,
        statusSekolah: application.statusSekolah,
        npsn: application.npsn,
        emailSekolah: application.emailSekolah,
        teleponSekolah: application.teleponSekolah,
        alamat: application.alamat,
        provinsi: application.provinsi,
        kotaKabupaten: application.kotaKabupaten,
        websiteSaatIni: application.websiteSaatIni,
        jumlahSiswaSaatIni: application.jumlahSiswaSaatIni,
        namaPic: application.namaPic,
        jabatanPic: application.jabatanPic,
        emailPic: application.emailPic,
        whatsappPic: application.whatsappPic,
        slugRequest: application.slugRequest,
        slugApproved: application.slugApproved,
        kebutuhanUtama: application.kebutuhanUtama,
        catatanTambahan: application.catatanTambahan,
        sumberLead: application.sumberLead,
        status: application.status,
        submittedAt: application.submittedAt,
        reviewedAt: application.reviewedAt,
        reviewedByUserId: application.reviewedByUserId,
        reviewNotes: application.reviewNotes,
        revisionNotes: application.revisionNotes,
        rejectedReason: application.rejectedReason,
        approvedTenantId: application.approvedTenantId,
        provisionedAt: application.provisionedAt,
        createdAt: application.createdAt,
      })),
      summary,
    })
  } catch (error) {
    console.error('[SUPER_ADMIN_TENANT_APPLICATIONS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
