import 'dotenv/config'
import { PrismaClient } from '.prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db'
const adapter = new PrismaLibSql({ url: dbUrl })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create Demo Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      nama: 'SMK Nusantara 1',
      slug: 'demo',
      alamat: 'Jl. Pendidikan No. 123, Jakarta Selatan',
      telepon: '021-12345678',
      email: 'info@smknusantara1.sch.id',
      website: 'https://smknusantara1.sch.id',
      paket: 'PRO',
      isActive: true,
    },
  })
  console.log(`✅ Tenant: ${tenant.nama} (${tenant.slug})`)

  // 2. Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { tenantId_username: { tenantId: tenant.id, username: 'admin' } },
    update: {},
    create: {
      tenantId: tenant.id,
      nama: 'Administrator',
      email: 'admin@smknusantara1.sch.id',
      username: 'admin',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })
  console.log(`✅ User: ${admin.nama} (${admin.username} / admin123)`)

  // 3. Create Keuangan User
  const keuangan = await prisma.user.upsert({
    where: { tenantId_username: { tenantId: tenant.id, username: 'keuangan' } },
    update: {},
    create: {
      tenantId: tenant.id,
      nama: 'Staff Keuangan',
      email: 'keuangan@smknusantara1.sch.id',
      username: 'keuangan',
      passwordHash: hashedPassword,
      role: 'KEUANGAN',
      isActive: true,
    },
  })
  console.log(`✅ User: ${keuangan.nama} (${keuangan.username} / admin123)`)

  // 4. Create Units
  const unitSMA = await prisma.unit.upsert({
    where: { tenantId_kode: { tenantId: tenant.id, kode: 'SMA' } },
    update: {},
    create: {
      tenantId: tenant.id,
      nama: 'SMA',
      kode: 'SMA',
      isActive: true,
    },
  })

  const unitSMK = await prisma.unit.upsert({
    where: { tenantId_kode: { tenantId: tenant.id, kode: 'SMK' } },
    update: {},
    create: {
      tenantId: tenant.id,
      nama: 'SMK',
      kode: 'SMK',
      isActive: true,
    },
  })
  console.log(`✅ Units: ${unitSMA.nama}, ${unitSMK.nama}`)

  // 5. Create Tahun Ajaran
  const tahunAjaran = await prisma.tahunAjaran.upsert({
    where: { tenantId_nama: { tenantId: tenant.id, nama: '2025/2026' } },
    update: {},
    create: {
      tenantId: tenant.id,
      nama: '2025/2026',
      tanggalMulai: new Date('2025-07-14'),
      tanggalSelesai: new Date('2026-06-30'),
      isActive: true,
    },
  })
  console.log(`✅ Tahun Ajaran: ${tahunAjaran.nama}`)

  // 6. Create Kelas
  const kelasData = [
    { nama: 'X-IPA-1', tingkat: 'X' },
    { nama: 'X-IPA-2', tingkat: 'X' },
    { nama: 'X-IPS-1', tingkat: 'X' },
    { nama: 'XI-IPA-1', tingkat: 'XI' },
    { nama: 'XI-IPS-1', tingkat: 'XI' },
    { nama: 'XII-IPA-1', tingkat: 'XII' },
  ]

  for (const k of kelasData) {
    await prisma.kelas.create({
      data: {
        tenantId: tenant.id,
        unitId: unitSMA.id,
        tahunAjaranId: tahunAjaran.id,
        nama: k.nama,
        tingkat: k.tingkat,
        kapasitas: 36,
      },
    })
  }
  console.log(`✅ Kelas: ${kelasData.length} kelas dibuat`)

  // 7. Get first kelas for siswa
  const kelas = await prisma.kelas.findFirst({
    where: { tenantId: tenant.id, nama: 'X-IPA-1' },
  })

  // 8. Create Sample Siswa
  const siswaData = [
    { nis: '10001', nama: 'Ahmad Fauzi', jk: 'LAKI_LAKI' as const },
    { nis: '10002', nama: 'Siti Nurhaliza', jk: 'PEREMPUAN' as const },
    { nis: '10003', nama: 'Budi Santoso', jk: 'LAKI_LAKI' as const },
    { nis: '10004', nama: 'Dewi Anggraini', jk: 'PEREMPUAN' as const },
    { nis: '10005', nama: 'Rizky Pratama', jk: 'LAKI_LAKI' as const },
    { nis: '10006', nama: 'Aisyah Putri', jk: 'PEREMPUAN' as const },
    { nis: '10007', nama: 'Fajar Nugroho', jk: 'LAKI_LAKI' as const },
    { nis: '10008', nama: 'Lestari Wulandari', jk: 'PEREMPUAN' as const },
    { nis: '10009', nama: 'Dimas Prayoga', jk: 'LAKI_LAKI' as const },
    { nis: '10010', nama: 'Kartini Sari', jk: 'PEREMPUAN' as const },
  ]

  for (const s of siswaData) {
    await prisma.siswa.upsert({
      where: { tenantId_nis: { tenantId: tenant.id, nis: s.nis } },
      update: {},
      create: {
        tenantId: tenant.id,
        kelasId: kelas?.id,
        unitId: unitSMA.id,
        nis: s.nis,
        namaLengkap: s.nama,
        jenisKelamin: s.jk,
        namaWali: `Wali ${s.nama}`,
        teleponWali: '08123456789',
        status: 'AKTIF',
      },
    })
  }
  console.log(`✅ Siswa: ${siswaData.length} siswa dibuat`)

  // 9. Create Kategori Tagihan
  const kategoriData = [
    { nama: 'SPP', kode: 'SPP', isBulanan: true },
    { nama: 'Buku', kode: 'BUKU', isBulanan: false },
    { nama: 'Kegiatan', kode: 'KEGIATAN', isBulanan: false },
    { nama: 'Seragam', kode: 'SERAGAM', isBulanan: false },
    { nama: 'Ujian', kode: 'UJIAN', isBulanan: false },
  ]

  for (const k of kategoriData) {
    await prisma.kategoriTagihan.upsert({
      where: { tenantId_kode: { tenantId: tenant.id, kode: k.kode } },
      update: {},
      create: {
        tenantId: tenant.id,
        nama: k.nama,
        kode: k.kode,
        isBulanan: k.isBulanan,
        isActive: true,
      },
    })
  }
  console.log(`✅ Kategori Tagihan: ${kategoriData.length} kategori`)

  // 10. Create Rekening
  await prisma.rekening.create({
    data: {
      tenantId: tenant.id,
      namaBank: 'Bank BCA',
      noRekening: '1234567890',
      atasNama: 'SMK Nusantara 1',
      isActive: true,
    },
  })
  await prisma.rekening.create({
    data: {
      tenantId: tenant.id,
      namaBank: 'Bank Mandiri',
      noRekening: '0987654321',
      atasNama: 'SMK Nusantara 1',
      isActive: true,
    },
  })
  console.log(`✅ Rekening: 2 rekening dibuat`)

  // 11. Create Akun Kas
  await prisma.akunKas.upsert({
    where: { tenantId_kode: { tenantId: tenant.id, kode: 'KAS-SPP' } },
    update: {},
    create: {
      tenantId: tenant.id,
      nama: 'Kas SPP',
      kode: 'KAS-SPP',
      tipe: 'PEMASUKAN',
      isActive: true,
    },
  })
  await prisma.akunKas.upsert({
    where: { tenantId_kode: { tenantId: tenant.id, kode: 'KAS-OPS' } },
    update: {},
    create: {
      tenantId: tenant.id,
      nama: 'Kas Operasional',
      kode: 'KAS-OPS',
      tipe: 'PENGELUARAN',
      isActive: true,
    },
  })
  console.log(`✅ Akun Kas: 2 akun kas dibuat`)

  console.log('\n🎉 Seeding selesai!')
  console.log('📌 Login: admin / admin123')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
