/*
  Warnings:

  - A unique constraint covering the columns `[npcId,dinozId]` on the table `npc` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "npc_npcId_dinozId_key" ON "npc"("npcId", "dinozId");
