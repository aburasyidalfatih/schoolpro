-- AlterTable
ALTER TABLE "beritas" ADD COLUMN     "kategori" TEXT NOT NULL DEFAULT 'BERITA',
ADD COLUMN     "ringkasan" TEXT;

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "profile_website" JSONB;

-- CreateTable
CREATE TABLE "agendas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "tanggal_mulai" TIMESTAMP(3) NOT NULL,
    "tanggal_akhir" TIMESTAMP(3),
    "lokasi" TEXT,
    "penanggungjawab" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prestasis" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "tingkat" TEXT NOT NULL DEFAULT 'SEKOLAH',
    "kategori" TEXT NOT NULL DEFAULT 'AKADEMIK',
    "tahun" INTEGER NOT NULL,
    "gambar_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prestasis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ekskuls" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "jadwal" TEXT,
    "pembina" TEXT,
    "gambar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ekskuls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fasilitas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "gambar_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fasilitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sliders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "judul" TEXT,
    "subjudul" TEXT,
    "gambar_url" TEXT NOT NULL,
    "link_url" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sliders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumnis" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "tahun_lulus" INTEGER NOT NULL,
    "melanjutkan_ke" TEXT,
    "pekerjaan" TEXT,
    "instansi" TEXT,
    "foto" TEXT,
    "testimonial" TEXT,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alumnis_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "agendas" ADD CONSTRAINT "agendas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestasis" ADD CONSTRAINT "prestasis_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ekskuls" ADD CONSTRAINT "ekskuls_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fasilitas" ADD CONSTRAINT "fasilitas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sliders" ADD CONSTRAINT "sliders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumnis" ADD CONSTRAINT "alumnis_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
