-- DropForeignKey
ALTER TABLE "LibraryMaterial" DROP CONSTRAINT "LibraryMaterial_categoryId_fkey";

-- AlterTable
ALTER TABLE "LibraryMaterial" ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "LibraryMaterial" ADD CONSTRAINT "LibraryMaterial_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
