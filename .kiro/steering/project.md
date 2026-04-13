# SchoolPro — Project Context

## Lokasi Project & Domain

| Environment | Path | Domain | Port | PM2 Name |
|---|---|---|---|---|
| Production | `/var/www/schoolpro` (branch `main`) | `schoolpro.id` (landing SaaS) | 3000 | `schoolpro` |
| Production | `/var/www/schoolpro` (branch `main`) | `demo.schoolpro.id` (app sekolah) | 3000 | `schoolpro` |
| Development | `/var/www/schoolpro-dev` (branch `develop`) | `dev.schoolpro.id` (landing SaaS dev) | 3001 | `schoolpro-dev` |
| Development | `/var/www/schoolpro-dev` (branch `develop`) | `demo-dev.schoolpro.id` (tenant demo dev) | 3001 | `schoolpro-dev` |
| Development | `/var/www/schoolpro-dev` (branch `develop`) | `ops-dev.schoolpro.id` (super-admin dev) | 3001 | `schoolpro-dev` |
| Development | `/var/www/schoolpro-dev` (branch `develop`) | `*-dev.schoolpro.id` (tenant dev lain) | 3001 | `schoolpro-dev` |

- **Process Manager**: PM2 dijalankan sebagai user `ubuntu` (bukan root)
- **Ecosystem config**: `/home/ubuntu/ecosystem.config.js`
- **Startup**: `pm2-ubuntu.service` (auto-start saat reboot via systemd)
- **Domain strategy (dev)**: gunakan first-level subdomain `*-dev.schoolpro.id` untuk tenant/super-admin dev agar kompatibel dengan Cloudflare Universal SSL; hindari pola second-level seperti `tenant.dev.schoolpro.id` kecuali nanti edge certificate khusus sudah disiapkan

## Workflow Branch & Release

- Repo development `/var/www/schoolpro-dev` harus memakai branch kerja aktif `develop`
- Repo production `/var/www/schoolpro` harus tetap memakai branch `main`
- Semua coding, verifikasi, build, dan smoke test dilakukan dulu di repo development
- Push GitHub dilakukan dari repo development ke `origin/develop`
- Promote ke production dilakukan dengan menarik commit yang sudah lolos dari `origin/develop` ke repo production `main`
- Hindari bekerja harian di branch `main` pada repo development, karena itu rawan membuat status branch lokal dan steering tidak sinkron
- Jika repo development terlanjur berada di `main`, fast-forward dulu `develop` ke commit terbaru lalu pindahkan HEAD kembali ke `develop` sebelum melanjutkan pekerjaan

## Tech Stack
- Next.js 15 (App Router, TypeScript)
- PostgreSQL (localhost:5432, db: `schoolpro`)
- Prisma ORM (`/var/www/schoolpro-dev/prisma/schema.prisma`)
- NextAuth v5 (JWT, multi-role)
- Styling campuran: shared CSS, CSS Modules, dan utility classes yang sudah ada di codebase
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
6. Subscription & Billing tenant self-service

## Dokumen Perencanaan Fitur Besar
- Super Admin Panel: lihat `docs/04_super_admin_panel_plan.md`
- Subscription & Billing: lihat `docs/05_subscription_billing_plan.md`
- PPDB stabilization reference: lihat `docs/06_ppdb_stabilization_roadmap.md`
- Release cutover runbook: lihat `docs/07_release_cutover_runbook.md`
- Tenant application & onboarding: lihat `docs/08_tenant_application_onboarding_plan.md`
- Steering khusus: lihat `.kiro/steering/super-admin.md`
- Workflow Codex: lihat `.kiro/steering/codex.md`
- Keputusan auth awal: satu login di `/app/login`, role `SUPER_ADMIN` diarahkan ke `/super-admin/dashboard`

## Progress Implementasi Saat Ini
- Super admin phase 1 sudah dimulai
- Sudah ada route `/super-admin/dashboard` dan `/super-admin/tenants`
- Sudah ada route `/super-admin/plans`, `/super-admin/feature-access`, dan `/super-admin/audit-logs`
- Sudah ada guard middleware untuk memisahkan area platform dan area tenant
- Tenant management dasar sudah tersedia untuk list dan edit cepat tenant
- Plan management, feature access override, dan audit log dasar sudah tersedia di development
- Arah berikutnya sudah ditetapkan ke subscription & billing berbasis `slot siswa`
- Model bisnis yang disepakati: `Free` untuk CMS website, plan berbayar full fitur, billing tahunan dibayar di muka, dan upgrade dipilih tenant dari halaman billing admin
- Fondasi `TenantSubscription` sebagai source of truth langganan aktif tenant sudah ditambahkan di development dan disinkronkan dengan edit tenant super admin
- Halaman tenant `Langganan` dan inbox super admin `Subscription Orders` sudah tersedia di development untuk order billing manual dan verifikasi pembayaran
- Guard kuota siswa aktif sudah diterapkan pada create/update siswa tenant dan sinkronisasi PPDB, mengikuti kapasitas `TenantSubscription`
- API tenant untuk resubmit bukti pembayaran ke order billing yang ditolak atau kedaluwarsa sudah tersedia di development
- Warning kuota siswa aktif sekarang juga diekspos di API dashboard tenant dan list siswa untuk dipakai modul UI berikutnya
- UI tenant `Langganan`, `Data Siswa`, dan dashboard tenant kini menampilkan warning kuota agar tenant tahu kondisi 80/90/100% sebelum menambah siswa aktif
- UI tenant `Langganan` kini juga mendukung resubmit bukti pembayaran untuk order billing yang ditolak atau kedaluwarsa
- UI tenant `Langganan` kini menampilkan label status order billing dan tipe order yang lebih human-readable
- Sidebar tenant kini menampilkan indicator kuota pada menu `Pengaturan` dan `Langganan` saat tenant masuk level `WARNING_80`, `WARNING_90`, atau `FULL`
- Empty state billing tenant dan label teknis utama seperti metode pembayaran serta billing period kini juga sudah dibuat lebih mudah dipahami tenant
- Handoff kerja berikutnya: jika diperlukan, evaluasi perilaku indicator kuota sidebar pada mode mobile; selain itu billing tenant sudah siap masuk fase stabilisasi/QA
- Kandidat fitur besar berikutnya: `Tenant Application + Approval + Provisioning` agar tenant baru tidak langsung aktif sebelum diverifikasi super admin
- Fondasi phase 1 `Tenant Application` kini mulai dipasang di development: form publik kanonis di `/daftarkan-sekolah` dengan redirect dari URL lama `/landing/daftarkan-sekolah`, intake API publik, model aplikasi calon tenant sudah dipisahkan dari `Tenant`, dan inbox review super admin sudah tersedia di `/super-admin/tenant-applications`
- Homepage marketing kanonis kini berada di `/`, memakai implementasi baru berbasis asset bundle `lp-schoolpro`; source HTML referensi disimpan di `src/features/marketing/lp-schoolpro/index.html`, lalu dirender lewat route Next.js agar CTA tetap bisa dipetakan ke host demo dan alur tenant signup SchoolPro. URL `/landing` dipertahankan hanya sebagai redirect kompatibilitas
- Mapping host development kini sudah dipisah mengikuti boundary produk: `dev.schoolpro.id` untuk marketing, `demo-dev.schoolpro.id` untuk tenant demo, `ops-dev.schoolpro.id` untuk super-admin, dan `*-dev.schoolpro.id` untuk tenant dev lain; pola lama `*.dev.schoolpro.id` tidak lagi dipakai karena tidak kompatibel dengan Cloudflare Universal SSL
- CTA `Lihat Demo` di landing dev dan label domain tenant pada layar super-admin kini sudah mengikuti host aktif, sehingga surface host utama yang disentuh pada sesi ini tidak lagi menunjuk ke domain production saat dibuka dari environment development
- Auth platform dev kini sudah membiarkan request `SUPER_ADMIN` ke `/api/auth/*` dan `/api/super-admin/*` di runtime aplikasi, sehingga login dan fetch data super-admin bisa lolos pada app lokal port `3001`
- Login `SUPER_ADMIN` di host platform kini juga sudah dipatch agar memakai kredensial host-aware dan hanya menerima role `SUPER_ADMIN` pada domain `ops-dev` / `ops`; smoke test dev di host publik kini lolos untuk CSRF, login, dashboard, dan API super-admin
- Handoff tambahan PPDB: backend hardening awal, workflow turunan, `draft vs final submit` form lengkap wali, filter/statistik workflow di list admin, serta ringkasan workflow pada form, invoice, dan `/app/beranda` wali sudah mulai terpasang; langkah berikutnya adalah memperluas workflow ke kartu ringkasan tenant lain bila diperlukan
- Auth tenant kini diarahkan ke login berbasis `email + password`; registrasi tenant cukup `nama, email, password`, sementara `username` tetap digenerate internal untuk kompatibilitas data lama
- Cleanup arsitektur foundation sudah dimulai: provider boundary disatukan ke `src/providers`, script non-runtime dipindah dari `tmp` ke `scripts/*`, dan backup schema diarsipkan ke `docs/archive`
- Route tree tenant kini memakai boundary internal `src/app/app/(portal)` tanpa mengubah surface URL `/app/*`
- Shared infra `src/lib` kini mulai dipisah ke boundary `lib/db`, `lib/auth`, `lib/tenant`, dan `lib/utils`
- Boundary website publik kini memakai naming `public`: route group `src/app/(public)` dan komponen `src/components/public/*`
- Feature layer mulai diperkenalkan secara bertahap dari domain `website`, dengan helper domain-specific pindah ke `src/features/website/lib`
- Extraction feature layer kini juga mulai menyentuh `ppdb` secara terbatas, dimulai dari server actions ke `src/features/ppdb/actions`
- Blueprint arsitektur folder: lihat `.kiro/steering/architecture.md`
- Guardrail engineering harian: lihat `.kiro/steering/engineering.md`
- Konvensi implementasi aktif: lihat `.kiro/steering/conventions.md`
- Rencana refactor struktur folder bertahap: lihat `docs/refactor-folder-structure-plan.md`
- Roadmap maintenance arsitektur: lihat `docs/architecture-maintenance-roadmap.md`

## Handoff Sesi Berikutnya
- CTA `Lihat Demo` di landing dev dan label domain tenant pada layar super-admin kini mengikuti host dev/prod aktif; lanjutkan audit sisa link, CTA, atau redirect yang masih hardcoded bila ada surface lain yang belum disentuh
- Login `SUPER_ADMIN` kini sudah lolos di `https://ops-dev.schoolpro.id` untuk endpoint CSRF, halaman login, dashboard, dan API dashboard super-admin; jika perlu, tindak lanjuti audit kecil pada raw callback auth yang masih mengembalikan redirect `https://localhost:3001` saat dipanggil langsung via curl walau session hasil login tetap valid
- Login tenant demo di `demo-dev.schoolpro.id` kini sudah lolos lagi setelah data tenant dev disejajarkan dengan mapping host baru; akun `ADMIN` dan `WALI` dev kembali bisa dipakai untuk smoke test tenant
- QA billing super-admin minimum sudah lolos di dev: halaman `Subscription Orders` dan API inbox order kini merespons `200`, tetapi datanya masih kosong karena belum ada order billing di environment dev
- Jika hasil login sudah stabil, lanjutkan cleanup kecil host/runtime helper agar boundary marketing, platform, dan tenant lebih mudah dirawat tanpa refactor folder besar
- Setelah itu baru siapkan checklist push GitHub dan rencana deploy production dengan mapping host production: `schoolpro.id`, `demo.schoolpro.id`, dan `ops.schoolpro.id`

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
- Gunakan CSS Variables dan token skin yang sudah ada; jangan hardcode warna jika token yang sesuai sudah tersedia
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
- Jika dan hanya jika bekerja di repo production, setelah edit kode wajib: `npm run build` lalu `pm2 restart schoolpro`
- Jangan gunakan `npm run dev` — selalu build untuk produksi
- Hati-hati dengan migration database — data nyata bisa terpengaruh
