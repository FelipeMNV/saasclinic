/*
  Warnings:

  - The values [PROVIDER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `customerCPF` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Made the column `customerEmail` on table `Appointment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `customerPhone` on table `Appointment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('SUPERADMIN', 'USER', 'MANAGER', 'EMPLOYEE');
ALTER TABLE "public"."Employee" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TABLE "public"."Employee" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."Employee" ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE';
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Appointment" ADD COLUMN     "customerCPF" TEXT NOT NULL,
ALTER COLUMN "customerEmail" SET NOT NULL,
ALTER COLUMN "customerPhone" SET NOT NULL;
