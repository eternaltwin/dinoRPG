
-- Update average column (points / dinozCount) rounded to the nearest integer
-- Set to 0 if dinozCount is 0
UPDATE "ranking" SET "average" = ROUND("points" / "dinozCount") WHERE "dinozCount" > 0;
UPDATE "ranking" SET "average" = 0 WHERE "dinozCount" = 0;
