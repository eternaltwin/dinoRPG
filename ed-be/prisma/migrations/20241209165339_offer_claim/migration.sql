-- AlterEnum
ALTER TYPE "OfferStatus" ADD VALUE 'CLAIMED';

-- Change value
UPDATE "Offer"
SET status = 'CLAIMED'
WHERE status = 'ENDED';
