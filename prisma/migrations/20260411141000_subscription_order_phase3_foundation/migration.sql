CREATE TABLE "subscription_orders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "current_plan_id" TEXT,
    "target_plan_id" TEXT NOT NULL,
    "order_type" TEXT NOT NULL DEFAULT 'NEW_SUBSCRIPTION',
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "billing_period" TEXT NOT NULL DEFAULT 'YEARLY',
    "student_capacity" INTEGER NOT NULL DEFAULT 0,
    "payment_method" TEXT,
    "payment_proof_url" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "activated_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "notes" TEXT,
    "rejection_reason" TEXT,
    "created_by_user_id" TEXT,
    "verified_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_orders_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "subscription_orders_tenant_id_submitted_at_idx" ON "subscription_orders"("tenant_id", "submitted_at" DESC);
CREATE INDEX "subscription_orders_status_submitted_at_idx" ON "subscription_orders"("status", "submitted_at" DESC);

ALTER TABLE "subscription_orders" ADD CONSTRAINT "subscription_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscription_orders" ADD CONSTRAINT "subscription_orders_current_plan_id_fkey" FOREIGN KEY ("current_plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "subscription_orders" ADD CONSTRAINT "subscription_orders_target_plan_id_fkey" FOREIGN KEY ("target_plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
