-- CreateEnum
CREATE TYPE "ServerAction" AS ENUM ('checkBans', 'dojoReset', 'healDinozFount', 'healRestingDinoz', 'itinerantMerchant', 'dinozShop', 'midnightReset');

-- CreateTable
CREATE TABLE "ServerState" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "action" "ServerAction" NOT NULL,
    "nextCheck" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServerState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServerState_id_key" ON "ServerState"("id");
