import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const hash = await bcrypt.hash('demo1234', 10)

// TENANT
const tenant = await prisma.tenant.upsert({
  where: { slug: 'demo' },
  update: {},
  create: {
    nama: 'SMK Nusantara 1', slug: 'demo',
    alamat: 'Jl. Pendidikan No. 123, Jakarta Selatan',
    telepon: '021-12345678', email: 'info@smknusantara1.sch.id',
    paket: 'PRO', isActive: true,
  },
})
console.log('✅ Tenant:', tenant.nama)

// USERS
const upsertUser = (username, nama, email, role) =>
  prisma.user.upsert({
    where: { tenantId_username: { tenantId: tenant.id, username } },
    update: {},
    create: { tenantId: tenant.id, nama, email, username, passwordHash: hash, role, isActive: true },
  })

const admin = await upsertUser('admin', 'Administrator', 'admin@demo.id', 'ADMIN')
await upsertUser('keuangan', 'Staff Keuangan', 'keuangan@demo.id', 'KEUANGAN')
const wali1 = await upsertUser('wali.ahmad', 'Bapak Suryadi', 'wali.ahmad@demo.id', 'WALI')
const wali2 = await upsertUser('wali.siti', 'Ibu Rahayu', 'wali.siti@demo.id', 'WALI')
const wali3 = await upsertUser('wali.budi', 'Bapak Hendra', 'wali.budi@demo.id', 'WALI')
console.log('✅ Users: admin, keuangan, 3 wali (password: demo1234)')

// UNIT & TAHUN AJARAN
const unit = await prisma.unit.upsert({
  where: { tenantId_kode: { tenantId: tenant.id, kode: 'SMA' } },
  update: {},
  create: { tenantId: tenant.id, nama: 'SMA', kode: 'SMA', isActive: true },
})
const ta = await prisma.tahunAjaran.upsert({
  where: { tenantId_nama: { tenantId: tenant.id, nama: '2025/2026' } },
  update: { isActive: true },
  create: {
    tenantId: tenant.id, nama: '2025/2026',
    tanggalMulai: new Date('2025-07-14'), tanggalSelesai: new Date('2026-06-30'), isActive: true,
  },
})
console.log('✅ Unit & Tahun Ajaran')

// KELAS
const kelasNames = ['X-IPA-1', 'X-IPS-1', 'XI-IPA-1', 'XI-IPS-1', 'XII-IPA-1']
const kelasMap = {}
for (const nama of kelasNames) {
  let k = await prisma.kelas.findFirst({ where: { tenantId: tenant.id, nama } })
  if (!k) k = await prisma.kelas.create({
    data: { tenantId: tenant.id, unitId: unit.id, tahunAjaranId: ta.id, nama, tingkat: nama.split('-')[0], kapasitas: 36 },
  })
  kelasMap[nama] = k
}
console.log('✅ Kelas:', kelasNames.join(', '))

// KATEGORI TAGIHAN
const katSPP = await prisma.kategoriTagihan.upsert({
  where: { tenantId_kode: { tenantId: tenant.id, kode: 'SPP' } },
  update: {},
  create: { tenantId: tenant.id, nama: 'SPP Bulanan', kode: 'SPP', isBulanan: true, isActive: true },
})
await prisma.kategoriTagihan.upsert({
  where: { tenantId_kode: { tenantId: tenant.id, kode: 'BUKU' } },
  update: {},
  create: { tenantId: tenant.id, nama: 'Buku & LKS', kode: 'BUKU', isBulanan: false, isActive: true },
})

// REKENING
let rekening = await prisma.rekening.findFirst({ where: { tenantId: tenant.id } })
if (!rekening) rekening = await prisma.rekening.create({
  data: { tenantId: tenant.id, namaBank: 'Bank BCA', noRekening: '1234567890', atasNama: 'SMK Nusantara 1', isActive: true },
})
console.log('✅ Kategori Tagihan & Rekening')

// SISWA
const siswaData = [
  { nis: '10001', nama: 'Ahmad Fauzi', userId: wali1.id, wali: 'Bapak Suryadi', emailWali: wali1.email },
  { nis: '10002', nama: 'Siti Rahmawati', userId: wali2.id, wali: 'Ibu Rahayu', emailWali: wali2.email },
  { nis: '10003', nama: 'Budi Santoso', userId: wali3.id, wali: 'Bapak Hendra', emailWali: wali3.email },
  { nis: '10004', nama: 'Dewi Anggraini', userId: null, wali: 'Ibu Sari', emailWali: null },
  { nis: '10005', nama: 'Rizky Pratama', userId: null, wali: 'Bapak Joko', emailWali: null },
  { nis: '10006', nama: 'Aisyah Putri', userId: null, wali: 'Ibu Wati', emailWali: null },
]
const siswas = []
for (const s of siswaData) {
  const siswa = await prisma.siswa.upsert({
    where: { tenantId_nis: { tenantId: tenant.id, nis: s.nis } },
    update: {},
    create: {
      tenantId: tenant.id, kelasId: kelasMap['X-IPA-1'].id, unitId: unit.id,
      userId: s.userId, nis: s.nis, namaLengkap: s.nama,
      namaWali: s.wali, teleponWali: '08123456789', emailWali: s.emailWali, status: 'AKTIF',
    },
  })
  siswas.push(siswa)
}
console.log('✅ Siswa:', siswas.length)

// TAGIHAN & PEMBAYARAN
const bulanList = [
  { nama: 'Januari', tgl: '2026-01' }, { nama: 'Februari', tgl: '2026-02' }, { nama: 'Maret', tgl: '2026-03' },
]
let tagihanCount = 0, bayarCount = 0
for (const siswa of siswas) {
  for (let i = 0; i < bulanList.length; i++) {
    const b = bulanList[i]
    const lunas = i < 2
    const tagihan = await prisma.tagihan.create({
      data: {
        tenantId: tenant.id, siswaId: siswa.id, kategoriId: katSPP.id,
        tahunAjaranId: ta.id, bulan: b.nama, nominal: 500000, potongan: 0, total: 500000,
        status: lunas ? 'LUNAS' : 'BELUM_LUNAS',
        jatuhTempo: new Date(`${b.tgl}-10`),
      },
    })
    tagihanCount++
    if (lunas) {
      await prisma.pembayaran.create({
        data: {
          tenantId: tenant.id, tagihanId: tagihan.id, petugasId: admin.id, rekeningId: rekening.id,
          noTransaksi: `TRX-${siswa.nis}-${b.nama.substring(0,3).toUpperCase()}`,
          jumlahBayar: 500000, metode: 'TUNAI', status: 'BERHASIL',
          tanggalBayar: new Date(`${b.tgl}-05`),
        },
      })
      bayarCount++
    }
  }
}
console.log(`✅ Tagihan: ${tagihanCount}, Pembayaran: ${bayarCount}`)

await prisma.$disconnect()
console.log('\n🎉 Seed demo selesai!')
console.log('   admin      / demo1234  → ADMIN')
console.log('   keuangan   / demo1234  → KEUANGAN')
console.log('   wali.ahmad / demo1234  → WALI (Ahmad Fauzi)')
console.log('   wali.siti  / demo1234  → WALI (Siti Rahmawati)')
console.log('   wali.budi  / demo1234  → WALI (Budi Santoso)')
