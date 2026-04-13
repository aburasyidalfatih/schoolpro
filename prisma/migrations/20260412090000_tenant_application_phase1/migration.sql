CREATE TABLE "tenant_applications" (
    "id" TEXT NOT NULL,
    "application_code" TEXT NOT NULL,
    "nama_sekolah" TEXT NOT NULL,
    "jenjang" TEXT NOT NULL,
    "status_sekolah" TEXT NOT NULL,
    "npsn" TEXT,
    "email_sekolah" TEXT NOT NULL,
    "telepon_sekolah" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "provinsi" TEXT NOT NULL,
    "kota_kabupaten" TEXT NOT NULL,
    "website_saat_ini" TEXT,
    "jumlah_siswa_saat_ini" INTEGER,
    "nama_pic" TEXT NOT NULL,
    "jabatan_pic" TEXT NOT NULL,
    "email_pic" TEXT NOT NULL,
    "whatsapp_pic" TEXT NOT NULL,
    "slug_request" TEXT NOT NULL,
    "slug_approved" TEXT,
    "kebutuhan_utama" TEXT NOT NULL,
    "catatan_tambahan" TEXT,
    "sumber_lead" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "submitted_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by_user_id" TEXT,
    "review_notes" TEXT,
    "revision_notes" TEXT,
    "rejected_reason" TEXT,
    "approved_tenant_id" TEXT,
    "provisioned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_applications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenant_applications_application_code_key" ON "tenant_applications"("application_code");
CREATE INDEX "tenant_applications_status_created_at_idx" ON "tenant_applications"("status", "created_at");
CREATE INDEX "tenant_applications_email_pic_idx" ON "tenant_applications"("email_pic");
CREATE INDEX "tenant_applications_slug_request_idx" ON "tenant_applications"("slug_request");

ALTER TABLE "tenant_applications"
ADD CONSTRAINT "tenant_applications_approved_tenant_id_fkey"
FOREIGN KEY ("approved_tenant_id") REFERENCES "tenants"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
