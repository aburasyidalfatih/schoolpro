# SISPRO - Sistem Informasi Sekolah Pro

A modern, multi-tenant school information system built with Next.js, Prisma, and NextAuth.

## Fitur Utama

- [x] **Multi-Tenancy**: Support banyak sekolah dalam satu platform.
- [x] **Data Master**: Management Unit, Tahun Ajaran, Kelas, Siswa, Petugas, dan Rekening.
- [x] **Modul Tagihan (Baru)**: 
    - Pembuatan tagihan masal (Mass Generate) per kelas.
    - Input tagihan manual untuk individu.
    - Proteksi duplikasi tagihan.
    - Filter canggih berdasarkan kelas dan kategori.
- [x] **Dashboard Real-time (Baru)**:
    - Statistik live total siswa, tunggakan, dan pembayaran hari ini.
    - Daftar transaksi pembayaran terbaru.
- [x] **NextAuth Integration**: Sistem login aman dengan role (Admin, Keuangan, TU, dll.).
- [x] **Premium UI**: Desain modern, responsif, dan clean.

## Getting Started

1. Salin `.env.example` ke `.env` dan atur database URL (SQLite default).
2. Install dependensi: `npm install`
3. Generate Prisma client: `npx prisma generate`
4. Jalankan aplikasi: `npm run dev`

Buka [http://localhost:3000](http://localhost:3000) untuk mulai menggunakan SISPRO.
