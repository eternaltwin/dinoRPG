/**
 * dungeonService — "pixy", the sole holder of the maze layout.
 *
 * The layout is generated here, encrypted (AES-256-GCM) before it touches the
 * database, and NEVER sent to the client. The client only ever receives the
 * fog-of-war reveals produced by its own validated moves, so a player cannot
 * solve the maze without exploring it.
 */

import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { DungeonCodec } from './dungeon/DungeonCodec.js';
import { Request } from 'express';
import { revealAround, cellKey, cellsForKeys } from './dungeon/reveal.js';
import type { MoveResult, RevealedCell, StartRunResult } from '@drpg/core/models/dungeon/DungeonClient';
import type { DungeonStruct } from './dungeon/types.js';
import { unseal } from '../utils/dungeonCrypto.js';
import {
	createRun,
	findRun,
	getDungeonById,
	getDungeonByName,
	updateRun,
	updateRunMonsters
} from '../dao/dungeonRunDao.js';
import { rollMonsters } from './dungeon/monsters.js';
import type { RunMonster } from './dungeon/monsters.js';
import translate from '../utils/server/translate.js';
import { auth } from '../dao/playerDao.js';
import { getDinozFicheLiteRequest } from '../dao/dinozDao.js';
import { DungeonList } from '@drpg/core/models/dungeon/DungeonList';

/** Filter candidate reveals down to the not-yet-revealed ones and record them. */
function newReveals(candidates: RevealedCell[], revealed: Set<string>): RevealedCell[] {
	const out: RevealedCell[] = [];
	for (const c of candidates) {
		const k = cellKey(c.l, c.x, c.y);
		if (revealed.has(k)) continue;
		revealed.add(k);
		out.push(c);
	}
	return out;
}

/** Strip the 'monster' icon from cells whose pack was already beaten this run. */
function hideDefeated(reveal: RevealedCell[], monsters: RunMonster[]): RevealedCell[] {
	const dead = new Set(monsters.filter(m => m.defeated).map(m => cellKey(m.l, m.x, m.y)));
	if (dead.size > 0)
		for (const c of reveal) if (c.icon === 'monster' && dead.has(cellKey(c.l, c.x, c.y))) c.icon = undefined;
	return reveal;
}

/** Flag the pack on cell (l,x,y) beaten; its icon stops appearing in reveals. */
export async function markMonsterDefeated(
	run: { id: string; monsters: string },
	l: number,
	x: number,
	y: number
): Promise<void> {
	const monsters = JSON.parse(run.monsters) as RunMonster[];
	const m = monsters.find(m => m.l === l && m.x === x && m.y === y);
	if (!m || m.defeated) return;
	m.defeated = true;
	await updateRunMonsters(run.id, JSON.stringify(monsters));
}

export async function startRun(req: Request): Promise<StartRunResult> {
	const authed = await auth(req);
	const dungeonName = req.params.id;
	const dungeon = await getDungeonByName(dungeonName);
	const dungeonRef = Object.values(DungeonList).find(d => d.name === dungeonName);
	if (!dungeon || !dungeonRef) {
		throw new ExpectedError(translate('dungeon.inexistent', authed));
	}
	const dinozId = req.body.dinozId;
	const dinoz = await getDinozFicheLiteRequest(dinozId);
	if (!dinoz) {
		throw new ExpectedError(translate('dungeon.inexistent', authed));
	}
	if (dungeonRef.placeStart !== dinoz.placeId) {
		throw new ExpectedError(translate('dungeon.wrongPlace', authed));
	}

	const codec = new DungeonCodec();
	codec.decode(
		unseal({ cipher: Buffer.from(dungeon.cipher), iv: Buffer.from(dungeon.iv), tag: Buffer.from(dungeon.tag) })
	);
	const d = codec.d;

	// Resume: one run per player per dungeon — hand back the position and
	// everything already revealed instead of violating the unique constraint.
	const existing = await findRun(dungeon.id, authed.id);
	if (existing) {
		return {
			runId: existing.id,
			pos: { l: existing.posL, x: existing.posX, y: existing.posY },
			width: d.width,
			height: d.height,
			levels: d.levels.length,
			skin: dungeon.type,
			skinSalt: Math.floor(Math.random() * 1000),
			reveal: hideDefeated(
				cellsForKeys(d, JSON.parse(existing.revealed) as string[]),
				JSON.parse(existing.monsters) as RunMonster[]
			)
		};
	}

	const revealed = new Set<string>();
	const reveal = newReveals(revealAround(d, d.start.l, d.start.x, d.start.y), revealed);

	const run = await createRun(
		{ posX: d.start.x, posY: d.start.y, posL: d.start.l },
		JSON.stringify([...revealed]),
		JSON.stringify(rollMonsters(d, dungeonRef.monsters)),
		authed.id,
		dungeon.id
	);

	return {
		runId: run.id,
		pos: { l: d.start.l, x: d.start.x, y: d.start.y },
		width: d.width,
		height: d.height,
		levels: d.levels.length,
		skin: dungeon.type,
		skinSalt: Math.floor(Math.random() * 1000),
		reveal
	};
}

/** Stair lookup: is there a stair door at (l,x,y), and where does it lead? */
function stairTarget(d: DungeonStruct, l: number, x: number, y: number): number | undefined {
	for (const room of d.levels[l].rooms) {
		for (const door of room.doors) {
			if (door.x !== x || door.y !== y || door.up == null) continue;
			const to = door.up ? l + 1 : l - 1;
			if (to >= 0 && to < d.levels.length) return to;
		}
	}
	return undefined;
}

/**
 * Validate one step (dx/dy ∈ {-1,0,1}, or dl !== 0 to take a stair under the
 * dinoz) against the decrypted layout; persist and return only the new reveals.
 */
export async function move(req: Request): Promise<MoveResult> {
	const authed = await auth(req);
	const dx = +req.body.dx;
	const dl = +req.body.dl;
	const dy = +req.body.dy;
	const dungeonId = req.params.id;
	const dungeon = await getDungeonByName(dungeonId);
	if (!dungeon) {
		throw new ExpectedError(translate('dungeon.inexistent', authed));
	}
	const run = await findRun(dungeon.id, authed.id);
	if (!run) throw new ExpectedError(`Unknown dungeon run.`);

	const codec = new DungeonCodec();
	codec.decode(
		unseal({ cipher: Buffer.from(dungeon.cipher), iv: Buffer.from(dungeon.iv), tag: Buffer.from(dungeon.tag) })
	);
	const d = codec.d;

	const cur = { l: run.posL, x: run.posX, y: run.posY };
	let next: { l: number; x: number; y: number } | null = null;

	if (dl !== 0) {
		// Stair traversal: only from a stair cell, only to the level it links.
		const to = stairTarget(d, cur.l, cur.x, cur.y);
		if (to !== undefined && to === cur.l + dl) next = { l: to, x: cur.x, y: cur.y };
	} else if (Math.abs(dx) + Math.abs(dy) === 1) {
		const nx = cur.x + dx;
		const ny = cur.y + dy;
		const walkable = nx >= 0 && ny >= 0 && nx < d.width && ny < d.height && d.levels[cur.l].table[nx][ny];
		if (walkable) next = { l: cur.l, x: nx, y: ny };
	}

	if (!next) {
		// Rejected: wall, out of bounds, or no stair here. No new knowledge leaks.
		return { ok: false, pos: cur, reveal: [] };
	}

	const revealed = new Set<string>(JSON.parse(run.revealed) as string[]);
	const reveal = newReveals(revealAround(d, next.l, next.x, next.y), revealed);
	await updateRun(run.id, { posX: next.x, posY: next.y, posL: next.l }, JSON.stringify([...revealed]));

	return { ok: true, pos: next, reveal: hideDefeated(reveal, JSON.parse(run.monsters) as RunMonster[]) };
}
