/*
  Warnings:

  - You are about to drop the column `activityType` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `ActivityQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `displayOrder` on the `ActivityQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `explanation` on the `ActivityQuestion` table. All the data in the column will be lost.
  - You are about to drop the `ActivityOption` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question` to the `ActivityQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ActivityQuestion` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `ActivityQuestion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'DISCUSSION';
ALTER TYPE "ActivityType" ADD VALUE 'MATERIAL';

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityOption" DROP CONSTRAINT "ActivityOption_activityQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "StudentAnswer" DROP CONSTRAINT "StudentAnswer_selectedOptionId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "activityType",
ADD COLUMN     "status" "ActivityStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "type" "ActivityType" NOT NULL;

-- AlterTable
ALTER TABLE "ActivityQuestion" DROP COLUMN "content",
DROP COLUMN "displayOrder",
DROP COLUMN "explanation",
ADD COLUMN     "correctAnswer" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "question" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "QuestionType" NOT NULL,
ALTER COLUMN "points" SET DEFAULT 1;

-- DropTable
DROP TABLE "ActivityOption";

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionOption_questionId_idx" ON "QuestionOption"("questionId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ActivityQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswer" ADD CONSTRAINT "StudentAnswer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "QuestionOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
