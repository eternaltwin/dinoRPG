-- AlterTable
ALTER TABLE "UsernameHistory" ALTER COLUMN "playerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "player_dinoz_shop" ALTER COLUMN "playerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "player_gather" ALTER COLUMN "playerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "player_ingredient" ALTER COLUMN "playerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "player_item" ALTER COLUMN "playerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "player_quest" ALTER COLUMN "playerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "player_reward" ALTER COLUMN "playerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ranking" ALTER COLUMN "playerId" DROP NOT NULL;
