import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSessionUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userSession = getSessionUser(session)
    if (!userSession?.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { tenantId } = userSession
    const data = await prisma.pengumuman.findMany({
      where: { tenantId },
      orderBy: { tanggal: 'desc' },
    })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userSession = getSessionUser(session)
    if (!userSession?.tenantId || !userSession.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    if (!body.judul) return NextResponse.json({ error: 'Judul wajib diisi' }, { status: 400 })
    const data = await prisma.pengumuman.create({
      data: {
        tenantId: userSession.tenantId,
        userId: userSession.id,
        judul: body.judul,
        slug: body.slug || slugify(body.judul),
        konten: body.konten || '',
        ringkasan: body.ringkasan || null,
        prioritas: body.prioritas || 'normal',
        gambarUrl: body.gambarUrl || null,
        tanggal: body.tanggal ? new Date(body.tanggal) : new Date(),
      },
    })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
