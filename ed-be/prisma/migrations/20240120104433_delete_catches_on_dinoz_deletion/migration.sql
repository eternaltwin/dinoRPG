-- DropForeignKey
ALTER TABLE "DinozCatch" DROP CONSTRAINT "DinozCatch_dinozId_fkey";

-- AddForeignKey
ALTER TABLE "DinozCatch" ADD CONSTRAINT "DinozCatch_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
