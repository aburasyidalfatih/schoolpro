import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { tenantId } = session.user as any
    const data = await prisma.agenda.findMany({ where: { tenantId }, orderBy: { tanggalMulai: 'desc' } })
    return NextResponse.json({ data })
  } catch { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { tenantId } = session.user as any
    const body = await req.json()
    if (!body.judul || !body.tanggalMulai) return NextResponse.json({ error: 'Judul dan tanggal wajib diisi' }, { status: 400 })
    const data = await prisma.agenda.create({ data: { tenantId, judul: body.judul, deskripsi: body.deskripsi, tanggalMulai: new Date(body.tanggalMulai), tanggalAkhir: body.tanggalAkhir ? new Date(body.tanggalAkhir) : null, lokasi: body.lokasi, penanggungjawab: body.penanggungjawab, isPublished: body.isPublished ?? true } })
    return NextResponse.json({ data })
  } catch { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }) }
}
