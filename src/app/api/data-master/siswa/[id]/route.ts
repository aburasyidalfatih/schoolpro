import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSessionUser, hasAnyRole } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { buildStudentQuotaErrorMessage, hasAvailableStudentSlot, shouldConsumeStudentSlot } from '@/lib/student-quota'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userSession = getSessionUser(session)
    const tenantId = userSession?.tenantId
    if (!tenantId || !hasAnyRole(userSession, ['SUPER_ADMIN', 'ADMIN', 'TU'])) {
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

    // Check ownership
    const existing = await prisma.siswa.findUnique({ where: { id } })
    if (!existing || existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    // Check NIS uniqueness if it's changing
    if (nis !== existing.nis) {
        const nisTaken = await prisma.siswa.findFirst({
        where: { tenantId, nis, NOT: { id } },
      })
      if (nisTaken) {
        return NextResponse.json({ error: 'NIS sudah digunakan oleh siswa lain' }, { status: 400 })
      }
    }

    const nextStatus = status || 'AKTIF'
    const updatedSiswa = await prisma.$transaction(async (tx) => {
      if (!shouldConsumeStudentSlot(existing.status) && shouldConsumeStudentSlot(nextStatus)) {
        const quotaCheck = await hasAvailableStudentSlot(tx, tenantId)
        if (!quotaCheck.allowed) {
          throw new Error(buildStudentQuotaErrorMessage(quotaCheck.snapshot))
        }
      }

      return tx.siswa.update({
        where: { id },
        data: {
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

    return NextResponse.json({ data: updatedSiswa, message: 'Siswa berhasil diperbarui' })
  } catch (error) {
    console.error('[SISWA_PUT]', error)
    if (error instanceof Error && error.message.includes('kuota siswa aktif')) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userSession = getSessionUser(session)
    const tenantId = userSession?.tenantId
    if (!tenantId || !hasAnyRole(userSession, ['SUPER_ADMIN', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const existing = await prisma.siswa.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tagihans: true }
        }
      }
    })

    if (!existing || existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    // Dependency check: Cannot delete if has bills
    if (existing._count.tagihans > 0) {
      return NextResponse.json({ error: 'Tidak dapat menghapus siswa karena masih memiliki data tagihan' }, { status: 400 })
    }

    await prisma.siswa.delete({ where: { id } })

    return NextResponse.json({ message: 'Siswa berhasil dihapus' })
  } catch (error) {
    console.error('[SISWA_DELETE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
