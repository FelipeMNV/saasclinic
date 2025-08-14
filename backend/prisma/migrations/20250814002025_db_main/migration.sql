/*
  Warnings:

  - Added the required column `speciality` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Employee" ADD COLUMN     "speciality" TEXT NOT NULL;
