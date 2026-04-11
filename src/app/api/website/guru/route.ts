import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { tenantId } = session.user as any
    const data = await prisma.guru.findMany({
      where: { tenantId },
      orderBy: [{ urutan: 'asc' }, { nama: 'asc' }],
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
    if (!body.nama) return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 })
    const data = await prisma.guru.create({
      data: {
        tenantId,
        nama: body.nama,
        slug: body.slug || slugify(body.nama),
        jabatan: body.jabatan || 'guru',
        jabatanLabel: body.jabatanLabel || body.jabatan || '',
        nip: body.nip || null,
        pendidikan: body.pendidikan || null,
        bidang: body.bidang || null,
        bio: body.bio || null,
        quote: body.quote || null,
        foto: body.foto || null,
        urutan: body.urutan || 0,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
