import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getTenantBySlug } from '@/lib/tenant'
import { prisma } from '@/lib/db/prisma'
import { derivePpdbWorkflow } from '@/features/ppdb/lib/ppdb-workflow'

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
        dataOrangtua: true,
        tagihanPpdbs: {
          select: {
            jenis: true,
            status: true,
            pembayarans: {
              select: { status: true },
            },
          },
        },
        berkas: {
          select: {
            persyaratanId: true,
            status: true,
            persyaratan: {
              select: {
                isWajib: true,
              },
            },
          },
        },
        periode: {
          select: {
            nama: true,
            unit: { select: { nama: true } },
            persyaratanBerkas: {
              select: {
                id: true,
                isWajib: true,
              },
            },
          },
        },
      },
    })

    if (!pendaftar) return NextResponse.json({ error: 'Nomor pendaftaran tidak ditemukan' }, { status: 404 })

    const syncedStudent = await prisma.siswa.findFirst({
      where: {
        tenantId: tenant.id,
        dataTambahan: {
          path: ['sumberPpdb'],
          equals: pendaftar.noPendaftaran,
        },
      },
      select: { id: true },
    })

    const workflow = derivePpdbWorkflow(pendaftar, {
      isSyncedToStudent: !!syncedStudent,
    })

    // Hanya expose data yang aman (tidak ada data pribadi sensitif)
    const pengumuman = (pendaftar.dataFormulir as { pengumuman?: unknown } | null)?.pengumuman || null

    return NextResponse.json({
      data: {
        noPendaftaran: pendaftar.noPendaftaran,
        namaLengkap: pendaftar.namaLengkap,
        status: pendaftar.status,
        tanggalDaftar: pendaftar.tanggalDaftar,
        periode: pendaftar.periode,
        pengumuman,
        workflow: {
          state: workflow.state,
          label: workflow.label,
          description: workflow.description,
          nextAction: workflow.nextAction,
          flags: workflow.flags,
        },
      },
    })
  } catch (error) {
    console.error('[CEK_STATUS]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
