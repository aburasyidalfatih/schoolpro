# SchoolPro — Tenant Application & Onboarding Plan

## Ringkasan

SchoolPro perlu memisahkan proses `pendaftaran calon tenant` dari `tenant aktif` agar sekolah yang masuk ke sistem benar-benar tervalidasi, berkualitas, dan siap diprovisioning.

Alih-alih membiarkan sekolah langsung membuat tenant aktif, flow yang disarankan adalah:
- calon sekolah mengisi formulir aplikasi
- super admin memverifikasi data sekolah
- hanya aplikasi yang disetujui yang diprovision menjadi tenant aktif
- setelah provisioning, tenant mendapatkan akses login dan subdomain gratis SchoolPro

Flow ini lebih aman untuk kualitas data, reputasi produk, dan operasional onboarding SaaS.

## Tujuan Produk

- mencegah tenant palsu, spam, atau data sekolah yang tidak valid masuk sebagai tenant aktif
- memberi super admin kontrol terhadap tenant baru yang akan memakai platform
- menjaga agar subdomain gratis hanya diberikan ke sekolah yang lolos review
- memisahkan `lead/application` dari `active tenant`
- menyiapkan fondasi onboarding tenant yang bisa berkembang ke trial, billing, dan SLA onboarding

## Masalah Pada Pendekatan Self-Register Tenant Langsung

Jika tenant langsung dibuat aktif saat sekolah mendaftar:
- data tenant aktif bercampur dengan data calon tenant yang belum valid
- super admin kehilangan kontrol kualitas onboarding
- subdomain gratis bisa dipakai pihak yang tidak layak
- cleanup tenant sampah menjadi pekerjaan operasional tambahan
- billing, trial, provisioning, dan approval tercampur dalam satu flow yang sulit dijaga

## Keputusan Produk

### 1. Pisahkan `Application` dan `Tenant`

- calon sekolah masuk ke entitas baru `TenantApplication`
- tenant aktif tetap berada di entitas `Tenant`
- `Tenant` hanya dibuat setelah aplikasi disetujui

### 2. Approval Super Admin Wajib

- aplikasi tenant tidak langsung aktif
- super admin wajib mereview aplikasi sebelum provisioning
- super admin bisa menyetujui, menolak, atau meminta revisi

### 3. Provisioning Setelah Approval

Setelah aplikasi disetujui, sistem:
- membuat `Tenant`
- membuat akun admin tenant
- menyiapkan status subscription awal
- menetapkan slug/subdomain tenant
- mengirim notifikasi aktivasi

### 4. Subdomain Gratis Hanya Setelah Provisioning

- subdomain seperti `namasekolah.schoolpro.id` tidak diberikan saat submit aplikasi
- slug dapat diminta pada form aplikasi
- slug final tetap berada di tangan super admin saat approval/provisioning

## Workflow End-to-End

### A. Applicant Flow

1. Calon sekolah membuka halaman publik `Daftarkan Sekolah`
2. Applicant mengisi data sekolah dan PIC
3. Applicant submit aplikasi
4. Sistem menyimpan aplikasi sebagai `SUBMITTED`
5. Applicant menerima nomor aplikasi / link tracking status
6. Jika diminta revisi, applicant memperbarui data
7. Jika disetujui, applicant menerima akses tenant

### B. Super Admin Flow

1. Super admin membuka inbox `Tenant Applications`
2. Super admin review data sekolah
3. Super admin memilih salah satu aksi:
- `Request Revision`
- `Reject`
- `Approve`
4. Jika `Approve`, super admin dapat:
- menyesuaikan slug final
- menentukan plan awal
- menentukan status onboarding awal
5. Sistem memprovision tenant
6. Audit log mencatat approval dan provisioning

### C. Provisioning Flow

Saat approval diproses:
- validasi ulang slug final
- buat `Tenant`
- buat akun admin tenant
- buat relasi subscription awal jika dibutuhkan
- tandai `TenantApplication` sebagai `PROVISIONED`
- kirim notifikasi hasil approval

## Status Yang Disarankan

### `TenantApplicationStatus`
- `DRAFT`
- `SUBMITTED`
- `UNDER_REVIEW`
- `REVISION_REQUESTED`
- `APPROVED`
- `REJECTED`
- `PROVISIONED`

### Arti Status

- `DRAFT`: form belum final
- `SUBMITTED`: aplikasi baru masuk
- `UNDER_REVIEW`: sedang diproses super admin
- `REVISION_REQUESTED`: applicant harus memperbaiki data
- `APPROVED`: lolos review, siap diprovision
- `REJECTED`: ditolak
- `PROVISIONED`: tenant aktif sudah berhasil dibuat

## Data Yang Sebaiknya Dikumpulkan

### Data Sekolah
- `namaSekolah`
- `jenjang`
- `statusSekolah` (`NEGERI`, `SWASTA`, `PESANTREN`, dll)
- `npsn` opsional
- `emailSekolah`
- `teleponSekolah`
- `alamat`
- `provinsi`
- `kotaKabupaten`
- `websiteSaatIni` opsional
- `jumlahSiswaSaatIni` estimasi

### Data PIC
- `namaPic`
- `jabatanPic`
- `emailPic`
- `whatsappPic`

### Data Operasional
- `slugRequest`
- `kebutuhanUtama`
- `catatanTambahan`
- `sumberLead` opsional

### Dokumen Opsional
- logo sekolah
- brosur / profil sekolah
- surat tugas / bukti kewenangan

## Model Data Yang Disarankan

### `TenantApplication`

Field inti yang disarankan:
- `id`
- `namaSekolah`
- `jenjang`
- `statusSekolah`
- `npsn`
- `emailSekolah`
- `teleponSekolah`
- `alamat`
- `provinsi`
- `kotaKabupaten`
- `websiteSaatIni`
- `jumlahSiswaSaatIni`
- `namaPic`
- `jabatanPic`
- `emailPic`
- `whatsappPic`
- `slugRequest`
- `slugApproved`
- `kebutuhanUtama`
- `catatanTambahan`
- `status`
- `submittedAt`
- `reviewedAt`
- `reviewedByUserId`
- `reviewNotes`
- `revisionNotes`
- `rejectedReason`
- `approvedTenantId`
- `provisionedAt`
- `createdAt`
- `updatedAt`

### Relasi Yang Mungkin Dibutuhkan
- `reviewedBy -> User`
- `approvedTenant -> Tenant`

### Catatan Penting
- jangan gunakan `Tenant` sebagai draft application
- `TenantApplication` adalah entitas pre-tenant
- `Tenant` tetap bersih untuk sekolah yang sudah live / approved

## Aturan Provisioning

Provisioning sebaiknya hanya boleh dilakukan jika:
- status aplikasi `APPROVED`
- slug final lolos validasi
- email PIC / admin tenant valid
- tidak ada tenant aktif lain dengan slug yang sama

Saat provisioning:
- buat tenant dengan data sekolah yang sudah disetujui
- set plan awal
- set paket / subscription default
- buat akun admin tenant
- hasilkan password sementara atau activation flow

## Opsi Aktivasi Akun Tenant

Ada 2 opsi yang layak:

### Opsi A — Password Dibuat Sistem
- sistem membuat password sementara
- dikirim lewat email / WhatsApp
- tenant wajib ganti password saat login pertama

### Opsi B — Activation Link
- sistem kirim link aktivasi
- tenant menentukan password sendiri

Rekomendasi:
- gunakan `Activation Link` bila ingin UX lebih modern
- gunakan `Password sementara` bila ingin implementasi awal lebih cepat

Untuk fase awal, opsi password sementara lebih pragmatis.

## UI Surface Yang Dibutuhkan

### Publik
- `/daftarkan-sekolah` atau halaman setara di website utama
- form aplikasi tenant
- halaman sukses submit
- halaman cek status aplikasi

### Super Admin
- `/super-admin/tenant-applications`
- list aplikasi
- detail aplikasi
- aksi:
  - minta revisi
  - tolak
  - setujui
  - provision tenant

### Applicant Self-Service
- halaman cek status dengan email + kode aplikasi
- jika status `REVISION_REQUESTED`, applicant bisa edit field tertentu

## API Surface Yang Dibutuhkan

### Publik
- `POST /api/tenant-applications`
- `GET /api/tenant-applications/status`
- `PUT /api/tenant-applications/[id]` untuk revisi applicant bila diizinkan

### Super Admin
- `GET /api/super-admin/tenant-applications`
- `GET /api/super-admin/tenant-applications/[id]`
- `POST /api/super-admin/tenant-applications/[id]/request-revision`
- `POST /api/super-admin/tenant-applications/[id]/reject`
- `POST /api/super-admin/tenant-applications/[id]/approve`
- `POST /api/super-admin/tenant-applications/[id]/provision`

## Integrasi Dengan Modul Yang Sudah Ada

### Super Admin
- inbox aplikasi tenant masuk ke domain super admin
- approval dan provisioning harus masuk audit log

### Billing / Subscription
- provisioning bisa langsung menempel ke plan default
- tenant baru bisa langsung masuk `FREE`
- atau masuk `trial` jika model trial nanti dibuka

### Auth
- akun admin tenant hanya dibuat saat provisioning
- login tenant tetap pakai `/app/login`

### Domain / Slug
- `slugRequest` adalah usulan
- `slugApproved` adalah slug final hasil review

## Guardrail Teknis

- data application tidak boleh bocor lintas applicant
- route super admin harus tetap lintas tenant, tapi applicant route tetap public-safe
- provisioning harus idempotent; jangan sampai satu aplikasi membuat tenant ganda
- provisioning wajib pakai transaction
- audit log wajib mencatat:
  - siapa yang approve
  - siapa yang reject
  - siapa yang memprovision

## Open Questions

Hal yang perlu diputuskan sebelum implementasi:
- apakah applicant boleh menyimpan draft?
- apakah revisi boleh dilakukan lewat link tanpa login, atau harus pakai verifikasi email?
- apakah plan default tenant baru adalah `FREE`, `TRIAL`, atau manual?
- apakah subdomain gratis langsung aktif saat provisioning atau menunggu aktivasi admin tenant?
- apakah applicant perlu upload dokumen legal sejak fase awal?
- apakah notifikasi dikirim via email saja atau email + WhatsApp?

## Rekomendasi Implementasi Bertahap

### Phase 1 — Application Intake
- tambah model `TenantApplication`
- buat form publik
- buat list super admin
- buat detail + approve/reject/revision

Progress development saat ini:
- selesai: model `TenantApplication`
- selesai: form publik `landing/daftarkan-sekolah`
- selesai: API intake publik `POST /api/tenant-applications`
- selesai: inbox super admin `tenant-applications`
- selesai: aksi review `approve`, `reject`, dan `request revision`
- belum: halaman tracking applicant dan provisioning tenant

### Phase 2 — Provisioning
- buat action provisioning tenant
- buat akun admin tenant otomatis
- set slug final dan plan awal
- kirim notifikasi hasil approval

### Phase 3 — Applicant Tracking
- halaman cek status aplikasi
- flow revisi applicant
- kode tracking aplikasi

### Phase 4 — Operational Polishing
- upload dokumen
- audit log lebih detail
- dashboard metrik aplikasi tenant
- integrasi ke CRM / lead source jika dibutuhkan

## Rekomendasi Final

Pendekatan terbaik untuk SchoolPro saat ini:
- buat form khusus `Tenant Application`
- approval oleh super admin wajib
- tenant aktif hanya dibuat setelah approve
- subdomain gratis hanya diberikan setelah provisioning
- pisahkan tegas `application` dari `tenant aktif`

Ini adalah jalur yang paling sehat untuk kualitas data, operasional onboarding, dan pertumbuhan SaaS SchoolPro.
