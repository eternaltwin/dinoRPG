-- CreateTable
CREATE TABLE "DinozCatch" (
    "id" SERIAL NOT NULL,
    "dinozId" INTEGER,
    "hp" INTEGER NOT NULL,

    CONSTRAINT "DinozCatch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DinozCatch" ADD CONSTRAINT "DinozCatch_dinozId_fkey" FOREIGN KEY ("dinozId") REFERENCES "dinoz"("id") ON DELETE SET NULL ON UPDATE CASCADE;
