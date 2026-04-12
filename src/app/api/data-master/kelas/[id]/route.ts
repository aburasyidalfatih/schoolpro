import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSessionUser, hasAnyRole } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userSession = getSessionUser(session)
    if (!userSession?.tenantId || !hasAnyRole(userSession, ['SUPER_ADMIN', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { nama, unitId, tahunAjaranId, tingkat, kapasitas } = body

    if (!nama || !unitId || !tahunAjaranId) {
      return NextResponse.json({ error: 'Nama, Unit, dan Tahun Ajaran wajib diisi' }, { status: 400 })
    }

    // Check ownership
    const existing = await prisma.kelas.findUnique({ where: { id } })
    if (!existing || existing.tenantId !== userSession.tenantId) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    const updatedKelas = await prisma.kelas.update({
      where: { id },
      data: {
        nama,
        unitId,
        tahunAjaranId,
        tingkat: tingkat || null,
        kapasitas: kapasitas ? parseInt(kapasitas.toString()) : existing.kapasitas,
      },
      include: {
        unit: true,
        tahunAjaran: true,
      }
    })

    return NextResponse.json({ data: updatedKelas, message: 'Kelas berhasil diperbarui' })
  } catch (error) {
    console.error('[KELAS_PUT]', error)
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
    if (!userSession?.tenantId || !hasAnyRole(userSession, ['SUPER_ADMIN', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const existing = await prisma.kelas.findUnique({
      where: { id },
      include: {
        _count: {
          select: { siswas: true }
        }
      }
    })

    if (!existing || existing.tenantId !== userSession.tenantId) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    // Dependency check
    if (existing._count.siswas > 0) {
      return NextResponse.json({ error: 'Tidak dapat menghapus kelas karena masih memiliki data siswa di dalamnya' }, { status: 400 })
    }

    await prisma.kelas.delete({ where: { id } })

    return NextResponse.json({ message: 'Kelas berhasil dihapus' })
  } catch (error) {
    console.error('[KELAS_DELETE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
