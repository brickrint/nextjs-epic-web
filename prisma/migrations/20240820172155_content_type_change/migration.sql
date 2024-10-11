/*
  Warnings:

  - Made the column `contentType` on table `UserImage` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "altText" TEXT,
    "contentType" TEXT NOT NULL,
    "blob" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserImage" ("altText", "blob", "contentType", "createdAt", "id", "updatedAt", "userId") SELECT "altText", "blob", "contentType", "createdAt", "id", "updatedAt", "userId" FROM "UserImage";
DROP TABLE "UserImage";
ALTER TABLE "new_UserImage" RENAME TO "UserImage";
CREATE UNIQUE INDEX "UserImage_userId_key" ON "UserImage"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
