import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PPDB']
const VALID_STATUSES = ['DITERIMA', 'DITOLAK']
type SessionUser = {
  id?: string
  role?: string
  tenantId?: string | null
}

// POST — kirim pengumuman hasil seleksi ke pendaftar
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userSession = session.user as SessionUser
    if (typeof userSession.role !== 'string' || !ADMIN_ROLES.includes(userSession.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const tenantId = userSession.tenantId
    if (!tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const body = await req.json()
    const { status, pesan, jadwalDaftarUlang } = body

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
    }

    const pendaftar = await prisma.pendaftarPpdb.findFirst({ where: { id, tenantId } })
    if (!pendaftar) return NextResponse.json({ error: 'Pendaftar tidak ditemukan' }, { status: 404 })
    if (pendaftar.status !== 'TERVERIFIKASI' && pendaftar.status !== status) {
      return NextResponse.json({ error: 'Status pendaftar belum siap diumumkan' }, { status: 409 })
    }

    // Update status + simpan pesan pengumuman di dataFormulir (extend JSON)
    const existingFormulir = (pendaftar.dataFormulir as Record<string, unknown> | null) || {}
    await prisma.pendaftarPpdb.update({
      where: { id },
      data: {
        status,
        dataFormulir: {
          ...existingFormulir,
          pengumuman: {
            status,
            pesan: pesan || (status === 'DITERIMA'
              ? 'Selamat! Anda dinyatakan DITERIMA. Silakan lakukan daftar ulang sesuai jadwal.'
              : 'Mohon maaf, Anda dinyatakan tidak lolos seleksi pada gelombang ini.'),
            jadwalDaftarUlang: status === 'DITERIMA' ? (jadwalDaftarUlang || null) : null,
            tanggalPengumuman: new Date().toISOString(),
          },
        },
      },
    })

    await prisma.logAktivitas.create({
      data: {
        tenantId,
        userId: session.user.id,
        aksi: 'KIRIM_PENGUMUMAN_PPDB',
        modul: 'PPDB',
        detail: `Pengumuman ${status} dikirim ke ${pendaftar.noPendaftaran}`,
      },
    })

    return NextResponse.json({ message: `Pengumuman ${status} berhasil dikirim` })
  } catch (error) {
    console.error('[PPDB_PENGUMUMAN]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
