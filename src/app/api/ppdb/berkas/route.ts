import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'

const FINAL_STATUSES = ['DITERIMA', 'DITOLAK']

type SessionUser = {
  tenantId?: string | null
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userSession = session.user as SessionUser
    const tenantId = userSession.tenantId
    if (!tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const body = await req.json()
    const pendaftarId = typeof body?.pendaftarId === 'string' ? body.pendaftarId.trim() : ''
    const persyaratanId = typeof body?.persyaratanId === 'string' ? body.persyaratanId.trim() : ''
    const fileUrl = typeof body?.fileUrl === 'string' ? body.fileUrl.trim() : ''

    if (!pendaftarId || !persyaratanId || !fileUrl) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Verifikasi pendaftar milik user ini
    const pendaftar = await prisma.pendaftarPpdb.findFirst({
      where: { id: pendaftarId, tenantId },
      select: {
        id: true,
        userId: true,
        periodeId: true,
        status: true,
      },
    })
    if (!pendaftar) return NextResponse.json({ error: 'Pendaftar tidak ditemukan' }, { status: 404 })
    if (pendaftar.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (FINAL_STATUSES.includes(pendaftar.status)) {
      return NextResponse.json({ error: 'Pendaftar sudah final dan berkas tidak dapat diubah' }, { status: 409 })
    }

    const persyaratan = await prisma.persyaratanBerkas.findFirst({
      where: {
        id: persyaratanId,
        tenantId,
        periodeId: pendaftar.periodeId,
      },
      select: {
        id: true,
      },
    })
    if (!persyaratan) {
      return NextResponse.json({ error: 'Persyaratan berkas tidak valid' }, { status: 404 })
    }

    // Upsert berkas (update jika sudah ada, create jika belum)
    const existing = await prisma.berkasPpdb.findFirst({
      where: { pendaftarId, persyaratanId, tenantId },
    })

    const berkas = existing
      ? await prisma.berkasPpdb.update({
          where: { id: existing.id },
          data: { fileUrl, status: 'MENUNGGU', catatan: null },
        })
      : await prisma.berkasPpdb.create({
          data: { tenantId, pendaftarId, persyaratanId, fileUrl, status: 'MENUNGGU' },
        })

    return NextResponse.json({ data: berkas, message: 'Berkas berhasil disimpan' })
  } catch (error) {
    console.error('[PPDB_BERKAS_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
