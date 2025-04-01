/*
  Warnings:

  - You are about to drop the column `createdAt` on the `StudentAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `exerciseId` on the `StudentAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `mcqAnswers` on the `StudentAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `StudentAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `StudentAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `StudentAnswer` table. All the data in the column will be lost.
  - You are about to drop the `CourseMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Enrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExerciseSubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FileRelation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LessonExercise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LessonProgress` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[fileId]` on the table `StudentAnswer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[activityAttemptId,activityQuestionId]` on the table `StudentAnswer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `activityAttemptId` to the `StudentAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activityQuestionId` to the `StudentAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('QUIZ', 'ASSIGNMENT');

-- CreateEnum
CREATE TYPE "GradingStatus" AS ENUM ('IN_PROGRESS', 'PENDING_AUTO', 'PENDING_MANUAL', 'GRADED');

-- CreateEnum
CREATE TYPE "ActivityQuestionType" AS ENUM ('MULTIPLE_CHOICE', 'ESSAY', 'FILE_UPLOAD');

-- DropForeignKey
ALTER TABLE "CourseMember" DROP CONSTRAINT "CourseMember_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseMember" DROP CONSTRAINT "CourseMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_userId_fkey";

-- DropForeignKey
ALTER TABLE "ExerciseSubmission" DROP CONSTRAINT "ExerciseSubmission_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "ExerciseSubmission" DROP CONSTRAINT "ExerciseSubmission_studentAnswerId_fkey";

-- DropForeignKey
ALTER TABLE "FileRelation" DROP CONSTRAINT "FileRelation_fileId_fkey";

-- DropForeignKey
ALTER TABLE "LessonExercise" DROP CONSTRAINT "LessonExercise_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "LessonProgress" DROP CONSTRAINT "LessonProgress_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "LessonProgress" DROP CONSTRAINT "LessonProgress_userId_fkey";

-- DropForeignKey
ALTER TABLE "StudentAnswer" DROP CONSTRAINT "StudentAnswer_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "StudentAnswer" DROP CONSTRAINT "StudentAnswer_userId_fkey";

-- AlterTable
ALTER TABLE "StudentAnswer" DROP COLUMN "createdAt",
DROP COLUMN "exerciseId",
DROP COLUMN "mcqAnswers",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "activityAttemptId" INTEGER NOT NULL,
ADD COLUMN     "activityQuestionId" INTEGER NOT NULL,
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "fileId" INTEGER,
ADD COLUMN     "isCorrect" BOOLEAN,
ADD COLUMN     "score" DOUBLE PRECISION,
ADD COLUMN     "selectedOptionId" INTEGER;

-- DropTable
DROP TABLE "CourseMember";

-- DropTable
DROP TABLE "Enrollment";

-- DropTable
DROP TABLE "ExerciseSubmission";

-- DropTable
DROP TABLE "FileRelation";

-- DropTable
DROP TABLE "LessonExercise";

-- DropTable
DROP TABLE "LessonProgress";

-- DropEnum
DROP TYPE "ExerciseStatus";

-- DropEnum
DROP TYPE "LessonProgressStatus";

-- CreateTable
CREATE TABLE "LibraryMaterial" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "fileId" INTEGER NOT NULL,

    CONSTRAINT "LibraryMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseLibraryUsage" (
    "courseId" INTEGER NOT NULL,
    "libraryMaterialId" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "displayOrder" INTEGER,
    "contextualNote" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CourseLibraryUsage_pkey" PRIMARY KEY ("courseId","libraryMaterialId")
);

-- CreateTable
CREATE TABLE "LessonAttachment" (
    "lessonId" INTEGER NOT NULL,
    "fileId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonAttachment_pkey" PRIMARY KEY ("lessonId","fileId")
);

-- CreateTable
CREATE TABLE "ActivityMaterial" (
    "activityId" INTEGER NOT NULL,
    "fileId" INTEGER NOT NULL,

    CONSTRAINT "ActivityMaterial_pkey" PRIMARY KEY ("activityId","fileId")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "activityType" "ActivityType" NOT NULL,
    "timeLimitMinutes" INTEGER,
    "dueDate" TIMESTAMP(3),
    "maxAttempts" INTEGER,
    "passScore" DOUBLE PRECISION,
    "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" INTEGER,
    "lessonId" INTEGER,
    "creatorId" INTEGER NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityQuestion" (
    "id" SERIAL NOT NULL,
    "activityId" INTEGER NOT NULL,
    "type" "ActivityQuestionType" NOT NULL,
    "content" TEXT NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "ActivityQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityOption" (
    "id" SERIAL NOT NULL,
    "activityQuestionId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "ActivityOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityAttempt" (
    "id" SERIAL NOT NULL,
    "activityId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "gradingStatus" "GradingStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "graderId" INTEGER,
    "gradedAt" TIMESTAMP(3),
    "graderFeedback" TEXT,

    CONSTRAINT "ActivityAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseTeacher" (
    "courseId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseTeacher_pkey" PRIMARY KEY ("courseId","teacherId")
);

-- CreateTable
CREATE TABLE "StudentCourseEnrollment" (
    "userId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "progressPercentage" DOUBLE PRECISION DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3),

    CONSTRAINT "StudentCourseEnrollment_pkey" PRIMARY KEY ("userId","courseId")
);

-- CreateTable
CREATE TABLE "LessonCompletion" (
    "userId" INTEGER NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3),

    CONSTRAINT "LessonCompletion_pkey" PRIMARY KEY ("userId","lessonId")
);

-- CreateIndex
CREATE UNIQUE INDEX "LibraryMaterial_fileId_key" ON "LibraryMaterial"("fileId");

-- CreateIndex
CREATE INDEX "CourseLibraryUsage_libraryMaterialId_idx" ON "CourseLibraryUsage"("libraryMaterialId");

-- CreateIndex
CREATE INDEX "LessonAttachment_fileId_idx" ON "LessonAttachment"("fileId");

-- CreateIndex
CREATE INDEX "ActivityMaterial_fileId_idx" ON "ActivityMaterial"("fileId");

-- CreateIndex
CREATE INDEX "Activity_courseId_idx" ON "Activity"("courseId");

-- CreateIndex
CREATE INDEX "Activity_lessonId_idx" ON "Activity"("lessonId");

-- CreateIndex
CREATE INDEX "Activity_creatorId_idx" ON "Activity"("creatorId");

-- CreateIndex
CREATE INDEX "ActivityQuestion_activityId_idx" ON "ActivityQuestion"("activityId");

-- CreateIndex
CREATE INDEX "ActivityOption_activityQuestionId_idx" ON "ActivityOption"("activityQuestionId");

-- CreateIndex
CREATE INDEX "ActivityAttempt_activityId_idx" ON "ActivityAttempt"("activityId");

-- CreateIndex
CREATE INDEX "ActivityAttempt_studentId_idx" ON "ActivityAttempt"("studentId");

-- CreateIndex
CREATE INDEX "ActivityAttempt_graderId_idx" ON "ActivityAttempt"("graderId");

-- CreateIndex
CREATE INDEX "ActivityAttempt_gradingStatus_idx" ON "ActivityAttempt"("gradingStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityAttempt_activityId_studentId_attemptNumber_key" ON "ActivityAttempt"("activityId", "studentId", "attemptNumber");

-- CreateIndex
CREATE INDEX "CourseTeacher_teacherId_idx" ON "CourseTeacher"("teacherId");

-- CreateIndex
CREATE INDEX "StudentCourseEnrollment_courseId_idx" ON "StudentCourseEnrollment"("courseId");

-- CreateIndex
CREATE INDEX "LessonCompletion_lessonId_idx" ON "LessonCompletion"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAnswer_fileId_key" ON "StudentAnswer"("fileId");

-- CreateIndex
CREATE INDEX "StudentAnswer_activityAttemptId_idx" ON "StudentAnswer"("activityAttemptId");

-- CreateIndex
CREATE INDEX "StudentAnswer_activityQuestionId_idx" ON "StudentAnswer"("activityQuestionId");

-- CreateIndex
CREATE INDEX "StudentAnswer_selectedOptionId_idx" ON "StudentAnswer"("selectedOptionId");

-- CreateIndex
CREATE INDEX "StudentAnswer_fileId_idx" ON "StudentAnswer"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAnswer_activityAttemptId_activityQuestionId_key" ON "StudentAnswer"("activityAttemptId", "activityQuestionId");

-- AddForeignKey
ALTER TABLE "LibraryMaterial" ADD CONSTRAINT "LibraryMaterial_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseLibraryUsage" ADD CONSTRAINT "CourseLibraryUsage_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseLibraryUsage" ADD CONSTRAINT "CourseLibraryUsage_libraryMaterialId_fkey" FOREIGN KEY ("libraryMaterialId") REFERENCES "LibraryMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonAttachment" ADD CONSTRAINT "LessonAttachment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonAttachment" ADD CONSTRAINT "LessonAttachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityMaterial" ADD CONSTRAINT "ActivityMaterial_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityMaterial" ADD CONSTRAINT "ActivityMaterial_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityQuestion" ADD CONSTRAINT "ActivityQuestion_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityOption" ADD CONSTRAINT "ActivityOption_activityQuestionId_fkey" FOREIGN KEY ("activityQuestionId") REFERENCES "ActivityQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttempt" ADD CONSTRAINT "ActivityAttempt_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttempt" ADD CONSTRAINT "ActivityAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttempt" ADD CONSTRAINT "ActivityAttempt_graderId_fkey" FOREIGN KEY ("graderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswer" ADD CONSTRAINT "StudentAnswer_activityAttemptId_fkey" FOREIGN KEY ("activityAttemptId") REFERENCES "ActivityAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswer" ADD CONSTRAINT "StudentAnswer_activityQuestionId_fkey" FOREIGN KEY ("activityQuestionId") REFERENCES "ActivityQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswer" ADD CONSTRAINT "StudentAnswer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "ActivityOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswer" ADD CONSTRAINT "StudentAnswer_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseTeacher" ADD CONSTRAINT "CourseTeacher_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseTeacher" ADD CONSTRAINT "CourseTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCourseEnrollment" ADD CONSTRAINT "StudentCourseEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCourseEnrollment" ADD CONSTRAINT "StudentCourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonCompletion" ADD CONSTRAINT "LessonCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonCompletion" ADD CONSTRAINT "LessonCompletion_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
