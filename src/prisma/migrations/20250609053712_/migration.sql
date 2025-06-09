/*
  Warnings:

  - Added the required column `type` to the `LessonAttachment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LessonAttachmentType" AS ENUM ('VIDEO', 'AUDIO', 'DOCUMENT');

-- AlterTable
ALTER TABLE "LessonAttachment" ADD COLUMN     "type" "LessonAttachmentType" NOT NULL;
