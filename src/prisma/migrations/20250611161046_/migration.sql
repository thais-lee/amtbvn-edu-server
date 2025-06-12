/*
  Warnings:

  - You are about to drop the column `essayAnswer` on the `StudentAnswer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StudentAnswer" DROP COLUMN "essayAnswer",
ADD COLUMN     "answer" TEXT;
