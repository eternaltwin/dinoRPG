/*
  Warnings:

  - A unique constraint covering the columns `[dojoId,dinozId]` on the table `DojoOpponents` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dojoId,dinozId]` on the table `DojoTeam` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DojoOpponents_dojoId_dinozId_key" ON "DojoOpponents"("dojoId", "dinozId");

-- CreateIndex
CREATE UNIQUE INDEX "DojoTeam_dojoId_dinozId_key" ON "DojoTeam"("dojoId", "dinozId");
