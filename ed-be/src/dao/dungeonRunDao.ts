import { prisma } from '../prisma.js';
import type { Sealed } from '../utils/dungeonCrypto.js';
import { DungeonType } from '@drpg/prisma/enums';

export interface RunPosition {
	posX: number;
	posY: number;
	posL: number;
}

/** Persist a freshly sealed dungeon run and return its id (the capability token). */
export async function createRun(
	pos: RunPosition,
	revealed: string,
	playerId: string,
	dungeonId: string,
	leaderId: number
) {
	return prisma.dungeonRun.create({
		data: { ...pos, revealed, playerId, dungeonId, leaderId }
	});
}

export async function getDungeonById(id: string) {
	return prisma.dungeon.findUnique({
		where: { id: id }
	});
}

export async function getDungeonByName(name: string) {
	return prisma.dungeon.findFirst({
		where: { name: name }
	});
}

export async function createDungeon(
	sealed: Sealed,
	type: DungeonType,
	name: string,
	level: number,
	monsters: string,
	scenarios = '[]'
) {
	return prisma.dungeon.create({
		data: { ...sealed, type, name, level, monsters, scenarios }
	});
}

export async function findRun(dungeonId: string, playerId: string) {
	return prisma.dungeonRun.findUnique({ where: { playerId_dungeonId: { playerId, dungeonId } } });
}

/** The run currently led by this dinoz, if any — followers resolve to their leader's run instead. */
export async function findRunByLeader(leaderId: number) {
	return prisma.dungeonRun.findFirst({ where: { leaderId } });
}

export async function updateRun(
	id: string,
	pos: RunPosition,
	revealed: string,
	keys: string,
	opened: string,
	scenarios: string,
	gold: string
) {
	return prisma.dungeonRun.update({
		where: { id },
		data: { ...pos, revealed, keys, opened, scenarios, gold }
	});
}

export async function dinozEnterRun(id: string, dinozId: number) {
	return prisma.dungeonRun.update({
		where: { id },
		data: { leaderId: dinozId }
	});
}

export async function dinozExitRun(id: string, dinozId: number) {
	return prisma.dungeonRun.update({
		where: { id },
		data: { leaderId: null }
	});
}

export async function updateRunDefeated(id: string, defeated: string) {
	return prisma.dungeonRun.update({
		where: { id },
		data: { defeated }
	});
}
