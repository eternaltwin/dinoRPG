-- DropForeignKey
ALTER TABLE "OfferBid" DROP CONSTRAINT "OfferBid_userId_fkey";

-- AddForeignKey
ALTER TABLE "OfferBid" ADD CONSTRAINT "OfferBid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
