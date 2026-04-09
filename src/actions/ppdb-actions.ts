'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function submitFormSingkat(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: 'Anda harus login terlebih dahulu' }

  const namaLengkap = formData.get('nama_lengkap') as string
  const periodeId = formData.get('periode_id') as string
  const unitId = formData.get('unit_id') as string

  if (!namaLengkap || !periodeId || !unitId) {
    return { error: 'Semua field wajib diisi' }
  }

  try {
    const tenantId = (session.user as any).tenantId

    // 1. Generate Nomor Pendaftaran (Simple Format: PPDB-YEAR-SEQ)
    const count = await prisma.pendaftarPpdb.count({
      where: { tenantId }
    })
    const noPendaftaran = `PPDB-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`

    // 2. Fetch Periode to get the fee
    const periode = await prisma.periodePpdb.findUnique({
      where: { id: periodeId }
    })

    if (!periode) return { error: 'Gelombang tidak valid' }

    // Validasi kuota
    const kuota = (periode.pengaturan as any)?.kuota
    if (kuota && Number(kuota) > 0) {
      const jumlahPendaftar = await prisma.pendaftarPpdb.count({
        where: { periodeId, tenantId }
      })
      if (jumlahPendaftar >= Number(kuota)) {
        return { error: `Kuota pendaftaran gelombang ini sudah penuh (${kuota} pendaftar)` }
      }
    }

    // 3. Create Pendaftar Record
    const pendaftar = await prisma.pendaftarPpdb.create({
      data: {
        tenantId,
        periodeId,
        userId: session.user.id,
        noPendaftaran,
        namaLengkap,
        status: 'MENUNGGU',
      }
    })

    // 4. Create Tagihan Pendaftaran (Biaya Formulir)
    // Ambil dari pengaturan periode
    const biayaPendaftaran = (periode.pengaturan as any)?.biayaPendaftaran
    const nominal = biayaPendaftaran && Number(biayaPendaftaran) > 0
      ? Number(biayaPendaftaran)
      : 150000 // fallback default

    await prisma.tagihanPpdb.create({
      data: {
        tenantId,
        pendaftarId: pendaftar.id,
        jenis: 'PENDAFTARAN',
        nominal,
        status: 'BELUM_LUNAS',
      }
    })

    revalidatePath('/app/dashboard')
    return { success: true, pendaftarId: pendaftar.id }
  } catch (err) {
    console.error('PPDB Form Singkat error:', err)
    return { error: 'Gagal menyimpan pendaftaran. Silakan coba lagi.' }
  }
}

export async function confirmPaymentManual(pendaftarId: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  try {
    const tenantId = (session.user as any).tenantId

    // Find the registration fee bill
    const tagihan = await prisma.tagihanPpdb.findFirst({
      where: {
        pendaftarId,
        tenantId,
        jenis: 'PENDAFTARAN'
      }
    })

    if (!tagihan) return { error: 'Tagihan tidak ditemukan' }
    if (tagihan.status === 'LUNAS') return { success: true, message: 'Sudah lunas' }

    // In a real scenario, we would wait for Admin verification.
    // For this flow, we will mark it as LUNAS to allow the user to proceed to Step 3.
    await prisma.tagihanPpdb.update({
      where: { id: tagihan.id },
      data: { status: 'LUNAS' }
    })

    // Log the activity
    await prisma.logAktivitas.create({
      data: {
        tenantId,
        userId: session.user.id,
        aksi: 'KONFIRMASI_BAYAR_PPDB',
        modul: 'PPDB',
        detail: `Konfirmasi pembayaran manual pendaftar ID: ${pendaftarId}`,
      }
    })

    revalidatePath('/app/beranda')
    return { success: true }
  } catch (err) {
    console.error('Confirm Payment error:', err)
    return { error: 'Gagal melakukan konfirmasi. Silakan hubungi admin.' }
  }
}
