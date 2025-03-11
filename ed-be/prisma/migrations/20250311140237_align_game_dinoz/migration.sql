-- AlterTable
ALTER TABLE "dinoz_status" ADD COLUMN     "gameDinozId" INTEGER;

-- AlterTable
ALTER TABLE "gamedinoz" ADD COLUMN     "canChangeName" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "dinoz_status" ADD CONSTRAINT "dinoz_status_gameDinozId_fkey" FOREIGN KEY ("gameDinozId") REFERENCES "gamedinoz"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
