import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://sispro_user:sispro_pass_2026@localhost:5433/sispro_db' } }
})

const TENANT_ID = 'c4c81d97-d574-40d0-b91e-d0150f47412e'

async function main() {
  const user = await prisma.user.findFirst({ where: { tenantId: TENANT_ID } })
  if (!user) throw new Error('User not found')

  // Update tenant
  await prisma.tenant.update({
    where: { id: TENANT_ID },
    data: {
      nama: 'Pondok Pesantren Al-Hikmah',
      alamat: 'Jl. KH. Hasyim Asyari No. 12, Jombang, Jawa Timur',
      telepon: '0321-861234',
      email: 'info@pp-alhikmah.sch.id',
      mediaSosial: { instagram: 'https://instagram.com/pp.alhikmah', facebook: 'https://facebook.com/ppalhikmah', youtube: 'https://youtube.com/@ppalhikmah' },
      profileWebsite: {
        tipeLembaga: 'Pondok Pesantren',
        npsn: '20501234', akreditasi: 'A', tahunBerdiri: '1952',
        kepalaSekolah: 'KH. Abdullah Faqih, Lc., M.A.',
        heroJudul: 'Selamat Datang di Pondok Pesantren Al-Hikmah',
        heroSubjudul: 'Membentuk generasi muslim yang berilmu, berakhlak mulia, dan bermanfaat bagi umat dan bangsa.',
        tentang: 'Pondok Pesantren Al-Hikmah berdiri sejak tahun 1952. Pesantren ini menggabungkan pendidikan agama Islam yang mendalam dengan pendidikan umum berkualitas, menghasilkan lulusan yang hafidz Quran, berakhlak mulia, dan siap menghadapi tantangan zaman.',
        visi: 'Menjadi lembaga pendidikan Islam terkemuka yang melahirkan generasi rabbani, berilmu amaliah, dan beramal ilmiah.',
        misi: '1. Menyelenggarakan pendidikan agama Islam berbasis Al-Quran dan As-Sunnah\n2. Mengintegrasikan ilmu agama dan ilmu umum secara seimbang\n3. Membentuk karakter santri yang berakhlakul karimah\n4. Mengembangkan potensi santri melalui berbagai program unggulan',
        runningText: 'Selamat datang di PP Al-Hikmah — Pendaftaran Santri Baru 1447 H segera dibuka!',
        stats: { siswa: '1.200', guru: '85', tahunBerdiri: '1952', prestasi: '200' }
      }
    }
  })
  console.log('✅ Tenant updated')

  // Berita
  await prisma.berita.createMany({ data: [
    { tenantId: TENANT_ID, userId: user.id, judul: 'Santri Al-Hikmah Raih Juara 1 MTQ Tingkat Provinsi', slug: 'santri-juara-mtq-provinsi', konten: '<p>Santri Pondok Pesantren Al-Hikmah meraih Juara 1 dalam Musabaqah Tilawatil Quran (MTQ) tingkat Provinsi Jawa Timur di Surabaya.</p><p>Prestasi ini diraih oleh Ahmad Zaki Mubarak dalam cabang Tilawah Quran Dewasa, mengalahkan 120 peserta dari seluruh kabupaten/kota di Jawa Timur.</p>', ringkasan: 'Santri Al-Hikmah meraih Juara 1 MTQ tingkat Provinsi Jawa Timur.', kategori: 'BERITA', status: 'TERBIT', tanggalTerbit: new Date() },
    { tenantId: TENANT_ID, userId: user.id, judul: 'Program Tahfidz 30 Juz Wisuda 47 Hafidz Baru', slug: 'wisuda-hafidz-2026', konten: '<p>PP Al-Hikmah menggelar wisuda tahfidz Al-Quran 30 juz yang diikuti 47 santri angkatan 2026. Para wisudawan menyelesaikan hafalan dalam waktu rata-rata 2-3 tahun.</p>', ringkasan: '47 santri Al-Hikmah berhasil menyelesaikan hafalan Al-Quran 30 juz.', kategori: 'BERITA', status: 'TERBIT', tanggalTerbit: new Date(Date.now() - 3*86400000) },
    { tenantId: TENANT_ID, userId: user.id, judul: 'Refleksi: Ilmu Tanpa Akhlak Adalah Bencana', slug: 'refleksi-ilmu-tanpa-akhlak', konten: '<p>Bismillahirrahmanirrahim. Di era kemajuan teknologi ini, kita sering terlena dengan pencapaian intelektual semata. Namun pesantren mengajarkan bahwa ilmu sejati harus diiringi akhlak yang mulia.</p><p>Imam Malik berkata: "Pelajarilah adab sebelum mempelajari ilmu." Inilah fondasi pendidikan di pesantren kita.</p>', ringkasan: 'Refleksi pengasuh tentang pentingnya akhlak sebagai fondasi ilmu.', kategori: 'EDITORIAL', status: 'TERBIT', tanggalTerbit: new Date(Date.now() - 7*86400000) },
    { tenantId: TENANT_ID, userId: user.id, judul: 'Metode Pembelajaran Kitab Kuning di Era Digital', slug: 'metode-kitab-kuning-era-digital', konten: '<p>Sebagai ustadz yang mengajar kitab kuning selama 15 tahun, saya ingin berbagi pengalaman mengintegrasikan metode tradisional dengan pendekatan modern.</p><p>Kitab kuning bukan sekadar teks kuno — ia adalah khazanah ilmu tak ternilai yang harus disajikan relevan bagi santri generasi Z.</p>', ringkasan: 'Ustadz berbagi pengalaman mengintegrasikan kitab kuning dengan pendekatan modern.', kategori: 'BLOG_GURU', status: 'TERBIT', tanggalTerbit: new Date(Date.now() - 5*86400000) },
  ]})
  console.log('✅ Berita created')

  // Pengumuman
  await prisma.pengumuman.createMany({ data: [
    { tenantId: TENANT_ID, userId: user.id, judul: 'Pendaftaran Santri Baru 1447/1448 H Dibuka', konten: 'Pendaftaran santri baru PP Al-Hikmah resmi dibuka mulai 1 April 2026. Tersedia program Tahfidz, Takhassus, dan Reguler.', tanggal: new Date(Date.now() - 1*86400000) },
    { tenantId: TENANT_ID, userId: user.id, judul: 'Jadwal Ujian Akhir Semester & Munaqosah Tahfidz', konten: 'Ujian Akhir Semester dan Munaqosah Tahfidz dilaksanakan 2-20 Juni 2026. Jadwal lengkap di mading pesantren.', tanggal: new Date(Date.now() - 3*86400000) },
    { tenantId: TENANT_ID, userId: user.id, judul: 'Rihlah Ilmiah ke Pesantren-Pesantren Jawa Timur', konten: 'PP Al-Hikmah mengadakan rihlah ilmiah ke pesantren besar di Jawa Timur pada 15-17 April 2026. Pendaftaran melalui wali kelas.', tanggal: new Date(Date.now() - 2*86400000) },
    { tenantId: TENANT_ID, userId: user.id, judul: 'Pembayaran Syahriyah Bulan April 1447 H', konten: 'Pembayaran syahriyah April 1447 H dibuka 1-15 April 2026. Bagi yang kesulitan silakan hubungi bagian keuangan pesantren.', tanggal: new Date() },
  ]})
  console.log('✅ Pengumuman created')

  // Agenda
  await prisma.agenda.createMany({ data: [
    { tenantId: TENANT_ID, judul: 'Wisuda Tahfidz & Khotmil Quran', deskripsi: 'Wisuda santri hafidz 30 juz dan khataman Al-Quran bersama', tanggalMulai: new Date('2026-04-20'), lokasi: 'Aula Utama PP Al-Hikmah', penanggungjawab: 'Panitia Wisuda', isPublished: true },
    { tenantId: TENANT_ID, judul: 'Haflah Akhirussanah 2026', deskripsi: 'Acara akhir tahun pesantren dengan penampilan santri dan pengumuman kelulusan', tanggalMulai: new Date('2026-06-15'), tanggalAkhir: new Date('2026-06-16'), lokasi: 'Lapangan Utama Pesantren', penanggungjawab: 'Panitia Haflah', isPublished: true },
    { tenantId: TENANT_ID, judul: 'Rihlah Ilmiah Santri', deskripsi: 'Kunjungan ilmiah ke pesantren-pesantren besar di Jawa Timur', tanggalMulai: new Date('2026-04-15'), tanggalAkhir: new Date('2026-04-17'), lokasi: 'Jawa Timur', penanggungjawab: 'Wakil Pengasuh', isPublished: true },
    { tenantId: TENANT_ID, judul: 'Ujian Akhir Semester & Munaqosah', deskripsi: 'Ujian akhir semester dan munaqosah tahfidz untuk seluruh santri', tanggalMulai: new Date('2026-06-02'), tanggalAkhir: new Date('2026-06-20'), lokasi: 'Kelas & Aula Pesantren', penanggungjawab: 'Wakasek Kurikulum', isPublished: true },
    { tenantId: TENANT_ID, judul: 'Pengajian Akbar Haul Pendiri', deskripsi: 'Pengajian akbar memperingati haul pendiri PP Al-Hikmah dengan ulama nasional', tanggalMulai: new Date('2026-05-01'), lokasi: 'Lapangan Utama', penanggungjawab: 'Pengurus Pesantren', isPublished: true },
  ]})
  console.log('✅ Agenda created')

  // Prestasi
  await prisma.prestasi.createMany({ data: [
    { tenantId: TENANT_ID, judul: 'Juara 1 MTQ Tilawah Quran Tingkat Provinsi', deskripsi: 'Ahmad Zaki Mubarak meraih juara 1 MTQ cabang Tilawah Quran Dewasa tingkat Provinsi Jawa Timur', tingkat: 'PROVINSI', kategori: 'AKADEMIK', tahun: 2026, isPublished: true },
    { tenantId: TENANT_ID, judul: 'Juara 1 Debat Bahasa Arab Tingkat Nasional', deskripsi: 'Tim debat bahasa Arab meraih juara 1 kompetisi nasional antar pesantren', tingkat: 'NASIONAL', kategori: 'AKADEMIK', tahun: 2025, isPublished: true },
    { tenantId: TENANT_ID, judul: 'Juara 2 Olimpiade Sains Pesantren Nasional', deskripsi: 'Meraih juara 2 bidang Matematika dalam Olimpiade Sains Pesantren tingkat nasional', tingkat: 'NASIONAL', kategori: 'AKADEMIK', tahun: 2025, isPublished: true },
    { tenantId: TENANT_ID, judul: 'Pesantren Terbaik Jawa Timur 2024', deskripsi: 'Penghargaan Pesantren Terbaik kategori Pendidikan Terpadu dari Kemenag Jawa Timur', tingkat: 'PROVINSI', kategori: 'NON_AKADEMIK', tahun: 2024, isPublished: true },
    { tenantId: TENANT_ID, judul: 'Juara 1 Kaligrafi Al-Quran Nasional', deskripsi: 'Santri meraih juara 1 lomba kaligrafi Al-Quran tingkat nasional', tingkat: 'NASIONAL', kategori: 'SENI', tahun: 2024, isPublished: true },
    { tenantId: TENANT_ID, judul: '500+ Hafidz Quran Diluluskan', deskripsi: 'Pesantren telah meluluskan lebih dari 500 hafidz/hafidzah Al-Quran 30 juz sejak berdiri', tingkat: 'SEKOLAH', kategori: 'AKADEMIK', tahun: 2025, isPublished: true },
  ]})
  console.log('✅ Prestasi created')

  // Ekskul
  await prisma.ekskul.createMany({ data: [
    { tenantId: TENANT_ID, nama: 'Tahfidz Al-Quran', deskripsi: 'Program menghafal Al-Quran 30 juz dengan metode talaqqi dan murajaah intensif', jadwal: 'Setiap hari, 04.30-06.00 & 20.00-21.30', pembina: 'Ust. Hafidz Mubarok, Lc.', isActive: true },
    { tenantId: TENANT_ID, nama: 'Kajian Kitab Kuning', deskripsi: 'Pembelajaran kitab klasik Islam: Fiqih, Nahwu, Shorof, Tafsir, Hadits', jadwal: 'Setiap hari, 08.00-12.00', pembina: 'Para Asatidz', isActive: true },
    { tenantId: TENANT_ID, nama: 'Muhadhoroh (Latihan Pidato)', deskripsi: 'Latihan pidato 3 bahasa: Arab, Inggris, dan Indonesia', jadwal: 'Kamis malam, 20.00-22.00', pembina: 'Ust. Ahmad Fauzi', isActive: true },
    { tenantId: TENANT_ID, nama: 'Kaligrafi Islam', deskripsi: 'Seni kaligrafi Al-Quran: Naskhi, Tsuluts, Diwani', jadwal: 'Sabtu, 14.00-16.00', pembina: 'Ust. Mahmud Al-Khattat', isActive: true },
    { tenantId: TENANT_ID, nama: 'Hadroh & Sholawat', deskripsi: 'Grup hadroh dan sholawat untuk syiar Islam', jadwal: 'Jumat, 20.00-22.00', pembina: 'Ust. Ridwan Mustofa', isActive: true },
    { tenantId: TENANT_ID, nama: 'Olahraga & Beladiri', deskripsi: 'Futsal, voli, badminton, dan pencak silat', jadwal: 'Selasa & Jumat, 16.00-17.30', pembina: 'Ust. Hendra Saputra', isActive: true },
    { tenantId: TENANT_ID, nama: 'Bahasa Arab & Inggris', deskripsi: 'Program intensif penguasaan bahasa Arab dan Inggris aktif', jadwal: 'Setiap hari (wajib berbicara)', pembina: 'Tim Bahasa', isActive: true },
    { tenantId: TENANT_ID, nama: 'Koperasi Santri', deskripsi: 'Wirausaha santri melalui koperasi pesantren untuk melatih kemandirian', jadwal: 'Setiap hari', pembina: 'Pengurus OSIS', isActive: true },
  ]})
  console.log('✅ Ekskul created')

  // Fasilitas
  await prisma.fasilitas.createMany({ data: [
    { tenantId: TENANT_ID, nama: 'Masjid Jami Al-Hikmah', deskripsi: 'Masjid utama berkapasitas 2.000 jamaah, pusat ibadah dan pengajian pesantren', isPublished: true },
    { tenantId: TENANT_ID, nama: 'Asrama Santri Putra & Putri', deskripsi: 'Asrama modern ber-AC, terpisah putra dan putri, kapasitas 1.500 santri', isPublished: true },
    { tenantId: TENANT_ID, nama: 'Perpustakaan Islam', deskripsi: 'Koleksi 15.000+ kitab dan buku Islam dengan ruang baca nyaman', isPublished: true },
    { tenantId: TENANT_ID, nama: 'Laboratorium Komputer', deskripsi: 'Lab komputer 40 unit untuk pembelajaran teknologi informasi', isPublished: true },
    { tenantId: TENANT_ID, nama: 'Aula Serbaguna', deskripsi: 'Aula kapasitas 800 orang untuk haflah, seminar, dan acara besar', isPublished: true },
    { tenantId: TENANT_ID, nama: 'Lapangan Olahraga', deskripsi: 'Lapangan futsal, voli, dan badminton untuk kegiatan olahraga santri', isPublished: true },
    { tenantId: TENANT_ID, nama: 'Klinik Kesehatan Santri', deskripsi: 'Klinik dengan tenaga medis profesional untuk kesehatan santri', isPublished: true },
    { tenantId: TENANT_ID, nama: 'Dapur & Ruang Makan', deskripsi: 'Dapur modern menu bergizi halal, melayani 1.200+ santri setiap hari', isPublished: true },
  ]})
  console.log('✅ Fasilitas created')

  console.log('\n🎉 Semua data pesantren berhasil dimasukkan!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
