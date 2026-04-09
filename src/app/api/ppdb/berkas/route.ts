import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userSession = session.user as any
    const tenantId = userSession.tenantId
    const body = await req.json()
    const { pendaftarId, persyaratanId, fileUrl } = body

    if (!pendaftarId || !persyaratanId || !fileUrl) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Verifikasi pendaftar milik user ini
    const pendaftar = await prisma.pendaftarPpdb.findUnique({
      where: { id: pendaftarId, tenantId },
    })
    if (!pendaftar) return NextResponse.json({ error: 'Pendaftar tidak ditemukan' }, { status: 404 })
    if (pendaftar.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
