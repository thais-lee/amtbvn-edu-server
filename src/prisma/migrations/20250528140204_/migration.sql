/*
  Warnings:

  - You are about to drop the column `fileId` on the `LibraryMaterial` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "LibraryMaterial" DROP CONSTRAINT "LibraryMaterial_fileId_fkey";

-- DropIndex
DROP INDEX "LibraryMaterial_fileId_key";

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "libraryMaterialId" INTEGER;

-- AlterTable
ALTER TABLE "LibraryMaterial" DROP COLUMN "fileId";

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_libraryMaterialId_fkey" FOREIGN KEY ("libraryMaterialId") REFERENCES "LibraryMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
