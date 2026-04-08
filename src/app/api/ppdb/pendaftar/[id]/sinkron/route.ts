import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PPDB']

// POST — sinkronisasi pendaftar DITERIMA ke tabel Siswa
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
    const { kelasId, unitId } = body

    const pendaftar = await prisma.pendaftarPpdb.findUnique({
      where: { id, tenantId },
      include: { periode: { include: { unit: true, tahunAjaran: true } } },
    })

    if (!pendaftar) return NextResponse.json({ error: 'Pendaftar tidak ditemukan' }, { status: 404 })
    if (pendaftar.status !== 'DITERIMA') {
      return NextResponse.json({ error: 'Hanya pendaftar berstatus DITERIMA yang bisa disinkronkan' }, { status: 400 })
    }

    const formulir = (pendaftar.dataFormulir as any) || {}
    const orangtua = (pendaftar.dataOrangtua as any) || {}

    // Generate NIS sementara
    const count = await prisma.siswa.count({ where: { tenantId } })
    const nis = `${new Date().getFullYear()}${(count + 1).toString().padStart(4, '0')}`

    // Cek apakah sudah pernah disinkron (cek NIS)
    const existing = await prisma.siswa.findFirst({ where: { tenantId, nis } })
    if (existing) return NextResponse.json({ error: 'Siswa dengan NIS ini sudah ada' }, { status: 409 })

    const siswa = await prisma.siswa.create({
      data: {
        tenantId,
        userId: pendaftar.userId,
        kelasId: kelasId || null,
        unitId: unitId || pendaftar.periode.unitId || null,
        nis,
        nisn: formulir.nisn || null,
        namaLengkap: pendaftar.namaLengkap,
        jenisKelamin: formulir.jenisKelamin || null,
        tempatLahir: formulir.tempatLahir || null,
        tanggalLahir: formulir.tanggalLahir ? new Date(formulir.tanggalLahir) : null,
        alamat: formulir.alamat || null,
        telepon: formulir.telepon || null,
        namaWali: orangtua.namaAyah || orangtua.namaIbu || null,
        teleponWali: orangtua.teleponAyah || orangtua.teleponIbu || null,
        emailWali: orangtua.email || null,
        status: 'AKTIF',
        dataTambahan: { sumberPpdb: pendaftar.noPendaftaran },
      },
    })

    // Update status pendaftar
    await prisma.pendaftarPpdb.update({
      where: { id },
      data: { status: 'DITERIMA' },
    })

    await prisma.logAktivitas.create({
      data: {
        tenantId,
        userId: session.user.id,
        aksi: 'SINKRON_PPDB',
        modul: 'PPDB',
        detail: `Sinkronisasi ${pendaftar.noPendaftaran} → Siswa NIS: ${nis}`,
      },
    })

    return NextResponse.json({
      message: `Pendaftar berhasil disinkronkan sebagai siswa dengan NIS ${nis}`,
      siswaId: siswa.id,
      nis,
    })
  } catch (error) {
    console.error('[PPDB_SINKRON]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
