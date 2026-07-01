/**
 * dungeonService — "pixy", the sole holder of the maze layout.
 *
 * The layout is generated here, encrypted (AES-256-GCM) before it touches the
 * database, and NEVER sent to the client. The client only ever receives the
 * fog-of-war reveals produced by its own validated moves, so a player cannot
 * solve the maze without exploring it.
 */

import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { OriginalGenerator } from './dungeon/original/index.js';
import { DungeonCodec } from './dungeon/DungeonCodec.js';
import { revealAround, cellKey } from './dungeon/reveal.js';
import type { RevealedCell } from './dungeon/reveal.js';
import type { DungeonStruct } from './dungeon/types.js';
import { seal, unseal } from '../utils/dungeonCrypto.js';
import { createRun, findRun, updateRun } from '../dao/dungeonRunDao.js';

export interface StartRunResult {
	runId: string;
	pos: { l: number; x: number; y: number };
	/** Grid dimensions + level count: canvas sizing only, no layout knowledge. */
	width: number;
	height: number;
	levels: number;
	/** Client-side skin salt (cosmetic only). */
	skinSalt: number;
	reveal: RevealedCell[];
}

export interface MoveResult {
	ok: boolean;
	pos: { l: number; x: number; y: number };
	reveal: RevealedCell[];
}

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

/** Generate, encrypt, store — return only the starting reveal. */
export async function startRun(): Promise<StartRunResult> {
	const d = OriginalGenerator.generate({ width: 24, height: 24, levels: 3 });
	const encoded = new DungeonCodec().encode(d);

	const revealed = new Set<string>();
	const reveal = newReveals(revealAround(d, d.start.l, d.start.x, d.start.y), revealed);

	const run = await createRun(
		seal(encoded),
		{ posX: d.start.x, posY: d.start.y, posL: d.start.l },
		JSON.stringify([...revealed])
	);

	return {
		runId: run.id,
		pos: { l: d.start.l, x: d.start.x, y: d.start.y },
		width: d.width,
		height: d.height,
		levels: d.levels.length,
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
export async function move(runId: string, dx: number, dy: number, dl: number): Promise<MoveResult> {
	const run = await findRun(runId);
	if (!run) throw new ExpectedError(`Unknown dungeon run.`);

	const codec = new DungeonCodec();
	codec.decode(unseal({ cipher: Buffer.from(run.cipher), iv: Buffer.from(run.iv), tag: Buffer.from(run.tag) }));
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
	await updateRun(runId, { posX: next.x, posY: next.y, posL: next.l }, JSON.stringify([...revealed]));

	return { ok: true, pos: next, reveal };
}
