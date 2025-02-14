/*
  Warnings:

  - You are about to drop the column `displayName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "displayName",
DROP COLUMN "password",
DROP COLUMN "role",
DROP COLUMN "username",
ADD COLUMN     "roles" "ERole"[] DEFAULT ARRAY['USER']::"ERole"[];

-- CreateTable
CREATE TABLE "UserLogin" (
    "userId" INTEGER NOT NULL,
    "username" TEXT,
    "email" VARCHAR(255) NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifyToken" TEXT,
    "emailVerifyTokenAt" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "passwordResetToken" TEXT,
    "passwordResetTokenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLogin_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "userIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserLogin" ADD CONSTRAINT "UserLogin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
