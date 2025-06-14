/*
  Warnings:

  - Changed the type of `role_type` on the `role_screens` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role_type` on the `roles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role_type` on the `system_users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('STUDENT', 'TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN');

-- DropForeignKey
ALTER TABLE "role_screens" DROP CONSTRAINT "role_screens_role_type_fkey";

-- DropForeignKey
ALTER TABLE "system_users" DROP CONSTRAINT "system_users_role_type_fkey";

-- AlterTable
ALTER TABLE "role_screens" DROP COLUMN "role_type",
ADD COLUMN     "role_type" "UserType" NOT NULL;

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "role_type",
ADD COLUMN     "role_type" "UserType" NOT NULL;

-- AlterTable
ALTER TABLE "system_users" DROP COLUMN "role_type",
ADD COLUMN     "role_type" "UserType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_type_key" ON "roles"("role_type");

-- AddForeignKey
ALTER TABLE "system_users" ADD CONSTRAINT "system_users_role_type_fkey" FOREIGN KEY ("role_type") REFERENCES "roles"("role_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_screens" ADD CONSTRAINT "role_screens_role_type_fkey" FOREIGN KEY ("role_type") REFERENCES "roles"("role_type") ON DELETE CASCADE ON UPDATE CASCADE;
