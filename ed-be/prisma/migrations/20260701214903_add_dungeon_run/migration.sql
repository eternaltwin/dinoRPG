-- CreateTable
CREATE TABLE "dungeon_run" (
    "id" TEXT NOT NULL,
    "cipher" BYTEA NOT NULL,
    "iv" BYTEA NOT NULL,
    "tag" BYTEA NOT NULL,
    "pos_x" INTEGER NOT NULL,
    "pos_y" INTEGER NOT NULL,
    "pos_l" INTEGER NOT NULL,
    "revealed" TEXT NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dungeon_run_pkey" PRIMARY KEY ("id")
);
