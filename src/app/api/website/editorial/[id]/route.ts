import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { tenantId } = session.user as any
    const { id } = await params
    const body = await req.json()
    const data = await prisma.editorial.update({
      where: { id, tenantId },
      data: {
        judul: body.judul,
        slug: body.slug || slugify(body.judul),
        konten: body.konten,
        ringkasan: body.ringkasan || null,
        penulis: body.penulis || null,
        fotoPenulis: body.fotoPenulis || null,
        judulPenulis: body.judulPenulis || null,
        gambarUrl: body.gambarUrl || null,
        isPublished: body.isPublished ?? true,
        tanggal: body.tanggal ? new Date(body.tanggal) : undefined,
      },
    })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { tenantId } = session.user as any
    const { id } = await params
    await prisma.editorial.delete({ where: { id, tenantId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
