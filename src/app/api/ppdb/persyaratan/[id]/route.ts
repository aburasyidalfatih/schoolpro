import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = session.user as any
    const tenantId = userSession.tenantId

    if (userSession.role !== 'SUPER_ADMIN' && userSession.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const existing = await prisma.persyaratanBerkas.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { berkas: true } } }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Persyaratan tidak ditemukan' }, { status: 404 })
    }

    if (existing._count.berkas > 0) {
      return NextResponse.json({ 
        error: 'Tidak bisa menghapus persyaratan yang sudah memiliki berkas unggahan pendaftar' 
      }, { status: 400 })
    }

    await prisma.persyaratanBerkas.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Persyaratan berkas berhasil dihapus' })
  } catch (error) {
    console.error('[PPDB_PERSYARATAN_DELETE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
