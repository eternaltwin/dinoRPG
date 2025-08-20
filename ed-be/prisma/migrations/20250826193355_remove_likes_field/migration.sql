/*
  Warnings:

  - You are about to drop the column `likes` on the `news` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NewsLike" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(6);

-- AlterTable
ALTER TABLE "news" DROP COLUMN "likes";
