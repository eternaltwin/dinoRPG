/*
  Warnings:

  - Added the required column `sellerName` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable Offer

ALTER TABLE "Offer" ADD COLUMN     "sellerName" TEXT;

UPDATE "Offer"
SET "sellerName" = "player"."name"
FROM "player"
WHERE "Offer"."sellerId" = "player"."id";

ALTER TABLE "Offer" ALTER COLUMN "sellerId" DROP NOT NULL,
													ALTER COLUMN "sellerName" SET NOT NULL;


