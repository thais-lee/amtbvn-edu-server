-- DropForeignKey
ALTER TABLE "Articles" DROP CONSTRAINT "Articles_categoryId_fkey";

-- AlterTable
ALTER TABLE "Articles" ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Articles" ADD CONSTRAINT "Articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
