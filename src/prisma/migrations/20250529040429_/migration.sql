/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Categories` will be added. If there are existing duplicate values, this will fail.
  - Made the column `slug` on table `Categories` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Categories_id_key";

-- DropIndex
DROP INDEX "Categories_parentId_slug_key";

-- AlterTable
ALTER TABLE "Categories" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Categories_slug_key" ON "Categories"("slug");
