/*
  Warnings:

  - A unique constraint covering the columns `[skillId,dinozId]` on the table `dinoz_skill` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "dinoz_skill_skillId_dinozId_key" ON "dinoz_skill"("skillId", "dinozId");
