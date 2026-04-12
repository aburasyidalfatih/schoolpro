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

    const userSession = getSessionUser(session)
    if (!userSession?.tenantId || !hasAnyRole(userSession, ['SUPER_ADMIN', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { nama, kode, isActive } = body

    if (!nama || !kode) {
      return NextResponse.json({ error: 'Nama dan kode unit wajib diisi' }, { status: 400 })
    }

    // Check if unit exists and belongs to tenant
    const existingUnit = await prisma.unit.findUnique({
      where: { id },
    })

    if (!existingUnit || existingUnit.tenantId !== userSession.tenantId) {
      return NextResponse.json({ error: 'Unit tidak ditemukan' }, { status: 404 })
    }

    // Check if new kode already exists in another unit
    if (kode !== existingUnit.kode) {
      const duplicateKode = await prisma.unit.findFirst({
        where: {
          tenantId: userSession.tenantId,
          kode,
          id: { not: id },
        },
      })

      if (duplicateKode) {
        return NextResponse.json(
          { error: 'Kode unit sudah digunakan oleh unit lain' },
          { status: 400 }
        )
      }
    }

    const updatedUnit = await prisma.unit.update({
      where: { id },
      data: {
        nama,
        kode,
        isActive: isActive !== undefined ? isActive : existingUnit.isActive,
      },
    })

    return NextResponse.json({ data: updatedUnit, message: 'Unit berhasil diperbarui' })
  } catch (error) {
    console.error('[UNIT_PUT]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = getSessionUser(session)
    if (!userSession?.tenantId || !hasAnyRole(userSession, ['SUPER_ADMIN', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const existingUnit = await prisma.unit.findUnique({
      where: { id },
      include: {
         kelases: true,
         siswas: true
      }
    })

    if (!existingUnit || existingUnit.tenantId !== userSession.tenantId) {
      return NextResponse.json({ error: 'Unit tidak ditemukan' }, { status: 404 })
    }

    // Protection against deleting unit with active relations
    if (existingUnit.kelases.length > 0 || existingUnit.siswas.length > 0) {
        return NextResponse.json({ error: 'Tidak dapat menghapus unit karena masih memiliki data kelas atau siswa yang terkait.' }, { status: 400 })
    }

    await prisma.unit.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Unit berhasil dihapus' })
  } catch (error) {
    console.error('[UNIT_DELETE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
