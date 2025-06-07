/*
  Warnings:

  - A unique constraint covering the columns `[parentId,slug]` on the table `Categories` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Categories_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "Categories_parentId_slug_key" ON "Categories"("parentId", "slug");
