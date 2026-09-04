import { prisma } from '../prisma.js';
import type { DungeonRun } from '@drpg/prisma';
import type { Sealed } from '../utils/dungeonCrypto.js';
import { DungeonType } from '@drpg/prisma/enums';
import { LOGGER } from '../context.js';

export interface RunPosition {
	posX: number;
	posY: number;
	posL: number;
}

// ── in-process run cache ─────────────────────────────────────────────────────
//
// A run is single-owner (one player, one leader) and is read on every single
// move, so it lives in memory and is written back lazily. Position and fog are
// allowed to lag the database: a crash rewinds the player a cell or two, which
// costs nothing.
//
// What may NOT lag is the run's other job — it is the dedup ledger for
// irreversible writes to the *player*. `gold`, `scenarios` and `defeated` are
// what stop a gold pile paying twice, a scenario granting its item twice, or a
// monster being re-farmed. Those are marked and flushed with flushRun() BEFORE
// the payout, so the only thing a crash can do is lose a reward, never duplicate
// one. See the checkpoint() calls in dungeonService.move().
//

/** How long position/fog may lag the DB. ~2-3 cells at the client's walk speed. */
const FLUSH_MS = 500;
/** Safety valve against unbounded growth; evicts oldest-inserted first (Map order). */
const MAX_RUNS = 5000;

const runs = new Map<string, DungeonRun>();
const byPlayerDungeon = new Map<string, string>();
const byLeader = new Map<number, string>();
const dirty = new Set<string>();
const timers = new Map<string, NodeJS.Timeout>();

const pdKey = (playerId: string, dungeonId: string): string => `${playerId}:${dungeonId}`;

function cacheRun(row: DungeonRun): DungeonRun {
	if (!runs.has(row.id) && runs.size >= MAX_RUNS) {
		// Oldest inserted. Evicting is always safe — it flushes, and the next read
		// just falls through to the database.
		const oldest = runs.keys().next().value;
		if (oldest) void evictRun(oldest);
	}
	runs.set(row.id, row);
	byPlayerDungeon.set(pdKey(row.playerId, row.dungeonId), row.id);
	if (row.leaderId != null) byLeader.set(row.leaderId, row.id);
	return row;
}

/** Write a dirty run out now. Safe to call when clean or uncached — it no-ops. */
export async function flushRun(id: string): Promise<void> {
	const timer = timers.get(id);
	if (timer) {
		clearTimeout(timer);
		timers.delete(id);
	}
	const row = runs.get(id);
	if (!row || !dirty.has(id)) return;
	dirty.delete(id);
	try {
		await prisma.dungeonRun.update({
			where: { id },
			data: {
				posX: row.posX,
				posY: row.posY,
				posL: row.posL,
				revealed: row.revealed,
				keys: row.keys,
				opened: row.opened,
				scenarios: row.scenarios,
				gold: row.gold,
				healed: row.healed,
				healPending: row.healPending,
				defeated: row.defeated
			}
		});
	} catch (err) {
		// Keep it dirty so the next flush retries rather than silently dropping progress.
		dirty.add(id);
		LOGGER.error(`Failed to flush dungeon run ${id}: ${err}`);
		throw err;
	}
}

function scheduleFlush(id: string): void {
	if (timers.has(id)) return;
	timers.set(
		id,
		setTimeout(() => {
			timers.delete(id);
			// Nothing awaits this timer, so a failure must not become an unhandled
			// rejection; flushRun has already re-marked the run dirty for the retry.
			void flushRun(id).catch(() => undefined);
		}, FLUSH_MS).unref()
	);
}

async function evictRun(id: string): Promise<void> {
	await flushRun(id).catch(() => undefined);
	const row = runs.get(id);
	if (row) {
		byPlayerDungeon.delete(pdKey(row.playerId, row.dungeonId));
		if (row.leaderId != null) byLeader.delete(row.leaderId);
	}
	runs.delete(id);
	dirty.delete(id);
}

/** Flush every pending run — call on shutdown so a deploy doesn't rewind players. */
export async function flushAllRuns(): Promise<void> {
	await Promise.all([...dirty].map(id => flushRun(id).catch(() => undefined)));
}

/** Test seam: drop everything without writing. */
export function clearRunCache(): void {
	for (const t of timers.values()) clearTimeout(t);
	timers.clear();
	runs.clear();
	byPlayerDungeon.clear();
	byLeader.clear();
	dirty.clear();
}

/** Persist a freshly sealed dungeon run and return its id (the capability token). */
export async function createRun(
	pos: RunPosition,
	revealed: string,
	playerId: string,
	dungeonId: string,
	leaderId: number
) {
	// Seeded into the cache straight away: entering is always followed by moves.
	return cacheRun(
		await prisma.dungeonRun.create({
			data: { ...pos, revealed, playerId, dungeonId, leaderId }
		})
	);
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
	isActive = true,
	fightBackgrounds = '[]'
) {
	return prisma.dungeon.create({
		data: {
			...sealed,
			type,
			name,
			level,
			monsters,
			scenarios,
			placeStart,
			placeEnd,
			condition,
			monsterPool,
			isActive,
			fightBackgrounds
		}
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
	fightBackgrounds?: string;
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
			isActive: true,
			fightBackgrounds: true
		}
	});
}

export async function findRun(dungeonId: string, playerId: string) {
	const cached = runs.get(byPlayerDungeon.get(pdKey(playerId, dungeonId)) ?? '');
	if (cached) return cached;
	const row = await prisma.dungeonRun.findUnique({ where: { playerId_dungeonId: { playerId, dungeonId } } });
	return row ? cacheRun(row) : row;
}

/**
 * The run currently led by this dinoz, if any — followers resolve to their leader's
 * run instead. Reads the cache first: isOnHealingCell() compares against the run's
 * position, which would be stale if this went straight to the database.
 */
export async function findRunByLeader(leaderId: number) {
	const cached = runs.get(byLeader.get(leaderId) ?? '');
	if (cached) return cached;
	const row = await prisma.dungeonRun.findFirst({ where: { leaderId } });
	return row ? cacheRun(row) : row;
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
	const row = runs.get(id);
	if (!row) {
		// Uncached (evicted, or a caller that never read it) — write straight through.
		return prisma.dungeonRun.update({
			where: { id },
			data: { ...pos, revealed, keys, opened, scenarios, gold }
		});
	}
	Object.assign(row, pos, { revealed, keys, opened, scenarios, gold });
	dirty.add(id);
	scheduleFlush(id);
	return row;
}

export async function updateRunHealing(id: string, healed: string, healPending: string | null) {
	const row = runs.get(id);
	if (!row) {
		return prisma.dungeonRun.update({
			where: { id },
			data: { healed, healPending }
		});
	}
	row.healed = healed;
	row.healPending = healPending;
	dirty.add(id);
	scheduleFlush(id);
	return row;
}

export async function updateRunDefeated(id: string, defeated: string) {
	const row = runs.get(id);
	if (!row) {
		return prisma.dungeonRun.update({
			where: { id },
			data: { defeated }
		});
	}
	row.defeated = defeated;
	dirty.add(id);
	scheduleFlush(id);
	return row;
}

// Leader changes gate the "one team at a time" check and are rare, so they stay
// synchronous — the cached row is corrected to match rather than written back later.

export async function dinozEnterRun(id: string, dinozId: number) {
	const updated = await prisma.dungeonRun.update({
		where: { id },
		data: { leaderId: dinozId }
	});
	const row = runs.get(id);
	if (row) {
		if (row.leaderId != null) byLeader.delete(row.leaderId);
		row.leaderId = dinozId;
		byLeader.set(dinozId, id);
	}
	return updated;
}

/** The run is over for now: flush what's pending, then drop it from the cache. */
export async function dinozExitRun(id: string) {
	await flushRun(id);
	const updated = await prisma.dungeonRun.update({
		where: { id },
		data: { leaderId: null }
	});
	await evictRun(id);
	return updated;
}
