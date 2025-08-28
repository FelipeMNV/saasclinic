/*
  Warnings:

  - You are about to drop the column `employee_id` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `employee_id` on the `BlockedSlot` table. All the data in the column will be lost.
  - Added the required column `capacity` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Type" AS ENUM ('INDIVIDUAL', 'COLLECTIVE');

-- DropForeignKey
ALTER TABLE "public"."Availability" DROP CONSTRAINT "Availability_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."BlockedSlot" DROP CONSTRAINT "BlockedSlot_employee_id_fkey";

-- AlterTable
ALTER TABLE "public"."Availability" DROP COLUMN "employee_id",
ADD COLUMN     "service_id" TEXT;

-- AlterTable
ALTER TABLE "public"."BlockedSlot" DROP COLUMN "employee_id",
ADD COLUMN     "service_id" TEXT;

-- AlterTable
ALTER TABLE "public"."Service" ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "type" "public"."Type" NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Availability" ADD CONSTRAINT "Availability_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlockedSlot" ADD CONSTRAINT "BlockedSlot_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
