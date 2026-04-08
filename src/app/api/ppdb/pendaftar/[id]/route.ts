import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PPDB']

// GET — detail satu pendaftar (admin atau pemilik)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const userSession = session.user as any
    const tenantId = userSession.tenantId

    const pendaftar = await prisma.pendaftarPpdb.findUnique({
      where: { id, tenantId },
      include: {
        periode: {
          include: {
            unit: true,
            tahunAjaran: true,
            persyaratanBerkas: true,
          },
        },
        tagihanPpdbs: true,
        berkas: { include: { persyaratan: true } },
        user: { select: { nama: true, email: true, username: true } },
      },
    })

    if (!pendaftar) return NextResponse.json({ error: 'Pendaftar tidak ditemukan' }, { status: 404 })

    // Non-admin hanya bisa lihat data miliknya sendiri
    const isAdmin = ADMIN_ROLES.includes(userSession.role)
    if (!isAdmin && pendaftar.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ data: pendaftar })
  } catch (error) {
    console.error('[PPDB_PENDAFTAR_GET_ID]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT — update data formulir lengkap (oleh user pemilik)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const userSession = session.user as any
    const tenantId = userSession.tenantId
    const body = await req.json()

    const pendaftar = await prisma.pendaftarPpdb.findUnique({ where: { id, tenantId } })
    if (!pendaftar) return NextResponse.json({ error: 'Pendaftar tidak ditemukan' }, { status: 404 })

    const isAdmin = ADMIN_ROLES.includes(userSession.role)
    if (!isAdmin && pendaftar.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { dataFormulir, dataOrangtua, jalurPendaftaran, jurusanPilihan } = body

    const updated = await prisma.pendaftarPpdb.update({
      where: { id },
      data: {
        dataFormulir: dataFormulir ?? pendaftar.dataFormulir,
        dataOrangtua: dataOrangtua ?? pendaftar.dataOrangtua,
        jalurPendaftaran: jalurPendaftaran ?? pendaftar.jalurPendaftaran,
        jurusanPilihan: jurusanPilihan ?? pendaftar.jurusanPilihan,
        // Jika form lengkap disubmit, ubah status ke TERVERIFIKASI (menunggu review admin)
        ...(dataFormulir && { status: 'TERVERIFIKASI' }),
      },
    })

    return NextResponse.json({ data: updated, message: 'Data formulir berhasil disimpan' })
  } catch (error) {
    console.error('[PPDB_PENDAFTAR_PUT]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
