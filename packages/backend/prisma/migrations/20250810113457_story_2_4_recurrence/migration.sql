/*
  Warnings:

  - A unique constraint covering the columns `[parent_id,occurrence_index]` on the table `tickets` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."tickets" ADD COLUMN     "is_exception" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "occurrence_index" INTEGER,
ADD COLUMN     "parent_id" TEXT,
ADD COLUMN     "recurrence" JSONB;

-- CreateIndex
CREATE INDEX "tickets_parent_id_idx" ON "public"."tickets"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_parent_id_occurrence_index_key" ON "public"."tickets"("parent_id", "occurrence_index");

-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
