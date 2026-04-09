import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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

    // Check if user exists and belongs to the same tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        tenantId: userSession.tenantId,
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Petugas tidak ditemukan' }, { status: 404 })
    }

    // Prevent deleting oneself
    if (existingUser.id === userSession.id) {
        return NextResponse.json({ error: 'Anda tidak dapat menghapus akun Anda sendiri' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Petugas berhasil dihapus' }, { status: 200 })
  } catch (error) {
    console.error('[PETUGAS_DELETE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

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
    const { nama, email, username, role, password, isActive } = body

    // Check if user exists and belongs to the same tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        tenantId: userSession.tenantId,
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Petugas tidak ditemukan' }, { status: 404 })
    }

    // If email or username changed, check for duplicates
    if (email !== existingUser.email || username !== existingUser.username) {
        const duplicateCheck = await prisma.user.findFirst({
            where: {
                tenantId: userSession.tenantId,
                id: { not: id },
                OR: [{ email }, { username }],
            },
        })
        if (duplicateCheck) {
            return NextResponse.json({ error: 'Username atau email sudah digunakan' }, { status: 400 })
        }
    }

    const updateData: any = {
        nama,
        email,
        username,
        role,
    }

    if (typeof isActive !== 'undefined') {
        updateData.isActive = isActive
    }

    if (password) {
        updateData.passwordHash = await bcrypt.hash(password, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
          id: true,
          nama: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
      }
    })

    return NextResponse.json({ data: updatedUser, message: 'Data petugas berhasil diperbarui' })
  } catch (error) {
    console.error('[PETUGAS_PUT]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
