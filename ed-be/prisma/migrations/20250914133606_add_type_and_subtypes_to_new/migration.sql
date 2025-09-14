-- CreateEnum
CREATE TYPE "NewsType" AS ENUM ('Update', 'Information', 'War', 'Championship', 'Tid', 'Event', 'Story');

-- CreateEnum
CREATE TYPE "Subtype" AS ENUM ('Christmas', 'Newyear', 'Halloween', 'Valentine', 'Easter', 'Summer', 'Start', 'End');

-- AlterTable
ALTER TABLE "news" ADD COLUMN     "subtype" "Subtype",
ADD COLUMN     "type" "NewsType" NOT NULL DEFAULT 'Update';
