-- CreateIndex
CREATE INDEX "Note_updatedAt_ownerId_idx" ON "Note"("updatedAt", "ownerId");
