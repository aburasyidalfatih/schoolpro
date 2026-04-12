---
inclusion: always
---

# SchoolPro — Engineering Guardrails

Dokumen ini menetapkan standar engineering jangka panjang agar pengembangan tetap rapi, konsisten, dan profesional.

## Prinsip Inti

1. Data correctness lebih penting daripada kecepatan coding.
2. Multi-tenant safety lebih penting daripada convenience.
3. Boundary yang jelas lebih penting daripada folder yang tampak rapi.
4. Edit minimal lebih baik daripada refactor besar tanpa kebutuhan nyata.
5. Pattern yang terbukti di repo lebih baik daripada abstraksi baru yang belum perlu.

## Definition of Good Change

Perubahan dianggap sehat jika:
- tujuan bisnisnya jelas
- write surface sempit
- tidak menurunkan isolasi tenant
- tidak menambah dependency yang salah arah
- tidak meninggalkan naming/struktur yang makin membingungkan
- bisa diverifikasi dengan langkah yang proporsional

## Decision Rules Harian

### Saat menambah file baru

- pilih lokasi berdasarkan tanggung jawab, bukan karena folder itu kebetulan dekat
- jika file hanya dipakai satu domain, mulai dari domain itu dulu
- jika file lintas domain dan stabil, pertimbangkan `lib`
- jika file hanya reusable secara visual, pertimbangkan `components/ui`

### Saat mengedit page atau route

- page harus fokus pada composition, orchestration, dan state UI ringan
- route handler harus fokus pada auth, validasi, query/write, dan response
- query helper, mapper, formatter, dan business rule panjang jangan dibiarkan menumpuk inline bila mulai berulang

### Saat merasa ingin membuat abstraction

Boleh lanjut hanya jika:
- duplication memang nyata, bukan baru dua baris mirip
- abstraction membuat boundary lebih jelas
- naming abstraction bisa dipahami tanpa membaca implementasi panjang

Tahan dulu jika:
- abstraction dibuat hanya untuk "future reuse"
- domain yang dibandingkan belum stabil
- helper generik justru jadi menutupi rule bisnis penting

## File Placement Matrix

### Taruh di `src/app/*`
- `page.tsx`
- `layout.tsx`
- `loading.tsx`
- `error.tsx`
- `route.ts`

### Taruh di `src/features/<domain>/*`
- action domain
- status map domain
- option list domain
- formatter domain
- query helper domain
- komponen form/table/card yang spesifik satu domain

### Taruh di `src/lib/*`
- Prisma client
- auth infra
- tenant resolution
- helper generik murni seperti format tanggal/angka/string
- konstanta global lintas domain

### Taruh di `src/components/ui/*`
- button
- modal
- badge
- data table generic
- input reusable

### Jangan lakukan
- simpan query domain-specific di `lib` hanya karena cepat
- simpan business rule di `components/layout`
- biarkan `page.tsx` menjadi file 400+ baris tanpa alasan kuat
- tambah provider baru di lokasi selain `src/providers`

## Review Checklist untuk Setiap Task

- query tenant sudah benar?
- role check sudah sesuai?
- response API tetap konsisten?
- copy UI tidak terlalu teknis?
- loading/error/empty state tertangani?
- import baru mengikuti boundary aktif?
- ada helper/constant yang seharusnya dipindah dari page?
- dark mode tetap aman?
- dead code ikut dibersihkan?
- steering relevan ikut diperbarui?

## Refactor Guardrails

Refactor boleh dilanjutkan jika:
- ada masalah nyata yang sedang diatasi
- target stage bisa dijelaskan dalam satu kalimat
- ada verifikasi konkret setelah batch selesai
- batch hanya punya satu risiko utama

Refactor harus ditunda jika:
- masih ada fitur aktif yang sedang dikejar di area sama
- rename menyentuh terlalu banyak domain sekaligus
- belum jelas source of truth setelah perpindahan
- perubahan lebih banyak kosmetik struktur daripada nilai engineering

## Anti-Patterns yang Harus Dihindari

- page menjadi tempat semua query, mapper, status label, dan modal logic sekaligus
- API route mengandung business rule berat bercampur format response dan transform UI
- helper generik semu di `lib` yang sebenarnya hanya dipakai satu modul
- copy-paste query lintas halaman tanpa extraction yang terkontrol
- menambah folder baru hanya agar tampak "enterprise" tanpa boundary nyata
- cleanup besar di tengah task fitur kecil

## Quality Gates

- bugfix lokal: verifikasi paling sempit yang cukup
- perubahan route/auth/prisma/integration: `npm run build`
- perubahan runtime-sensitive: cek `pm2` atau hit route dev seperlunya
- perubahan dokumentasi arsitektur: sinkronkan steering dan roadmap jika keputusan arah berubah

## Rule of Stability

Saat arsitektur sudah "cukup sehat", default berikutnya bukan refactor lagi, tetapi:
- pakai struktur yang ada secara disiplin
- refactor kecil hanya saat ada pain point nyata
- buka batch arsitektur baru hanya bila manfaatnya jelas dan terukur
