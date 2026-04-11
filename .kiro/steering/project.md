# SchoolPro — Project Context

## Lokasi Project & Domain

| Environment | Path | Domain | Port | PM2 Name |
|---|---|---|---|---|
| Production | `/var/www/schoolpro` (branch `main`) | `schoolpro.id` (landing SaaS) | 3000 | `schoolpro` |
| Production | `/var/www/schoolpro` (branch `main`) | `demo.schoolpro.id` (app sekolah) | 3000 | `schoolpro` |
| Development | `/var/www/schoolpro-dev` (branch `develop`) | `dev.schoolpro.id` (app sekolah) | 3001 | `schoolpro-dev` |
| Development | `/var/www/schoolpro-dev` (branch `develop`) | `dev.schoolpro.id/landing` (landing dev) | 3001 | `schoolpro-dev` |

- **Process Manager**: PM2 dijalankan sebagai user `ubuntu` (bukan root)
- **Ecosystem config**: `/home/ubuntu/ecosystem.config.js`
- **Startup**: `pm2-ubuntu.service` (auto-start saat reboot via systemd)

## Tech Stack
- Next.js 15 (App Router, TypeScript)
- PostgreSQL (localhost:5432, db: `schoolpro`)
- Prisma ORM (`/var/www/schoolpro/prisma/schema.prisma`)
- NextAuth v5 (JWT, multi-role)
- CSS Modules (tanpa Tailwind/shadcn)
- PM2 + Nginx reverse proxy

## Struktur Route
| Route | Fungsi |
|---|---|
| `/` | Website publik sekolah |
| `/app/login` | Login |
| `/app/dashboard` | Admin dashboard |
| `/ppdb` | Pendaftaran online publik |

## Arsitektur
- **Multi-tenant**: Shared DB + `tenantId` di setiap tabel
- **Tenant resolution**: via subdomain/slug di middleware
- **Roles**: ADMIN, KEUANGAN, TU, WALI, SISWA

## Fitur MVP yang Sudah Ada
- Data Master: Unit, Tahun Ajaran, Kelas, Siswa, Petugas, Rekening
- Keuangan: Tagihan, Pembayaran, Tabungan, Arus Kas
- PPDB Online: Periode, Pendaftar, Berkas, Tagihan PPDB
- Website publik: Berita, Pengumuman, Agenda, Prestasi, Ekskul, Fasilitas, Alumni, Guru, Blog, Editorial
- Auth multi-role + multi-tenant
- Landing SaaS: funnel `website sekolah gratis` sebagai entry point, lalu upgrade ke modul admin premium saat kebutuhan sekolah berkembang

## Fitur Belum Ada (Roadmap Prioritas)
1. Absensi Digital (QR Code)
2. Raport Digital (Kurikulum Merdeka)
3. Modul Kepegawaian/HR
4. PWA Mobile App
5. Notifikasi WhatsApp
6. Super Admin Panel (SaaS billing)

## Perintah Penting
```bash
# Deploy production (tanpa sudo)
cd /var/www/schoolpro && npm run build && pm2 restart schoolpro

# Deploy development (tanpa sudo)
cd /var/www/schoolpro-dev && npm run build && pm2 restart schoolpro-dev

# Prisma migrate (dev)
cd /var/www/schoolpro-dev && npx prisma migrate dev

# Prisma migrate (prod) — hati-hati!
cd /var/www/schoolpro && npx prisma migrate deploy

# Lihat log
pm2 logs schoolpro
pm2 logs schoolpro-dev
```

## Aturan Pengembangan
- Selalu scope query dengan `tenantId`
- Gunakan CSS Variables dari `globals.css` (jangan hardcode warna)
- Semua komponen harus support Dark Mode
- Gunakan komponen UI yang sudah ada: `DataTable`, `Modal`, `Badge`, `Button`, dll di `src/components/ui/`
- Notifikasi pakai `Sonner`
- Charts pakai `Recharts`

## Aturan Setelah Pengembangan
Setiap selesai mengerjakan fitur, AI wajib:
1. Update `database.md` jika ada model/tabel/field baru atau perubahan enum
2. Update `ui.md` jika ada komponen UI baru yang dibuat
3. Update bagian **Fitur MVP yang Sudah Ada** di `project.md` jika fitur baru selesai
4. Update bagian **Fitur Belum Ada** jika item roadmap sudah selesai dikerjakan
5. Hapus import, variabel, fungsi, dan file yang tidak lagi digunakan (dead code)
6. Pastikan tidak ada console.log yang tertinggal di kode produksi

## Environment Produksi
- Ini adalah aplikasi PRODUKSI yang sudah live, bukan localhost
- URL live: https://demo.schoolpro.id dan https://schoolpro.id
- Setiap perubahan kode langsung berdampak ke pengguna nyata
- Setelah edit kode, wajib: `npm run build` lalu `pm2 restart schoolpro`
- Jangan gunakan `npm run dev` — selalu build untuk produksi
- Hati-hati dengan migration database — data nyata bisa terpengaruh
