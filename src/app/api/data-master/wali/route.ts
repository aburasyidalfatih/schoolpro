import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { getSessionUser, hasAnyRole } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = getSessionUser(session)
    if (!userSession?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')?.trim()

    const whereClause: Prisma.UserWhereInput = {
      tenantId: userSession.tenantId,
      role: 'WALI',
    }

    if (search) {
      whereClause.OR = [
        { nama: { contains: search } },
        { email: { contains: search } },
        { username: { contains: search } },
      ]
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        nama: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: users })
  } catch (error) {
    console.error('[WALI_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = getSessionUser(session)
    if (!userSession?.tenantId || !hasAnyRole(userSession, ['SUPER_ADMIN', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { nama, email, username, password } = body

    if (!nama || !email || !username || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        tenantId: userSession.tenantId,
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username atau email sudah digunakan' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const newUser = await prisma.user.create({
      data: {
        tenantId: userSession.tenantId,
        nama,
        email,
        username,
        passwordHash,
        role: 'WALI',
        isActive: true,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
      },
    })

    return NextResponse.json(
      { data: newUser, message: 'Akun wali berhasil ditambahkan' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[WALI_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
