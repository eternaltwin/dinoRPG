-- DropForeignKey
ALTER TABLE "OfferItem" DROP CONSTRAINT "OfferItem_offerId_fkey";

-- AddForeignKey
ALTER TABLE "OfferItem" ADD CONSTRAINT "OfferItem_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
