import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PPDB']

// POST — admin approve/reject berkas dan ubah status pendaftar
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userSession = session.user as any
    if (!ADMIN_ROLES.includes(userSession.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const tenantId = userSession.tenantId
    const body = await req.json()
    const { status, berkasUpdates, catatan } = body
    // berkasUpdates: [{ berkasId, status: 'DITERIMA'|'DITOLAK', catatan }]

    const pendaftar = await prisma.pendaftarPpdb.findUnique({ where: { id, tenantId } })
    if (!pendaftar) return NextResponse.json({ error: 'Pendaftar tidak ditemukan' }, { status: 404 })

    // Update status berkas jika ada
    if (berkasUpdates && Array.isArray(berkasUpdates)) {
      await Promise.all(
        berkasUpdates.map((b: { berkasId: string; status: string; catatan?: string }) =>
          prisma.berkasPpdb.update({
            where: { id: b.berkasId },
            data: { status: b.status, catatan: b.catatan },
          })
        )
      )
    }

    // Update status pendaftar
    const validStatuses = ['MENUNGGU', 'TERVERIFIKASI', 'DITERIMA', 'DITOLAK']
    if (status && validStatuses.includes(status)) {
      await prisma.pendaftarPpdb.update({
        where: { id },
        data: { status },
      })
    }

    await prisma.logAktivitas.create({
      data: {
        tenantId,
        userId: session.user.id,
        aksi: 'VERIFIKASI_PPDB',
        modul: 'PPDB',
        detail: `Verifikasi pendaftar ${pendaftar.noPendaftaran} → status: ${status}`,
      },
    })

    return NextResponse.json({ message: 'Verifikasi berhasil disimpan' })
  } catch (error) {
    console.error('[PPDB_VERIFIKASI]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
