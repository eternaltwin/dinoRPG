-- DropForeignKey
ALTER TABLE "DojoOpponents" DROP CONSTRAINT "DojoOpponents_dinozId_fkey";

-- DropForeignKey
ALTER TABLE "DojoTeam" DROP CONSTRAINT "DojoTeam_dinozId_fkey";

-- AddForeignKey
ALTER TABLE "DojoTeam" ADD CONSTRAINT "DojoTeam_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DojoOpponents" ADD CONSTRAINT "DojoOpponents_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
