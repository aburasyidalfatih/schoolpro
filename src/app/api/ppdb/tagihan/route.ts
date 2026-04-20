import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { derivePpdbWorkflow, type PpdbWorkflowState } from '@/features/ppdb/lib/ppdb-workflow'

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PPDB']

type SessionUser = {
  role?: string
  tenantId?: string | null
}

type BillingStage = 'AWAITING_BILL' | 'AWAITING_PAYMENT' | 'READY_TO_SYNC' | 'SYNCED'

const BILLING_STAGE_BY_WORKFLOW: Partial<Record<PpdbWorkflowState, BillingStage>> = {
  ACCEPTED_AWAITING_REENROLLMENT_BILL: 'AWAITING_BILL',
  REENROLLMENT_PAYMENT_PENDING: 'AWAITING_PAYMENT',
  READY_TO_SYNC: 'READY_TO_SYNC',
  SYNCED_TO_STUDENT: 'SYNCED',
}

const BILLING_STAGE_META: Record<BillingStage, { label: string; sortOrder: number }> = {
  AWAITING_BILL: { label: 'Perlu Tagihan', sortOrder: 0 },
  AWAITING_PAYMENT: { label: 'Menunggu Pembayaran', sortOrder: 1 },
  READY_TO_SYNC: { label: 'Siap Sinkron', sortOrder: 2 },
  SYNCED: { label: 'Sudah Sinkron', sortOrder: 3 },
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userSession = session.user as SessionUser
    const tenantId = userSession.tenantId

    if (!tenantId || typeof userSession.role !== 'string' || !ADMIN_ROLES.includes(userSession.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const periodeId = searchParams.get('periodeId')
    const search = searchParams.get('search')?.trim()
    const billingStage = searchParams.get('billingStage') as BillingStage | null
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20))

    const where: Record<string, unknown> = {
      tenantId,
      status: 'DITERIMA',
    }

    if (periodeId) where.periodeId = periodeId
    if (search) {
      where.OR = [
        { namaLengkap: { contains: search, mode: 'insensitive' } },
        { noPendaftaran: { contains: search, mode: 'insensitive' } },
      ]
    }

    const workflowRows = await prisma.pendaftarPpdb.findMany({
      where,
      select: {
        id: true,
        noPendaftaran: true,
        namaLengkap: true,
        status: true,
        tanggalDaftar: true,
        periodeId: true,
        periode: {
          select: {
            persyaratanBerkas: {
              select: {
                id: true,
                isWajib: true,
              },
            },
          },
        },
        tagihanPpdbs: {
          select: {
            jenis: true,
            status: true,
            pembayarans: {
              select: {
                status: true,
              },
            },
          },
        },
        berkas: {
          select: {
            persyaratanId: true,
            status: true,
          },
        },
      },
    })

    const syncedStudents = workflowRows.length > 0
      ? await prisma.siswa.findMany({
          where: {
            tenantId,
            OR: workflowRows.map((row) => ({
              dataTambahan: {
                path: ['sumberPpdb'],
                equals: row.noPendaftaran,
              },
            })),
          },
          select: {
            id: true,
            nis: true,
            namaLengkap: true,
            dataTambahan: true,
            createdAt: true,
          },
        })
      : []

    const syncedStudentByRegistration = new Map<string, { id: string; nis: string; namaLengkap: string; createdAt: Date }>()

    for (const siswa of syncedStudents) {
      const source = (
        siswa.dataTambahan &&
        typeof siswa.dataTambahan === 'object' &&
        !Array.isArray(siswa.dataTambahan)
          ? (siswa.dataTambahan as Record<string, unknown>).sumberPpdb
          : null
      )

      if (typeof source === 'string' && source.trim()) {
        syncedStudentByRegistration.set(source, {
          id: siswa.id,
          nis: siswa.nis,
          namaLengkap: siswa.namaLengkap,
          createdAt: siswa.createdAt,
        })
      }
    }

    const rowsWithBilling = workflowRows
      .map((row) => {
        const syncedStudent = syncedStudentByRegistration.get(row.noPendaftaran) ?? null
        const workflow = derivePpdbWorkflow(row, {
          isSyncedToStudent: !!syncedStudent,
        })
        const stage = BILLING_STAGE_BY_WORKFLOW[workflow.state]

        if (!stage) return null

        return {
          ...row,
          workflow,
          billingStage: stage,
          billingStageLabel: BILLING_STAGE_META[stage].label,
          syncedStudent,
        }
      })
      .filter((row): row is NonNullable<typeof row> => !!row)

    const filteredRows = billingStage
      ? rowsWithBilling.filter((row) => row.billingStage === billingStage)
      : rowsWithBilling

    const stats = filteredRows.reduce(
      (acc, row) => {
        acc.total += 1
        if (row.billingStage === 'AWAITING_BILL') acc.awaitingBill += 1
        if (row.billingStage === 'AWAITING_PAYMENT') acc.awaitingPayment += 1
        if (row.billingStage === 'READY_TO_SYNC') acc.readyToSync += 1
        if (row.billingStage === 'SYNCED') acc.synced += 1
        return acc
      },
      {
        total: 0,
        awaitingBill: 0,
        awaitingPayment: 0,
        readyToSync: 0,
        synced: 0,
      },
    )

    const sortedRows = filteredRows.sort((a, b) => {
      const stageOrderDiff = BILLING_STAGE_META[a.billingStage].sortOrder - BILLING_STAGE_META[b.billingStage].sortOrder
      if (stageOrderDiff !== 0) return stageOrderDiff
      return new Date(b.tanggalDaftar).getTime() - new Date(a.tanggalDaftar).getTime()
    })

    const total = sortedRows.length
    const pagedRows = sortedRows.slice((page - 1) * limit, page * limit)
    const pagedIds = pagedRows.map((row) => row.id)

    const detailedRows = pagedIds.length > 0
      ? await prisma.pendaftarPpdb.findMany({
          where: {
            tenantId,
            id: {
              in: pagedIds,
            },
          },
          select: {
            id: true,
            namaLengkap: true,
            noPendaftaran: true,
            tanggalDaftar: true,
            periode: {
              select: {
                nama: true,
                unit: {
                  select: {
                    nama: true,
                  },
                },
                tahunAjaran: {
                  select: {
                    nama: true,
                  },
                },
              },
            },
            tagihanPpdbs: {
              select: {
                id: true,
                jenis: true,
                status: true,
                nominal: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        })
      : []

    const rowMetaById = new Map(
      pagedRows.map((row) => [
        row.id,
        {
          workflow: row.workflow,
          billingStage: row.billingStage,
          billingStageLabel: row.billingStageLabel,
          syncedStudent: row.syncedStudent,
        },
      ]),
    )
    const rowPosition = new Map(pagedIds.map((id, index) => [id, index]))

    const data = detailedRows
      .sort((a, b) => (rowPosition.get(a.id) ?? 0) - (rowPosition.get(b.id) ?? 0))
      .map((row) => ({
        ...row,
        reenrollmentBill: row.tagihanPpdbs.find((tagihan) => tagihan.jenis === 'DAFTAR_ULANG') ?? null,
        workflow: rowMetaById.get(row.id)?.workflow ?? null,
        billingStage: rowMetaById.get(row.id)?.billingStage ?? null,
        billingStageLabel: rowMetaById.get(row.id)?.billingStageLabel ?? null,
        syncedStudent: rowMetaById.get(row.id)?.syncedStudent ?? null,
      }))

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      stats,
    })
  } catch (error) {
    console.error('[PPDB_TAGIHAN_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
