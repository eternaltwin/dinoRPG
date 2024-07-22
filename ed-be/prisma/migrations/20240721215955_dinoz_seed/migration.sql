CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- AlterTable
ALTER TABLE "dinoz" ADD COLUMN     "seed" TEXT NOT NULL DEFAULT uuid_generate_v4();
