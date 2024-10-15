/*
  Warnings:

  - A unique constraint covering the columns `[pinnedMessageId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "pinnedMessageId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_pinnedMessageId_key" ON "Conversation"("pinnedMessageId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_pinnedMessageId_fkey" FOREIGN KEY ("pinnedMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
