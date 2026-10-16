import { PrismaPg } from '@prisma/adapter-pg';

/** Prisma 7 no longer reads `DATABASE_URL` itself: every client connects through this adapter. */
export function createPrismaAdapter(): PrismaPg {
	return new PrismaPg({ connectionString: process.env.DATABASE_URL });
}
