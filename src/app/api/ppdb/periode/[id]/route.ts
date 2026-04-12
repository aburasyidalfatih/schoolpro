import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { getSessionUser, hasAnyRole } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

function getPengaturanRecord(value: Prisma.JsonValue | null): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = getSessionUser(session)
    const tenantId = userSession?.tenantId
    if (!tenantId || !hasAnyRole(userSession, ['SUPER_ADMIN', 'ADMIN', 'PPDB'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { 
      nama, tahunAjaranId, unitId, tanggalBuka, tanggalTutup,
      biayaPendaftaran, isActive, pengaturan
    } = body

    const existing = await prisma.periodePpdb.findFirst({ where: { id, tenantId } })
    if (!existing) return NextResponse.json({ error: 'Gelombang tidak ditemukan' }, { status: 404 })

    // Merge pengaturan — support update partial atau full object
    const existingPengaturan = getPengaturanRecord(existing.pengaturan)
    const newPengaturan = pengaturan
      ? { ...existingPengaturan, ...pengaturan }
      : {
          ...existingPengaturan,
          biayaPendaftaran: biayaPendaftaran !== undefined
            ? Number(biayaPendaftaran)
            : existingPengaturan.biayaPendaftaran,
        }

    const updated = await prisma.periodePpdb.update({
      where: { id },
      data: {
        nama: nama || existing.nama,
        tahunAjaranId: tahunAjaranId || existing.tahunAjaranId,
        unitId: unitId !== undefined ? unitId : existing.unitId,
        tanggalBuka: tanggalBuka ? new Date(tanggalBuka) : existing.tanggalBuka,
        tanggalTutup: tanggalTutup ? new Date(tanggalTutup) : existing.tanggalTutup,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        pengaturan: newPengaturan,
      },
    })

    return NextResponse.json({ 
      data: updated, 
      message: 'Gelombang PPDB berhasil diupdate' 
    })
  } catch (error) {
    console.error('[PPDB_PERIODE_PUT]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = getSessionUser(session)
    const tenantId = userSession?.tenantId
    if (!tenantId || !hasAnyRole(userSession, ['SUPER_ADMIN', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const existing = await prisma.periodePpdb.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { pendaftars: true } } }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Gelombang tidak ditemukan' }, { status: 404 })
    }

    if (existing._count.pendaftars > 0) {
      return NextResponse.json({ 
        error: 'Tidak bisa menghapus gelombang yang sudah memiliki pendaftar' 
      }, { status: 400 })
    }

    await prisma.periodePpdb.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Gelombang PPDB berhasil dihapus' })
  } catch (error) {
    console.error('[PPDB_PERIODE_DELETE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
