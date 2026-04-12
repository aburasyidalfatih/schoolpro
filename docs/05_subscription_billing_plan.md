# SchoolPro — Subscription & Billing Plan

## Ringkasan

SchoolPro akan memakai model pricing berbasis `slot siswa` untuk paket berbayar agar sekolah kecil tetap bisa memakai seluruh modul inti tanpa terbebani paket flat yang terlalu besar di awal.

Model ini menggantikan pendekatan paket premium berbasis perbedaan fitur utama. Paket berbayar tetap mendapatkan full fitur, sedangkan pembeda utamanya adalah kapasitas siswa aktif dan harga tahunan.

## Tujuan Bisnis

- memberi jalan masuk yang ringan untuk sekolah kecil melalui `Free`
- membuat monetisasi SchoolPro tumbuh seiring pertumbuhan tenant
- menyederhanakan narasi penjualan: bayar sesuai kapasitas sekolah
- memindahkan proses upgrade dari edit manual internal menjadi self-service tenant
- menyiapkan fondasi subscription, checkout, verifikasi pembayaran, dan audit operasional

## Keputusan Produk

### 1. Struktur Paket

- `Free` hanya mendapatkan CMS website publik
- semua paket berbayar mendapatkan full fitur operasional SchoolPro
- paket berbayar dibedakan oleh `slot siswa`
- fitur baru di masa depan ikut terbuka untuk tenant berbayar, kecuali ada keputusan produk khusus

Contoh tier awal:
- `FREE`
- `SCH_50`
- `SCH_100`
- `SCH_300`
- `SCH_500`
- `SCH_1000`
- paket custom untuk tenant besar bila dibutuhkan

### 2. Dasar Kuota

- kuota dihitung berdasarkan `jumlah siswa aktif`
- siswa dengan status `ALUMNI` atau `KELUAR` tidak memakai slot
- source of truth kuota aktif berasal dari subscription tenant, bukan dari total histori data siswa

### 3. Warning dan Enforcement

- saat penggunaan mencapai 80% kuota, tampil warning awal
- saat penggunaan mencapai 90% kuota, tampil warning prioritas tinggi
- saat penggunaan mencapai 100% kuota, tenant tidak bisa menambah siswa aktif baru
- tenant tetap boleh mengedit data siswa lama
- tenant tetap boleh mengubah siswa aktif menjadi nonaktif/alumni/keluar agar slot kembali tersedia

### 4. Billing Period

- billing utama memakai periode tahunan
- tenant membayar di muka untuk 1 tahun
- saat pembayaran upgrade diverifikasi, masa aktif plan baru di-reset menjadi 1 tahun sejak aktivasi

### 5. Upgrade Flow

- pilihan upgrade tersedia di halaman billing tenant admin, bukan melalui edit manual super admin
- tenant memilih paket target
- sistem membuat order checkout
- tenant melakukan pembayaran dan mengirim bukti
- super admin memverifikasi pembayaran
- setelah verifikasi, subscription tenant diaktifkan sesuai paket yang dibeli
- sebelum verifikasi, plan aktif tenant tidak berubah

## Alur Pengguna

### Tenant Admin

1. Buka halaman `Billing / Langganan`
2. Lihat plan aktif, kuota siswa, siswa aktif terpakai, dan tanggal jatuh tempo
3. Pilih paket upgrade atau renewal
4. Sistem membuat order billing
5. Tenant mengirim pembayaran atau bukti transfer
6. Tenant menunggu verifikasi
7. Setelah diverifikasi, paket aktif dan kuota siswa diperbarui

### Super Admin

1. Buka daftar `Subscription Orders`
2. Review tenant, paket saat ini, paket tujuan, nominal, dan bukti bayar
3. Verifikasi atau tolak pembayaran
4. Saat verifikasi sukses, aktifkan subscription tenant
5. Semua aksi sensitif dicatat di `PlatformAuditLog`

## Model Data yang Direncanakan

### `Plan`

Peran:
- katalog paket publik dan internal

Field inti yang direncanakan:
- `code`
- `name`
- `description`
- `price` sebagai harga tahunan
- `studentCapacity`
- `billingPeriod`
- `isDefault`
- `isActive`
- `isPublic`
- `fullAccess`
- `sortOrder`

Catatan:
- `PlanFeature` tetap dipertahankan untuk override khusus, promo, beta access, atau kebutuhan operasional internal
- `PlanFeature` bukan lagi pembeda utama pricing

### `TenantSubscription`

Peran:
- menyimpan langganan aktif tenant sebagai source of truth billing

Field inti yang direncanakan:
- `tenantId`
- `planId`
- `status`
- `studentCapacity`
- `startsAt`
- `endsAt`
- `activatedAt`
- `lastPaidAt`

### `SubscriptionOrder`

Peran:
- menyimpan checkout, upgrade, renewal, dan status verifikasi pembayaran

Field inti yang direncanakan:
- `tenantId`
- `currentPlanId`
- `targetPlanId`
- `orderType`
- `status`
- `amount`
- `billingPeriod`
- `studentCapacity`
- `paymentMethod`
- `paymentProofUrl`
- `submittedAt`
- `paidAt`
- `verifiedAt`
- `activatedAt`
- `expiresAt`
- `notes`
- `rejectionReason`
- `createdByUserId`
- `verifiedByUserId`

Progress implementasi saat ini:
- model `SubscriptionOrder` sudah ditambahkan
- tenant dapat membuat order billing dari halaman `Langganan`
- super admin memiliki inbox `Subscription Orders` untuk verifikasi dan aktivasi manual
- bukti pembayaran saat ini memakai file upload ke storage lokal melalui endpoint upload yang sudah ada
- tenant juga dapat mengirim ulang bukti pembayaran ke order yang `REJECTED` atau `EXPIRED` melalui endpoint resubmission tanpa membuat order baru

## Status yang Direncanakan

### Subscription
- `ACTIVE`
- `EXPIRING_SOON`
- `EXPIRED`
- `SUSPENDED`

### Subscription Order
- `PENDING_PAYMENT`
- `WAITING_VERIFICATION`
- `VERIFIED`
- `ACTIVATED`
- `REJECTED`
- `CANCELLED`
- `EXPIRED`

## Surface Aplikasi yang Direncanakan

### Tenant Admin
- `/app/billing`
- daftar paket publik
- checkout/unggah bukti bayar
- riwayat order billing

Implementasi development saat ini:
- route tenant aktif di `/app/pengaturan/langganan`
- route API tenant aktif di `/api/billing/subscription` dan `/api/billing/orders`

### Super Admin
- `/super-admin/plans`
- `/super-admin/subscription-orders`
- ringkasan subscription tenant
- verifikasi pembayaran dan aktivasi langganan

## Aturan Kompatibilitas

- `tenant.planId` dan `tenant.paket` tetap dipertahankan untuk kompatibilitas modul existing
- source of truth billing jangka menengah dipindah ke `TenantSubscription`
- saat subscription aktif berubah, `tenant.planId` dan `tenant.paket` harus ikut disinkronkan

## Fase Implementasi

### Fase 1
- rapikan `Plan` menjadi basis slot siswa dan harga tahunan
- pertahankan `PlanFeature` sebagai override internal
- update super admin plan management agar fokus pada kapasitas dan harga

### Fase 2
- tambahkan `TenantSubscription`
- sinkronkan relasi tenant dengan plan aktif dan periode langganan

### Fase 3
- tambahkan `SubscriptionOrder`
- buat halaman tenant billing
- buat halaman super admin subscription orders

### Fase 4
- enforce kuota siswa aktif pada create siswa, reaktivasi status siswa, dan sinkronisasi PPDB
- expose warning kuota ke API tenant terkait agar dashboard dan modul siswa bisa menampilkan status 80/90/100%
- tampilkan warning kuota di halaman tenant/admin terkait

## Catatan Operasional

- pada fase awal, pembayaran dapat diverifikasi manual oleh super admin
- payment gateway tidak menjadi syarat implementasi pertama
- downgrade paket tidak menjadi prioritas awal; fokus awal adalah new subscription, upgrade, dan renewal
- top-up atau custom enterprise dapat ditambahkan setelah alur dasar stabil

## Handoff Besok

Status implementasi yang sudah aman di development:
- super admin: dashboard, tenant management, plans, feature access, audit logs, subscription orders
- tenant admin: menu `Langganan`, checkout billing, resubmit pembayaran, warning kuota di `Langganan`, `Data Siswa`, dan dashboard tenant
- backend: `TenantSubscription`, `SubscriptionOrder`, guard kuota siswa aktif, warning quota API

Prioritas kerja berikutnya saat buka chat baru:
1. pertimbangkan apakah indikator sidebar kuota perlu diteruskan ke mode mobile atau cukup di desktop
2. lakukan QA alur tenant `Langganan` end-to-end setelah polish UI ini
3. lanjut ke pekerjaan billing/super-admin berikutnya jika tenant flow sudah dianggap stabil

Urutan yang disarankan:
1. mulai dari QA tenant flow `Langganan`, termasuk order baru, resubmit, dan state tanpa order
2. evaluasi apakah indikator sidebar yang sekarang perlu penyesuaian khusus untuk mobile
3. jika tenant flow sudah stabil, geser fokus ke backlog billing/super-admin berikutnya

Checklist QA dev yang disarankan:
1. Login sebagai tenant admin dan buka `/app/pengaturan/langganan`
2. Pastikan summary plan, status langganan, kuota siswa, dan jatuh tempo tampil dengan label human-readable
3. Pastikan warning kuota muncul konsisten di `/app/dashboard`, `/app/pengaturan/langganan`, `/app/data-master/siswa`, dan indikator sidebar saat warning level `WARNING_80`, `WARNING_90`, atau `FULL`
4. Buat order billing baru dari halaman `Langganan`, unggah bukti pembayaran, lalu cek order masuk ke riwayat dengan status `Menunggu Verifikasi`
5. Uji empty state tenant dengan tenant yang belum punya order billing dan pastikan CTA/copy tetap jelas
6. Login sebagai `SUPER_ADMIN`, buka `/super-admin/subscription-orders`, lalu cek search, filter status, label status, metode bayar, dan periode billing
7. Verifikasi satu order billing dari super admin dan pastikan status berubah ke aktif serta subscription tenant ikut tersinkron
8. Tolak satu order billing dengan alasan penolakan, lalu login lagi sebagai tenant untuk memastikan order bisa di-resubmit dan alasan penolakan terlihat jelas
9. Setelah resubmit, cek kembali order masuk ke antrean verifikasi super admin dengan status yang benar
10. Jika perlu, ulangi cek visual sidebar dan halaman billing tenant di viewport mobile untuk memastikan indicator tidak mengganggu layout

Catatan teknis untuk chat berikutnya:
- source of truth kuota: `TenantSubscription.studentCapacity`
- siswa yang menghitung kuota: `Siswa.status = AKTIF`
- API warning kuota sudah tersedia di:
  - `/api/billing/subscription`
  - `/api/data-master/siswa`
  - `/api/keuangan/dashboard/stats`
- route tenant billing aktif di `/app/pengaturan/langganan`
- route super admin order review aktif di `/super-admin/subscription-orders`
