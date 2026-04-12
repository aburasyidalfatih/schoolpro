import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { derivePpdbWorkflow } from '@/features/ppdb/lib/ppdb-workflow'

type SessionUser = {
  id: string
  tenantId?: string | null
}

type InvoicePembayaran = {
  id: string
  status: string
}

type InvoiceTagihan = {
  id: string
  jenis: string
  status: string
  nominal: Prisma.Decimal
  createdAt: Date
  pembayarans: InvoicePembayaran[]
}

type InvoicePendaftar = {
  id: string
  userId: string | null
  noPendaftaran: string
  namaLengkap: string
  status: string
  dataFormulir?: unknown
  dataOrangtua?: unknown
  createdAt: Date
  periode: {
    nama: string
    unit: {
      nama: string
    } | null
    persyaratanBerkas: {
      id: string
      isWajib: boolean
    }[]
  }
  berkas: {
    persyaratanId: string
    status: string
    persyaratan?: {
      isWajib?: boolean
    } | null
  }[]
  tagihanPpdbs: InvoiceTagihan[]
}

function pickActiveTagihan(tagihanPpdbs: InvoiceTagihan[]) {
  const ordered = [...tagihanPpdbs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    ordered.find((t) => t.jenis === 'PENDAFTARAN' && t.status !== 'LUNAS') ??
    ordered.find((t) => t.jenis === 'DAFTAR_ULANG' && t.status !== 'LUNAS') ??
    ordered[0] ??
    null
  )
}

// GET — data invoice untuk halaman pembayaran pendaftar
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const userSession = session.user as SessionUser
    const tenantId = userSession.tenantId
    const userId = session.user.id

    if (!tenantId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const pendaftar = (await prisma.pendaftarPpdb.findFirst({
      where: { id, tenantId, userId },
      include: {
        periode: {
          include: {
            unit: true,
            persyaratanBerkas: {
              select: {
                id: true,
                isWajib: true,
              },
            },
          },
        },
        berkas: {
          include: {
            persyaratan: {
              select: {
                isWajib: true,
              },
            },
          },
        },
        tagihanPpdbs: {
          orderBy: { createdAt: 'desc' },
          include: { pembayarans: { orderBy: { createdAt: 'desc' } } },
        },
      },
    })) as InvoicePendaftar | null

    if (!pendaftar) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    const tagihan = pickActiveTagihan(pendaftar.tagihanPpdbs)
    const syncedStudent = await prisma.siswa.findFirst({
      where: {
        tenantId,
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

    const rekenings = await prisma.rekening.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ namaBank: 'asc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json({ data: { pendaftar, tagihan, rekenings, workflow } })
  } catch (error) {
    console.error('[INVOICE_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
