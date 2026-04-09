import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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
    const { password } = body

    if (!password) {
        return NextResponse.json({ error: 'Password baru wajib diisi' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({
        where: { id },
        include: { siswas: true }
    })

    if (!existing || existing.tenantId !== userSession.tenantId || existing.role !== 'SISWA') {
        return NextResponse.json({ error: 'Akun tidak ditemukan atau bukan akun siswa' }, { status: 404 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const updatedUser = await prisma.user.update({
        where: { id },
        data: { passwordHash }
    })

    return NextResponse.json({ data: updatedUser, message: 'Password berhasil diperbarui' })
  } catch (error) {
    console.error('[AKUN_SISWA_PUT]', error)
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

    const existing = await prisma.user.findUnique({
        where: { id },
    })

    if (!existing || existing.tenantId !== userSession.tenantId || existing.role !== 'SISWA') {
        return NextResponse.json({ error: 'Akun tidak ditemukan atau bukan akun siswa' }, { status: 404 })
    }

    // Set Siswa.userId to null before deleting the user
    await prisma.siswa.updateMany({
        where: { userId: id },
        data: { userId: null }
    })

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ message: 'Akun siswa berhasil dihapus' })
  } catch (error) {
    console.error('[AKUN_SISWA_DELETE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
