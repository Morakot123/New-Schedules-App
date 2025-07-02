/*
  Warnings:

  - You are about to drop the column `capacity` on the `Lab` table. All the data in the column will be lost.
  - You are about to drop the column `roomNumber` on the `Lab` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lab" DROP COLUMN "capacity",
DROP COLUMN "roomNumber";
