import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userSession = session.user as any

    const tagihan = await prisma.tagihan.findUnique({
      where: { id, tenantId: userSession.tenantId },
      include: {
        siswa: true,
        kategori: true,
        tahunAjaran: true,
        pembayarans: true
      }
    })

    if (!tagihan) {
      return NextResponse.json({ error: 'Tagihan tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: tagihan })
  } catch (error) {
    console.error('[TAGIHAN_ID_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userSession = session.user as any
    if (userSession.role !== 'SUPER_ADMIN' && userSession.role !== 'ADMIN' && userSession.role !== 'KEUANGAN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { nominal, keterangan, jatuhTempo, status } = body

    // Optional: Add logic to prevent editing nominal if some payments exist 
    // (though in "pro" mode we might allow it with recalculation of 'total')

    const updated = await prisma.tagihan.update({
      where: { id, tenantId: userSession.tenantId },
      data: {
        nominal: nominal ? parseFloat(nominal) : undefined,
        total: nominal ? parseFloat(nominal) : undefined,
        keterangan,
        jatuhTempo: jatuhTempo ? new Date(jatuhTempo) : undefined,
        status: status || undefined
      }
    })

    return NextResponse.json({ data: updated, message: 'Tagihan berhasil diupdate' })
  } catch (error) {
    console.error('[TAGIHAN_ID_PUT]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userSession = session.user as any
    if (userSession.role !== 'SUPER_ADMIN' && userSession.role !== 'ADMIN' && userSession.role !== 'KEUANGAN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if tagihan has payments
    const paymentsCount = await prisma.pembayaran.count({
      where: { tagihanId: id }
    })

    if (paymentsCount > 0) {
      return NextResponse.json({ 
        error: 'Tagihan tidak bisa dihapus karena sudah memiliki data pembayaran' 
      }, { status: 400 })
    }

    await prisma.tagihan.delete({
      where: { id, tenantId: userSession.tenantId }
    })

    return NextResponse.json({ message: 'Tagihan berhasil dihapus' })
  } catch (error) {
    console.error('[TAGIHAN_ID_DELETE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
