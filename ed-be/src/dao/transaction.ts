import { prisma } from '../prisma.js';

/** Client of an interactive transaction, also accepted where a DAO defaults to the global client. */
export type TxClient = Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

/**
 * Runs `fn` in one database transaction: every write is rolled back if it throws. Pair it with conditional
 * writes (`updateMany` on the expected state, then a check of `count`) to settle concurrent requests: the first
 * one changes the state, the others match nothing and give up.
 */
export async function runInTransaction<T>(fn: (tx: TxClient) => Promise<T>): Promise<T> {
	return prisma.$transaction(tx => fn(tx));
}
