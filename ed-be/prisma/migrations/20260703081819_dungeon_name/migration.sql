/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `dungeon` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "dungeon" ADD COLUMN     "name" TEXT NOT NULL DEFAULT uuid_generate_v4();

-- CreateIndex
CREATE UNIQUE INDEX "dungeon_name_key" ON "dungeon"("name");
