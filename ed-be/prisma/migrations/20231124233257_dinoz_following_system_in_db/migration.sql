-- AddForeignKey
ALTER TABLE "dinoz" ADD CONSTRAINT "dinoz_following_fkey" FOREIGN KEY ("following") REFERENCES "dinoz"("id") ON DELETE SET NULL ON UPDATE CASCADE;
