CREATE TABLE "tenant_subscriptions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "plan_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TRIAL',
    "student_capacity" INTEGER NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMP(3),
    "activated_at" TIMESTAMP(3),
    "last_paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenant_subscriptions_tenant_id_key" ON "tenant_subscriptions"("tenant_id");

ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "tenant_subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "tenant_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "tenant_subscriptions" (
    "id",
    "tenant_id",
    "plan_id",
    "status",
    "student_capacity",
    "starts_at",
    "ends_at",
    "activated_at",
    "last_paid_at",
    "created_at",
    "updated_at"
)
SELECT
    gen_random_uuid()::text,
    t."id",
    COALESCE(t."plan_id", p."id"),
    CASE
        WHEN t."tenant_status" = 'ARCHIVED' OR t."is_active" = false OR t."tenant_status" = 'SUSPENDED' THEN 'SUSPENDED'
        WHEN t."berlangganan_sampai" IS NOT NULL AND t."berlangganan_sampai" < CURRENT_TIMESTAMP THEN 'EXPIRED'
        WHEN t."tenant_status" = 'TRIAL' OR t."paket" = 'FREE' THEN 'TRIAL'
        ELSE 'ACTIVE'
    END,
    COALESCE(p."student_capacity", 0),
    t."created_at",
    COALESCE(t."berlangganan_sampai", t."trial_ends_at"),
    CASE
        WHEN COALESCE(t."plan_id", p."id") IS NOT NULL AND t."paket" <> 'FREE' THEN t."created_at"
        ELSE NULL
    END,
    CASE
        WHEN t."berlangganan_sampai" IS NOT NULL THEN t."updated_at"
        ELSE NULL
    END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "tenants" t
LEFT JOIN "plans" p ON p."id" = t."plan_id" OR (t."plan_id" IS NULL AND p."code" = t."paket")
WHERE NOT EXISTS (
    SELECT 1
    FROM "tenant_subscriptions" ts
    WHERE ts."tenant_id" = t."id"
);
