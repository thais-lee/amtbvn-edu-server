-- CreateEnum
CREATE TYPE "ERole" AS ENUM ('ADMIN', 'USER', 'MINISTRY', 'TEACHER');

-- CreateEnum
CREATE TYPE "EGender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50),
    "gender" "EGender",
    "dateOfBirth" TIMESTAMP(3),
    "avatarImageFileId" TEXT,
    "avatarImageFileUrl" TEXT,
    "phoneNumber" VARCHAR(15),
    "role" "ERole"[] DEFAULT ARRAY['USER']::"ERole"[],
    "displayName" VARCHAR(50) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
