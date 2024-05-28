-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'MODERATOR', 'PLAYER');

-- AlterTable
ALTER TABLE "player" ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'PLAYER';
