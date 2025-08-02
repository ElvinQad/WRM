/*
  Warnings:

  - A unique constraint covering the columns `[email_verification_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[password_reset_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "email_verification_token" TEXT,
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password_reset_expires" TIMESTAMP(3),
ADD COLUMN     "password_reset_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_verification_token_key" ON "public"."users"("email_verification_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_password_reset_token_key" ON "public"."users"("password_reset_token");
