-- AlterTable
ALTER TABLE "public"."tickets" ADD COLUMN     "is_in_pool" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pool_order" INTEGER;

-- CreateIndex
CREATE INDEX "tickets_user_id_is_in_pool_idx" ON "public"."tickets"("user_id", "is_in_pool");

-- CreateIndex
CREATE INDEX "tickets_user_id_is_in_pool_pool_order_idx" ON "public"."tickets"("user_id", "is_in_pool", "pool_order");
