-- AlterTable
ALTER TABLE "Offer" ADD COLUMN "sellerPaid" BOOLEAN NOT NULL DEFAULT false;

-- Sellers are now paid when the winner claims the offer. Offers that ended with a bid before this
-- change already paid their seller at the end of the auction: flag them so the claim does not pay twice.
UPDATE "Offer" o
SET "sellerPaid" = true
WHERE o."status" = 'ENDED'
  AND EXISTS (SELECT 1 FROM "OfferBid" b WHERE b."offerId" = o."id");
