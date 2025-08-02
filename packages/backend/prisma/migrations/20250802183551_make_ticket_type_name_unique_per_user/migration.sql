/*
  Warnings:

  - A unique constraint covering the columns `[name,user_id]` on the table `ticket_types` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."ticket_types_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "ticket_types_name_user_id_key" ON "public"."ticket_types"("name", "user_id");
