import { PrismaClient } from '@drpg/prisma';
import { createPrismaAdapter } from './prismaAdapter.js';

export type PismaClientLocal = typeof prisma;
export const prisma = new PrismaClient({
	adapter: createPrismaAdapter(),
	omit: {
		dinoz: {
			seed: true
		}
	}
	// log: ['query', 'info', 'warn', 'error']
});
