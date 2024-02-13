import { PrismaClient } from '@drpg/prisma';

export const prisma = new PrismaClient({
	// log: ['query', 'info', 'warn', 'error']
});
