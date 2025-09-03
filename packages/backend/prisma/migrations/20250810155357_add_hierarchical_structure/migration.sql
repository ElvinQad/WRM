/*
  Warnings:

  - You are about to drop the column `parent_ticket_id` on the `tickets` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."tickets" DROP CONSTRAINT "tickets_parent_ticket_id_fkey";

-- DropIndex
DROP INDEX "public"."tickets_parent_ticket_id_idx";

-- AlterTable
ALTER TABLE "public"."tickets" DROP COLUMN "parent_ticket_id",
ADD COLUMN     "auto_complete_on_children_done" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "child_completion_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "child_order" INTEGER,
ADD COLUMN     "hierarchy_parent_id" TEXT,
ADD COLUMN     "nesting_level" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "recurrence_parent_id" TEXT,
ADD COLUMN     "total_child_count" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "tickets_recurrence_parent_id_idx" ON "public"."tickets"("recurrence_parent_id");

-- CreateIndex
CREATE INDEX "tickets_hierarchy_parent_id_idx" ON "public"."tickets"("hierarchy_parent_id");

-- CreateIndex
CREATE INDEX "tickets_nesting_level_idx" ON "public"."tickets"("nesting_level");

-- CreateIndex
CREATE INDEX "tickets_user_id_hierarchy_parent_id_idx" ON "public"."tickets"("user_id", "hierarchy_parent_id");

-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_recurrence_parent_id_fkey" FOREIGN KEY ("recurrence_parent_id") REFERENCES "public"."tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_hierarchy_parent_id_fkey" FOREIGN KEY ("hierarchy_parent_id") REFERENCES "public"."tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
