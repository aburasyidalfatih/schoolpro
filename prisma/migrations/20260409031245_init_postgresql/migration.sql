-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain_kustom" TEXT,
    "logo_url" TEXT,
    "alamat" TEXT,
    "telepon" TEXT,
    "email" TEXT,
    "website" TEXT,
    "media_sosial" JSONB,
    "pengaturan" JSONB,
    "paket" TEXT NOT NULL DEFAULT 'FREE',
    "berlangganan_sampai" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAF',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tahun_ajarans" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggal_mulai" TIMESTAMP(3) NOT NULL,
    "tanggal_selesai" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tahun_ajarans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kelases" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "tahun_ajaran_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tingkat" TEXT,
    "kapasitas" INTEGER NOT NULL DEFAULT 30,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kelases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siswas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "kelas_id" TEXT,
    "unit_id" TEXT,
    "nis" TEXT NOT NULL,
    "nisn" TEXT,
    "nama_lengkap" TEXT NOT NULL,
    "jenis_kelamin" TEXT,
    "tempat_lahir" TEXT,
    "tanggal_lahir" TIMESTAMP(3),
    "alamat" TEXT,
    "telepon" TEXT,
    "foto_url" TEXT,
    "nama_wali" TEXT,
    "telepon_wali" TEXT,
    "email_wali" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "data_tambahan" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "siswas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori_tagihans" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "is_bulanan" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kategori_tagihans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rekenings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nama_bank" TEXT NOT NULL,
    "no_rekening" TEXT NOT NULL,
    "atas_nama" TEXT NOT NULL,
    "logo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rekenings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tagihans" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "kategori_id" TEXT NOT NULL,
    "tahun_ajaran_id" TEXT NOT NULL,
    "bulan" TEXT,
    "nominal" DECIMAL(65,30) NOT NULL,
    "potongan" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BELUM_LUNAS',
    "jatuh_tempo" TIMESTAMP(3),
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tagihans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pembayarans" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tagihan_id" TEXT NOT NULL,
    "petugas_id" TEXT,
    "rekening_id" TEXT,
    "no_transaksi" TEXT NOT NULL,
    "jumlah_bayar" DECIMAL(65,30) NOT NULL,
    "metode" TEXT NOT NULL DEFAULT 'TUNAI',
    "status" TEXT NOT NULL DEFAULT 'BERHASIL',
    "bukti_url" TEXT,
    "tanggal_bayar" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pembayarans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "akun_kas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "akun_kas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaksi_kas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "akun_kas_id" TEXT NOT NULL,
    "pembayaran_id" TEXT,
    "jenis" TEXT NOT NULL,
    "nominal" DECIMAL(65,30) NOT NULL,
    "keterangan" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_otomatis" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaksi_kas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tabungans" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "saldo" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tabungans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaksi_tabungans" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tabungan_id" TEXT NOT NULL,
    "petugas_id" TEXT,
    "jenis" TEXT NOT NULL,
    "nominal" DECIMAL(65,30) NOT NULL,
    "saldo_sebelum" DECIMAL(65,30) NOT NULL,
    "saldo_sesudah" DECIMAL(65,30) NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaksi_tabungans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periode_ppdbs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tahun_ajaran_id" TEXT NOT NULL,
    "unit_id" TEXT,
    "nama" TEXT NOT NULL,
    "tanggal_buka" TIMESTAMP(3) NOT NULL,
    "tanggal_tutup" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "pengaturan" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periode_ppdbs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendaftar_ppdbs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "periode_id" TEXT NOT NULL,
    "user_id" TEXT,
    "no_pendaftaran" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "data_formulir" JSONB,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU',
    "jalur_pendaftaran" TEXT,
    "jurusan_pilihan" TEXT,
    "data_orangtua" JSONB,
    "tanggal_daftar" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pendaftar_ppdbs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persyaratan_berkas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "periode_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "is_wajib" BOOLEAN NOT NULL DEFAULT true,
    "tipe_file" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persyaratan_berkas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "berkas_ppdbs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "pendaftar_id" TEXT NOT NULL,
    "persyaratan_id" TEXT NOT NULL,
    "file_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU',
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "berkas_ppdbs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tagihan_ppdbs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "pendaftar_id" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "nominal" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BELUM_LUNAS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tagihan_ppdbs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pembayaran_ppdbs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tagihan_id" TEXT NOT NULL,
    "no_transaksi" TEXT,
    "nominal" DECIMAL(65,30) NOT NULL,
    "metode" TEXT DEFAULT 'MANUAL',
    "tanggal_bayar" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "bukti_url" TEXT,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pembayaran_ppdbs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beritas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "konten" TEXT NOT NULL,
    "gambar_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "tanggal_terbit" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beritas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengumumans" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "konten" TEXT NOT NULL,
    "target_kelas" JSONB,
    "kirim_wa" BOOLEAN NOT NULL DEFAULT false,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengumumans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_aktivitas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "aksi" TEXT NOT NULL,
    "modul" TEXT NOT NULL,
    "detail" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_aktivitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengaturan_notifikasi" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "via_app" BOOLEAN NOT NULL DEFAULT true,
    "via_wa" BOOLEAN NOT NULL DEFAULT false,
    "via_email" BOOLEAN NOT NULL DEFAULT false,
    "template_pesan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengaturan_notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenant_id_username_key" ON "users"("tenant_id", "username");

-- CreateIndex
CREATE UNIQUE INDEX "units_tenant_id_kode_key" ON "units"("tenant_id", "kode");

-- CreateIndex
CREATE UNIQUE INDEX "tahun_ajarans_tenant_id_nama_key" ON "tahun_ajarans"("tenant_id", "nama");

-- CreateIndex
CREATE UNIQUE INDEX "siswas_tenant_id_nis_key" ON "siswas"("tenant_id", "nis");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_tagihans_tenant_id_kode_key" ON "kategori_tagihans"("tenant_id", "kode");

-- CreateIndex
CREATE UNIQUE INDEX "pembayarans_tenant_id_no_transaksi_key" ON "pembayarans"("tenant_id", "no_transaksi");

-- CreateIndex
CREATE UNIQUE INDEX "akun_kas_tenant_id_kode_key" ON "akun_kas"("tenant_id", "kode");

-- CreateIndex
CREATE UNIQUE INDEX "transaksi_kas_pembayaran_id_key" ON "transaksi_kas"("pembayaran_id");

-- CreateIndex
CREATE UNIQUE INDEX "tabungans_siswa_id_key" ON "tabungans"("siswa_id");

-- CreateIndex
CREATE UNIQUE INDEX "pendaftar_ppdbs_tenant_id_no_pendaftaran_key" ON "pendaftar_ppdbs"("tenant_id", "no_pendaftaran");

-- CreateIndex
CREATE UNIQUE INDEX "beritas_tenant_id_slug_key" ON "beritas"("tenant_id", "slug");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahun_ajarans" ADD CONSTRAINT "tahun_ajarans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelases" ADD CONSTRAINT "kelases_tahun_ajaran_id_fkey" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "tahun_ajarans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelases" ADD CONSTRAINT "kelases_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelases" ADD CONSTRAINT "kelases_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siswas" ADD CONSTRAINT "siswas_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siswas" ADD CONSTRAINT "siswas_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siswas" ADD CONSTRAINT "siswas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siswas" ADD CONSTRAINT "siswas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kategori_tagihans" ADD CONSTRAINT "kategori_tagihans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rekenings" ADD CONSTRAINT "rekenings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagihans" ADD CONSTRAINT "tagihans_tahun_ajaran_id_fkey" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "tahun_ajarans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagihans" ADD CONSTRAINT "tagihans_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "kategori_tagihans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagihans" ADD CONSTRAINT "tagihans_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagihans" ADD CONSTRAINT "tagihans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayarans" ADD CONSTRAINT "pembayarans_rekening_id_fkey" FOREIGN KEY ("rekening_id") REFERENCES "rekenings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayarans" ADD CONSTRAINT "pembayarans_petugas_id_fkey" FOREIGN KEY ("petugas_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayarans" ADD CONSTRAINT "pembayarans_tagihan_id_fkey" FOREIGN KEY ("tagihan_id") REFERENCES "tagihans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayarans" ADD CONSTRAINT "pembayarans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "akun_kas" ADD CONSTRAINT "akun_kas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_kas" ADD CONSTRAINT "transaksi_kas_pembayaran_id_fkey" FOREIGN KEY ("pembayaran_id") REFERENCES "pembayarans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_kas" ADD CONSTRAINT "transaksi_kas_akun_kas_id_fkey" FOREIGN KEY ("akun_kas_id") REFERENCES "akun_kas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_kas" ADD CONSTRAINT "transaksi_kas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tabungans" ADD CONSTRAINT "tabungans_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tabungans" ADD CONSTRAINT "tabungans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_tabungans" ADD CONSTRAINT "transaksi_tabungans_petugas_id_fkey" FOREIGN KEY ("petugas_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_tabungans" ADD CONSTRAINT "transaksi_tabungans_tabungan_id_fkey" FOREIGN KEY ("tabungan_id") REFERENCES "tabungans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_tabungans" ADD CONSTRAINT "transaksi_tabungans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periode_ppdbs" ADD CONSTRAINT "periode_ppdbs_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periode_ppdbs" ADD CONSTRAINT "periode_ppdbs_tahun_ajaran_id_fkey" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "tahun_ajarans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periode_ppdbs" ADD CONSTRAINT "periode_ppdbs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftar_ppdbs" ADD CONSTRAINT "pendaftar_ppdbs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftar_ppdbs" ADD CONSTRAINT "pendaftar_ppdbs_periode_id_fkey" FOREIGN KEY ("periode_id") REFERENCES "periode_ppdbs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftar_ppdbs" ADD CONSTRAINT "pendaftar_ppdbs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persyaratan_berkas" ADD CONSTRAINT "persyaratan_berkas_periode_id_fkey" FOREIGN KEY ("periode_id") REFERENCES "periode_ppdbs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persyaratan_berkas" ADD CONSTRAINT "persyaratan_berkas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berkas_ppdbs" ADD CONSTRAINT "berkas_ppdbs_persyaratan_id_fkey" FOREIGN KEY ("persyaratan_id") REFERENCES "persyaratan_berkas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berkas_ppdbs" ADD CONSTRAINT "berkas_ppdbs_pendaftar_id_fkey" FOREIGN KEY ("pendaftar_id") REFERENCES "pendaftar_ppdbs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berkas_ppdbs" ADD CONSTRAINT "berkas_ppdbs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagihan_ppdbs" ADD CONSTRAINT "tagihan_ppdbs_pendaftar_id_fkey" FOREIGN KEY ("pendaftar_id") REFERENCES "pendaftar_ppdbs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagihan_ppdbs" ADD CONSTRAINT "tagihan_ppdbs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran_ppdbs" ADD CONSTRAINT "pembayaran_ppdbs_tagihan_id_fkey" FOREIGN KEY ("tagihan_id") REFERENCES "tagihan_ppdbs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran_ppdbs" ADD CONSTRAINT "pembayaran_ppdbs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beritas" ADD CONSTRAINT "beritas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beritas" ADD CONSTRAINT "beritas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengumumans" ADD CONSTRAINT "pengumumans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengumumans" ADD CONSTRAINT "pengumumans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_aktivitas" ADD CONSTRAINT "log_aktivitas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_aktivitas" ADD CONSTRAINT "log_aktivitas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengaturan_notifikasi" ADD CONSTRAINT "pengaturan_notifikasi_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
