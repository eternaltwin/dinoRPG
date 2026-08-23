-- AlterTable
ALTER TABLE "FBTournament"
ADD COLUMN "demon" BOOLEAN NOT NULL DEFAULT false;
UPDATE "dinoz"
SET "raceId" = CASE
        "raceId"
        WHEN 2 THEN 1
        WHEN 4 THEN 3
        WHEN 6 THEN 5
        WHEN 8 THEN 7
        WHEN 16 THEN 15
        WHEN 18 THEN 17
        WHEN 22 THEN 21
    END
WHERE "raceId" IN (2, 4, 6, 8, 16, 18, 22);