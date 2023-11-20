/*
  Warnings:

  - A unique constraint covering the columns `[statusId,dinozId]` on the table `dinoz_status` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "dinoz_status_statusId_dinozId_key" ON "dinoz_status"("statusId", "dinozId");
