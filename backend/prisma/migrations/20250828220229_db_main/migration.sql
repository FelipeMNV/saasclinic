/*
  Warnings:

  - You are about to drop the `_EmployeeServices` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `duration` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Made the column `clinica_id` on table `Service` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Availability" DROP CONSTRAINT "Availability_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."BlockedSlot" DROP CONSTRAINT "BlockedSlot_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Service" DROP CONSTRAINT "Service_clinica_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EmployeeServices" DROP CONSTRAINT "_EmployeeServices_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EmployeeServices" DROP CONSTRAINT "_EmployeeServices_B_fkey";

-- AlterTable
ALTER TABLE "public"."Availability" ALTER COLUMN "employee_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."BlockedSlot" ALTER COLUMN "employee_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Service" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "employee_id" TEXT,
ALTER COLUMN "clinica_id" SET NOT NULL;

-- DropTable
DROP TABLE "public"."_EmployeeServices";

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "public"."Clinica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Availability" ADD CONSTRAINT "Availability_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlockedSlot" ADD CONSTRAINT "BlockedSlot_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
