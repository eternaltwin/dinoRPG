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
	scenarios = '[]',
	placeStart: number | null = null,
	placeEnd: number | null = null,
	condition = '{}',
	monsterPool = '[]',
	isActive = true
) {
	return prisma.dungeon.create({
		data: { ...sealed, type, name, level, monsters, scenarios, placeStart, placeEnd, condition, monsterPool, isActive }
	});
}

/** The active dungeon (if any) whose enter action should show at this place. */
export async function getDungeonByPlaceStart(placeId: number) {
	return prisma.dungeon.findFirst({ where: { placeStart: placeId, isActive: true } });
}

export interface DungeonCatalogUpdate {
	name?: string;
	type?: DungeonType;
	level?: number;
	placeStart?: number | null;
	placeEnd?: number | null;
	condition?: string;
	monsterPool?: string;
	scenarios?: string;
	isActive?: boolean;
}

/** Catalog-only update — never touches cipher/iv/tag, the sealed maze layout is immutable here. */
export async function updateDungeonCatalog(id: string, data: DungeonCatalogUpdate) {
	return prisma.dungeon.update({ where: { id }, data });
}

export async function deleteDungeon(id: string) {
	return prisma.dungeon.delete({ where: { id } });
}

/** Admin list: excludes cipher/iv/tag — the encrypted layout must never reach the client. */
export async function listDungeonsCatalog() {
	return prisma.dungeon.findMany({
		select: {
			id: true,
			name: true,
			type: true,
			level: true,
			placeStart: true,
			placeEnd: true,
			condition: true,
			monsterPool: true,
			scenarios: true,
			isActive: true
		}
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
