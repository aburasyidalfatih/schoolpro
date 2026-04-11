import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { tenantId } = session.user as any
    const data = await prisma.slider.findMany({ where: { tenantId }, orderBy: { urutan: 'asc' } })
    return NextResponse.json({ data })
  } catch { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { tenantId } = session.user as any
    const body = await req.json()
    if (!body.gambarUrl) return NextResponse.json({ error: 'Gambar wajib diisi' }, { status: 400 })
    const data = await prisma.slider.create({ data: { tenantId, judul: body.judul, subjudul: body.subjudul, gambarUrl: body.gambarUrl, linkUrl: body.linkUrl, urutan: body.urutan || 0, isActive: body.isActive ?? true } })
    return NextResponse.json({ data })
  } catch { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }) }
}
