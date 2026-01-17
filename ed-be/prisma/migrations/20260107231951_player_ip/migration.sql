/*
  Warnings:

  - You are about to drop the column `ips` on the `player` table. All the data in the column will be lost.

*/


-- CreateTable
CREATE TABLE "PlayerIp" (
    "id" SERIAL NOT NULL,
    "ip" INET NOT NULL,
    "playerId" UUID NOT NULL,

    CONSTRAINT "PlayerIp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerIp_ip_idx" ON "PlayerIp"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerIp_playerId_ip_key" ON "PlayerIp"("playerId", "ip");

-- AddForeignKey
ALTER TABLE "PlayerIp" ADD CONSTRAINT "PlayerIp_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "PlayerIp" ("playerId", "ip")
SELECT id, unnest(ips)
FROM "player"
WHERE ips IS NOT NULL AND array_length(ips, 1) > 0;


-- AlterTable
ALTER TABLE "player" DROP COLUMN "ips";
