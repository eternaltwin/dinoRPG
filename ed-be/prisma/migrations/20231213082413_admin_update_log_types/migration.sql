/*
  Warnings:

  - The values [AdminUpdate] on the enum `LogType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LogType_new" AS ENUM ('ItemUsed', 'ItemBought', 'GoldWon', 'GoldLost', 'Move', 'LevelUp', 'Fight', 'Death', 'Revive', 'MissionStep', 'MissionFinished', 'MissionCanceled', 'Gather', 'CreateDinoz', 'ChangeDinozOrder', 'AdminUpdateDinoz', 'AdminAddStatus', 'AdminRemoveStatus', 'AdminAddSkill', 'AdminRemoveSkill', 'AdminAddMoney', 'AdminRemoveMoney', 'AdminAddReward', 'AdminRemoveReward', 'AdminUpdatePlayer', 'AdminUpdateSecret');
ALTER TABLE "Log" ALTER COLUMN "type" TYPE "LogType_new" USING ("type"::text::"LogType_new");
ALTER TYPE "LogType" RENAME TO "LogType_old";
ALTER TYPE "LogType_new" RENAME TO "LogType";
DROP TYPE "LogType_old";
COMMIT;
