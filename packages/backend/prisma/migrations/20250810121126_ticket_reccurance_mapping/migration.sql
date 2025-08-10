/*
  Warnings:

  - You are about to drop the column `is_exception` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `occurrence_index` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `parent_id` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `recurrence` on the `tickets` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."RecurrenceFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM');

-- DropForeignKey
ALTER TABLE "public"."tickets" DROP CONSTRAINT "tickets_parent_id_fkey";

-- DropIndex
DROP INDEX "public"."tickets_parent_id_idx";

-- DropIndex
DROP INDEX "public"."tickets_parent_id_occurrence_index_key";

-- AlterTable
ALTER TABLE "public"."tickets" DROP COLUMN "is_exception",
DROP COLUMN "occurrence_index",
DROP COLUMN "parent_id",
DROP COLUMN "recurrence",
ADD COLUMN     "is_recurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "max_occurrences" INTEGER,
ADD COLUMN     "parent_ticket_id" TEXT,
ADD COLUMN     "recurrence_end" TIMESTAMP(3),
ADD COLUMN     "recurrence_id" TEXT,
ADD COLUMN     "recurrence_rule" TEXT;

-- CreateTable
CREATE TABLE "public"."recurrence_patterns" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "frequency" "public"."RecurrenceFrequency" NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "skip_dates" TIMESTAMP(3)[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurrence_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recurrence_patterns_ticket_id_key" ON "public"."recurrence_patterns"("ticket_id");

-- CreateIndex
CREATE INDEX "recurrence_patterns_ticket_id_idx" ON "public"."recurrence_patterns"("ticket_id");

-- CreateIndex
CREATE INDEX "tickets_recurrence_id_idx" ON "public"."tickets"("recurrence_id");

-- CreateIndex
CREATE INDEX "tickets_parent_ticket_id_idx" ON "public"."tickets"("parent_ticket_id");

-- CreateIndex
CREATE INDEX "tickets_is_recurring_idx" ON "public"."tickets"("is_recurring");

-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_parent_ticket_id_fkey" FOREIGN KEY ("parent_ticket_id") REFERENCES "public"."tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recurrence_patterns" ADD CONSTRAINT "recurrence_patterns_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
