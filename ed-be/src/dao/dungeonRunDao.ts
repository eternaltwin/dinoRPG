import { prisma } from '../prisma.js';
import type { Sealed } from '../utils/dungeonCrypto.js';
import { DungeonType } from '@drpg/prisma/enums';

export interface RunPosition {
	posX: number;
	posY: number;
	posL: number;
}

/** Persist a freshly sealed dungeon run and return its id (the capability token). */
export async function createRun(pos: RunPosition, revealed: string, playerId: string, dungeonId: string) {
	return prisma.dungeonRun.create({
		data: { ...pos, revealed, playerId, dungeonId }
	});
}

export async function getDungeon(id: string) {
	return prisma.dungeon.findUnique({
		where: { id: id }
	});
}

export async function createDungeon(sealed: Sealed, type: DungeonType) {
	return prisma.dungeon.create({
		data: { ...sealed, type }
	});
}

export async function findRun(dungeonId: string, playerId: string) {
	return prisma.dungeonRun.findUnique({ where: { playerId_dungeonId: { playerId, dungeonId } } });
}

export async function updateRun(id: string, pos: RunPosition, revealed: string) {
	return prisma.dungeonRun.update({
		where: { id },
		data: { ...pos, revealed }
	});
}
