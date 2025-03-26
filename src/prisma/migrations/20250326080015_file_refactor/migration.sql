/*
  Warnings:

  - You are about to drop the column `fileRelationId` on the `LessonExercise` table. All the data in the column will be lost.
  - You are about to drop the `CourseItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LessonItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FileItemType" ADD VALUE 'LESSON_EXERCISE';
ALTER TYPE "FileItemType" ADD VALUE 'HOMEWORK_ANSWER';

-- DropForeignKey
ALTER TABLE "CourseItem" DROP CONSTRAINT "CourseItem_courseId_fkey";

-- DropForeignKey
ALTER TABLE "LessonItem" DROP CONSTRAINT "LessonItem_lessonId_fkey";

-- DropIndex
DROP INDEX "FileRelation_fileId_itemType_key";

-- AlterTable
ALTER TABLE "LessonExercise" DROP COLUMN "fileRelationId";

-- DropTable
DROP TABLE "CourseItem";

-- DropTable
DROP TABLE "LessonItem";

-- DropEnum
DROP TYPE "LessonItemType";
