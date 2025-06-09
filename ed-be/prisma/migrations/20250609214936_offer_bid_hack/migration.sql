/*
  Warnings:

  - Added the required column `userName` to the `OfferBid` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OfferBid" ADD COLUMN     "userName" TEXT;

UPDATE "OfferBid"
SET "userName" = "player"."name"
FROM "player"
WHERE "OfferBid"."userId" = "player"."id";

ALTER TABLE "OfferBid" ALTER COLUMN "userId" DROP NOT NULL,
                    ALTER COLUMN "userName" SET NOT NULL;


