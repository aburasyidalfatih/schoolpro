import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userSession = session.user as any
    if (userSession.role !== 'SUPER_ADMIN' && userSession.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { nama, tanggalMulai, tanggalSelesai, isActive } = body

    if (!nama || !tanggalMulai || !tanggalSelesai) {
      return NextResponse.json({ error: 'Nama, tanggal mulai, dan tanggal selesai wajib diisi' }, { status: 400 })
    }

    if (new Date(tanggalMulai) >= new Date(tanggalSelesai)) {
        return NextResponse.json({ error: 'Tanggal mulai harus sebelum tanggal selesai' }, { status: 400 })
    }

    // Check ownership
    const existing = await prisma.tahunAjaran.findUnique({ where: { id } })
    if (!existing || existing.tenantId !== userSession.tenantId) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    // Single Active Year Logic
    if (isActive && !existing.isActive) {
      await prisma.tahunAjaran.updateMany({
        where: { tenantId: userSession.tenantId, isActive: true },
        data: { isActive: false },
      })
    }

    const updatedTA = await prisma.tahunAjaran.update({
      where: { id },
      data: {
        nama,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: new Date(tanggalSelesai),
        isActive: !!isActive,
      },
    })

    return NextResponse.json({ data: updatedTA, message: 'Tahun Ajaran berhasil diperbarui' })
  } catch (error) {
    console.error('[TAHUN_AJARAN_PUT]', error)
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
    const userSession = session.user as any
    if (userSession.role !== 'SUPER_ADMIN' && userSession.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const existing = await prisma.tahunAjaran.findUnique({
      where: { id },
      include: {
        kelases: true,
        tagihans: true,
        periodePpdbs: true,
      },
    })

    if (!existing || existing.tenantId !== userSession.tenantId) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    // Dependency check
    if (existing.kelases.length > 0 || existing.tagihans.length > 0 || existing.periodePpdbs.length > 0) {
      return NextResponse.json({ error: 'Tidak dapat menghapus tahun ajaran karena memiliki data kelas atau tagihan yang terkait' }, { status: 400 })
    }

    await prisma.tahunAjaran.delete({ where: { id } })

    return NextResponse.json({ message: 'Tahun Ajaran berhasil dihapus' })
  } catch (error) {
    console.error('[TAHUN_AJARAN_DELETE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
