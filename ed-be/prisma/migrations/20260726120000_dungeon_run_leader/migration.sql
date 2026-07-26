-- AlterTable
ALTER TABLE "dungeon_run" ADD COLUMN     "leaderId" INTEGER;

-- CreateIndex
CREATE INDEX "dungeon_run_leaderId_idx" ON "dungeon_run"("leaderId");

-- AddForeignKey
ALTER TABLE "dungeon_run" ADD CONSTRAINT "dungeon_run_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "dinoz"("id") ON DELETE SET NULL ON UPDATE CASCADE;
