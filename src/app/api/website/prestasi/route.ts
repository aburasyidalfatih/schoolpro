import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSessionUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userSession = getSessionUser(session)
    if (!userSession?.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { tenantId } = userSession
    const data = await prisma.prestasi.findMany({ where: { tenantId }, orderBy: { tahun: 'desc' } })
    return NextResponse.json({ data })
  } catch { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userSession = getSessionUser(session)
    if (!userSession?.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { tenantId } = userSession
    const body = await req.json()
    if (!body.judul || !body.tahun) return NextResponse.json({ error: 'Judul dan tahun wajib diisi' }, { status: 400 })
    const data = await prisma.prestasi.create({ data: { tenantId, judul: body.judul, deskripsi: body.deskripsi, tingkat: body.tingkat || 'SEKOLAH', kategori: body.kategori || 'AKADEMIK', tahun: Number(body.tahun), gambarUrl: body.gambarUrl, isPublished: body.isPublished ?? true } })
    return NextResponse.json({ data })
  } catch { return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }) }
}
