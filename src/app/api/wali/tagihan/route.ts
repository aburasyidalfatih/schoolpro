import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — semua tagihan milik user yang login (PPDB + tagihan siswa reguler)
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userSession = session.user as any
    const tenantId = userSession.tenantId
    const userId = session.user.id

    // 1. Tagihan PPDB (dari semua pendaftaran user ini)
    const pendaftarans = await prisma.pendaftarPpdb.findMany({
      where: { userId, tenantId },
      include: {
        tagihanPpdbs: {
          include: { pembayarans: true },
        },
        periode: { include: { unit: true } },
      },
    })

    const tagihanPpdb = pendaftarans.flatMap(p =>
      p.tagihanPpdbs.map(t => ({
        id: t.id,
        tipe: 'PPDB' as const,
        jenis: t.jenis === 'PENDAFTARAN' ? 'Biaya Pendaftaran' : 'Biaya Daftar Ulang',
        keterangan: `${p.periode.nama} — ${p.periode.unit?.nama || 'Umum'}`,
        nominal: Number(t.nominal),
        status: t.status,
        pendaftarId: p.id,
        noPendaftaran: p.noPendaftaran,
        namaLengkap: p.namaLengkap,
        createdAt: t.createdAt,
        pembayarans: t.pembayarans,
      }))
    )

    // 2. Tagihan siswa reguler (jika user sudah jadi siswa)
    const siswa = await prisma.siswa.findFirst({
      where: { userId, tenantId },
      include: {
        tagihans: {
          include: {
            kategori: true,
            pembayarans: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    const tagihanSiswa = siswa?.tagihans.map(t => ({
      id: t.id,
      tipe: 'SISWA' as const,
      jenis: t.kategori.nama,
      keterangan: t.bulan ? `Bulan ${t.bulan}` : t.keterangan || '',
      nominal: Number(t.total),
      status: t.status,
      jatuhTempo: t.jatuhTempo,
      createdAt: t.createdAt,
      pembayarans: t.pembayarans,
    })) || []

    // Gabungkan dan urutkan terbaru dulu
    const semua = [...tagihanPpdb, ...tagihanSiswa].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const stats = {
      total: semua.length,
      belumLunas: semua.filter(t => t.status === 'BELUM_LUNAS').length,
      lunas: semua.filter(t => t.status === 'LUNAS').length,
      totalNominal: semua.filter(t => t.status === 'BELUM_LUNAS').reduce((s, t) => s + t.nominal, 0),
    }

    return NextResponse.json({ data: semua, stats })
  } catch (error) {
    console.error('[WALI_TAGIHAN_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
