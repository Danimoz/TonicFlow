/*
  Warnings:

  - Made the column `full_name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "refresh_token" TEXT,
ALTER COLUMN "full_name" SET NOT NULL;
