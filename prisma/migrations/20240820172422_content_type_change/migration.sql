/*
  Warnings:

  - Made the column `contentType` on table `NoteImage` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NoteImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "altText" TEXT,
    "contentType" TEXT NOT NULL,
    "blob" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "noteId" TEXT NOT NULL,
    CONSTRAINT "NoteImage_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_NoteImage" ("altText", "blob", "contentType", "createdAt", "id", "noteId", "updatedAt") SELECT "altText", "blob", "contentType", "createdAt", "id", "noteId", "updatedAt" FROM "NoteImage";
DROP TABLE "NoteImage";
ALTER TABLE "new_NoteImage" RENAME TO "NoteImage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
