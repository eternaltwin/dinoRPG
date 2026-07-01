import { prisma } from '../prisma.js';
import type { Sealed } from '../utils/dungeonCrypto.js';

export interface RunPosition {
	posX: number;
	posY: number;
	posL: number;
}

/** Persist a freshly sealed dungeon run and return its id (the capability token). */
export async function createRun(sealed: Sealed, pos: RunPosition, revealed: string) {
	return prisma.dungeonRun.create({
		data: { ...sealed, ...pos, revealed }
	});
}

export async function findRun(id: string) {
	return prisma.dungeonRun.findUnique({ where: { id } });
}

export async function updateRun(id: string, pos: RunPosition, revealed: string) {
	return prisma.dungeonRun.update({
		where: { id },
		data: { ...pos, revealed }
	});
}
