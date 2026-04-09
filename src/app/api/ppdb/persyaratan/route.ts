import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const periodeId = searchParams.get('periodeId')

    const userSession = session.user as any
    const tenantId = userSession.tenantId

    if (!periodeId) {
      return NextResponse.json({ error: 'Periode ID wajib diisi' }, { status: 400 })
    }

    const persyaratan = await prisma.persyaratanBerkas.findMany({
      where: { 
        tenantId,
        periodeId 
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ data: persyaratan })
  } catch (error) {
    console.error('[PPDB_PERSYARATAN_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = session.user as any
    const tenantId = userSession.tenantId

    if (userSession.role !== 'SUPER_ADMIN' && userSession.role !== 'ADMIN' && userSession.role !== 'PPDB') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { periodeId, nama, isWajib, tipeFile } = body

    if (!periodeId || !nama) {
      return NextResponse.json({ error: 'Periode dan Nama persyaratan wajib diisi' }, { status: 400 })
    }

    const newPersyaratan = await prisma.persyaratanBerkas.create({
      data: {
        tenantId,
        periodeId,
        nama,
        isWajib: isWajib ?? true,
        tipeFile: tipeFile || 'image/jpeg,image/png,application/pdf'
      }
    })

    return NextResponse.json({ 
      data: newPersyaratan, 
      message: 'Persyaratan berkas berhasil ditambahkan' 
    }, { status: 201 })
  } catch (error) {
    console.error('[PPDB_PERSYARATAN_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
