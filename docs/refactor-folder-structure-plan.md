# Refactor Folder Structure Plan

## Tujuan

Dokumen ini adalah rencana eksekusi bertahap untuk merapikan struktur folder SchoolPro di development repository `/var/www/schoolpro-dev`.

Blueprint target arsitektur ada di:
- `.kiro/steering/architecture.md`

Dokumen ini fokus pada:
- urutan kerja
- ruang lingkup tiap tahap
- risiko
- checklist verifikasi

## Prinsip Eksekusi

- Refactor dilakukan bertahap, bukan sekali besar.
- Setiap tahap harus selesai dalam kondisi app tetap buildable.
- Jangan mencampur refactor struktur dengan fitur baru dalam satu batch besar.
- Deploy ke production hanya setelah tahap dev stabil dan disetujui.
- Satu batch refactor idealnya hanya punya satu jenis risiko utama: `rename`, `move`, atau `boundary extraction`.
- Jika satu tahap menyentuh terlalu banyak domain aktif, pecah lagi sebelum dikerjakan.

## Tahap 1A — Foundation Cleanup Ringan

### Target
- satukan provider
- pindahkan script non-runtime keluar dari `tmp`
- bersihkan artefak yang tidak memerlukan perubahan route besar

### Pekerjaan
- pindahkan `src/components/providers/AuthProvider.tsx` → `src/providers/AuthProvider.tsx`
- review `src/providers/SkinProvider.tsx` agar semua provider satu boundary
- buat folder:
  - `scripts/debug`
  - `scripts/seed`
  - `scripts/maintenance`
- pindahkan file dari `tmp/` ke folder script yang sesuai
- review `prisma/schema.prisma.bak` dan putuskan:
  - hapus jika tidak diperlukan
  - atau pindahkan ke `docs/archive/` bila perlu disimpan sebagai referensi

### Risiko
- script operasional tidak ditemukan jika ada referensi hardcoded
- import provider tertinggal

### Verifikasi
- `npm run build`
- cek root layout tetap normal
- cek auth session/provider tidak rusak
- cek script yang dipindahkan masih bisa ditemukan sesuai kategori

## Tahap 1B — Portal Route Group Rename

### Target
- hilangkan naming `src/app/app` yang paling membingungkan
- pertahankan namespace URL `/app/*`, tetapi tambahkan boundary route group yang lebih profesional: `(portal)`

### Pekerjaan
- ubah struktur `src/app/app/(admin|auth|wali)` menjadi `src/app/app/(portal)/(admin|auth|wali)`
- rapikan seluruh import relatif yang terdampak
- review redirect, middleware, dan link internal yang mengandalkan struktur lama

### Risiko
- import path rusak karena rename route group
- layout chain admin/auth/wali ikut terganggu
- dev cache atau runtime stale setelah rename besar

### Verifikasi
- `npm run build`
- cek `/app/login`
- cek `/app/dashboard`
- cek `/app/pengaturan/langganan`
- cek halaman wali utama
- cek super admin tetap normal
- cek middleware/auth redirect tetap benar

## Tahap 2 — Shared Boundaries

### Target
- rapikan folder shared infrastructure
- cegah `src/lib` tumbuh liar

### Pekerjaan
- buat subfolder:
  - `src/lib/db`
  - `src/lib/auth`
  - `src/lib/tenant`
  - `src/lib/utils`
  - `src/lib/constants`
- pindahkan file existing:
  - `prisma.ts`
  - `auth.ts`
  - `tenant.ts`
  - `utils.ts`
- rapikan alias/import path
- review `src/types/index.ts` untuk menentukan shared types yang tetap global

### Risiko
- circular import baru
- import alias ketinggalan
- helper shared bercampur dengan helper domain

### Verifikasi
- `npm run build`
- login/logout
- tenant resolution
- halaman publik tetap render

## Tahap 3 — Public Website Extraction

### Target
- pisahkan public component tree dari naming lama `website`
- siapkan domain extraction untuk website publik

### Pekerjaan
- rename:
  - `src/components/website/home` → `src/components/public/home`
  - `src/components/website/layout` → `src/components/public/layout`
  - `src/components/website/shared` → `src/components/public/shared`
- rename route group:
  - `src/app/(website)` → `src/app/(public)`
- review `src/lib/website-data.ts`
  - pindah ke `src/features/website/lib` jika logic-nya domain-specific

### Risiko
- import path komponen publik banyak berubah
- route/public layout error jika ada alias yang tertinggal

### Verifikasi
- `npm run build`
- homepage
- halaman detail publik: agenda, pengumuman, blog, prestasi, profil
- dark mode dan skin switcher

## Tahap 4 — Feature Layer Introduction

### Target
- mulai memindahkan logic domain dari `app`/`lib` ke `features`

### Domain urutan prioritas
1. `website`
2. `ppdb`
3. `keuangan`
4. `data-master`
5. `wali`

### Pekerjaan awal per domain
- buat folder:
  - `src/features/<domain>/components`
  - `src/features/<domain>/actions`
  - `src/features/<domain>/lib`
  - `src/features/<domain>/types`
- pindahkan logic domain sedikit demi sedikit
- page dan route handler hanya menjadi orchestration layer

Aturan eksekusi:
- pilih satu domain aktif per batch
- mulai dari helper/query/mapper sebelum memindahkan UI
- jangan langsung membuat abstraksi lintas domain sebelum pattern-nya terbukti

### Risiko
- over-abstraction terlalu cepat
- domain boundary salah jika dipindah tanpa audit dependensi

### Verifikasi
- build sukses
- smoke test per domain
- tidak ada orphan import

## Tahap 5 — Page Thinning

### Target
- page file pendek dan fokus pada composition

### Pekerjaan
- pindahkan query helper dan mapping logic keluar dari `page.tsx`
- pindahkan form state heavy logic ke feature component/domain hook bila perlu
- satukan reusable table/form blocks dalam domain components

### Indikator berhasil
- `page.tsx` umumnya tidak berisi logic domain panjang
- API route tidak memuat business logic berat secara inline

## Tahap 6 — Cleanup dan Standardization

### Target
- hilangkan sisa naming lama
- bersihkan artefak refactor

### Pekerjaan
- hapus alias sementara yang tidak dipakai
- hapus file backup atau mover shim yang sudah tidak dibutuhkan
- cek dead code
- update dokumen steering final

### Verifikasi
- `npm run build`
- audit import
- audit folder kosong
- audit docs agar sesuai real structure

## Checklist per Tahap

- struktur folder sesuai target tahap
- import path sudah bersih
- tidak ada dead file tertinggal
- `npm run build` sukses
- `pm2 restart schoolpro-dev` bila tahap perlu diuji di dev runtime
- steering relevan diperbarui
- ada daftar entrypoint yang diuji manual setelah tahap selesai
- tidak ada fitur baru yang diselipkan dalam batch refactor

## Guardrail Profesional

Sebelum mengeksekusi tahap refactor, pastikan:
- tujuan tahap bisa dijelaskan dalam satu kalimat
- alasan teknisnya jelas, bukan hanya “biar lebih rapi”
- ada batas write surface yang sempit
- ada rollback path yang masuk akal bila hasilnya buruk

Tanda tahap belum siap dieksekusi:
- terlalu banyak rename lintas domain
- belum jelas file mana yang menjadi sumber kebenaran setelah refactor
- verifikasi masih terlalu abstrak
- perubahan arsitektur dicampur dengan perbaikan fitur aktif

## Aturan Pengambilan Keputusan

- Jika refactor menyentuh banyak domain sekaligus, pecah lagi jadi batch lebih kecil.
- Jika ada konflik dengan perubahan fitur berjalan, prioritaskan stabilitas dev.
- Jika folder baru belum punya manfaat boundary yang jelas, jangan buat hanya demi kerapian visual.

## Tahap yang Disarankan untuk Mulai

Mulai dari Tahap 1A terlebih dahulu karena paling aman dan memberi manfaat nyata tanpa mengguncang route tree:
- unify providers
- pindahkan `tmp/` ke `scripts/`
- arsipkan artefak backup yang tidak lagi layak hidup di root kerja aktif

Setelah 1A stabil, baru nilai kesiapan Tahap 1B untuk menambahkan boundary `src/app/app/(portal)` tanpa mengubah URL `/app/*`.
