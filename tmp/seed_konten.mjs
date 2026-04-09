import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const tenant = await prisma.tenant.findUnique({ where: { slug: 'demo' } })
if (!tenant) { console.error('❌ Tenant demo tidak ditemukan. Jalankan seed_demo.mjs dulu.'); process.exit(1) }

const admin = await prisma.user.findFirst({ where: { tenantId: tenant.id, username: 'admin' } })

// BERITA
const beritas = [
  { judul: 'Selamat Datang di SMK Nusantara 1', slug: 'selamat-datang', ringkasan: 'Portal resmi SMK Nusantara 1 kini hadir secara online.', konten: '<p>Kami dengan bangga mempersembahkan portal resmi SMK Nusantara 1. Melalui portal ini, orang tua dan siswa dapat mengakses informasi sekolah, tagihan, dan pengumuman secara mudah.</p>', kategori: 'BERITA' },
  { judul: 'Pendaftaran PPDB 2026/2027 Dibuka', slug: 'ppdb-2026-2027', ringkasan: 'Pendaftaran peserta didik baru tahun ajaran 2026/2027 resmi dibuka mulai 1 Mei 2026.', konten: '<p>SMK Nusantara 1 membuka pendaftaran peserta didik baru untuk tahun ajaran 2026/2027. Pendaftaran dapat dilakukan secara online melalui portal PPDB kami.</p><p>Kuota tersedia: 120 siswa untuk 4 kelas.</p>', kategori: 'BERITA' },
  { judul: 'Siswa Raih Juara 1 Olimpiade Matematika', slug: 'juara-olimpiade-matematika', ringkasan: 'Ahmad Fauzi berhasil meraih juara 1 Olimpiade Matematika tingkat provinsi.', konten: '<p>Kebanggaan bagi SMK Nusantara 1! Ahmad Fauzi, siswa kelas X-IPA-1, berhasil meraih juara 1 pada Olimpiade Matematika tingkat Provinsi DKI Jakarta yang diselenggarakan pada 5 April 2026.</p>', kategori: 'PRESTASI' },
]
for (const b of beritas) {
  await prisma.berita.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: b.slug } },
    update: {},
    create: { tenantId: tenant.id, userId: admin.id, ...b, status: 'TERBIT', tanggalTerbit: new Date() },
  })
}
console.log('✅ Berita:', beritas.length)

// PENGUMUMAN
await prisma.pengumuman.createMany({
  data: [
    { tenantId: tenant.id, userId: admin.id, judul: 'Pembayaran SPP Maret 2026', konten: 'Harap segera melunasi SPP bulan Maret 2026 sebelum tanggal 10 April 2026. Pembayaran dapat dilakukan melalui transfer bank atau langsung ke bagian keuangan.', tanggal: new Date() },
    { tenantId: tenant.id, userId: admin.id, judul: 'Libur Hari Raya Idul Fitri', konten: 'Sekolah akan libur pada tanggal 28 Maret - 7 April 2026 dalam rangka Hari Raya Idul Fitri 1447 H. Kegiatan belajar mengajar kembali normal pada 8 April 2026.', tanggal: new Date() },
  ],
  skipDuplicates: true,
})
console.log('✅ Pengumuman: 2')

// AGENDA
await prisma.agenda.createMany({
  data: [
    { tenantId: tenant.id, judul: 'Ujian Tengah Semester Genap', deskripsi: 'Ujian Tengah Semester untuk semua kelas', tanggalMulai: new Date('2026-04-20'), tanggalAkhir: new Date('2026-04-25'), lokasi: 'Ruang Kelas', penanggungjawab: 'Wakasek Kurikulum', isPublished: true },
    { tenantId: tenant.id, judul: 'Rapat Wali Murid', deskripsi: 'Rapat wali murid semester genap membahas perkembangan siswa', tanggalMulai: new Date('2026-05-03'), lokasi: 'Aula Sekolah', penanggungjawab: 'Kepala Sekolah', isPublished: true },
    { tenantId: tenant.id, judul: 'Pentas Seni Akhir Tahun', deskripsi: 'Penampilan seni siswa dalam rangka akhir tahun ajaran', tanggalMulai: new Date('2026-06-15'), tanggalAkhir: new Date('2026-06-16'), lokasi: 'Lapangan Sekolah', penanggungjawab: 'OSIS', isPublished: true },
  ],
  skipDuplicates: true,
})
console.log('✅ Agenda: 3')

// PRESTASI
await prisma.prestasi.createMany({
  data: [
    { tenantId: tenant.id, judul: 'Juara 1 Olimpiade Matematika Provinsi', deskripsi: 'Ahmad Fauzi meraih juara 1 olimpiade matematika tingkat provinsi DKI Jakarta', tingkat: 'PROVINSI', kategori: 'AKADEMIK', tahun: 2026, isPublished: true },
    { tenantId: tenant.id, judul: 'Juara 2 Lomba Debat Bahasa Inggris', deskripsi: 'Tim debat SMK Nusantara 1 meraih juara 2 tingkat kota', tingkat: 'KOTA', kategori: 'AKADEMIK', tahun: 2025, isPublished: true },
    { tenantId: tenant.id, judul: 'Juara 1 Futsal Antar Sekolah', deskripsi: 'Tim futsal putra meraih juara 1 turnamen antar sekolah se-Jakarta Selatan', tingkat: 'KOTA', kategori: 'OLAHRAGA', tahun: 2025, isPublished: true },
  ],
  skipDuplicates: true,
})
console.log('✅ Prestasi: 3')

// EKSKUL
await prisma.ekskul.createMany({
  data: [
    { tenantId: tenant.id, nama: 'Pramuka', deskripsi: 'Kegiatan kepramukaan untuk membentuk karakter siswa', jadwal: 'Jumat, 14.00-16.00', pembina: 'Bpk. Agus Salim', isActive: true },
    { tenantId: tenant.id, nama: 'Futsal', deskripsi: 'Olahraga futsal untuk siswa putra', jadwal: 'Sabtu, 08.00-10.00', pembina: 'Bpk. Doni Setiawan', isActive: true },
    { tenantId: tenant.id, nama: 'English Club', deskripsi: 'Klub bahasa Inggris untuk meningkatkan kemampuan berbahasa', jadwal: 'Rabu, 14.00-15.30', pembina: 'Ibu Rina Marlina', isActive: true },
    { tenantId: tenant.id, nama: 'Seni Tari', deskripsi: 'Kegiatan seni tari tradisional dan modern', jadwal: 'Kamis, 14.00-16.00', pembina: 'Ibu Dewi Kusuma', isActive: true },
  ],
  skipDuplicates: true,
})
console.log('✅ Ekskul: 4')

// FASILITAS
await prisma.fasilitas.createMany({
  data: [
    { tenantId: tenant.id, nama: 'Laboratorium Komputer', deskripsi: '40 unit komputer dengan koneksi internet berkecepatan tinggi', isPublished: true },
    { tenantId: tenant.id, nama: 'Perpustakaan Digital', deskripsi: 'Koleksi lebih dari 5.000 buku fisik dan akses e-book', isPublished: true },
    { tenantId: tenant.id, nama: 'Lapangan Olahraga', deskripsi: 'Lapangan futsal, basket, dan voli yang representatif', isPublished: true },
    { tenantId: tenant.id, nama: 'Aula Serbaguna', deskripsi: 'Kapasitas 500 orang, dilengkapi sound system dan proyektor', isPublished: true },
  ],
  skipDuplicates: true,
})
console.log('✅ Fasilitas: 4')

// ALUMNI
await prisma.alumni.createMany({
  data: [
    { tenantId: tenant.id, namaLengkap: 'Rudi Hartono', tahunLulus: 2023, melanjutkanKe: 'Universitas Indonesia', pekerjaan: 'Mahasiswa', testimonial: 'SMK Nusantara 1 memberikan fondasi yang kuat untuk karir saya.', status: 'TERVERIFIKASI' },
    { tenantId: tenant.id, namaLengkap: 'Maya Sari', tahunLulus: 2022, melanjutkanKe: 'Universitas Gadjah Mada', pekerjaan: 'Mahasiswa', testimonial: 'Guru-guru di sini sangat berdedikasi dan selalu mendukung siswa.', status: 'TERVERIFIKASI' },
    { tenantId: tenant.id, namaLengkap: 'Andi Wijaya', tahunLulus: 2021, pekerjaan: 'Software Engineer', instansi: 'PT Tokopedia', testimonial: 'Pendidikan di SMK Nusantara 1 sangat relevan dengan dunia kerja.', status: 'TERVERIFIKASI' },
  ],
  skipDuplicates: true,
})
console.log('✅ Alumni: 3')

await prisma.$disconnect()
console.log('\n🎉 Seed konten selesai!')
