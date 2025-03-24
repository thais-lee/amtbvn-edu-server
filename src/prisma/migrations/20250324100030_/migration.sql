/*
  Warnings:

  - A unique constraint covering the columns `[previousId]` on the table `Lesson` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "previousId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_previousId_key" ON "Lesson"("previousId");

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_previousId_fkey" FOREIGN KEY ("previousId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
