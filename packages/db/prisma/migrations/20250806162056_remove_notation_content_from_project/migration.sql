/*
  Warnings:

  - You are about to drop the column `current_notation_content` on the `projects` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."project_versions" DROP CONSTRAINT "project_versions_project_id_fkey";

-- AlterTable
ALTER TABLE "public"."projects" DROP COLUMN "current_notation_content";

-- AddForeignKey
ALTER TABLE "public"."project_versions" ADD CONSTRAINT "project_versions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
