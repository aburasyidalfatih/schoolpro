---
inclusion: always
---

# SchoolPro Architecture Blueprint

## Tujuan

Dokumen ini menetapkan struktur folder target untuk SchoolPro agar:
- tetap mudah dipahami saat modul SaaS bertambah
- menjaga boundary domain tetap jelas
- mencegah `src/app`, `src/lib`, dan `src/components` menjadi dumping ground
- membuat refactor bertahap tetap aman untuk development dan production

Dokumen ini adalah arah arsitektur target. Implementasi refactor dilakukan bertahap mengikuti `docs/refactor-folder-structure-plan.md`.

## Aturan Penting Untuk Pekerjaan Harian

- Dokumen ini adalah target arah, bukan instruksi untuk merombak struktur pada setiap task.
- Untuk bugfix, fitur kecil, dan perubahan operasional, prioritaskan edit minimal pada struktur yang ada sekarang.
- Refactor menuju blueprint ini hanya dilakukan bila task memang meminta restrukturisasi atau saat perubahan modul sudah cukup besar untuk membenarkannya.

## Prinsip Struktur

### 0. Boundary dan dependency harus eksplisit

Arsitektur yang sehat bukan hanya soal folder, tetapi soal arah dependency yang konsisten.

Aturan dependency jangka panjang:
- `src/app` boleh mengimpor dari `features`, `components`, `lib`, `providers`, dan `types`
- `features/<domain>` boleh mengimpor dari `lib`, `components/ui`, dan `types`
- `components/ui` tidak boleh mengimpor logic domain dari `features`
- `components/layout` tidak boleh menyimpan business logic domain
- `lib` tidak boleh mengimpor dari `app` atau `features`
- antar `features/<domain>` jangan saling mengimpor sembarangan; jika ada kebutuhan shared, pindahkan ke `lib` atau `features/shared`

Jika sebuah file membuat boundary makin kabur, itu sinyal bahwa lokasi file atau tanggung jawabnya salah.

### 1. `src/app` hanya untuk routing

Folder `src/app` dipakai untuk:
- `page.tsx`
- `layout.tsx`
- `loading.tsx`
- `error.tsx`
- `route.ts`
- route groups App Router

Jangan jadikan `src/app` tempat utama menyimpan logic domain, query helper, atau komponen kompleks yang dipakai lintas route.

### 2. `features` sebagai boundary domain jangka menengah

Logic domain idealnya bergerak ke `src/features/<domain>` agar page dan API handler tetap tipis, tetapi jangan memaksa perpindahan file pada task kecil.

Contoh domain utama:
- `auth`
- `website`
- `ppdb`
- `keuangan`
- `data-master`
- `wali`
- `shared` bila ada logic lintas domain yang tidak cocok di `lib`

Setiap domain boleh memiliki subfolder:
- `components`
- `actions`
- `lib`
- `types`
- `constants`
- `schemas`

Target tanggung jawab dalam domain:
- `components`: UI domain-specific
- `actions`: server actions atau orchestration write flow
- `lib`: query helper, mapper, formatter, rule bisnis spesifik domain
- `types`: types yang tidak layak tetap global
- `constants`: label, status map, option list domain
- `schemas`: validasi input domain jika nanti dibutuhkan

### 3. `components/ui` hanya untuk komponen generik

`src/components/ui` hanya berisi komponen reusable yang tidak terikat domain bisnis, misalnya:
- `Button`
- `Modal`
- `DataTable`
- `Input`
- `Badge`

Komponen yang terikat domain atau konteks halaman harus masuk ke `features/<domain>/components` atau `src/components/public`.

### 4. `lib` hanya untuk infrastructure dan shared primitives

`src/lib` tidak boleh tumbuh menjadi tempat semua helper dilempar begitu saja.

Yang pantas berada di `src/lib`:
- `db/prisma.ts`
- auth infra
- tenant resolution infra
- utility shared generik
- konstanta global

Yang tidak ideal tetap berada di `src/lib`:
- query helper yang spesifik `ppdb`
- formatter yang hanya dipakai satu domain
- mapping logic untuk satu modul tertentu

Prinsip penting:
- `lib` adalah tempat utilitas stabil lintas domain
- jika helper hanya dipakai satu area produk, jangan simpan di `lib`
- jangan menambahkan file ke `lib` hanya karena belum sempat memilih boundary yang benar

Catatan boundary runtime:
- helper resolusi host, environment, dan app context lintas subdomain masih layak berada di `src/lib/runtime` atau `src/lib/constants` selama fungsinya tetap murni infrastructural
- untuk SchoolPro, boundary host minimum yang harus dijaga adalah `marketing`, `platform`, dan `tenant`
- pada environment development, gunakan first-level subdomain seperti `dev.schoolpro.id`, `demo-dev.schoolpro.id`, `ops-dev.schoolpro.id`, dan `*-dev.schoolpro.id`; jangan andalkan pola `tenant.dev.schoolpro.id` bila edge SSL Cloudflare belum mendukungnya

### 5. Provider idealnya disatukan

Targetnya semua React provider berada di `src/providers`.

Hindari menambah penyebaran provider baru antara:
- `src/providers`
- `src/components/providers`

Boundary provider harus konsisten agar bootstrap app mudah diikuti.

### 6. Script operasional tidak disimpan di `tmp`

Script sementara, seed utilitas, dan debugging helper harus dipindah ke:
- `scripts/seed`
- `scripts/debug`
- `scripts/maintenance`

Folder `tmp/` sebaiknya tidak menjadi bagian permanen dari struktur repo aktif.

### 7. Naming route groups harus mencerminkan intent

Hindari memperluas struktur membingungkan seperti `src/app/app/...`, tetapi jangan memindahkan route group lama tanpa kebutuhan task yang jelas.

Gunakan grouping yang menjelaskan area produk:
- `(public)`
- `(portal)`
- `(admin)`
- `(wali)`
- `(auth)`

Jika perlu area dashboard bersama, gunakan `(portal)` sebagai boundary utama.

## Struktur Folder Target

```text
src/
  app/
    (public)/
      page.tsx
      agenda/
      blog/
      editorial/
      ekskul/
      fasilitas/
      guru/
      kontak/
      pengumuman/
      prestasi/
      profil/
      layout.tsx

    app/
      (portal)/
        (auth)/
          login/
          register/
        (admin)/
          dashboard/
          data-master/
          keuangan/
          ppdb/
          website/
          pengaturan/
          laporan/
          notifikasi/
          tools/
        (wali)/
          beranda/
          tagihan-saya/
          ppdb/
        layout.tsx

    landing/
    api/
      auth/
      data-master/
      keuangan/
      ppdb/
      website/
      wali/

  components/
    ui/
    layout/
    public/
      home/
      layout/
      shared/

  features/
    auth/
      components/
      actions/
      lib/
      types/
    website/
      components/
      lib/
      types/
    ppdb/
      components/
      actions/
      lib/
      types/
    keuangan/
      components/
      actions/
      lib/
      types/
    data-master/
      components/
      actions/
      lib/
      types/
    wali/
      components/
      lib/
      types/

  lib/
    auth/
    db/
    tenant/
    utils/
    constants/

  providers/
    AuthProvider.tsx
    SkinProvider.tsx
    ThemeProvider.tsx

  styles/
    globals/
    shared/

  types/
    shared/
```

## Mapping dari Struktur Saat Ini

### Route groups
- `src/app/(website)` → `src/app/(public)`
- `src/app/app/(admin)` → `src/app/app/(portal)/(admin)`
- `src/app/app/(auth)` → `src/app/app/(portal)/(auth)`
- `src/app/app/(wali)` → `src/app/app/(portal)/(wali)`

### Public components
- `src/components/website/home` → `src/components/public/home`
- `src/components/website/layout` → `src/components/public/layout`
- `src/components/website/shared` → `src/components/public/shared`

### Providers
- `src/components/providers/AuthProvider.tsx` → `src/providers/AuthProvider.tsx`

### Lib
- `src/lib/prisma.ts` → `src/lib/db/prisma.ts`
- `src/lib/auth.ts` → `src/lib/auth/*`
- `src/lib/tenant.ts` → `src/lib/tenant/*`
- `src/lib/website-data.ts` → `src/features/website/lib/*` atau `src/lib/website/*` jika benar-benar lintas route

### Scripts
- `tmp/*.js`
- `tmp/*.mjs`

dipindah ke:
- `scripts/debug`
- `scripts/seed`
- `scripts/maintenance`

## Aturan Refactor

- Refactor harus bertahap, jangan big-bang.
- Setiap tahap harus tetap `npm run build` sukses.
- Jangan campur refactor struktur dengan perubahan fitur besar dalam satu tahap.
- Jika boundary domain berubah, update steering dan docs di tahap yang sama.
- Jika rename folder berdampak ke import path luas, lakukan per-domain agar risiko merge conflict kecil.

## Aturan Profesional Jangka Panjang

### 1. Satu file, satu alasan berubah

Jika sebuah file berubah karena terlalu banyak alasan berbeda, file itu kemungkinan memegang terlalu banyak tanggung jawab.

Contoh yang harus dihindari:
- `page.tsx` yang berisi fetch, mapping, validation, modal state, tabel, dan submit logic sekaligus
- route handler yang memuat auth, query, business rule, transform, dan response formatting semua inline

### 2. Business rule tidak boleh tersembunyi di UI

Aturan bisnis seperti quota siswa, status billing, atau validasi subscription tidak boleh hanya hidup di komponen UI.

Rule harus berada di:
- `features/<domain>/lib`
- atau `src/lib/*` bila benar-benar lintas domain

UI hanya membaca hasil rule tersebut.

### 3. Hindari abstraction prematur

Jangan membuat:
- generic hook yang sebenarnya hanya dipakai satu halaman
- shared helper yang sebenarnya hanya dipakai satu domain
- folder `shared` baru tanpa manfaat boundary yang jelas

Abstraction dibuat setelah pattern terbukti berulang, bukan sebelumnya.

### 4. Route handler dan page adalah orchestration layer

Target jangka panjang:
- `page.tsx` fokus pada composition
- `route.ts` fokus pada auth, validasi awal, lalu delegasi ke helper/domain logic
- logic berat dipindahkan ke domain layer

### 5. Naming harus mencerminkan intent, bukan sejarah

Nama seperti `app/app`, `website` untuk semua hal publik, atau helper generik yang ternyata domain-specific sebaiknya dieliminasi bertahap.

Nama folder harus membantu engineer baru memahami:
- area produk apa yang sedang dibuka
- siapa pemilik logic tersebut
- dependency ke mana yang wajar

### 6. Dokumen arsitektur harus mengikuti real code

Jika implementasi nyata memaksa penyimpangan dari blueprint:
- prioritaskan stabilitas code
- lalu perbarui steering agar tetap jujur

Blueprint bukan dogma; blueprint adalah alat untuk menjaga konsistensi keputusan.

## Larangan Praktis

Untuk menjaga repo tetap sehat, hindari pola berikut:
- menambah logic domain baru langsung di `src/app/*` jika sudah ada boundary domain yang lebih tepat
- menaruh helper domain-specific baru di `src/lib` tanpa alasan lintas domain yang kuat
- menambah komponen reusable baru di luar `components/ui` bila sebenarnya generic
- menyimpan script permanen baru di `tmp`
- memperbesar `page.tsx` yang sudah terlalu berat tanpa ekstraksi
- membuat refactor besar tanpa checklist verifikasi yang jelas

## Anti-Pattern yang Harus Dihindari

- `src/app/app/...`
- domain logic kompleks langsung di `page.tsx`
- semua helper menumpuk di `src/lib`
- provider tersebar di beberapa folder
- script maintenance/debug berada di `tmp`
- file backup seperti `schema.prisma.bak` tinggal permanen tanpa alasan jelas

## Definisi Selesai Jangka Menengah

Struktur repo dianggap sudah sehat ketika:
- route file tipis dan fokus pada composition
- logic domain utama berada di `src/features/*`
- `src/lib` hanya memuat shared infrastructure
- `src/components/ui` tetap generik
- provider disatukan
- script operasional punya rumah yang jelas
- tidak ada naming route yang membingungkan untuk developer baru
