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
| Agenda | agendas | Kalender kegiatan |
| Pengumuman | pengumumans | Pengumuman internal/publik |
| Prestasi | prestasis | Prestasi siswa/sekolah |
| Ekskul | ekskuls | Ekstrakurikuler |
| Fasilitas | fasilitas | Fasilitas sekolah |
| Slider | sliders | Banner/slider homepage |
| Alumni | alumnis | Data alumni |

### Sistem
| Model | Tabel | Keterangan |
|---|---|---|
| LogAktivitas | log_aktivitas | Audit log per user |
| PengaturanNotifikasi | pengaturan_notifikasi | Konfigurasi notif (app/WA/email) |

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

## Aturan Query
- Selalu filter dengan `tenantId` di setiap query
- Gunakan `include` Prisma untuk relasi, hindari N+1
- Decimal fields (nominal, saldo, dll) — gunakan `Number()` saat display
