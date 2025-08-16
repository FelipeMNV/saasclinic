/*
  Warnings:

  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'MANAGER', 'PROVIDER', 'EMPLOYEE');

-- AlterTable
ALTER TABLE "public"."Employee" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "username",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'USER';
