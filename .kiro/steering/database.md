# SchoolPro — Database Schema

## Database
- PostgreSQL, db: `schoolpro`, host: `localhost:5432`
- ORM: Prisma (`/var/www/schoolpro/prisma/schema.prisma`)
- Semua tabel wajib punya `tenantId` untuk multi-tenant isolation

## Model & Relasi

### Core
| Model | Tabel | Keterangan |
|---|---|---|
| Tenant | tenants | Root multi-tenant, semua model berelasi ke sini |
| User | users | Petugas/staf, unique per `[tenantId, email]` dan `[tenantId, username]` |
| Unit | units | Satuan pendidikan (SD/SMP/SMA), unique `[tenantId, kode]` |
| TahunAjaran | tahun_ajarans | Periode akademik, unique `[tenantId, nama]` |
| Kelas | kelases | Kelas per unit + tahun ajaran |
| Siswa | siswas | Data siswa, unique `[tenantId, nis]` |

### Keuangan
| Model | Tabel | Keterangan |
|---|---|---|
| KategoriTagihan | kategori_tagihans | Jenis tagihan (SPP, dll), `isBulanan` untuk tagihan rutin |
| Rekening | rekenings | Rekening bank sekolah |
| Tagihan | tagihans | Tagihan per siswa, status: `BELUM_LUNAS / LUNAS` |
| Pembayaran | pembayarans | Transaksi bayar, unique `[tenantId, noTransaksi]` |
| AkunKas | akun_kas | Akun untuk arus kas, unique `[tenantId, kode]` |
| TransaksiKas | transaksi_kas | Arus kas, bisa otomatis dari Pembayaran |
| Tabungan | tabungans | Saldo tabungan per siswa (1-to-1 dengan Siswa) |
| TransaksiTabungan | transaksi_tabungans | Mutasi tabungan siswa |

### PPDB
| Model | Tabel | Keterangan |
|---|---|---|
| PeriodePpdb | periode_ppdbs | Periode penerimaan per unit + tahun ajaran |
| PersyaratanBerkas | persyaratan_berkas | Dokumen wajib per periode |
| PendaftarPpdb | pendaftar_ppdbs | Data calon siswa, status: `MENUNGGU/DITERIMA/DITOLAK` |
| BerkasPpdb | berkas_ppdbs | Upload dokumen pendaftar |
| TagihanPpdb | tagihan_ppdbs | Tagihan biaya pendaftaran |
| PembayaranPpdb | pembayaran_ppdbs | Pembayaran tagihan PPDB |

### Website Publik
| Model | Tabel | Keterangan |
|---|---|---|
| Berita | beritas | Artikel/berita, unique `[tenantId, slug]` |
| Agenda | agendas | Kalender kegiatan — ditambah field: `slug`, `waktu`, `kontakPerson`, `kategori`, `gambarUrl` |
| Pengumuman | pengumumans | Pengumuman — ditambah field: `slug`, `ringkasan`, `prioritas`, `gambarUrl` |
| Prestasi | prestasis | Prestasi siswa — ditambah field: `slug`, `siswa`, `pencapaian` |
| Ekskul | ekskuls | Ekstrakurikuler — ditambah field: `slug`, `hari`, `jumlahAnggota`, `maxAnggota`, `kategori`, `pendaftaranBuka` |
| Fasilitas | fasilitas | Fasilitas sekolah — ditambah field: `slug`, `kategori`, `kapasitas` |
| Slider | sliders | Banner/slider homepage |
| Alumni | alumnis | Data alumni |
| Guru | gurus | Data guru & staff, field: `nama`, `slug`, `jabatan`, `jabatanLabel`, `nip`, `pendidikan`, `bidang`, `bio`, `quote`, `foto`, `urutan` |
| Blog | blogs | Blog guru, field: `judul`, `slug`, `konten`, `ringkasan`, `penulis`, `fotoPenulis`, `bioPenulis`, `kategori`, `tags`, `gambarUrl` |
| Editorial | editorials | Editorial kepala sekolah, field: `judul`, `slug`, `konten`, `ringkasan`, `penulis`, `fotoPenulis`, `judulPenulis`, `gambarUrl` |

### Sistem
| Model | Tabel | Keterangan |
|---|---|---|
| LogAktivitas | log_aktivitas | Audit log per user |
| PengaturanNotifikasi | pengaturan_notifikasi | Konfigurasi notif (app/WA/email) |

### Platform / Super Admin
| Model | Tabel | Keterangan |
|---|---|---|
| TenantApplication | tenant_applications | Intake aplikasi calon tenant sebelum approval/provisioning menjadi tenant aktif |
| Plan | plans | Paket SchoolPro lintas tenant, diarahkan menjadi katalog plan berbasis `studentCapacity` dan harga tahunan |
| PlanFeature | plan_features | Mapping fitur default per plan, dipertahankan untuk override/internal control, bukan pembeda pricing utama |
| TenantSubscription | tenant_subscriptions | Source of truth langganan aktif tenant: plan aktif, kapasitas siswa, masa aktif, status subscription, dan relasi 1-to-1 per tenant |
| SubscriptionOrder | subscription_orders | Order checkout tenant untuk new subscription, upgrade, renewal, bukti pembayaran, verifikasi, dan aktivasi |
| TenantFeatureOverride | tenant_feature_overrides | Override fitur per tenant, unique `[tenantId, featureKey]` |
| PlatformAuditLog | platform_audit_logs | Audit log aksi sensitif super admin lintas tenant |
| PlatformSetting | platform_settings | Key-value JSON untuk konfigurasi global platform seperti default provisioning, billing, dan notifikasi internal |

### Tambahan Field Tenant
- `Tenant.planId` — relasi ke `Plan`
- `Tenant.tenantStatus` — status platform tenant (`TRIAL`, `ACTIVE`, `SUSPENDED`, `ARCHIVED`)
- `Tenant.trialEndsAt` — akhir masa trial tenant
- `Tenant.paket` tetap dipertahankan sebagai fallback/compatibility dan disinkronkan dengan `Plan.code`
- `Tenant.pengaturan` juga dipakai untuk konfigurasi tenant JSON tertentu seperti `tripay`, `emailGateway`, dan `whatsappGateway`

### Aturan Billing Berbasis Slot Siswa
- `Free` hanya membuka CMS website publik
- plan berbayar memberi full fitur SchoolPro
- pembeda utama plan berbayar adalah `studentCapacity`
- kuota dihitung berdasarkan jumlah `Siswa.status = AKTIF`
- status `ALUMNI` dan `KELUAR` tidak memakai slot
- saat kuota penuh, tenant tidak boleh menambah siswa aktif baru sampai slot tersedia atau subscription di-upgrade
- `TenantSubscription` menjadi source of truth status langganan aktif, tetapi `Tenant.planId` dan `Tenant.paket` tetap disinkronkan untuk kompatibilitas modul lama
- snapshot kuota siswa aktif kini juga diekspos lewat API tenant untuk dashboard dan modul data siswa agar warning 80/90/100 dapat dipakai lintas layar

### Ringkasan Field `TenantSubscription`
- `tenantId` — unique, satu subscription aktif per tenant
- `planId` — relasi ke plan aktif saat ini
- `status` — status langganan aktif tenant
- `studentCapacity` — snapshot kapasitas siswa aktif yang berlaku untuk tenant
- `startsAt` — awal periode subscription aktif
- `endsAt` — akhir periode aktif atau akhir trial bila ada
- `activatedAt` — waktu aktivasi plan berbayar
- `lastPaidAt` — waktu pembayaran terakhir yang mengaktifkan periode berjalan

### Ringkasan Field `SubscriptionOrder`
- `tenantId` — pemilik order billing tenant
- `currentPlanId` — plan aktif sebelum order diproses
- `targetPlanId` — plan yang diminta tenant
- `orderType` — `NEW_SUBSCRIPTION`, `UPGRADE`, atau `RENEWAL`
- `status` — state order dari submit tenant sampai aktivasi atau penolakan
- `amount` — nominal tahunan yang ditagihkan untuk order tersebut
- `studentCapacity` — snapshot kapasitas siswa dari target plan
- `paymentMethod` dan `paymentProofUrl` — bukti pembayaran tenant
- `submittedAt`, `paidAt`, `verifiedAt`, `activatedAt` — jejak waktu operasional billing
- `createdByUserId` dan `verifiedByUserId` — jejak actor tenant dan super admin
- order `REJECTED`, `PENDING_PAYMENT`, atau `EXPIRED` dapat di-resubmit tenant dengan bukti pembayaran baru tanpa membuat order baru

### Ringkasan Field `TenantApplication`
- `applicationCode` — nomor aplikasi publik untuk tracking aplikasi tenant
- `namaSekolah`, `jenjang`, `statusSekolah`, `npsn`, `emailSekolah`, `teleponSekolah`, `alamat`, `provinsi`, `kotaKabupaten`, `websiteSaatIni`, `jumlahSiswaSaatIni` — data inti sekolah
- `namaPic`, `jabatanPic`, `emailPic`, `whatsappPic` — kontak PIC sekolah
- `slugRequest` — usulan slug sekolah saat aplikasi dibuat
- `slugApproved` — slug final setelah review dan approval super admin
- `kebutuhanUtama`, `catatanTambahan`, `sumberLead` — konteks onboarding awal
- `status` — status aplikasi tenant dari submit sampai provisioning
- `submittedAt`, `reviewedAt`, `provisionedAt` — jejak waktu operasional intake dan onboarding
- `reviewedByUserId`, `reviewNotes`, `revisionNotes`, `rejectedReason` — catatan review internal
- `approvedTenantId` — relasi ke tenant aktif setelah provisioning berhasil

## Enum Values (String)
- `User.role`: ADMIN, KEUANGAN, TU, WALI, SISWA, STAF
- `Siswa.status`: AKTIF, ALUMNI, KELUAR
- `Tagihan.status`: BELUM_LUNAS, LUNAS
- `Pembayaran.metode`: TUNAI, TRANSFER, dll
- `Pembayaran.status`: BERHASIL, GAGAL, PENDING
- `PendaftarPpdb.status`: MENUNGGU, DITERIMA, DITOLAK
- `BerkasPpdb.status`: MENUNGGU, DISETUJUI, DITOLAK
- `Berita.status`: DRAFT, TERBIT
- `Berita.kategori`: BERITA, ARTIKEL, PENGUMUMAN
- `TransaksiKas.jenis`: MASUK, KELUAR
- `TransaksiTabungan.jenis`: SETOR, TARIK
- `Tenant.tenantStatus`: TRIAL, ACTIVE, SUSPENDED, ARCHIVED
- `TenantApplication.status`: DRAFT, SUBMITTED, UNDER_REVIEW, REVISION_REQUESTED, APPROVED, REJECTED, PROVISIONED
- `TenantSubscription.status`: TRIAL, ACTIVE, EXPIRED, SUSPENDED
- `SubscriptionOrder.orderType`: NEW_SUBSCRIPTION, UPGRADE, RENEWAL
- `SubscriptionOrder.status`: PENDING_PAYMENT, WAITING_VERIFICATION, VERIFIED, ACTIVATED, REJECTED, CANCELLED, EXPIRED

## Feature Key Platform
- `website`
- `cms`
- `ppdb`
- `keuangan`
- `tabungan`
- `laporan`
- `ai_module`
- `whatsapp_notifikasi`

## Aturan Query
- Selalu filter dengan `tenantId` di setiap query
- Gunakan `include` Prisma untuk relasi, hindari N+1
- Decimal fields (nominal, saldo, dll) — gunakan `Number()` saat display
- Untuk validasi kuota siswa, hitung berdasarkan subscription aktif tenant dan jumlah siswa `AKTIF`, bukan total seluruh data siswa
