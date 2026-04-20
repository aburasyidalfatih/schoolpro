# SchoolPro — PPDB Stabilization Roadmap

Dokumen ini menjadi rujukan kerja lanjutan untuk penyempurnaan fitur PPDB berdasarkan implementasi yang sudah aktif di `/var/www/schoolpro-dev`.

Dokumen ini tidak menggantikan [docs/03_implementation_plan_ppdb.md](/var/www/schoolpro-dev/docs/03_implementation_plan_ppdb.md). Dokumen lama tetap menjadi blueprint awal implementasi. Dokumen ini fokus pada:
- evaluasi fitur PPDB yang sudah berjalan
- gap produk, operasional, dan teknis
- prioritas hardening
- usulan batch kerja yang bisa dieksekusi bertahap atau diparalelkan oleh orchestrator

## Tujuan

PPDB SchoolPro saat ini sudah berfungsi, tetapi masih perlu dimatangkan agar:
- alur pendaftar lebih jelas dan minim kebingungan
- admin lebih cepat mengambil keputusan
- backend lebih aman terhadap race condition, invalid transition, dan tenant leak
- proses diterima sampai menjadi siswa aktif lebih operasional

Target utamanya bukan menambah banyak fitur baru, tetapi membuat PPDB lebih kuat, lebih terukur, dan lebih siap dipakai secara serius oleh tenant sekolah.

## Progress Implementasi Terkini

Progress yang sudah selesai sampai sesi kerja ini:
- backend hardening awal untuk flow PPDB utama sudah dikerjakan
- action PPDB sekarang lebih aman terhadap duplicate submit, tenant mismatch, dan klik ganda
- route invoice, pembayaran, verifikasi, berkas, dan pendaftar sudah diperketat pada tenant scope dan relation safety
- rule backend minimum untuk beberapa transisi status sudah mulai ditegakkan
- helper derived workflow PPDB sudah dibuat di `src/features/ppdb/lib/ppdb-workflow.ts`
- helper identifier PPDB kini juga sudah dipisah ke `src/features/ppdb/lib/ppdb-identifiers.ts` untuk retry dan generasi nomor yang lebih aman tanpa perubahan schema
- API detail pendaftar dan API cek status publik sudah mengembalikan snapshot workflow
- halaman `cek status` publik sudah mulai memakai label workflow, deskripsi, dan next action
- halaman detail pendaftar admin sudah mulai menampilkan panel workflow, readiness summary, dan blocker utama
- backend `draft` vs `final submit` pada form lengkap wali sudah aktif di endpoint detail pendaftar
- UI form lengkap wali kini sudah mendukung simpan draft vs kirim final
- list pendaftar admin kini mulai memakai snapshot workflow untuk filter tahap dan statistik operasional
- list pendaftar admin kini juga memakai pagination shared dan API list tidak lagi mengirim payload detail berat untuk seluruh hasil pada setiap halaman
- halaman admin `Tagihan PPDB` kini sudah diganti dari placeholder menjadi meja kerja daftar ulang yang memakai API khusus untuk statistik, filter tahap pasca-diterima, status tagihan daftar ulang, dan kesiapan sinkronisasi siswa
- stepper dan copy utama pada form lengkap wali kini mulai mengikuti lifecycle draft/final dan review admin
- halaman invoice wali kini juga menampilkan workflow, next action, dan CTA yang sinkron dengan status draft/final formulir
- dashboard `/app/beranda` wali kini mulai memakai workflow PPDB yang sama untuk status, progress, dan CTA utama pendaftar
- route verifikasi admin kini menolak `TERVERIFIKASI` atau `DITERIMA` jika formulir belum benar-benar `final submit` atau readiness workflow belum terpenuhi
- sinkronisasi PPDB ke `Siswa` kini tidak lagi mengubah role akun wali menjadi `SISWA`; relasi akun pendaftar tetap aman dan sinkronisasi disimpan sebagai metadata pada record siswa
- generator nomor pendaftaran dan NIS tidak lagi bergantung pada pola `count + 1`, tetapi memakai generator prefix-aware + retry pada constraint conflict

Yang belum selesai dan masih menjadi pekerjaan lanjutan:
- penyelarasan lanjutan copy dan indikator workflow PPDB di kartu ringkasan tenant atau layar wali lain yang belum disentuh
- kemungkinan helper workflow dipakai juga di dashboard atau kartu ringkasan PPDB tenant
- keputusan produk apakah layar admin `Tagihan PPDB` perlu menambah aksi inline untuk generate/verifikasi atau tetap memakai pola triase ke halaman detail pendaftar

## Handoff Terdekat

Jika pekerjaan PPDB dilanjutkan pada sesi berikutnya, urutan yang direkomendasikan:

1. Audit ulang surface wali atau tenant lain yang masih belum memakai copy workflow PPDB yang baru.
2. Evaluasi apakah milestone pasca-diterima perlu dipersist sebagai field eksplisit jika reporting operasional makin kompleks.
3. Pertimbangkan counter/sequence khusus bila tenant besar nantinya membutuhkan nomor PPDB atau NIS yang lebih terstruktur dari prefix tahunan saat ini.
4. Tambahkan QA browser end-to-end pada flow admin review sampai sinkronisasi siswa untuk memastikan behavior runtime sesuai guard backend baru.

Catatan penting:
- untuk saat ini lifecycle baru masih berupa derived state, belum enum database baru
- jangan menambah schema dulu kecuali kebutuhan `draft/final` tidak lagi nyaman di-handle dari state turunan
- jika nanti `draft/final submit` menambah field baru atau mengubah perilaku UI secara material, update dokumen steering terkait sebelum batch ditutup

## Ringkasan Kondisi Saat Ini

Surface area PPDB yang sudah ada:
- landing page publik PPDB
- form singkat pendaftar
- invoice pendaftaran dan upload bukti bayar
- form lengkap dan upload berkas
- meja review admin
- verifikasi status pendaftar
- generate tagihan daftar ulang
- sinkronisasi pendaftar diterima ke tabel `Siswa`
- cek status publik berdasarkan nomor pendaftaran

Implementasi yang sudah ditinjau untuk analisis ini:
- [src/app/ppdb/page.tsx](/var/www/schoolpro-dev/src/app/ppdb/page.tsx)
- [src/app/app/(portal)/(wali)/ppdb/form-singkat/page.tsx](/var/www/schoolpro-dev/src/app/app/(portal)/(wali)/ppdb/form-singkat/page.tsx)
- [src/app/app/(portal)/(wali)/ppdb/form-lengkap/[id]/page.tsx](/var/www/schoolpro-dev/src/app/app/(portal)/(wali)/ppdb/form-lengkap/[id]/page.tsx)
- [src/app/app/(portal)/(wali)/ppdb/invoice/[id]/page.tsx](/var/www/schoolpro-dev/src/app/app/(portal)/(wali)/ppdb/invoice/[id]/page.tsx)
- [src/app/app/(portal)/(admin)/ppdb/pendaftar/page.tsx](/var/www/schoolpro-dev/src/app/app/(portal)/(admin)/ppdb/pendaftar/page.tsx)
- [src/app/app/(portal)/(admin)/ppdb/pendaftar/[id]/page.tsx](/var/www/schoolpro-dev/src/app/app/(portal)/(admin)/ppdb/pendaftar/[id]/page.tsx)
- [src/features/ppdb/actions/ppdb-actions.ts](/var/www/schoolpro-dev/src/features/ppdb/actions/ppdb-actions.ts)
- [src/features/ppdb/actions/ppdb-payment-actions.ts](/var/www/schoolpro-dev/src/features/ppdb/actions/ppdb-payment-actions.ts)
- [src/app/api/ppdb/pendaftar/route.ts](/var/www/schoolpro-dev/src/app/api/ppdb/pendaftar/route.ts)
- [src/app/api/ppdb/pendaftar/[id]/route.ts](/var/www/schoolpro-dev/src/app/api/ppdb/pendaftar/[id]/route.ts)
- [src/app/api/ppdb/pendaftar/[id]/verifikasi/route.ts](/var/www/schoolpro-dev/src/app/api/ppdb/pendaftar/[id]/verifikasi/route.ts)
- [src/app/api/ppdb/pendaftar/[id]/sinkron/route.ts](/var/www/schoolpro-dev/src/app/api/ppdb/pendaftar/[id]/sinkron/route.ts)
- [src/app/api/ppdb/periode/route.ts](/var/www/schoolpro-dev/src/app/api/ppdb/periode/route.ts)
- [src/app/api/ppdb/cek-status/route.ts](/var/www/schoolpro-dev/src/app/api/ppdb/cek-status/route.ts)

## Alur PPDB Saat Ini

Alur yang berjalan sekarang dapat diringkas sebagai berikut:

1. Calon wali membuat akun dan memilih gelombang PPDB.
2. Sistem membuat `PendaftarPpdb` dan `TagihanPpdb` jenis `PENDAFTARAN`.
3. Pendaftar membuka invoice dan mengirim bukti pembayaran.
4. Admin memverifikasi pembayaran.
5. Setelah tagihan formulir lunas, pendaftar mengisi form lengkap dan upload berkas.
6. Admin mereview data dan berkas, lalu menetapkan status seperti `TERVERIFIKASI`, `DITERIMA`, atau `DITOLAK`.
7. Jika diterima, admin dapat membuat tagihan daftar ulang.
8. Admin dapat menyinkronkan pendaftar ke `Siswa`.

Secara fungsional, alur ini sudah cukup lengkap. Namun state prosesnya masih terlalu datar dan sebagian rule bisnis masih bergantung pada disiplin manual admin.

## Catatan Masalah Utama

### 1. Workflow state masih terlalu longgar

Status utama yang dipakai sekarang belum cukup menjelaskan posisi proses secara operasional.

Contoh gap:
- belum membedakan draft awal dan submit final
- belum membedakan menunggu pembayaran dan pembayaran sedang diverifikasi
- belum membedakan form lengkap belum selesai dan siap direview
- belum membedakan diterima tetapi belum daftar ulang
- belum membedakan diterima dan sudah menjadi siswa aktif

Dampak:
- admin sulit melakukan triase
- pendaftar sulit memahami langkah berikutnya
- dashboard dan reporting PPDB akan sulit berkembang

Arahan:
- jangka pendek: buat derived status di level aplikasi
- jangka menengah: pertimbangkan lifecycle state yang lebih eksplisit bila pola sudah stabil

### 2. Nomor pendaftaran dan NIS belum cukup aman

Beberapa nomor masih dihasilkan dari pola `count + 1`.

Risiko:
- race condition saat submit paralel
- potensi nomor ganda pada beban nyata
- sulit diaudit bila terjadi bentrok

Status terbaru:
- sudah ditangani pada batch ini dengan helper generator prefix-aware + retry terhadap conflict unik
- masih ada ruang penguatan ke counter eksplisit bila tenant besar nanti butuh sequence yang lebih formal

### 3. Tenant safety dan ownership checks masih perlu diperketat

Sebagian query utama sudah memakai `tenantId`, tetapi mutation child record masih perlu diperiksa lebih ketat.

Risiko:
- update berkas atau pembayaran berbasis `id` global tanpa verifikasi relasi penuh
- potensi salah update lintas pendaftar atau lintas tenant jika ada celah handler

Arahan:
- setiap update child entity harus memverifikasi:
  - `tenantId`
  - relasi ke `pendaftarId`
  - kepemilikan record terhadap context yang sedang diproses

### 4. Form lengkap belum punya mode draft vs final submit

Saat ini pendaftar mengisi data lengkap dan mengirim berkas, tetapi belum ada pemisahan jelas antara:
- simpan sementara
- kirim final untuk direview admin

Risiko:
- data setengah lengkap tetap tampak seperti submission
- admin mereview data yang belum benar-benar siap
- user tidak mendapat checkpoint yang jelas

Arahan:
- tambahkan mode `draft` dan `final submit`
- validasi field wajib hanya dipaksakan saat final submit
- tampilkan indikator progress dan kelengkapan berkas

### 5. Rule verifikasi admin masih terlalu permisif

Admin saat ini bisa mengubah status pendaftar cukup bebas selama status valid.

Risiko:
- pendaftar diterima padahal pembayaran belum lunas
- status `TERVERIFIKASI` dipakai walau berkas wajib belum lengkap
- penerimaan tidak didukung readiness checks yang konsisten

Status terbaru:
- backend kini menolak `TERVERIFIKASI` dan `DITERIMA` bila workflow belum siap
- `DITERIMA` juga kini menuntut status review sebelumnya benar-benar sudah lolos `TERVERIFIKASI`
- rule minimum `form lengkap harus final` kini sudah ditegakkan di route verifikasi admin, bukan hanya di UI/form wali

### 6. Review admin belum cukup decision-assisted

Halaman detail pendaftar sudah cukup informatif, tetapi belum memberikan ringkasan readiness yang cepat dipindai admin.

Yang sebaiknya ditambahkan:
- pembayaran pendaftaran: `belum bayar / pending / lunas`
- form lengkap: `draft / final`
- berkas wajib: `x/y lengkap`
- hasil review berkas: `ada yang ditolak / semua valid`
- sinkronisasi siswa: `belum / sudah`

Dampak:
- admin lebih cepat mengambil keputusan
- mengurangi error review saat volume pendaftar tinggi

### 7. Pengalaman pendaftar masih kurang terarah

Pendaftar sudah punya stepper, invoice, dan form, tetapi sistem belum cukup jelas memberi tahu:
- posisi proses saat ini
- action berikutnya
- alasan mengapa proses tertahan

Yang sebaiknya dibenahi:
- copy yang lebih operasional
- status explanation yang konsisten
- halaman status atau dashboard PPDB yang lebih eksplisit

### 8. Public status tracking masih minim

Cek status publik saat ini masih menampilkan informasi dasar.

Yang belum cukup:
- arti status bagi wali
- langkah berikutnya
- apakah ada revisi berkas atau hanya menunggu

Arahan:
- tampilkan `status explanation`
- tampilkan `next action`
- tetap jaga agar data sensitif tidak ikut terekspos

### 9. Data formulir dan pengumuman masih bertumpu pada JSON

Pendekatan JSON masih masuk akal untuk fase awal, tetapi ada tradeoff:
- validasi lebih sulit
- reporting lebih sulit
- query/filter lebih terbatas
- perubahan bentuk data lebih rawan tidak konsisten

Arahan:
- jangka pendek: definisikan contract TypeScript yang ketat untuk isi JSON
- jangka menengah: field inti PPDB bisa dipindah ke kolom eksplisit jika kebutuhan query dan reporting meningkat

### 10. Flow pasca-diterima belum cukup operasional

Saat pendaftar diterima, sistem sudah mendukung tagihan daftar ulang dan sinkronisasi siswa. Namun lifecycle setelah diterima belum cukup terstruktur.

Yang masih perlu dirapikan:
- diterima tetapi tagihan daftar ulang belum dibuat
- tagihan daftar ulang sudah dibuat tetapi belum lunas
- sudah lunas tetapi belum disinkronkan
- sudah menjadi siswa aktif

Arahan:
- buat operational milestones pasca-diterima
- gunakan milestone ini untuk filter admin dan notifikasi berikutnya

Catatan tambahan terbaru:
- sinkronisasi ke `Siswa` kini menyimpan metadata `sumberPpdb` dan `syncedAt` pada record siswa hasil sinkron
- akun wali/pendaftar tidak lagi diubah rolenya saat proses sinkronisasi berjalan

## Prinsip Penyempurnaan

PPDB sebaiknya disempurnakan dengan prinsip berikut:
- edit minimal, jangan refactor besar tanpa kebutuhan nyata
- tenant safety lebih penting daripada kenyamanan implementasi
- backend validation lebih penting daripada asumsi UI
- state proses harus jelas bagi admin dan pendaftar
- keputusan admin harus dibantu sistem, bukan hanya mengandalkan ingatan operator

## Prioritas Pengerjaan

### Prioritas 1 — Hardening backend dan data correctness

Fokus:
- tenant ownership checks
- role guard
- validasi relasi child record
- status transition rules
- anti-duplicate nomor pendaftaran dan NIS

Tujuan:
- mencegah bug berisiko tinggi
- mengurangi error operasional
- memastikan proses PPDB aman di multi-tenant environment

### Prioritas 2 — Rapikan lifecycle dan status proses

Fokus:
- derived workflow status
- draft vs final submit
- readiness checks untuk admin
- status explanation untuk pendaftar

Tujuan:
- membuat alur lebih mudah dipahami
- mengurangi ambigu pada review dan monitoring

### Prioritas 3 — Sempurnakan review admin

Fokus:
- summary panel per pendaftar
- filter operasional yang lebih tajam
- indikator berkas, pembayaran, dan readiness
- flow keputusan yang lebih preskriptif

Tujuan:
- mempercepat kerja admin PPDB
- membuat UI lebih cocok untuk volume pendaftar tinggi

### Prioritas 4 — Rapikan pembayaran dan daftar ulang

Fokus:
- tetapkan satu flow pembayaran utama
- bedakan mode demo/simulasi dan flow riil
- rapikan keterkaitan pembayaran, daftar ulang, dan sinkronisasi siswa

Tujuan:
- mengurangi kebingungan flow
- membuat transisi antar tahap lebih kuat

### Prioritas 5 — Refinement schema bila sudah justified

Fokus:
- kontrak data JSON
- auditability
- reporting support
- field inti yang layak diekstrak dari JSON

Tujuan:
- menjaga PPDB tetap berkembang tanpa schema chaos

## State Matrix PPDB

Bagian ini mendefinisikan lifecycle operasional PPDB yang direkomendasikan untuk implementasi berikutnya.

State matrix ini sengaja memakai pendekatan `derived workflow state`, bukan langsung menambah enum baru di database. Source of truth tetap kombinasi data yang sudah ada:
- `PendaftarPpdb.status`
- `TagihanPpdb`
- `PembayaranPpdb`
- `BerkasPpdb`
- data form lengkap
- status sinkron ke `Siswa`

### Prinsip Derived State

Tujuannya:
- admin melihat readiness dan blocker dengan cepat
- pendaftar melihat langkah berikutnya dengan jelas
- backend dan UI memakai bahasa status yang sama

Derived state tidak harus langsung disimpan di database. Pada tahap awal, state ini cukup dihitung dari data yang sudah ada lalu dipakai di:
- detail pendaftar admin
- dashboard atau status pendaftar
- kartu progres PPDB
- filter daftar pendaftar

### State yang Direkomendasikan

#### 1. `REGISTRATION_CREATED`

Arti:
- pendaftar sudah punya record PPDB
- form singkat selesai
- tagihan formulir sudah dibuat

Kondisi minimum:
- `PendaftarPpdb` ada
- ada `TagihanPpdb` jenis `PENDAFTARAN`

Next action:
- pendaftar membuka invoice dan mengirim bukti bayar

#### 2. `PAYMENT_PENDING`

Arti:
- tagihan formulir masih belum lunas
- pendaftar belum mengirim bukti bayar atau belum ada pembayaran tercatat

Kondisi minimum:
- tagihan `PENDAFTARAN` status `BELUM_LUNAS`
- belum ada `PembayaranPpdb.status = PENDING` untuk tagihan aktif

Next action:
- kirim bukti pembayaran

#### 3. `PAYMENT_REVIEW`

Arti:
- pendaftar sudah mengirim bukti bayar
- admin belum selesai memverifikasi

Kondisi minimum:
- tagihan `PENDAFTARAN` status `MENUNGGU_VERIFIKASI`
- ada `PembayaranPpdb.status = PENDING`

Next action:
- admin verifikasi pembayaran

#### 4. `FULL_FORM_UNLOCKED`

Arti:
- pembayaran formulir sudah valid
- pendaftar boleh mulai isi form lengkap
- form lengkap belum cukup siap untuk direview

Kondisi minimum:
- tagihan `PENDAFTARAN` status `LUNAS`
- `PendaftarPpdb.status = MENUNGGU`
- data form lengkap belum memenuhi submission final

Next action:
- isi data siswa, data orang tua, dan upload berkas

#### 5. `FULL_FORM_IN_PROGRESS`

Arti:
- pendaftar sudah mulai mengisi form lengkap
- tetapi submission belum siap direview

Kondisi minimum:
- tagihan `PENDAFTARAN` status `LUNAS`
- minimal salah satu dari `dataFormulir`, `dataOrangtua`, atau `berkas` sudah ada
- readiness final belum terpenuhi

Next action:
- lengkapi field wajib dan berkas wajib

Catatan:
- state ini baru akan terasa benar setelah mode `draft` vs `final submit` diimplementasikan

#### 6. `SUBMITTED_FOR_REVIEW`

Arti:
- pendaftar sudah menyelesaikan submission final
- admin belum selesai review

Kondisi minimum yang direkomendasikan:
- tagihan `PENDAFTARAN` status `LUNAS`
- data form lengkap wajib ada
- semua berkas wajib sudah terupload
- `PendaftarPpdb.status = MENUNGGU`

Next action:
- admin review berkas dan validasi kelayakan

#### 7. `VERIFIED_READY_FOR_DECISION`

Arti:
- administrasi dan berkas sudah lolos
- pendaftar siap diumumkan diterima atau ditolak

Kondisi minimum:
- `PendaftarPpdb.status = TERVERIFIKASI`
- tagihan `PENDAFTARAN` status `LUNAS`
- semua berkas wajib berstatus `DITERIMA`

Next action:
- admin kirim pengumuman hasil seleksi

#### 8. `REJECTED`

Arti:
- pendaftar tidak lolos

Kondisi minimum:
- `PendaftarPpdb.status = DITOLAK`

Next action:
- tidak ada proses lanjutan kecuali tenant nanti ingin menyediakan flow banding atau reapply

#### 9. `ACCEPTED_AWAITING_REENROLLMENT_BILL`

Arti:
- pendaftar diterima
- tetapi tagihan daftar ulang belum dibuat

Kondisi minimum:
- `PendaftarPpdb.status = DITERIMA`
- belum ada `TagihanPpdb` jenis `DAFTAR_ULANG`

Next action:
- admin buat tagihan daftar ulang jika proses tenant membutuhkannya

#### 10. `REENROLLMENT_PAYMENT_PENDING`

Arti:
- pendaftar diterima
- tagihan daftar ulang sudah ada
- pembayaran daftar ulang belum lunas

Kondisi minimum:
- `PendaftarPpdb.status = DITERIMA`
- ada tagihan `DAFTAR_ULANG`
- status tagihan `DAFTAR_ULANG` bukan `LUNAS`

Next action:
- pendaftar melunasi daftar ulang
- admin verifikasi bila masih memakai flow manual

#### 11. `READY_TO_SYNC`

Arti:
- seluruh kewajiban pasca-diterima sudah selesai
- pendaftar siap diubah menjadi siswa aktif

Kondisi minimum:
- `PendaftarPpdb.status = DITERIMA`
- jika ada tagihan `DAFTAR_ULANG`, statusnya `LUNAS`
- belum ada `Siswa` dengan penanda sumber PPDB ini

Next action:
- admin sinkronkan ke tabel `Siswa`

#### 12. `SYNCED_TO_STUDENT`

Arti:
- pendaftar sudah berhasil menjadi siswa aktif

Kondisi minimum:
- ada `Siswa` dengan marker sumber PPDB milik pendaftar tersebut

Next action:
- proses PPDB selesai

### Readiness Flags yang Direkomendasikan

Selain satu derived state utama, PPDB juga sebaiknya memiliki readiness flags turunan yang lebih granular.

Flags yang direkomendasikan:
- `isRegistrationFeePaid`
- `hasStartedFullForm`
- `hasSubmittedFullForm`
- `requiredDocumentsUploadedCount`
- `requiredDocumentsApprovedCount`
- `hasRejectedRequiredDocument`
- `isEligibleForVerification`
- `isEligibleForAcceptance`
- `hasReenrollmentBill`
- `isReenrollmentPaid`
- `isSyncedToStudent`

Flags ini penting karena:
- satu label status saja tidak cukup untuk menjelaskan blocker
- admin butuh tahu alasan kenapa pendaftar belum bisa maju ke tahap berikutnya

### Rule Transisi yang Direkomendasikan

Rule minimum yang sebaiknya dipakai di backend:

1. Tidak bisa membuka final review jika tagihan formulir belum `LUNAS`.
2. Tidak bisa `TERVERIFIKASI` jika field inti form lengkap belum ada.
3. Tidak bisa `TERVERIFIKASI` jika berkas wajib belum lengkap atau masih ada yang ditolak.
4. Tidak bisa `DITERIMA` jika pendaftar belum `TERVERIFIKASI`.
5. Tidak bisa membuat tagihan daftar ulang jika pendaftar belum `DITERIMA`.
6. Tidak bisa sinkron ke `Siswa` jika status belum `DITERIMA`.
7. Jika tenant memakai tagihan daftar ulang, sinkron ke `Siswa` hanya boleh setelah tagihan itu `LUNAS`.
8. Pendaftar yang sudah `DITERIMA` atau `DITOLAK` tidak bisa diubah lagi oleh user pendaftar biasa.

### Matrix Ringkas untuk Admin

| Derived State | Yang Dilihat Admin | CTA Utama |
|---|---|---|
| `REGISTRATION_CREATED` | Baru daftar | Tinjau invoice jika perlu |
| `PAYMENT_PENDING` | Belum ada bukti bayar | Tunggu tindakan pendaftar |
| `PAYMENT_REVIEW` | Bukti bayar masuk | Verifikasi pembayaran |
| `FULL_FORM_UNLOCKED` | Sudah boleh isi form | Tunggu data lengkap |
| `FULL_FORM_IN_PROGRESS` | Form sedang dikerjakan | Pantau kelengkapan |
| `SUBMITTED_FOR_REVIEW` | Siap direview | Review berkas dan data |
| `VERIFIED_READY_FOR_DECISION` | Administrasi lolos | Putuskan diterima/ditolak |
| `REJECTED` | Proses selesai - ditolak | Arsip / tindak lanjut |
| `ACCEPTED_AWAITING_REENROLLMENT_BILL` | Diterima, belum ada tagihan daftar ulang | Buat tagihan |
| `REENROLLMENT_PAYMENT_PENDING` | Menunggu pelunasan daftar ulang | Verifikasi / pantau |
| `READY_TO_SYNC` | Siap jadi siswa | Sinkron ke `Siswa` |
| `SYNCED_TO_STUDENT` | Sudah selesai | Lihat data siswa |

### Matrix Ringkas untuk Pendaftar

| Derived State | Yang Dilihat Pendaftar | CTA Utama |
|---|---|---|
| `REGISTRATION_CREATED` | Pendaftaran dibuat | Lihat invoice |
| `PAYMENT_PENDING` | Menunggu pembayaran | Upload bukti bayar |
| `PAYMENT_REVIEW` | Bukti bayar sedang dicek | Tunggu verifikasi |
| `FULL_FORM_UNLOCKED` | Form lengkap terbuka | Mulai isi form |
| `FULL_FORM_IN_PROGRESS` | Form belum lengkap | Lengkapi data dan berkas |
| `SUBMITTED_FOR_REVIEW` | Data sudah dikirim | Tunggu review admin |
| `VERIFIED_READY_FOR_DECISION` | Sedang masuk tahap keputusan | Tunggu pengumuman |
| `REJECTED` | Tidak lolos | Lihat pengumuman |
| `ACCEPTED_AWAITING_REENROLLMENT_BILL` | Diterima | Tunggu instruksi daftar ulang |
| `REENROLLMENT_PAYMENT_PENDING` | Daftar ulang belum lunas | Bayar daftar ulang |
| `READY_TO_SYNC` | Administrasi selesai | Tunggu aktivasi siswa |
| `SYNCED_TO_STUDENT` | Sudah resmi menjadi siswa | Lanjut ke portal siswa |

### Konsekuensi ke Batch Berikutnya

State matrix ini berarti batch berikut tidak sebaiknya langsung fokus ke kosmetik UI. Urutan implementasi yang lebih sehat:

1. buat helper server-side untuk menghitung derived state dan readiness flags
2. pakai helper itu di detail pendaftar admin
3. pakai helper itu di flow wali dan status publik
4. baru setelah itu rapikan stepper, badge, copy, dan filter UI

## Batch Kerja yang Cocok untuk Orchestrator

### Batch A — Backend hardening

Cakupan:
- `src/features/ppdb/actions/*`
- `src/app/api/ppdb/pendaftar/*`
- `src/app/api/ppdb/pembayaran/*`
- `src/app/api/ppdb/invoice/*`

Subtask paralel yang aman:
- hardening tenant ownership checks
- validasi transisi status
- generator nomor pendaftaran / NIS
- payment verification rules

Status:
- sudah dikerjakan sebagai batch pertama
- hasilnya menjadi fondasi untuk lifecycle hardening batch berikutnya

### Batch B — Pendaftar flow

Cakupan:
- `src/app/ppdb/*`
- `src/app/app/(portal)/(wali)/ppdb/*`

Subtask paralel yang aman:
- perbaikan UX form singkat
- draft vs final submit form lengkap
- invoice and payment messaging
- status/progress messaging untuk pendaftar

Status:
- baru sebagian
- workflow helper sudah tersedia untuk dipakai
- implementasi `draft vs final submit` belum dimulai

### Batch C — Admin review flow

Cakupan:
- `src/app/app/(portal)/(admin)/ppdb/*`

Subtask paralel yang aman:
- summary readiness panel
- filter dan stats operasional
- review berkas dan keputusan status
- flow tagihan daftar ulang dan sinkronisasi

Status:
- baru sebagian
- panel workflow dan blocker summary sudah mulai terpasang di detail pendaftar admin
- list admin dan stats operasional masih perlu diselaraskan ke workflow baru

### Batch D — Reporting dan operasional pasca-diterima

Cakupan:
- laporan PPDB
- milestone diterima → daftar ulang → siswa aktif
- integrasi ke dashboard admin bila diperlukan

Status:
- belum dimulai

## Urutan Eksekusi yang Disarankan

Urutan ideal:

1. backend hardening
2. lifecycle dan status proses
3. admin review experience
4. pendaftar experience
5. schema refinement jika sudah terbukti perlu

Urutan ini sengaja menempatkan correctness di depan polish UI.

## Definition of Done untuk PPDB yang Lebih Matang

PPDB dapat dianggap lebih matang bila kondisi berikut terpenuhi:
- setiap mutation tenant-scoped sudah diverifikasi aman
- status transition tidak lagi bebas, tetapi rule-based
- nomor pendaftaran dan NIS tidak rawan bentrok
- admin bisa melihat readiness pendaftar secara cepat
- pendaftar selalu tahu langkah berikutnya
- flow diterima sampai menjadi siswa aktif dapat dipantau secara jelas
- dokumentasi dan steering tetap sinkron dengan behavior sistem

## Catatan Implementasi

Saat mengerjakan batch PPDB berikutnya:
- prioritaskan edit lokal pada modul yang disentuh
- jangan memaksakan refactor struktur besar
- jika ada perubahan schema, update `.kiro/steering/database.md`
- jika ada perubahan UI atau flow baru yang signifikan, update `.kiro/steering/ui.md` dan `.kiro/steering/project.md`
- jika arah arsitektur PPDB berubah cukup besar, sinkronkan juga dengan dokumen ini

## Next Working Mode

Mode kerja yang direkomendasikan untuk PPDB:

1. audit kecil pada batch yang dipilih
2. pecah subtask yang write surface-nya tidak tumpang tindih
3. eksekusi paralel lewat orchestrator
4. integrasi dan verifikasi
5. update dokumen steering yang relevan

Dokumen ini harus diperlakukan sebagai referensi kerja hidup. Jika PPDB berubah cukup signifikan, roadmap ini perlu diperbarui agar tetap sesuai dengan kondisi implementasi terbaru.
