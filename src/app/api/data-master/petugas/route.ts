import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    const userSession = session.user as any
    const whereClause: any = {
      tenantId: userSession.tenantId,
      // Exclude WALI and SISWA as they are usually managed separately
      role: { notIn: ['WALI', 'SISWA'] },
    }

    if (role) {
      whereClause.role = role
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
    console.error('[PETUGAS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = session.user as any

    // Only Admin can create users
    if (userSession.role !== 'SUPER_ADMIN' && userSession.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { nama, email, username, password, role } = body

    if (!nama || !email || !username || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if username/email already exists in tenant
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
        tenantId: userSession.tenantId as string,
        nama,
        email,
        username,
        passwordHash,
        role,
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

    return NextResponse.json({ data: newUser, message: 'Petugas berhasil ditambahkan' }, { status: 201 })
  } catch (error) {
    console.error('[PETUGAS_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
