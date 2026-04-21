import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { getSessionUser, hasAnyRole } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userSession = getSessionUser(session)
    if (!userSession?.tenantId || !hasAnyRole(userSession, ['SUPER_ADMIN', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        tenantId: userSession.tenantId,
        role: 'WALI',
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Akun wali tidak ditemukan' }, { status: 404 })
    }

    if (existingUser.id === userSession.id) {
      return NextResponse.json(
        { error: 'Anda tidak dapat menghapus akun Anda sendiri' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Akun wali berhasil dihapus' }, { status: 200 })
  } catch (error) {
    console.error('[WALI_DELETE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userSession = getSessionUser(session)
    if (!userSession?.tenantId || !hasAnyRole(userSession, ['SUPER_ADMIN', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { nama, email, username, password, isActive } = body

    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        tenantId: userSession.tenantId,
        role: 'WALI',
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Akun wali tidak ditemukan' }, { status: 404 })
    }

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

    const updateData: Prisma.UserUpdateInput = {
      nama,
      email,
      username,
      role: 'WALI',
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
      },
    })

    return NextResponse.json({
      data: updatedUser,
      message: 'Data akun wali berhasil diperbarui',
    })
  } catch (error) {
    console.error('[WALI_PUT]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
