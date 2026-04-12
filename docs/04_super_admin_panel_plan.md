# SchoolPro — Rencana Super Admin Panel

## Ringkasan
SchoolPro membutuhkan `Super Admin Panel` sebagai pusat kendali SaaS untuk mengelola tenant, paket, subscription, dan operasional platform tanpa bergantung pada perubahan manual di database.

Dokumen ini menjadi acuan implementasi bertahap untuk area internal SchoolPro, terpisah dari dashboard admin sekolah.

## Tujuan Bisnis
- mengelola tenant secara terpusat
- mengontrol model free vs premium dengan rapi
- mengurangi pekerjaan manual tim internal
- menyiapkan fondasi billing dan growth SaaS
- mempercepat support dan troubleshooting tenant

## Personas Internal

### 1. Super Admin
- akses penuh ke semua tenant, paket, dan kontrol platform

### 2. Support
- lihat tenant, cek status, bantu troubleshooting, tambah catatan support

### 3. Sales
- lihat lead/tenant, status plan, histori upgrade, onboarding progress

### 4. Finance
- lihat subscription, invoice, pembayaran, jatuh tempo

## Keputusan Login dan Redirect
- SchoolPro tetap menggunakan satu halaman login: `/app/login`
- Setelah autentikasi berhasil, sistem melakukan redirect berbasis role
- `SUPER_ADMIN` masuk ke `/super-admin/dashboard`
- Role tenant tetap masuk ke `/app/dashboard` atau area tenant masing-masing
- Area `/super-admin/*` dan `/app/*` harus diproteksi secara terpisah

Catatan implementasi awal:
- pada fase awal, role `SUPER_ADMIN` masih memanfaatkan sistem auth yang ada
- pada fase lanjutan, platform user dapat dipisahkan lebih bersih dari user tenant bila kebutuhan SaaS semakin kompleks

## Modul Utama

### 1. SaaS Dashboard
Tujuan:
- memberi gambaran cepat kondisi bisnis dan operasional platform

Fitur:
- total tenant
- tenant active / trial / suspended / expired
- tenant baru 7 hari / 30 hari
- upgrade bulan berjalan
- tenant mendekati jatuh tempo
- ringkasan subscription dan billing dasar

### 2. Tenant Management
Tujuan:
- mengelola seluruh tenant dari satu area internal

Fitur:
- daftar tenant
- cari/filter tenant
- detail tenant
- owner tenant
- plan aktif
- status tenant
- domain/subdomain
- created at / activated at
- last activity
- internal notes

Aksi minimum:
- create tenant
- activate tenant
- suspend tenant
- reactivate tenant
- archive tenant
- change plan
- set trial end date

### 3. Plan Management
Tujuan:
- mengelola paket SchoolPro secara terstruktur

Fitur:
- daftar paket
- nama paket
- deskripsi paket
- harga
- billing period
- paket default untuk tenant baru
- visible/inactive state

Contoh paket awal:
- Free: website sekolah + CMS konten
- Starter: website + PPDB
- Growth: website + PPDB + keuangan
- Full Suite: operasional sekolah terintegrasi

### 4. Feature Access Control
Tujuan:
- mengelola modul mana yang aktif pada tiap tenant

Fitur:
- mapping fitur per plan
- feature override per tenant
- feature unlock sementara
- trial feature
- promo feature access

Contoh fitur yang bisa dikontrol:
- website
- berita/pengumuman
- PPDB
- keuangan
- tabungan
- laporan
- AI module
- notifikasi WhatsApp

### 5. Subscription Management
Tujuan:
- mengelola lifecycle langganan tenant

Fitur:
- subscription status
- start date
- end date
- renewal date
- trial period
- upgrade / downgrade history
- cancel / resume

Status awal yang disarankan:
- trial
- active
- overdue
- canceled
- suspended

### 6. Billing & Invoice
Tujuan:
- menyiapkan kontrol monetisasi tenant

Fitur MVP:
- daftar invoice
- status pembayaran
- nominal
- due date
- payment date
- payment method
- bukti pembayaran manual

Tahap lanjut:
- recurring invoice
- payment gateway
- auto-reminder
- pajak / invoice numbering

### 7. Platform User Management
Tujuan:
- mengontrol siapa yang boleh mengakses super admin panel

Fitur:
- daftar internal users
- role assignment
- active/inactive access
- reset password flow
- audit terhadap perubahan akses

Role awal:
- SUPER_ADMIN
- SUPPORT
- SALES
- FINANCE

### 8. Audit Log
Tujuan:
- memastikan semua aksi sensitif tercatat

Wajib dicatat:
- create/update tenant
- status change tenant
- plan change
- feature override
- subscription update
- impersonation
- login internal

### 9. Support Notes
Tujuan:
- menyimpan konteks masalah tenant tanpa tercecer

Fitur:
- note per tenant
- label issue
- status follow-up
- assigned internal user
- histori komunikasi singkat

### 10. Tenant Onboarding Tracker
Tujuan:
- memantau apakah tenant baru sudah benar-benar aktif menggunakan platform

Fitur:
- tenant created
- owner invited
- website configured
- content published
- domain configured
- premium module enabled
- onboarding completed

## Halaman Tenant Admin Yang Tetap Dibutuhkan
Walaupun ada Super Admin Panel, dashboard tenant tetap perlu halaman:
- `Langganan`
- `Paket Saya`
- `Fitur Saya`

Isi minimal:
- paket aktif
- status subscription
- fitur aktif
- fitur terkunci
- CTA upgrade / hubungi sales

Halaman tenant ini tidak menggantikan super admin.

## Model Data Awal yang Disarankan

### Platform Level
- `Plan`
- `PlanFeature`
- `Subscription`
- `SubscriptionInvoice`
- `TenantFeatureOverride`
- `PlatformUser`
- `PlatformAuditLog`
- `TenantNote`

### Tambahan di Tenant
- status tenant
- planId aktif
- subscriptionId aktif
- onboardingStatus

## Status dan Enum Awal

### TenantStatus
- ACTIVE
- TRIAL
- SUSPENDED
- ARCHIVED

### SubscriptionStatus
- TRIAL
- ACTIVE
- OVERDUE
- CANCELED
- SUSPENDED

### PlatformRole
- SUPER_ADMIN
- SUPPORT
- SALES
- FINANCE

## Navigasi Sidebar yang Disarankan
- Dashboard
- Tenants
- Plans
- Feature Access
- Subscriptions
- Billing
- Platform Users
- Support Notes
- Audit Logs
- Settings

## Prioritas Implementasi

### Phase 1 — Core Control
- SaaS dashboard
- tenant management
- plan management
- feature access override
- platform users
- audit log dasar

Output:
- tenant bisa dikelola tanpa edit database manual
- paket dan fitur tenant bisa dikontrol dari panel

Status implementasi saat ini:
- selesai: dokumen steering dan plan super admin
- selesai: keputusan auth satu login di `/app/login`
- selesai: redirect `SUPER_ADMIN` ke `/super-admin/dashboard`
- selesai: route protection terpisah antara `/super-admin/*` dan `/app/*`
- selesai: super admin dashboard skeleton
- selesai: tenant management dasar dengan API list/update tenant
- belum: plan management
- belum: feature access override
- belum: platform users management
- belum: audit log dasar

### Phase 2 — Subscription Ops
- subscription management
- invoice manual
- support notes
- onboarding tracker

Output:
- tim internal bisa menangani upgrade, renewal, dan support tenant

### Phase 3 — Monetization & Growth
- billing automation
- analytics SaaS
- promo/discount support
- advanced domain management

Output:
- panel siap mendukung growth SaaS yang lebih matang

## Risiko yang Harus Dijaga
- jangan campur area super admin dengan area tenant admin
- jangan beri akses lintas tenant ke role tenant biasa
- semua aksi sensitif wajib masuk audit log
- override fitur per tenant harus terlihat jelas agar tidak membingungkan tim internal
- impersonation hanya boleh untuk role tertentu dan wajib tercatat

## Keputusan Produk Saat Ini
- Super Admin Panel akan dibangun sebagai modul terpisah untuk internal SchoolPro
- Tenant admin tetap memiliki halaman langganan sendiri
- implementasi dilakukan bertahap mulai dari kontrol tenant, plan, dan feature access

## Progress Kode Saat Ini

### Sudah Dibangun
- route `/super-admin/dashboard`
- route `/super-admin/tenants`
- middleware redirect dan guard role `SUPER_ADMIN`
- API `GET /api/super-admin/tenants`
- API `PUT /api/super-admin/tenants/[id]`

### Siap Dilanjutkan di Sesi Berikutnya
- halaman detail tenant
- plan management
- feature access control
- audit log dasar
