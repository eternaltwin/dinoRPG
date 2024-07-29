/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Clan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Clan_name_key" ON "Clan"("name");
