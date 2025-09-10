import { PrismaClient } from '@drpg/prisma';

export type PismaClientLocal = typeof prisma;
export const prisma = new PrismaClient({
	omit: {
		dinoz: {
			seed: true
		}
	}
	// log: ['query', 'info', 'warn', 'error']
});
