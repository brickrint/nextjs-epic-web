-- DropIndex
DROP INDEX "Note_updatedAt_ownerId_idx";

-- CreateIndex
CREATE INDEX "Note_ownerId_updatedAt_idx" ON "Note"("ownerId", "updatedAt");
