import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { tenantId } = session.user as any
    const data = await prisma.editorial.findMany({
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
    const { tenantId } = session.user as any
    const body = await req.json()
    if (!body.judul) return NextResponse.json({ error: 'Judul wajib diisi' }, { status: 400 })
    const data = await prisma.editorial.create({
      data: {
        tenantId,
        judul: body.judul,
        slug: body.slug || slugify(body.judul),
        konten: body.konten || '',
        ringkasan: body.ringkasan || null,
        penulis: body.penulis || null,
        fotoPenulis: body.fotoPenulis || null,
        judulPenulis: body.judulPenulis || null,
        gambarUrl: body.gambarUrl || null,
        isPublished: body.isPublished ?? true,
        tanggal: body.tanggal ? new Date(body.tanggal) : new Date(),
      },
    })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
