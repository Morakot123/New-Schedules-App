/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ClassGroup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Lab` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `day` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Made the column `classGroupId` on table `Schedule` required. This step will fail if there are existing NULL values in that column.
  - Made the column `labId` on table `Schedule` required. This step will fail if there are existing NULL values in that column.
  - Made the column `teacherId` on table `Schedule` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Schedule` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Teacher` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Schedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subject" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "labId" INTEGER NOT NULL,
    "classGroupId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Schedule_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Schedule_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Schedule_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Schedule" ("classGroupId", "createdAt", "id", "labId", "subject", "teacherId", "time", "userId") SELECT "classGroupId", "createdAt", "id", "labId", "subject", "teacherId", "time", "userId" FROM "Schedule";
DROP TABLE "Schedule";
ALTER TABLE "new_Schedule" RENAME TO "Schedule";
CREATE TABLE "new_Teacher" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Teacher" ("id", "name", "userId") SELECT "id", "name", "userId" FROM "Teacher";
DROP TABLE "Teacher";
ALTER TABLE "new_Teacher" RENAME TO "Teacher";
CREATE UNIQUE INDEX "Teacher_name_key" ON "Teacher"("name");
CREATE UNIQUE INDEX "Teacher_userId_key" ON "Teacher"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ClassGroup_name_key" ON "ClassGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Lab_name_key" ON "Lab"("name");
