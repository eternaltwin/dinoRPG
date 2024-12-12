-- Change value
UPDATE "Offer"
SET status = 'CLAIMED'
WHERE status = 'ENDED';
