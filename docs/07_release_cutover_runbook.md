# Release Cutover Runbook

## Tujuan
- Menjadikan `/var/www/schoolpro-dev` sebagai kandidat baseline release baru
- Menghindari penghapusan prematur pada repo GitHub lama atau environment production lama
- Menjaga jalur rollback jika cutover ke production bermasalah

## Prinsip
- Jangan hapus repo GitHub lama sebelum baseline baru terbukti stabil
- Jangan hapus `/var/www/schoolpro` sebelum release baru lolos smoke test production
- Gunakan pendekatan `replace with rollback path`, bukan `destroy and recreate`
- Semua validasi dilakukan dari `schoolpro-dev` dulu

## Branch Contract
- Repo development: `/var/www/schoolpro-dev` pada branch aktif `develop`
- Repo production: `/var/www/schoolpro` pada branch aktif `main`
- Alur release normal:
  1. implementasi dan verifikasi di `develop`
  2. push ke `origin/develop`
  3. fetch di repo production
  4. merge commit release dari `origin/develop` ke `main`
  5. build, restart, lalu smoke test production
- Jangan gunakan repo production untuk eksperimen, debugging awal, atau edit source harian

## Scope Release Saat Ini
- Foundation portal/auth baru
- Login tenant berbasis `email + password`
- Registrasi tenant berbasis `nama, email, password`
- PPDB stabilization yang sudah berjalan di dev
- Paket super-admin, billing, dan migration schema masih perlu keputusan eksplisit apakah ikut release sekarang atau ditahan

## Gate Sebelum Push GitHub
1. Pastikan worktree `schoolpro-dev` memang sudah menjadi baseline yang disepakati
2. Review diff besar lintas area:
   - foundation portal/auth
   - PPDB
   - super-admin dan billing
   - schema Prisma dan migrations
3. Pastikan dokumen steering terkait sudah sinkron:
   - `.kiro/steering/project.md`
   - `.kiro/steering/super-admin.md` bila paket super-admin ikut release
   - roadmap PPDB bila PPDB ikut release
4. Jalankan verifikasi teknis minimum:
   - `npx eslint ...` pada file target
   - `npm run build`
5. Jalankan smoke test dev:
   - login `SUPER_ADMIN`
   - login `ADMIN`
   - login `WALI`
   - register akun baru
   - alur PPDB minimal

## Gate Sebelum Deploy Production
1. Backup repo production lama
2. Backup database production
3. Simpan salinan `.env` production
4. Catat status PM2 dan service terkait
5. Putuskan model deploy:
   - deploy in-place ke `/var/www/schoolpro`
   - atau cutover via baseline baru lalu switch

## Backup Minimum
### Repo
- archive branch/tag terakhir production
- backup isi `/var/www/schoolpro`

### Database
- dump PostgreSQL production sebelum migration

### Runtime
- simpan:
  - file environment production
  - konfigurasi PM2
  - konfigurasi Nginx yang relevan

## Strategi Push GitHub Yang Disarankan
1. Pastikan repo development sedang berada di branch `develop`
2. Pastikan worktree bersih dan steering relevan sudah diperbarui
3. Buat commit baseline yang merepresentasikan perubahan di `schoolpro-dev`
4. Push ke `origin/develop`
5. Catat SHA release candidate sebelum deploy production

## Strategi Deploy Production Yang Disarankan
1. Freeze perubahan production selama window deploy
2. Di repo production, jalankan `git fetch origin`
3. Merge SHA atau tip `origin/develop` yang sudah disetujui ke branch `main`
4. Install dependency jika diperlukan
5. Jalankan:
```bash
npm run build
```
6. Jalankan migration hanya jika paket release memang mencakup schema change dan backup DB sudah dibuat
7. Restart proses production:
```bash
pm2 restart schoolpro
```
8. Jalankan smoke test production segera setelah restart

## Smoke Test Host Minimum
- marketing: `https://schoolpro.id`
- platform: `https://ops.schoolpro.id/app/login`
- tenant demo: `https://demo.schoolpro.id/app/login`
- auth callback: `https://ops.schoolpro.id/api/auth/csrf`

## Smoke Test Production Minimum
- `SUPER_ADMIN` bisa login dan masuk ke `/super-admin/dashboard`
- `ADMIN` bisa login dan masuk ke `/app/dashboard`
- `WALI` bisa login dan masuk ke `/app/beranda`
- registrasi akun baru bekerja
- login email bekerja untuk tenant
- halaman login dan register menampilkan field yang benar
- PPDB publik membuka halaman status
- invoice/form lengkap wali tidak error

## Rollback Plan
Rollback wajib disiapkan sebelum deploy.

Jika deploy gagal:
1. restore source production lama
2. restore `.env` production jika berubah
3. restart PM2 ke baseline lama
4. jika migration sudah berjalan dan merusak kompatibilitas, restore DB dari dump terakhir

## Kapan Boleh Hapus Repo Lama atau Baseline Lama
Hanya setelah:
- release baru stabil
- smoke test production lolos
- tidak ada blocker operasional
- rollback window dianggap selesai

## Keputusan Operasional Saat Ini
- Belum disarankan menghapus repo GitHub lama
- Belum disarankan menghapus `/var/www/schoolpro`
- Langkah paling aman berikutnya adalah audit smoke test lintas role dan keputusan final apakah paket super-admin/billing/schema ikut release atau ditahan
