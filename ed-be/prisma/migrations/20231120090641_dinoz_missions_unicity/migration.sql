/*
  Warnings:

  - A unique constraint covering the columns `[missionId,dinozId]` on the table `dinoz_mission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "dinoz_mission_missionId_dinozId_key" ON "dinoz_mission"("missionId", "dinozId");
