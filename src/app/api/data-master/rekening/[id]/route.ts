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
    const { namaBank, noRekening, atasNama, isActive } = body

    if (!namaBank || !noRekening || !atasNama) {
      return NextResponse.json({ error: 'Data Rekening Belum Lengkap' }, { status: 400 })
    }

    // Check ownership
    const existing = await prisma.rekening.findUnique({ where: { id } })
    if (!existing || existing.tenantId !== userSession.tenantId) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    const updatedRekening = await prisma.rekening.update({
      where: { id },
      data: {
        namaBank,
        noRekening,
        atasNama,
        isActive: isActive !== undefined ? !!isActive : true,
      },
    })

    return NextResponse.json({ data: updatedRekening, message: 'Rekening Berhasil diperbarui' })
  } catch (error) {
    console.error('[REKENING_PUT]', error)
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

    const existing = await prisma.rekening.findUnique({
      where: { id },
      include: {
        _count: {
          select: { pembayarans: true }
        }
      }
    })

    if (!existing || existing.tenantId !== userSession.tenantId) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    // Dependency check: Cannot delete if has manual payments linked (rare but possible in future)
    if (existing._count.pembayarans > 0) {
      return NextResponse.json({ error: 'Tidak dapat menghapus rekening karena masih terkait dengan data pembayaran' }, { status: 400 })
    }

    await prisma.rekening.delete({ where: { id } })

    return NextResponse.json({ message: 'Rekening Berhasil dihapus' })
  } catch (error) {
    console.error('[REKENING_DELETE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
