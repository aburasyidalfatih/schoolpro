import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const tenantId = 'c4c81d97-d574-40d0-b91e-d0150f47412e'
const tahunAjaranId = '4efc6dfd-04f2-4099-8fa6-805b5a9f8bda'
const unitId = 'ea2b9754-7266-445f-bd95-88a8207a1f4c'
const passwordHash = '$2b$12$w9JtjAHdYk1VhFkm/Ni0W./CvJtMNKz3uLU3XDUWAL5grxzuepYLG'

async function main() {
  const periode = await prisma.periodePpdb.upsert({
    where: { id: 'ppdb-demo-2026' },
    update: {},
    create: {
      id: 'ppdb-demo-2026',
      tenantId,
      tahunAjaranId,
      unitId,
      nama: 'PPDB 2026 Gelombang 1',
      tanggalBuka: new Date('2026-01-01T00:00:00.000Z'),
      tanggalTutup: new Date('2026-12-31T23:59:59.000Z'),
      isActive: true,
    },
  })

  const user = await prisma.user.upsert({
    where: {
      tenantId_username: {
        tenantId,
        username: 'wali.demo',
      },
    },
    update: {
      nama: 'Demo Orang Tua',
      email: 'wali.demo@sispro.kelasmaster.id',
      role: 'WALI',
      isActive: true,
      passwordHash,
    },
    create: {
      id: 'user-wali-demo',
      tenantId,
      nama: 'Demo Orang Tua',
      email: 'wali.demo@sispro.kelasmaster.id',
      username: 'wali.demo',
      passwordHash,
      role: 'WALI',
      isActive: true,
    },
  })

  const pendaftar = await prisma.pendaftarPpdb.upsert({
    where: {
      tenantId_noPendaftaran: {
        tenantId,
        noPendaftaran: 'PPDB-2026-0001',
      },
    },
    update: {
      userId: user.id,
      periodeId: periode.id,
      namaLengkap: 'Ananda Demo',
      status: 'MENUNGGU',
      dataOrangtua: {
        namaAyah: 'Demo Ayah',
        namaIbu: 'Demo Ibu',
        teleponAyah: '081234567890',
        teleponIbu: '081234567891',
        email: 'wali.demo@sispro.kelasmaster.id',
      },
    },
    create: {
      id: 'pendaftar-wali-demo',
      tenantId,
      periodeId: periode.id,
      userId: user.id,
      noPendaftaran: 'PPDB-2026-0001',
      namaLengkap: 'Ananda Demo',
      status: 'MENUNGGU',
      dataOrangtua: {
        namaAyah: 'Demo Ayah',
        namaIbu: 'Demo Ibu',
        teleponAyah: '081234567890',
        teleponIbu: '081234567891',
        email: 'wali.demo@sispro.kelasmaster.id',
      },
    },
  })

  const existingTagihan = await prisma.tagihanPpdb.findFirst({
    where: {
      pendaftarId: pendaftar.id,
      jenis: 'PENDAFTARAN',
    },
  })

  if (!existingTagihan) {
    await prisma.tagihanPpdb.create({
      data: {
        id: 'tagihan-wali-demo',
        tenantId,
        pendaftarId: pendaftar.id,
        jenis: 'PENDAFTARAN',
        nominal: 250000,
        status: 'BELUM_LUNAS',
      },
    })
  }

  console.log(
    JSON.stringify(
      {
        user: {
          username: user.username,
          role: user.role,
        },
        pendaftar: {
          noPendaftaran: pendaftar.noPendaftaran,
          namaLengkap: pendaftar.namaLengkap,
        },
        periode: {
          nama: periode.nama,
        },
      },
      null,
      2
    )
  )
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
