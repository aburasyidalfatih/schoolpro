import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSessionUser, hasAnyRole } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { buildStudentQuotaErrorMessage, getTenantStudentQuotaSnapshot, hasAvailableStudentSlot, shouldConsumeStudentSlot } from '@/lib/student-quota'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const kelasId = searchParams.get('kelasId')
    const unitId = searchParams.get('unitId')
    const status = searchParams.get('status')
    const hasPaginationParams = searchParams.has('page') || searchParams.has('pageSize')
    const pageParam = Number.parseInt(searchParams.get('page') || '1', 10)
    const pageSizeParam = Number.parseInt(searchParams.get('pageSize') || '20', 10)
    const pageSize = Number.isFinite(pageSizeParam) ? Math.min(Math.max(pageSizeParam, 1), 100) : 20

    const userSession = getSessionUser(session)
    if (!userSession?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const whereClause: Prisma.SiswaWhereInput = {
      tenantId: userSession.tenantId,
    }

    if (search) {
      whereClause.OR = [
        { namaLengkap: { contains: search } },
        { nis: { contains: search } },
        { nisn: { contains: search } },
      ]
    }
    if (kelasId) whereClause.kelasId = kelasId
    if (unitId) whereClause.unitId = unitId
    if (status) whereClause.status = status

    const total = await prisma.siswa.count({ where: whereClause })
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const page = Math.min(Math.max(pageParam || 1, 1), totalPages)

    const [siswas, quota] = await Promise.all([
      prisma.siswa.findMany({
        where: whereClause,
        include: {
          kelas: {
            select: { nama: true }
          },
          unit: {
            select: { nama: true, kode: true }
          },
        },
        orderBy: { namaLengkap: 'asc' },
        ...(hasPaginationParams
          ? {
              skip: (page - 1) * pageSize,
              take: pageSize,
            }
          : {}),
      }),
      getTenantStudentQuotaSnapshot(prisma, userSession.tenantId),
    ])

    return NextResponse.json({
      data: siswas,
      meta: {
        ...(hasPaginationParams
          ? {
              pagination: {
                page,
                pageSize,
                totalItems: total,
                totalPages,
              },
            }
          : {}),
        studentQuota: quota.studentCapacity > 0
          ? {
              activeStudents: quota.activeStudents,
              studentCapacity: quota.studentCapacity,
              remainingSlots: quota.remainingSlots,
              usagePercent: quota.usagePercent,
              warningLevel: quota.warningLevel,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('[SISWA_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = getSessionUser(session)
    if (!userSession?.tenantId || !hasAnyRole(userSession, ['SUPER_ADMIN', 'ADMIN', 'TU'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { 
        nis, nisn, namaLengkap, jenisKelamin, tempatLahir, tanggalLahir, 
        alamat, telepon, fotoUrl, namaWali, teleponWali, emailWali, 
        kelasId, unitId, status 
    } = body

    if (!nis || !namaLengkap) {
      return NextResponse.json({ error: 'NIS dan Nama Lengkap wajib diisi' }, { status: 400 })
    }

    // Check if NIS already exists for this tenant
    const existing = await prisma.siswa.findFirst({
      where: { tenantId: userSession.tenantId, nis },
    })
    if (existing) {
      return NextResponse.json({ error: 'NIS sudah digunakan oleh siswa lain' }, { status: 400 })
    }

    const tenantId = userSession.tenantId
    const nextStatus = status || 'AKTIF'

    const newSiswa = await prisma.$transaction(async (tx) => {
      if (shouldConsumeStudentSlot(nextStatus)) {
        const quotaCheck = await hasAvailableStudentSlot(tx, tenantId)
        if (!quotaCheck.allowed) {
          throw new Error(buildStudentQuotaErrorMessage(quotaCheck.snapshot))
        }
      }

      return tx.siswa.create({
        data: {
          tenantId,
          nis,
          nisn: nisn || null,
          namaLengkap,
          jenisKelamin: jenisKelamin || null,
          tempatLahir: tempatLahir || null,
          tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
          alamat: alamat || null,
          telepon: telepon || null,
          fotoUrl: fotoUrl || null,
          namaWali: namaWali || null,
          teleponWali: teleponWali || null,
          emailWali: emailWali || null,
          kelasId: kelasId || null,
          unitId: unitId || null,
          status: nextStatus,
        },
      })
    })

    return NextResponse.json({ data: newSiswa, message: 'Siswa berhasil ditambahkan' }, { status: 201 })
  } catch (error) {
    console.error('[SISWA_POST]', error)
    if (error instanceof Error && error.message.includes('kuota siswa aktif')) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
