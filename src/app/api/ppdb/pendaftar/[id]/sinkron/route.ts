import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { buildStudentQuotaErrorMessage, hasAvailableStudentSlot } from '@/lib/student-quota'

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PPDB']
type SessionUser = {
  id?: string
  role?: string
  tenantId?: string | null
}
type PpdbFormulir = {
  nisn?: string
  jenisKelamin?: string
  tempatLahir?: string
  tanggalLahir?: string
  alamat?: string
  telepon?: string
}
type PpdbOrangtua = {
  namaAyah?: string
  namaIbu?: string
  teleponAyah?: string
  teleponIbu?: string
  email?: string
}

// POST — sinkronisasi pendaftar DITERIMA ke tabel Siswa
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
    const { kelasId, unitId } = body

    const pendaftar = await prisma.pendaftarPpdb.findFirst({
      where: { id, tenantId },
      include: {
        periode: { include: { unit: true, tahunAjaran: true } },
        tagihanPpdbs: { select: { jenis: true, status: true } },
      },
    })

    if (!pendaftar) return NextResponse.json({ error: 'Pendaftar tidak ditemukan' }, { status: 404 })
    if (pendaftar.status !== 'DITERIMA') {
      return NextResponse.json({ error: 'Hanya pendaftar berstatus DITERIMA yang bisa disinkronkan' }, { status: 400 })
    }

    if (pendaftar.tagihanPpdbs.some(t => t.jenis === 'DAFTAR_ULANG' && t.status !== 'LUNAS')) {
      return NextResponse.json({ error: 'Tagihan daftar ulang belum lunas' }, { status: 409 })
    }

    const kelas = kelasId
      ? await prisma.kelas.findFirst({
        where: { id: kelasId, tenantId },
        select: { id: true, unitId: true },
      })
      : null
    if (kelasId && !kelas) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 })
    }

    const unit = unitId
      ? await prisma.unit.findFirst({
        where: { id: unitId, tenantId },
        select: { id: true },
      })
      : null
    if (unitId && !unit) {
      return NextResponse.json({ error: 'Unit tidak ditemukan' }, { status: 404 })
    }

    if (kelas && unitId && kelas.unitId !== unitId) {
      return NextResponse.json({ error: 'Kelas dan unit tidak cocok' }, { status: 400 })
    }

    const formulir = (pendaftar.dataFormulir as PpdbFormulir | null) || {}
    const orangtua = (pendaftar.dataOrangtua as PpdbOrangtua | null) || {}

    // Generate NIS unik dengan timestamp untuk menghindari race condition
    const count = await prisma.siswa.count({ where: { tenantId } })
    const nis = `${new Date().getFullYear()}${(count + 1).toString().padStart(4, '0')}`

    // Cek apakah pendaftar ini sudah pernah disinkron
    const alreadySynced = await prisma.siswa.findFirst({
      where: { tenantId, dataTambahan: { path: ['sumberPpdb'], equals: pendaftar.noPendaftaran } }
    })
    if (alreadySynced) return NextResponse.json({ error: 'Pendaftar ini sudah pernah disinkronkan' }, { status: 409 })

    const siswa = await prisma.$transaction(async (tx) => {
      const quotaCheck = await hasAvailableStudentSlot(tx, tenantId)
      if (!quotaCheck.allowed) {
        throw new Error(buildStudentQuotaErrorMessage(quotaCheck.snapshot))
      }

      return tx.siswa.create({
        data: {
          tenantId,
          userId: pendaftar.userId,
          kelasId: kelasId || null,
          unitId: kelas?.unitId || unitId || pendaftar.periode.unitId || null,
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
    })

    // Update status pendaftar + update role user jika ada
    await prisma.pendaftarPpdb.update({
      where: { id },
      data: { status: 'DITERIMA' },
    })

    // Update role user menjadi SISWA agar bisa akses fitur siswa
    if (pendaftar.userId) {
      await prisma.user.update({
        where: { id: pendaftar.userId },
        data: { role: 'SISWA' },
      })
    }

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
    if (error instanceof Error && error.message.includes('kuota siswa aktif')) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
