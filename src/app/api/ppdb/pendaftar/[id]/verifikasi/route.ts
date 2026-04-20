import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { derivePpdbWorkflow } from '@/features/ppdb/lib/ppdb-workflow'

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PPDB']
const VALID_PENDAFTAR_STATUSES = ['MENUNGGU', 'TERVERIFIKASI', 'DITERIMA', 'DITOLAK']
const FINAL_STATUSES = ['DITERIMA', 'DITOLAK']
const VALID_BERKAS_STATUSES = ['MENUNGGU', 'DITERIMA', 'DITOLAK']

type SessionUser = {
  id?: string
  role?: string
  tenantId?: string | null
}

type BerkasUpdate = {
  berkasId: string
  status: string
  catatan?: string
}

// POST — admin approve/reject berkas dan ubah status pendaftar
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userSession = session.user as SessionUser
    if (typeof userSession.role !== 'string' || !ADMIN_ROLES.includes(userSession.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const tenantId = userSession.tenantId
    if (!tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const body = await req.json()
    const { status, berkasUpdates } = body
    // berkasUpdates: [{ berkasId, status: 'DITERIMA'|'DITOLAK', catatan }]

    const pendaftar = await prisma.pendaftarPpdb.findFirst({
      where: { id, tenantId },
      include: {
        periode: {
          include: {
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
          },
        },
        berkas: {
          select: {
            id: true,
            persyaratanId: true,
            status: true,
          },
        },
      },
    })
    if (!pendaftar) return NextResponse.json({ error: 'Pendaftar tidak ditemukan' }, { status: 404 })
    if (status && !VALID_PENDAFTAR_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
    }

    const updates = Array.isArray(berkasUpdates) ? berkasUpdates : []
    if (!status && updates.length === 0) {
      return NextResponse.json({ error: 'Tidak ada perubahan yang dikirim' }, { status: 400 })
    }
    if (status && FINAL_STATUSES.includes(pendaftar.status) && status !== pendaftar.status) {
      return NextResponse.json({ error: 'Status pendaftar sudah final' }, { status: 409 })
    }

    if (updates.length > 0) {
      const updateIds = [
        ...new Set(
          updates
            .map((b: { berkasId?: string }) => b.berkasId)
            .filter((berkasId): berkasId is string => typeof berkasId === 'string' && berkasId.length > 0)
        ),
      ]
      if (updateIds.length !== updates.length) {
        return NextResponse.json({ error: 'Data berkas tidak valid' }, { status: 400 })
      }

      const matchedBerkas = await prisma.berkasPpdb.findMany({
        where: { tenantId, pendaftarId: id, id: { in: updateIds } },
        select: { id: true },
      })
      if (matchedBerkas.length !== updateIds.length) {
        return NextResponse.json({ error: 'Salah satu berkas tidak ditemukan' }, { status: 404 })
      }

      for (const b of updates as BerkasUpdate[]) {
        if (!VALID_BERKAS_STATUSES.includes(b.status)) {
          return NextResponse.json({ error: 'Status berkas tidak valid' }, { status: 400 })
        }
        if (b.status === 'DITOLAK' && !b.catatan?.trim()) {
          return NextResponse.json({ error: 'Catatan wajib diisi saat menolak berkas' }, { status: 400 })
        }
      }

      await Promise.all(
        updates.map((b: BerkasUpdate) =>
          prisma.berkasPpdb.updateMany({
            where: { id: b.berkasId, tenantId, pendaftarId: id },
            data: {
              status: b.status,
              catatan: b.catatan?.trim() || null,
            },
          })
        )
      )
    }

    const berkasStatusById = new Map(
      pendaftar.berkas.map((berkas) => [
        berkas.id,
        { persyaratanId: berkas.persyaratanId, status: berkas.status },
      ])
    )
    for (const update of updates as BerkasUpdate[]) {
      const current = berkasStatusById.get(update.berkasId)
      if (current) {
        berkasStatusById.set(update.berkasId, {
          persyaratanId: current.persyaratanId,
          status: update.status,
        })
      }
    }

    const workflow = derivePpdbWorkflow(pendaftar)
    const persyaratanWajibIds = new Set(
      pendaftar.periode.persyaratanBerkas
        .filter((persyaratan) => persyaratan.isWajib)
        .map((persyaratan) => persyaratan.id)
    )
    const statusBerkasWajib = Array.from(berkasStatusById.values())
      .filter((berkas) => persyaratanWajibIds.has(berkas.persyaratanId))
      .map((berkas) => berkas.status)

    if (status === 'TERVERIFIKASI' || status === 'DITERIMA') {
      if (!workflow.flags.isEligibleForVerification) {
        return NextResponse.json({
          error: 'Pendaftar belum siap diverifikasi. Pastikan biaya formulir lunas, form lengkap sudah submit final, dan tidak ada berkas wajib yang ditolak.',
        }, { status: 409 })
      }
    }

    if (status === 'TERVERIFIKASI') {
      const semuaBerkasWajibAda = statusBerkasWajib.length === persyaratanWajibIds.size
      const adaBerkasWajibDitolak = statusBerkasWajib.includes('DITOLAK')
      if (!semuaBerkasWajibAda || adaBerkasWajibDitolak) {
        return NextResponse.json({ error: 'Berkas wajib belum lengkap atau masih ada yang ditolak' }, { status: 409 })
      }
    }

    if (status === 'DITERIMA') {
      if (!workflow.flags.isEligibleForAcceptance) {
        return NextResponse.json({
          error: 'Pendaftar belum siap diterima. Verifikasi admin harus selesai terlebih dahulu dan semua berkas wajib harus sudah diterima.',
        }, { status: 409 })
      }

      const semuaBerkasWajibDiterima =
        statusBerkasWajib.length === persyaratanWajibIds.size &&
        statusBerkasWajib.every((berkasStatus) => berkasStatus === 'DITERIMA')

      if (!semuaBerkasWajibDiterima) {
        return NextResponse.json({ error: 'Semua berkas wajib harus diterima sebelum pendaftar dinyatakan diterima' }, { status: 409 })
      }
    }

    // Update status pendaftar
    if (status && status !== pendaftar.status) {
      await prisma.pendaftarPpdb.update({
        where: { id },
        data: { status },
      })
    }

    await prisma.logAktivitas.create({
      data: {
        tenantId,
        userId: session.user.id,
        aksi: 'VERIFIKASI_PPDB',
        modul: 'PPDB',
        detail: `Verifikasi pendaftar ${pendaftar.noPendaftaran} → status: ${status}`,
      },
    })

    return NextResponse.json({ message: 'Verifikasi berhasil disimpan' })
  } catch (error) {
    console.error('[PPDB_VERIFIKASI]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
