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
    const search = searchParams.get('search')
    const hasAccount = searchParams.get('hasAccount') // 'true' or 'false'

    const userSession = session.user as any
    const whereClause: any = {
      tenantId: userSession.tenantId,
    }

    if (search) {
      whereClause.OR = [
        { namaLengkap: { contains: search } },
        { nis: { contains: search } },
      ]
    }

    if (hasAccount === 'true') {
      whereClause.userId = { not: null }
    } else if (hasAccount === 'false') {
      whereClause.userId = null
    }

    const siswas = await prisma.siswa.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            isActive: true,
            lastLogin: true,
          }
        },
        kelas: { select: { nama: true } }
      },
      orderBy: { namaLengkap: 'asc' },
    })

    return NextResponse.json({ data: siswas })
  } catch (error) {
    console.error('[AKUN_SISWA_GET]', error)
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
    if (userSession.role !== 'SUPER_ADMIN' && userSession.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { action, siswaId, password } = body

    // -------------------------------------------------------------
    // ACTION: MASS GENERATE
    // -------------------------------------------------------------
    if (action === 'generate-all') {
        const studentsWithoutAccount = await prisma.siswa.findMany({
            where: { tenantId: userSession.tenantId, userId: null },
        })

        if (studentsWithoutAccount.length === 0) {
            return NextResponse.json({ message: 'Semua siswa sudah memiliki akun.' })
        }

        let createdCount = 0
        const defaultPasswordHash = await bcrypt.hash('Siswa123!', 12)

        for (const student of studentsWithoutAccount) {
            try {
                // Check if username (NIS) already taken in same tenant
                const existingUser = await prisma.user.findFirst({
                    where: { tenantId: userSession.tenantId, username: student.nis }
                })
                
                if (existingUser) continue // Skip if NIS as username is taken (rare edge case)

                const newUser = await prisma.user.create({
                    data: {
                        tenantId: userSession.tenantId,
                        nama: student.namaLengkap,
                        email: `${student.nis}@schoolpro.id`, // Dummy email
                        username: student.nis,
                        passwordHash: defaultPasswordHash,
                        role: 'SISWA',
                        isActive: true,
                    }
                })

                await prisma.siswa.update({
                    where: { id: student.id },
                    data: { userId: newUser.id }
                })
                createdCount++
            } catch (err) {
                console.error(`Gagal membuat akun untuk ${student.nis}:`, err)
            }
        }

        return NextResponse.json({ 
            message: `${createdCount} Akun siswa berhasil digenerate.`,
            count: createdCount 
        })
    }

    // -------------------------------------------------------------
    // ACTION: SINGLE CREATE
    // -------------------------------------------------------------
    if (!siswaId || !password) {
        return NextResponse.json({ error: 'Siswa dan password wajib diisi' }, { status: 400 })
    }

    const student = await prisma.siswa.findUnique({
        where: { id: siswaId },
        include: { user: true }
    })

    if (!student || student.tenantId !== userSession.tenantId) {
        return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 })
    }

    if (student.userId) {
        return NextResponse.json({ error: 'Siswa sudah memiliki akun' }, { status: 400 })
    }

    // Check if NIS as username is taken
    const usernameTaken = await prisma.user.findFirst({
        where: { tenantId: userSession.tenantId, username: student.nis }
    })
    if (usernameTaken) {
        return NextResponse.json({ error: 'Username (NIS) sudah digunakan oleh akun lain' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const newUser = await prisma.user.create({
        data: {
            tenantId: userSession.tenantId,
            nama: student.namaLengkap,
            email: `${student.nis}@schoolpro.id`,
            username: student.nis,
            passwordHash,
            role: 'SISWA',
            isActive: true,
        }
    })

    await prisma.siswa.update({
        where: { id: siswaId },
        data: { userId: newUser.id }
    })

    return NextResponse.json({ data: newUser, message: 'Akun siswa berhasil dibuat' }, { status: 201 })

  } catch (error) {
    console.error('[AKUN_SISWA_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
