/*
  Warnings:

  - The values [dojoReset,healDinozFount,dinozShop] on the enum `ServerAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
DELETE FROM "ServerState" WHERE "action" = 'dojoReset';
DELETE FROM "ServerState" WHERE "action" = 'dinozShop';
DELETE FROM "ServerState" WHERE "action" = 'healDinozFount';
CREATE TYPE "ServerAction_new" AS ENUM ('checkBans', 'healRestingDinoz', 'itinerantMerchant', 'midnightReset');

ALTER TABLE "ServerState" ALTER COLUMN "action" TYPE "ServerAction_new" USING ("action"::text::"ServerAction_new");
ALTER TYPE "ServerAction" RENAME TO "ServerAction_old";
ALTER TYPE "ServerAction_new" RENAME TO "ServerAction";
DROP TYPE "ServerAction_old";
COMMIT;
