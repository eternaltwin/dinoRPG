-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('ONGOING', 'ENDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "OfferItem" (
    "id" SERIAL NOT NULL,
    "offerId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "isIngredient" BOOLEAN NOT NULL,

    CONSTRAINT "OfferItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferBid" (
    "id" SERIAL NOT NULL,
    "offerId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "OfferBid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" SERIAL NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "dinozId" INTEGER,
    "total" INTEGER NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'ONGOING',

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OfferItem" ADD CONSTRAINT "OfferItem_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferBid" ADD CONSTRAINT "OfferBid_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferBid" ADD CONSTRAINT "OfferBid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE SET NULL ON UPDATE CASCADE;
