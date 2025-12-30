-- AlterTable
ALTER TABLE "dinoz" ADD COLUMN     "buildId" UUID;

-- CreateTable
CREATE TABLE "DinozBuild" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "playerId" UUID NOT NULL,
    "skills" INTEGER[] DEFAULT ARRAY[]::INTEGER[],

    CONSTRAINT "DinozBuild_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dinoz" ADD CONSTRAINT "dinoz_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "DinozBuild"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DinozBuild" ADD CONSTRAINT "DinozBuild_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
