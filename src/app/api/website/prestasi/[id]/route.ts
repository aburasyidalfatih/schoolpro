import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { tenantId } = session.user as any
    const { id } = await params
    const body = await req.json()
    const data = await prisma.prestasi.update({ where: { id, tenantId }, data: { judul: body.judul, deskripsi: body.deskripsi, tingkat: body.tingkat, kategori: body.kategori, tahun: Number(body.tahun), gambarUrl: body.gambarUrl, isPublished: body.isPublished } })
    return NextResponse.json({ data })
  } catch { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }) }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { tenantId } = session.user as any
    const { id } = await params
    await prisma.prestasi.delete({ where: { id, tenantId } })
    return NextResponse.json({ data: true })
  } catch { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }) }
}
