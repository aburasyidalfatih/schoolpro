import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { derivePpdbWorkflow, type PpdbWorkflowState } from '@/features/ppdb/lib/ppdb-workflow'

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PPDB']
type SessionUser = {
  role?: string
  tenantId?: string | null
}

type WorkflowGroup =
  | 'PAYMENT'
  | 'FULL_FORM'
  | 'REVIEW'
  | 'VERIFIED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'SYNCED'

const WORKFLOW_GROUP_BY_STATE: Record<PpdbWorkflowState, WorkflowGroup> = {
  REGISTRATION_CREATED: 'PAYMENT',
  PAYMENT_PENDING: 'PAYMENT',
  PAYMENT_REVIEW: 'PAYMENT',
  FULL_FORM_UNLOCKED: 'FULL_FORM',
  FULL_FORM_IN_PROGRESS: 'FULL_FORM',
  SUBMITTED_FOR_REVIEW: 'REVIEW',
  VERIFIED_READY_FOR_DECISION: 'VERIFIED',
  REJECTED: 'REJECTED',
  ACCEPTED_AWAITING_REENROLLMENT_BILL: 'ACCEPTED',
  REENROLLMENT_PAYMENT_PENDING: 'ACCEPTED',
  READY_TO_SYNC: 'ACCEPTED',
  SYNCED_TO_STUDENT: 'SYNCED',
}

// GET — Admin: list semua pendaftar dengan filter
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

    const status = searchParams.get('status')
    const periodeId = searchParams.get('periodeId')
    const workflowGroup = searchParams.get('workflow') as WorkflowGroup | null
    const search = searchParams.get('search')?.trim()
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20))

    const where: Record<string, unknown> = { tenantId }
    if (status) where.status = status
    if (periodeId) where.periodeId = periodeId
    if (search) {
      where.OR = [
        { namaLengkap: { contains: search, mode: 'insensitive' } },
        { noPendaftaran: { contains: search, mode: 'insensitive' } },
      ]
    }

    const rows = await prisma.pendaftarPpdb.findMany({
      where,
      include: {
        periode: {
          include: {
            unit: true,
            tahunAjaran: true,
            persyaratanBerkas: {
              select: {
                id: true,
                isWajib: true,
              },
            },
          },
        },
        tagihanPpdbs: {
          include: {
            pembayarans: {
              select: {
                status: true,
              },
            },
          },
        },
        berkas: {
          include: {
            persyaratan: {
              select: {
                isWajib: true,
              },
            },
          },
        },
      },
      orderBy: { tanggalDaftar: 'desc' },
    })

    const syncedNoPendaftaranSet = new Set<string>()
    if (rows.length > 0) {
      const syncedStudents = await prisma.siswa.findMany({
        where: {
          tenantId,
          OR: rows.map((row) => ({
            dataTambahan: {
              path: ['sumberPpdb'],
              equals: row.noPendaftaran,
            },
          })),
        },
        select: {
          dataTambahan: true,
        },
      })

      syncedStudents.forEach((siswa) => {
        const source = (
          siswa.dataTambahan &&
          typeof siswa.dataTambahan === 'object' &&
          !Array.isArray(siswa.dataTambahan)
            ? (siswa.dataTambahan as Record<string, unknown>).sumberPpdb
            : null
        )

        if (typeof source === 'string' && source.trim()) {
          syncedNoPendaftaranSet.add(source)
        }
      })
    }

    const rowsWithWorkflow = rows.map((row) => ({
      ...row,
      workflow: derivePpdbWorkflow(row, {
        isSyncedToStudent: syncedNoPendaftaranSet.has(row.noPendaftaran),
      }),
    }))

    const filteredRows = workflowGroup
      ? rowsWithWorkflow.filter((row) => WORKFLOW_GROUP_BY_STATE[row.workflow.state] === workflowGroup)
      : rowsWithWorkflow

    const stats = filteredRows.reduce(
      (acc, row) => {
        const group = WORKFLOW_GROUP_BY_STATE[row.workflow.state]
        acc.total += 1
        if (group === 'PAYMENT') acc.payment += 1
        if (group === 'FULL_FORM') acc.fullForm += 1
        if (group === 'REVIEW') acc.review += 1
        if (group === 'VERIFIED') acc.verified += 1
        if (group === 'ACCEPTED') acc.accepted += 1
        if (group === 'REJECTED') acc.rejected += 1
        if (group === 'SYNCED') acc.synced += 1
        return acc
      },
      {
        total: 0,
        payment: 0,
        fullForm: 0,
        review: 0,
        verified: 0,
        accepted: 0,
        rejected: 0,
        synced: 0,
      }
    )

    const total = filteredRows.length
    const data = filteredRows.slice((page - 1) * limit, page * limit)

    return NextResponse.json({ data, total, page, limit, stats })
  } catch (error) {
    console.error('[PPDB_PENDAFTAR_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
