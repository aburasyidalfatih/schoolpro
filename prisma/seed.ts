import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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

  // 12. Create Sliders
  const slidersData = [
    {
      judul: 'Penerimaan Peserta Didik Baru',
      subjudul: 'Tahun Ajaran 2025/2026 Segera Dibuka. Daftar sekarang juga!',
      gambarUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80',
      urutan: 1,
    },
    {
      judul: 'Fasilitas Modern & Lengkap',
      subjudul: 'Mendukung kenyamanan dan kualitas pembelajaran siswa.',
      gambarUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80',
      urutan: 2,
    },
  ]
  for (const sl of slidersData) {
    await prisma.slider.create({
      data: { ...sl, tenantId: tenant.id },
    })
  }
  console.log(`✅ Sliders: ${slidersData.length} item dibuat`)

  // 13. Create Agenda
  const agendaData = [
    {
      judul: 'Ujian Akhir Semester Ganjil',
      deskripsi: 'Pelaksanaan ujian akhir semester ganjil tahun ajaran 2025/2026',
      tanggalMulai: new Date('2025-12-05'),
      tanggalAkhir: new Date('2025-12-15'),
      lokasi: 'Ruang Kelas Masing-masing',
      kategori: 'Akademik',
    },
    {
      judul: 'Porseni Tingkat Sekolah',
      deskripsi: 'Pekan Olahraga dan Seni antar kelas',
      tanggalMulai: new Date('2025-10-20'),
      tanggalAkhir: new Date('2025-10-25'),
      lokasi: 'Lapangan Utama & Aula',
      kategori: 'Kegiatan',
    },
  ]
  for (const ag of agendaData) {
    await prisma.agenda.create({
      data: { ...ag, tenantId: tenant.id },
    })
  }
  console.log(`✅ Agenda: ${agendaData.length} item dibuat`)

  // 14. Create Pengumuman
  const pengumumanData = [
    {
      judul: 'Pengambilan Raport Semester Ganjil',
      konten: 'Diberitahukan kepada seluruh wali murid bahwa pengambilan raport akan dilaksanakan secara langsung...',
      ringkasan: 'Jadwal dan tata cara pengambilan raport semester ganjil.',
      prioritas: 'tinggi',
      userId: admin.id,
    },
    {
      judul: 'Libur Nasional Hari Raya',
      konten: 'Dalam rangka memperingati Hari Raya, kegiatan belajar mengajar diliburkan selama...',
      ringkasan: 'Informasi libur nasional untuk siswa dan staf.',
      prioritas: 'normal',
      userId: admin.id,
    },
  ]
  for (const pg of pengumumanData) {
    await prisma.pengumuman.create({
      data: { ...pg, tenantId: tenant.id },
    })
  }
  console.log(`✅ Pengumuman: ${pengumumanData.length} item dibuat`)

  // 15. Create Prestasi
  const prestasiData = [
    {
      judul: 'Juara 1 Lomba Robotik Nasional',
      deskripsi: 'Tim Robotik SMK Nusantara 1 berhasil meraih juara pertama...',
      tingkat: 'NASIONAL',
      kategori: 'TEKNOLOGI',
      tahun: 2025,
      siswa: 'Tim Robotik',
      pencapaian: 'Juara 1',
      gambarUrl: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=800&q=80',
    },
    {
      judul: 'Medali Emas Olimpiade Sains',
      deskripsi: 'Siswa kelas XI IPA berhasil menyabet medali emas...',
      tingkat: 'PROVINSI',
      kategori: 'AKADEMIK',
      tahun: 2025,
      siswa: 'Ahmad Fauzi',
      pencapaian: 'Medali Emas',
    },
  ]
  for (const pr of prestasiData) {
    await prisma.prestasi.create({
      data: { ...pr, tenantId: tenant.id },
    })
  }
  console.log(`✅ Prestasi: ${prestasiData.length} item dibuat`)

  // 16. Create Guru
  const guruData = [
    {
      nama: 'Budi Santoso, M.Pd.',
      jabatan: 'Kepala Sekolah',
      bidang: 'Manajemen Pendidikan',
      pendidikan: 'S2 Manajemen Pendidikan',
      foto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
      isActive: true,
    },
    {
      nama: 'Siti Aminah, S.Pd.',
      jabatan: 'Wakil Kepala Sekolah',
      bidang: 'Kurikulum',
      pendidikan: 'S1 Pendidikan Biologi',
      foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      isActive: true,
    },
    {
      nama: 'Andi Saputra, M.Kom.',
      jabatan: 'Guru',
      bidang: 'Informatika',
      pendidikan: 'S2 Ilmu Komputer',
      foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      isActive: true,
    },
  ]
  for (const gr of guruData) {
    await prisma.guru.create({
      data: { ...gr, tenantId: tenant.id },
    })
  }
  console.log(`✅ Guru: ${guruData.length} item dibuat`)

  // 17. Create Fasilitas
  const fasilitasData = [
    {
      nama: 'Laboratorium Komputer',
      deskripsi: 'Dilengkapi dengan 40 unit PC spesifikasi tinggi.',
      kapasitas: '40 Orang',
      gambarUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80',
    },
    {
      nama: 'Perpustakaan Digital',
      deskripsi: 'Koleksi ribuan buku cetak dan e-book.',
      kapasitas: '100 Orang',
      gambarUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80',
    },
    {
      nama: 'Lapangan Olahraga',
      deskripsi: 'Lapangan basket, voli, dan futsal terpadu.',
      kapasitas: 'Terbuka',
      gambarUrl: 'https://images.unsplash.com/photo-1628281313757-0834eb91e4ab?w=800&q=80',
    },
  ]
  for (const fa of fasilitasData) {
    await prisma.fasilitas.create({
      data: { ...fa, tenantId: tenant.id },
    })
  }
  console.log(`✅ Fasilitas: ${fasilitasData.length} item dibuat`)

  // 18. Create Ekskul
  const ekskulData = [
    {
      nama: 'Pramuka',
      deskripsi: 'Kegiatan kepramukaan wajib dan pilihan.',
      hari: 'Jumat',
      jumlahAnggota: 120,
      gambarUrl: 'https://images.unsplash.com/photo-1506869640319-ce1a44867630?w=800&q=80',
    },
    {
      nama: 'PMR',
      deskripsi: 'Palang Merah Remaja.',
      hari: 'Sabtu',
      jumlahAnggota: 45,
    },
    {
      nama: 'Klub IT & Robotik',
      deskripsi: 'Pengembangan skill programming dan IoT.',
      hari: 'Sabtu',
      jumlahAnggota: 30,
      gambarUrl: 'https://images.unsplash.com/photo-1527685216219-c7bb2a0bd2e5?w=800&q=80',
    },
  ]
  for (const ek of ekskulData) {
    await prisma.ekskul.create({
      data: { ...ek, tenantId: tenant.id },
    })
  }
  console.log(`✅ Ekskul: ${ekskulData.length} item dibuat`)

  // 19. Create Blog
  const blogData = [
    {
      judul: 'Pentingnya Pendidikan Karakter di Era Digital',
      slug: 'pentingnya-pendidikan-karakter',
      konten: '<p>Di era digital seperti sekarang ini, pendidikan karakter menjadi benteng utama...</p>',
      ringkasan: 'Bagaimana pendidikan karakter membentengi generasi muda dari dampak negatif teknologi.',
      penulis: 'Budi Santoso',
      userId: admin.id,
      gambarUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    },
    {
      judul: 'Tips Memilih Ekstrakurikuler yang Tepat',
      slug: 'tips-memilih-ekstrakurikuler',
      konten: '<p>Banyaknya pilihan ekstrakurikuler terkadang membuat siswa bingung...</p>',
      ringkasan: 'Panduan singkat bagi siswa dalam memilih kegiatan ekstrakurikuler yang sesuai minat.',
      penulis: 'Siti Aminah',
      userId: admin.id,
      gambarUrl: 'https://images.unsplash.com/photo-1525019954005-59d4de0b3dc5?w=800&q=80',
    },
  ]
  for (const bl of blogData) {
    await prisma.blog.create({
      data: { ...bl, tenantId: tenant.id },
    })
  }
  console.log(`✅ Blog: ${blogData.length} item dibuat`)

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
