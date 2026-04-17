# SchoolPro — Super Admin Steering

## Tujuan
Super Admin Panel adalah control center internal SchoolPro untuk mengelola tenant, paket, akses fitur, langganan, dan operasional SaaS lintas sekolah.

Panel ini **bukan** area admin sekolah. Semua fitur di sini dipakai oleh tim internal SchoolPro seperti `SUPER_ADMIN`, `SUPPORT`, `SALES`, dan `FINANCE`.

## Prinsip Utama
- Pisahkan tegas `platform scope` dan `tenant scope`
- Tenant admin hanya boleh melihat data tenant miliknya sendiri
- Super admin boleh melihat data lintas tenant, tetapi aksi sensitif harus tercatat di audit log
- Jangan mengandalkan perubahan manual via database untuk operasi harian SaaS
- Semua kontrol paket dan fitur tenant harus bisa dikelola dari panel internal

## Keputusan Auth & Routing
- Halaman login tetap satu: `/app/login`
- Setelah login, user diarahkan berdasarkan role
- Role `SUPER_ADMIN` diarahkan ke `/super-admin/dashboard`
- Role tenant seperti `ADMIN`, `TU`, `KEUANGAN`, `WALI`, `SISWA`, `STAF` diarahkan ke area `/app/*`
- Route `/super-admin/*` hanya boleh diakses role platform
- Route `/app/*` tetap diperlakukan sebagai area tenant
- `SUPER_ADMIN` tidak boleh dianggap otomatis sebagai admin tenant UI
- Jika nanti dibutuhkan akses ke tenant tertentu untuk support, gunakan impersonation yang tercatat di audit log

## Scope Minimum

### 1. Dashboard SaaS
- total tenant
- tenant aktif, trial, suspended, expired
- pertumbuhan tenant baru
- status upgrade dan subscription dasar

### 2. Tenant Management
- daftar tenant
- detail tenant
- status tenant
- owner tenant
- domain/subdomain
- plan aktif
- catatan internal
- aksi suspend/reactivate

### 3. Plan & Feature Access
- daftar paket
- kapasitas siswa per paket
- harga tahunan per paket
- paket publik yang bisa dipilih tenant
- fitur per paket sebagai override/internal control
- override fitur per tenant
- trial atau unlock fitur tertentu

### 4. Subscription Control
- status subscription tenant
- kapasitas siswa aktif tenant
- histori perubahan paket
- masa aktif, jatuh tempo, renewal dasar
- order upgrade atau renewal dari tenant
- verifikasi pembayaran manual sebelum aktivasi

### 5. Platform User & Role
- akun internal SchoolPro
- role: `SUPER_ADMIN`, `SUPPORT`, `SALES`, `FINANCE`
- pembatasan aksi sesuai role

### 6. Audit & Support
- audit log lintas tenant
- histori perubahan tenant/plan/fitur
- catatan support internal

## Yang Bukan Scope Awal
- billing otomatis penuh
- white-label kompleks
- marketplace/API eksternal
- custom workflow enterprise per tenant

## Relasi Dengan Tenant Admin
- Tenant admin tetap membutuhkan halaman `Langganan` atau `Paket Saya`
- Halaman tenant tersebut menjadi entry point self-service untuk melihat paket aktif, kuota siswa, status subscription, dan CTA upgrade
- Tenant admin **bukan pengganti** Super Admin Panel
- Pilihan upgrade ada di area tenant billing, sedangkan super admin memverifikasi pembayaran dan mengaktifkan langganan

## Urutan Implementasi

### Phase 1
- dashboard SaaS
- tenant management
- plan assignment
- feature access override
- audit log dasar

Progress saat ini:
- selesai: routing dan guard awal `/super-admin/*`
- selesai: redirect role `SUPER_ADMIN` ke `/super-admin/dashboard`
- selesai: dashboard super admin berbasis data aktual platform
- selesai: tenant management dengan plan assignment, status tenant, trial end, dan summary override
- selesai: plan management terstruktur
- selesai: plan management kini mendukung hapus plan yang belum dipakai tenant, subscription, atau order billing
- selesai: feature access override per tenant
- selesai: audit log dasar
- selesai: shell super admin disejajarkan dengan layout `/app` agar lebih konsisten tanpa mencampur menu tenant
- belum: platform user management terpisah

### Phase 2
- subscription lifecycle
- billing/invoice manual
- support notes
- onboarding tracker tenant

Target detail phase 2:
- model pricing berbayar berbasis `slot siswa`
- `Free` hanya untuk CMS website
- semua plan berbayar mendapatkan full fitur
- `TenantSubscription` menjadi source of truth langganan aktif tenant
- tenant memilih upgrade dari halaman billing admin
- pembayaran diverifikasi manual oleh super admin
- setelah verifikasi, plan aktif dan kuota siswa tenant diperbarui
- warning kuota pada ambang 80% dan 90%
- blok tambah siswa aktif baru saat kuota mencapai 100%

Progress tambahan phase 2:
- selesai: fondasi `TenantSubscription` dan sinkronisasi awal dengan tenant management super admin
- selesai: `SubscriptionOrder`, halaman billing tenant, dan inbox verifikasi pembayaran super admin
- selesai: enforce kuota siswa aktif pada create siswa, aktivasi ulang siswa, dan sinkronisasi PPDB ke siswa aktif
- selesai: flow backend resubmit bukti pembayaran tenant untuk order billing yang ditolak/kedaluwarsa
- selesai: dashboard super admin sekarang menampilkan metrik subscription, kapasitas siswa, dan jatuh tempo terdekat
- selesai: dashboard super admin sekarang menampilkan quick actions, daftar subscription jatuh tempo, dan order billing menunggu verifikasi
- selesai: panel operasional dashboard super admin kini bisa diklik ke modul terkait dan memakai badge status yang lebih jelas
- selesai: dashboard super admin kini meneruskan filter query ke halaman tenant dan subscription orders agar alur review lebih presisi
- selesai: dashboard tenant kini menampilkan warning kuota ringan yang mengarahkan tenant ke halaman `Langganan` dan `Data Siswa`
- selesai: UX billing tenant dirapikan, termasuk label status order, empty state, dan indikator kuota sidebar
- selesai: inbox `Subscription Orders` super admin kini juga memakai label status, tipe order, metode bayar, dan periode billing yang lebih mudah dibaca
- selesai: runtime auth platform dev kini tidak lagi memblokir `/api/auth/*` dan `/api/super-admin/*`, sehingga login `SUPER_ADMIN` dan fetch inbox billing bisa lolos pada app lokal
- selesai sebagian: flow login host platform kini dipatch agar kredensial `SUPER_ADMIN` tidak lagi dipaksa memakai slug tenant palsu pada domain `ops-dev` / `ops`
- selesai: smoke test dev pada host publik `ops-dev.schoolpro.id` kini lolos untuk CSRF auth, halaman login, dashboard super admin, dan API dashboard dengan session `SUPER_ADMIN`
- berikutnya: QA end-to-end billing tenant dan super admin, lalu tentukan backlog phase 3 yang paling dekat

Catatan QA dev terbaru:
- halaman dan API `Subscription Orders` super admin kini merespons `200` di development setelah perbaikan middleware platform
- patch auth host-aware untuk login `SUPER_ADMIN` sudah tervalidasi di host publik `https://ops-dev.schoolpro.id`; raw callback auth yang sebelumnya masih mengembalikan redirect `https://localhost:3001` saat dipanggil langsung via curl kini juga sudah dinormalisasi ke host publik aktif
- smoke test tenant `ADMIN` dan `WALI` di `demo-dev.schoolpro.id` kini sudah lolos lagi setelah data tenant aktif disejajarkan dengan host baru, sehingga QA billing tenant tidak lagi terblokir oleh absennya user demo

### Phase 3
- billing automation
- analytics SaaS lanjutan
- promo engine
- domain management lanjutan
- tenant application intake, approval, dan provisioning flow

Progress awal phase 3:
- selesai sebagian di development: form publik tenant application, API intake publik, model `TenantApplication` sebagai entitas pre-tenant, serta inbox super admin untuk review approve/reject/request revision
- belum: provisioning tenant, tracking applicant, dan notifikasi operasional

## Catatan Arsitektur
- Gunakan model data yang tetap `shared DB + tenantId`
- Entitas level platform tidak boleh tercampur dengan data operasional tenant
- Query lintas tenant hanya boleh tersedia di super admin area
- Impersonation, jika dibuat, wajib dicatat di audit log dan dibatasi role
- Pada fase implementasi saat ini, platform auth masih memakai `User.role = SUPER_ADMIN` dari sistem auth yang ada; model platform user terpisah belum dibuat
- Untuk billing berbasis slot siswa, source of truth subscription diarahkan ke model langganan khusus tenant dan bukan hanya ke `tenant.planId`
- `tenant.planId` dan `tenant.paket` tetap dipertahankan sementara untuk kompatibilitas modul existing
- arah onboarding tenant baru yang disarankan: gunakan entitas pre-tenant seperti `TenantApplication`, lalu buat `Tenant` hanya setelah approve/provisioning
