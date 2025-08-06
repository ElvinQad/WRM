-- CreateIndex
CREATE INDEX "tickets_user_id_start_time_idx" ON "public"."tickets"("user_id", "start_time");

-- CreateIndex
CREATE INDEX "tickets_user_id_end_time_idx" ON "public"."tickets"("user_id", "end_time");

-- CreateIndex
CREATE INDEX "tickets_user_id_start_time_end_time_idx" ON "public"."tickets"("user_id", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "tickets_start_time_end_time_idx" ON "public"."tickets"("start_time", "end_time");
