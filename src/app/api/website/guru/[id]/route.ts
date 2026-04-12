import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSessionUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { slugify } from '@/lib/utils'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userSession = getSessionUser(session)
    if (!userSession?.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { tenantId } = userSession
    const { id } = await params
    const body = await req.json()
    const data = await prisma.guru.update({
      where: { id, tenantId },
      data: {
        nama: body.nama,
        slug: body.slug || slugify(body.nama),
        jabatan: body.jabatan,
        jabatanLabel: body.jabatanLabel || body.jabatan,
        nip: body.nip || null,
        pendidikan: body.pendidikan || null,
        bidang: body.bidang || null,
        bio: body.bio || null,
        quote: body.quote || null,
        foto: body.foto || null,
        urutan: body.urutan ?? 0,
        isActive: body.isActive ?? true,
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
    const userSession = getSessionUser(session)
    if (!userSession?.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { tenantId } = userSession
    const { id } = await params
    await prisma.guru.delete({ where: { id, tenantId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
