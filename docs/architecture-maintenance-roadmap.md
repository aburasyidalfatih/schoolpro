# Architecture Maintenance Roadmap

Dokumen ini menjaga arsitektur SchoolPro tetap konsisten setelah batch refactor awal selesai.

## Status Saat Ini

Yang sudah beres:
- provider global sudah disatukan ke `src/providers`
- script non-runtime sudah dipindah dari `tmp` ke `scripts/*`
- route tenant sudah memakai boundary `src/app/app/(portal)` tanpa mengubah URL `/app/*`
- shared infra `lib` sudah dipisah ke `db`, `auth`, `tenant`, dan `utils`
- website publik sudah memakai naming `public`
- feature layer sudah mulai diperkenalkan untuk `website` dan sebagian `ppdb`

Artinya repo sudah cukup sehat untuk development normal. Fokus berikutnya bukan refactor besar, tetapi menjaga disiplin boundary.

## Prioritas Berikutnya

### Prioritas 1 — Stabilize by Usage

Tujuan:
- biarkan tim memakai struktur baru dulu
- identifikasi pain point nyata sebelum membuka batch refactor berikutnya

Aturan:
- jangan pindahkan domain baru hanya demi konsistensi visual
- catat file/page yang kembali gemuk atau helper yang kembali salah lokasi

### Prioritas 2 — Domain-by-Domain Extraction

Urutan yang disarankan:
1. `website`
2. `ppdb`
3. `keuangan`
4. `data-master`
5. `wali`

Rule:
- satu batch hanya satu domain
- mulai dari `lib`, `actions`, `constants`, atau `types`
- pindahkan UI domain-specific setelah pattern domainnya stabil

### Prioritas 3 — Page Thinning

Target:
- `page.tsx` tetap tipis
- mapping/status label/query helper yang mulai berulang dipindah ke domain yang tepat

Trigger:
- satu page memuat query + mapper + modal logic + status labels sekaligus
- satu page sulit dites atau sulit dibaca karena terlalu padat

## Kapan Tidak Perlu Refactor

Jangan buka refactor baru jika:
- task saat ini hanya bugfix kecil
- file yang disentuh masih jelas tanggung jawabnya
- perpindahan folder tidak mengurangi complexity nyata
- tim masih beradaptasi dengan struktur hasil refactor terakhir

## Kriteria Memulai Batch Refactor Baru

Semua poin ini harus terpenuhi:
- target batch bisa dijelaskan dalam satu kalimat
- domain yang disentuh hanya satu
- source of truth sesudah perpindahan jelas
- ada daftar file yang akan disentuh
- ada verifikasi konkret setelah perubahan

## Checklist Sebelum Menutup Task

- boundary import baru sudah benar
- tidak ada path lama yang tertinggal
- tidak ada helper domain-specific baru yang nyasar ke `lib`
- tidak ada business rule baru yang tertanam di layout atau UI generic
- steering relevan diperbarui bila arah struktur berubah

## Checklist Review PR / Task Besar

- apakah perubahan ini memperjelas atau justru mengaburkan boundary?
- apakah `tenantId` tetap aman di semua read/write tenant?
- apakah ada logic domain yang semestinya tidak lagi tinggal di `page.tsx`?
- apakah ada abstraction baru yang sebenarnya belum perlu?
- apakah dokumentasi arsitektur masih sesuai dengan struktur nyata?

## Backlog Arsitektur yang Layak, Bukan Mendesak

- lanjutkan extraction `website` sampai helper domainnya rapi
- lanjutkan extraction `ppdb` dengan pattern yang sama
- audit `src/actions` yang tersisa
- audit page admin yang masih terlalu gemuk
- standardisasi constants/status maps per domain

## Prinsip Penutup

Arsitektur profesional tidak dijaga dengan refactor besar terus-menerus. Arsitektur dijaga dengan:
- keputusan penempatan file yang disiplin
- batch refactor kecil yang jelas manfaatnya
- dokumentasi yang tetap sinkron dengan struktur nyata
