/*
  Warnings:

  - The primary key for the `ServerState` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ServerState` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[action]` on the table `ServerState` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ServerState_id_key";

-- AlterTable
ALTER TABLE "ServerState" DROP CONSTRAINT "ServerState_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "ServerState_pkey" PRIMARY KEY ("action");

-- CreateIndex
CREATE UNIQUE INDEX "ServerState_action_key" ON "ServerState"("action");

INSERT INTO "ServerState" (action, "nextCheck") VALUES ('dojoReset'::"ServerAction", '2025-03-27 00:00:00.000');
INSERT INTO "ServerState" (action, "nextCheck") VALUES ('dinozShop'::"ServerAction", '2025-03-27 00:00:00.000');
INSERT INTO "ServerState" (action, "nextCheck") VALUES ('healDinozFount'::"ServerAction", '2025-03-27 00:00:00.000');
INSERT INTO "ServerState" (action, "nextCheck") VALUES ('itinerantMerchant'::"ServerAction", '2025-03-27 00:00:00.000');