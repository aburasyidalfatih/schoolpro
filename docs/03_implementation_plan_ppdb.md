# Blueprint Teknis — Modul PPDB (SaaS-Ready)

Dokumen ini adalah *cetak biru* (blueprint) teknis super detail untuk pengerjaan Modul Penerimaan Peserta Didik Baru (PPDB) yang akan kita eksekusi bertahap. Modul ini menganut prinsip **Progressive Onboarding** dengan 7 tahapan funneling.

---

## Arsitektur Alur & State Management (7 Tahap)

Sistem akan melacak pendaftar melalui Enum Status. Karena kita menggunakan Prisma, kita akan memperluas `StatusPpdb` di masa depan jika diperlukan, namun untuk saat ini kita menggunakan kombinasi status pembayaran dan status formulir.

| Tahap | Aktivitas User | Reaksi Sistem (Backend) |
| :--- | :--- | :--- |
| **1. Pre-Registration** | Mengisi Form Singkat (Nama, Tingkat, NISN). | Membuat row di `PendaftarPpdb`. Membuat `TagihanPpdb` (Biaya Formulir). |
| **2. Bayar Formulir** | Melunasi *Invoice* Pendaftaran. | Status `Tagihan` menjadi `LUNAS`. Meng-unlock form tahap 3. |
| **3. Form Lengkap** | Input Data Detail & Upload Berkas. | Data tersimpan di `dataFormulir`. Status Berkas `MENUNGGU`. Status Pendaftar `TERVERIFIKASI` (oleh admin jika lengkap). |
| **4. Ujian Seleksi** | Menunggu/Melihat Jadwal Tes. | Menampilkan jadwal dari Admin. |
| **5. Pengumuman** | Melihat Hasil Tes. | Admin mengubah status menjadi `DITERIMA` atau `DITOLAK`. |
| **6. Daftar Ulang** | Menerima rincian tagihan (SPP Awal, Gedung). | Sistem men-generate `Tagihan` (Daftar Ulang). Tersedia opsi cicil (`SEBAGIAN`). |
| **7. Resmi Integrasi** | Lunas / Deal Daftar Ulang. | Admin klik "Sinkronisasi". Pendaftar disalin ke tabel `SISWA`. |

---

## Rencana Eksekusi Teknis (File per File)

Kita akan membaginya murni ke dalam 3 Fase Eksekusi agar lebih fokus dan kode lebih bersih.

### FASE 1: Dapur Admin (Setup Gelombang & Persyaratan) ✅ SELESAI
*Fokus: Membangun backend dan UI bagi admin untuk membuka/menutup pendaftaran.*

**A. API Routes:**
- `[DONE]` `/api/ppdb/periode` (GET, POST): CRUD Gelombang PPDB.
- `[DONE]` `/api/ppdb/persyaratan` (GET, POST): Mengatur form apa/berkas apa yang wajib diupload.

**B. UI Pages (Dasbor Admin):**
- `[DONE]` `src/app/(admin)/ppdb/periode/page.tsx`: DataTable untuk melihat gelombang pendaftaran (Aktif/Tutup). Lengkap dengan Modal Form.
- `[DONE]` `src/app/(admin)/ppdb/persyaratan/page.tsx`: Manajemen berkas (contoh: Set KK Wajib, Ijazah Wajib).
- `[NEW]` `src/app/(admin)/ppdb/pengaturan/page.tsx`: Menentukan tarif "Biaya Pendaftaran Formulir".

### FASE 2: Portal Pendaftar & Funneling (Sisi User)
*Fokus: Menggarap halaman depan dan UX pendaftar.*

**A. Publik & Registrasi:**
- `[NEW]` `src/app/ppdb/page.tsx`: Landing Page elegan (Public). Menampilkan Gelombang yang sedang buka.
- `[NEW]` `src/app/(auth)/register/page.tsx`: Pendaftaran akun `USER`.

**B. Dasbor User & Formulir (The Stepper):**
- `[MODIFY]` `src/app/(user)/dashboard/page.tsx`: Dasbor pintar. Menampilkan "Mulai Pendaftaran" jika belum daftar. Atau "Lanjut Ke Tahap 2" jika sudah mengisi form singkat.
- `[NEW]` `src/app/(user)/ppdb/form-singkat`: UI Tahap 1.
- `[NEW]` `src/app/(user)/ppdb/invoice`: UI Tahap 2.
- `[NEW]` `src/app/(user)/ppdb/form-lengkap`: UI Tahap 3. Form builder menggunakan struktur JSON agar fleksibel `({ nama_ayah, pekerjaan, penghasilan })`.

### FASE 3: Meja Verifikasi & Sinkronisasi
*Fokus: Admin menilai berkas dan memasukkan data mentah ke ekosistem SISPRO.*

**A. API Routes:**
- `[NEW]` `/api/ppdb/pendaftar/[id]/verifikasi`: Endpoint untuk Admin menyetujui berkas.
- `[NEW]` `/api/ppdb/pendaftar/[id]/terima`: Endpoint krusial untuk DITERIMA.
- `[NEW]` `/api/ppdb/pendaftar/[id]/sinkron`: Endpoint paling *magic*. (Menyalin dari `PendaftarPpdb` -> `Siswa`).

**B. UI Pages:**
- `[NEW]` `src/app/(admin)/ppdb/pendaftar/page.tsx`: Tabel antrean berkas masuk. Filter berdasarkan status (Menunggu/Lulus).
- `[NEW]` `src/app/(admin)/ppdb/pendaftar/[id]/page.tsx`: Detail halaman review satu siswa, tombol Approve Berkas, dan form untuk memasukkan Tagihan Daftar Ulang.

---

## Kesiapan Database (Prisma)
Struktur di `schema.prisma` saat ini **sudah 95% mampu** mengakomodasi alur ini tanpa perubahan besar. 
Fitur kunci yang kita manfaatkan:
1. `PeriodePpdb` -> Menampung gelombang pendaftaran.
2. `PendaftarPpdb.dataFormulir` (JSON) -> Menampung semua field form lengkap tanpa perlu merusak skema utama.
3. `PendaftarPpdb.userId` -> Tali pengikat antara formulir dan akun orang tua yang membayar.

---

## Tindakan Selanjutnya (Next Action)
Kita akan melanjutkan ke **FASE 2: Portal Pendaftar & Funneling**. Fokus utama adalah membangun Landing Page PPDB yang menampilkan gelombang aktif dan sistem registrasi akun pendaftar baru.
