import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { derivePpdbWorkflow } from '@/features/ppdb/lib/ppdb-workflow'

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PPDB']
const FINAL_STATUSES = ['DITERIMA', 'DITOLAK']
const REQUIRED_SISWA_FIELDS = ['nisn', 'jenisKelamin', 'tempatLahir', 'tanggalLahir', 'alamat'] as const
const REQUIRED_ORANGTUA_FIELDS = ['namaAyah', 'teleponAyah', 'namaIbu', 'teleponIbu'] as const
type SessionUser = {
  id?: string
  role?: string
  tenantId?: string | null
}

type SubmissionMode = 'draft' | 'final'

function getJsonRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function withSubmissionMeta(value: unknown, mode: SubmissionMode): Prisma.InputJsonValue {
  const base = getJsonRecord(value)
  const previousMeta = getJsonRecord(base._submission)
  const now = new Date().toISOString()

  return {
    ...base,
    _submission: {
      ...previousMeta,
      mode,
      updatedAt: now,
      ...(mode === 'final' ? { finalSubmittedAt: now } : {}),
    },
  } as Prisma.InputJsonValue
}

function hasRequiredFields(record: Record<string, unknown>, fields: readonly string[]) {
  return fields.every((field) => typeof record[field] === 'string' && record[field].trim().length > 0)
}

// GET — detail satu pendaftar (admin atau pemilik)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const userSession = session.user as SessionUser
    const tenantId = userSession.tenantId
    if (!tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const pendaftar = await prisma.pendaftarPpdb.findFirst({
      where: { id, tenantId },
      include: {
        periode: {
          include: {
            unit: true,
            tahunAjaran: true,
            persyaratanBerkas: true,
          },
        },
        tagihanPpdbs: { include: { pembayarans: { orderBy: { createdAt: 'desc' } } } },
        berkas: { include: { persyaratan: true } },
        user: { select: { nama: true, email: true, username: true } },
      },
    })

    if (!pendaftar) return NextResponse.json({ error: 'Pendaftar tidak ditemukan' }, { status: 404 })

    // Non-admin hanya bisa lihat data miliknya sendiri
    const isAdmin = typeof userSession.role === 'string' && ADMIN_ROLES.includes(userSession.role)
    if (!isAdmin && pendaftar.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const syncedStudent = await prisma.siswa.findFirst({
      where: {
        tenantId,
        dataTambahan: {
          path: ['sumberPpdb'],
          equals: pendaftar.noPendaftaran,
        },
      },
      select: { id: true },
    })

    const workflow = derivePpdbWorkflow(pendaftar, {
      isSyncedToStudent: !!syncedStudent,
    })

    return NextResponse.json({
      data: {
        ...pendaftar,
        workflow,
      },
    })
  } catch (error) {
    console.error('[PPDB_PENDAFTAR_GET_ID]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT — update data formulir lengkap (oleh user pemilik)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const userSession = session.user as SessionUser
    const tenantId = userSession.tenantId
    if (!tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const body = await req.json()

    const pendaftar = await prisma.pendaftarPpdb.findFirst({
      where: { id, tenantId },
      include: {
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
        berkas: {
          select: {
            persyaratanId: true,
          },
        },
      },
    })
    if (!pendaftar) return NextResponse.json({ error: 'Pendaftar tidak ditemukan' }, { status: 404 })

    const isAdmin = typeof userSession.role === 'string' && ADMIN_ROLES.includes(userSession.role)
    if (!isAdmin && pendaftar.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (!isAdmin && FINAL_STATUSES.includes(pendaftar.status)) {
      return NextResponse.json({ error: 'Pendaftar sudah final dan tidak dapat diubah' }, { status: 409 })
    }

    const { dataFormulir, dataOrangtua, jalurPendaftaran, jurusanPilihan } = body
    const submitMode: SubmissionMode = body?.submitMode === 'final' ? 'final' : 'draft'
    const nextDataFormulir = dataFormulir ?? pendaftar.dataFormulir
    const nextDataOrangtua = dataOrangtua ?? pendaftar.dataOrangtua

    if (!isAdmin && submitMode === 'final') {
      const formulirRecord = getJsonRecord(nextDataFormulir)
      const orangtuaRecord = getJsonRecord(nextDataOrangtua)
      if (!hasRequiredFields(formulirRecord, REQUIRED_SISWA_FIELDS)) {
        return NextResponse.json({ error: 'Data siswa wajib belum lengkap untuk submit final' }, { status: 400 })
      }
      if (!hasRequiredFields(orangtuaRecord, REQUIRED_ORANGTUA_FIELDS)) {
        return NextResponse.json({ error: 'Data orang tua wajib belum lengkap untuk submit final' }, { status: 400 })
      }

      const requiredDocumentIds = new Set(
        (pendaftar.periode?.persyaratanBerkas ?? [])
          .filter((persyaratan) => persyaratan.isWajib)
          .map((persyaratan) => persyaratan.id)
      )
      const uploadedDocumentIds = new Set((pendaftar.berkas ?? []).map((berkas) => berkas.persyaratanId))
      const hasAllRequiredDocuments = Array.from(requiredDocumentIds).every((persyaratanId) => uploadedDocumentIds.has(persyaratanId))

      if (!hasAllRequiredDocuments) {
        return NextResponse.json({ error: 'Berkas wajib belum lengkap untuk submit final' }, { status: 400 })
      }
    }

    const updated = await prisma.pendaftarPpdb.update({
      where: { id },
      data: {
        dataFormulir: nextDataFormulir === null ? Prisma.JsonNull : withSubmissionMeta(nextDataFormulir, submitMode),
        dataOrangtua: nextDataOrangtua === null ? Prisma.JsonNull : withSubmissionMeta(nextDataOrangtua, submitMode),
        jalurPendaftaran: jalurPendaftaran ?? pendaftar.jalurPendaftaran,
        jurusanPilihan: jurusanPilihan ?? pendaftar.jurusanPilihan,
        ...(!isAdmin && submitMode === 'final' && { status: 'MENUNGGU' }),
      },
    })

    return NextResponse.json({
      data: updated,
      message: submitMode === 'final' ? 'Formulir lengkap berhasil dikirim untuk direview' : 'Draft formulir berhasil disimpan',
    })
  } catch (error) {
    console.error('[PPDB_PENDAFTAR_PUT]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
