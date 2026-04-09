# SISPRO — Sistem Informasi Pesantren Pro

Platform SaaS manajemen pesantren/sekolah modern berbasis Next.js, Prisma, dan PostgreSQL.

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Database**: PostgreSQL (via Prisma ORM)
- **Auth**: NextAuth v5 (JWT, multi-role)
- **UI**: CSS Modules + Lucide React Icons
- **Deployment**: Systemd service + Nginx reverse proxy

## Struktur Aplikasi

```
sispro.kelasmaster.id/          → Website publik sekolah
sispro.kelasmaster.id/app       → Dashboard (redirect ke login)
sispro.kelasmaster.id/app/login → Login
sispro.kelasmaster.id/app/dashboard → Admin dashboard
sispro.kelasmaster.id/ppdb      → Pendaftaran online (publik)
```

## Fitur

### Website Publik (`/`)
- Beranda dengan hero, stats, berita, pengumuman, agenda, prestasi, ekskul
- Halaman Profil Sekolah (visi, misi, kepala sekolah, kontak)
- Halaman Berita & Artikel (Berita, Editorial, Blog Guru)
- Halaman Pengumuman
- Halaman Agenda Kegiatan
- Halaman Prestasi
- Halaman Program & Kegiatan (Ekskul)
- Halaman Fasilitas
- Halaman Alumni
- Running text & header responsif
- Footer dengan kontak & sosial media

### Dashboard (`/app`)
- Multi-tenancy (satu platform, banyak sekolah)
- Data Master: Unit, Tahun Ajaran, Kelas, Siswa, Petugas, Rekening
- Modul Keuangan: Tagihan, Pembayaran, Tabungan, Arus Kas
- Modul PPDB: Periode, Pendaftar, Berkas, Tagihan PPDB
- Dashboard real-time dengan statistik live
- Role-based access: Admin, Keuangan, TU, Wali/Siswa

## Setup Development

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit DATABASE_URL ke PostgreSQL

# Migrasi database
npx prisma migrate dev

# Jalankan dev server
npm run dev
```

## Production (VPS)

```bash
# Build
npm run build

# Service: /etc/systemd/system/sispro.service
# Port: 3011
# Domain: sispro.kelasmaster.id

sudo systemctl restart sispro
```

## Database Schema

Model utama:
- `Tenant` — data sekolah/pesantren (multi-tenant)
- `User` — pengguna dengan role (ADMIN, KEUANGAN, TU, WALI, SISWA)
- `Siswa`, `Kelas`, `Unit`, `TahunAjaran` — data akademik
- `Tagihan`, `Pembayaran`, `Tabungan` — keuangan
- `PeriodePpdb`, `PendaftarPpdb` — PPDB online
- `Berita`, `Pengumuman`, `Agenda` — konten website
- `Prestasi`, `Ekskul`, `Fasilitas`, `Alumni` — profil sekolah
- `Slider` — banner beranda

## Environment Variables

```env
DATABASE_URL="postgresql://user:pass@localhost:5433/sispro_db"
AUTH_SECRET="..."
AUTH_TRUST_HOST="true"
AUTH_URL="https://sispro.kelasmaster.id"
NEXTAUTH_URL="https://sispro.kelasmaster.id"
```

---

**Live**: https://sispro.kelasmaster.id  
**Stack**: Next.js 15 + PostgreSQL + Prisma + NextAuth
