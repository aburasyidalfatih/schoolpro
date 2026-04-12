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
    const { nama, kode, isBulanan, isActive } = body

    if (!nama || !kode) {
      return NextResponse.json({ error: 'Nama dan Kode wajib diisi' }, { status: 400 })
    }

    // Check ownership and uniqueness of code
    const existing = await prisma.kategoriTagihan.findUnique({ where: { id } })
    if (!existing || existing.tenantId !== userSession.tenantId) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    if (kode !== existing.kode) {
        const codeTaken = await prisma.kategoriTagihan.findFirst({
            where: { tenantId: userSession.tenantId, kode, NOT: { id } },
        })
        if (codeTaken) {
            return NextResponse.json({ error: 'Kode kategori sudah digunakan' }, { status: 400 })
        }
    }

    const updatedKategori = await prisma.kategoriTagihan.update({
      where: { id },
      data: {
        nama,
        kode,
        isBulanan: !!isBulanan,
        isActive: isActive !== undefined ? !!isActive : true,
      },
    })

    return NextResponse.json({ data: updatedKategori, message: 'Kategori Berhasil diperbarui' })
  } catch (error) {
    console.error('[KATEGORI_TAGIHAN_PUT]', error)
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

    const existing = await prisma.kategoriTagihan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tagihans: true }
        }
      }
    })

    if (!existing || existing.tenantId !== userSession.tenantId) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    // Dependency check
    if (existing._count.tagihans > 0) {
      return NextResponse.json({ error: 'Tidak dapat menghapus kategori karena masih memiliki data tagihan di dalamnya' }, { status: 400 })
    }

    await prisma.kategoriTagihan.delete({ where: { id } })

    return NextResponse.json({ message: 'Kategori Berhasil dihapus' })
  } catch (error) {
    console.error('[KATEGORI_TAGIHAN_DELETE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
