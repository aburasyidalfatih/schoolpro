import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getTenantBySlug } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

// GET publik — cek status pendaftaran berdasarkan nomor pendaftaran
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const no = searchParams.get('no')

    if (!no) return NextResponse.json({ error: 'Nomor pendaftaran wajib diisi' }, { status: 400 })

    const headerList = await headers()
    const tenantSlug = headerList.get('x-tenant-slug') || 'demo'
    const tenant = await getTenantBySlug(tenantSlug)
    if (!tenant) return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 404 })

    const pendaftar = await prisma.pendaftarPpdb.findFirst({
      where: { noPendaftaran: no, tenantId: tenant.id },
      select: {
        noPendaftaran: true,
        namaLengkap: true,
        status: true,
        tanggalDaftar: true,
        dataFormulir: true,
        periode: { select: { nama: true, unit: { select: { nama: true } } } },
      },
    })

    if (!pendaftar) return NextResponse.json({ error: 'Nomor pendaftaran tidak ditemukan' }, { status: 404 })

    // Hanya expose data yang aman (tidak ada data pribadi sensitif)
    const pengumuman = (pendaftar.dataFormulir as any)?.pengumuman || null

    return NextResponse.json({
      data: {
        noPendaftaran: pendaftar.noPendaftaran,
        namaLengkap: pendaftar.namaLengkap,
        status: pendaftar.status,
        tanggalDaftar: pendaftar.tanggalDaftar,
        periode: pendaftar.periode,
        pengumuman,
      },
    })
  } catch (error) {
    console.error('[CEK_STATUS]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
