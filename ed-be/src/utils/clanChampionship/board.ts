import seedrandom from 'seedrandom';
import { BOARD_SIZE, BoardDirection } from '@drpg/core/models/clan/clanChampionship';
import { getRandomInteger } from '../tools.js';

export type Side = 'west' | 'east';
export interface BoardPiece {
	id: number;
	clanId: number;
	x: number;
	y: number;
}

const LAST = BOARD_SIZE - 1;
const MIN_PAIRS = 20;
const MAX_PAIRS = 30;

export const cellIndex = (x: number, y: number) => y * BOARD_SIZE + x;

export function isInBounds(x: number, y: number): boolean {
	return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
}

/** Sorted cell indexes of obstacles: point-symmetric pairs, never on the entry columns, 40..60 cells. */
export function generateObstacles(rng: seedrandom.PRNG): number[] {
	for (;;) {
		const candidates: number[] = [];
		for (let x = 1; x <= 9; x++) {
			for (let y = 0; y < BOARD_SIZE; y++) candidates.push(cellIndex(x, y));
		}
		const pairs = getRandomInteger(MIN_PAIRS, MAX_PAIRS, rng);
		const obstacles: number[] = [];
		for (let i = 0; i < pairs; i++) {
			const [cell] = candidates.splice(getRandomInteger(0, candidates.length - 1, rng), 1);
			const x = cell % BOARD_SIZE;
			const y = Math.floor(cell / BOARD_SIZE);
			obstacles.push(cell, cellIndex(LAST - x, LAST - y));
		}
		obstacles.sort((a, b) => a - b);
		if (hasCrossingPath(obstacles)) return obstacles;
	}
}

/** 4-neighbour BFS from any free cell of column 0 to any cell of the last column. */
export function hasCrossingPath(obstacles: number[]): boolean {
	const blocked = new Set(obstacles);
	const seen = new Set<number>();
	const queue: number[] = [];
	for (let y = 0; y < BOARD_SIZE; y++) {
		const c = cellIndex(0, y);
		if (!blocked.has(c)) {
			seen.add(c);
			queue.push(c);
		}
	}
	for (let head = 0; head < queue.length; head++) {
		const c = queue[head];
		const x = c % BOARD_SIZE;
		const y = Math.floor(c / BOARD_SIZE);
		if (x === LAST) return true;
		for (const [dx, dy] of [
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1]
		]) {
			const nx = x + dx;
			const ny = y + dy;
			if (!isInBounds(nx, ny)) continue;
			const n = cellIndex(nx, ny);
			if (blocked.has(n) || seen.has(n)) continue;
			seen.add(n);
			queue.push(n);
		}
	}
	return false;
}

export function advancement(side: Side, x: number): number {
	return side === 'west' ? x : LAST - x;
}

/**
 * Max advancement of own pieces not passed by an enemy piece; 0 if none.
 * A west piece crosses an east piece when its x is greater (east/west mirrored). When two pieces cross each other,
 * only the less advanced one is the passer: a piece is passed by a crossing, unpassed enemy that is strictly less
 * advanced than itself (resolved from the least advanced piece up, so the spec example gives 7 for A and 10 for B).
 */
export function scoreLine(side: Side, own: BoardPiece[], enemies: BoardPiece[]): number {
	const enemySide: Side = side === 'west' ? 'east' : 'west';
	const crosses = (westX: number, eastX: number) => westX > eastX;
	const tagged = [...own.map(p => ({ p, side })), ...enemies.map(p => ({ p, side: enemySide }))].sort(
		(a, b) => advancement(a.side, a.p.x) - advancement(b.side, b.p.x)
	);
	const passed = new Map<BoardPiece, boolean>();
	for (const { p, side: s } of tagged) {
		const adv = advancement(s, p.x);
		passed.set(
			p,
			tagged.some(
				o =>
					o.side !== s &&
					advancement(o.side, o.p.x) < adv &&
					!passed.get(o.p) &&
					(s === 'west' ? crosses(p.x, o.p.x) : crosses(o.p.x, p.x))
			)
		);
	}
	let best = 0;
	for (const p of own) if (!passed.get(p)) best = Math.max(best, advancement(side, p.x));
	return best;
}

export function entryColumn(side: Side): number {
	return side === 'west' ? 0 : LAST;
}

/** N is y - 1, S is y + 1, E is x + 1, W is x - 1. */
export function step(x: number, y: number, dir: BoardDirection): { x: number; y: number } {
	switch (dir) {
		case BoardDirection.N:
			return { x, y: y - 1 };
		case BoardDirection.S:
			return { x, y: y + 1 };
		case BoardDirection.E:
			return { x: x + 1, y };
		case BoardDirection.W:
			return { x: x - 1, y };
	}
}

/** Attacker stands on the victim's camp side: west victim hit from x - 1, east victim from x + 1. */
export function isBehindAttack(victimSide: Side, attacker: { x: number }, victim: { x: number }): boolean {
	return victimSide === 'west' ? attacker.x === victim.x - 1 : attacker.x === victim.x + 1;
}

/** Union of the 3x3 squares (clipped to the board) centred on both cells. */
export function fightZone(a: { x: number; y: number }, b: { x: number; y: number }): Set<number> {
	const zone = new Set<number>();
	for (const c of [a, b]) {
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				if (isInBounds(c.x + dx, c.y + dy)) zone.add(cellIndex(c.x + dx, c.y + dy));
			}
		}
	}
	return zone;
}

export function pickEntryCell(
	side: Side,
	occupied: Set<number>,
	rng: seedrandom.PRNG
): { x: number; y: number } | null {
	const x = entryColumn(side);
	const free: number[] = [];
	for (let y = 0; y < BOARD_SIZE; y++) if (!occupied.has(cellIndex(x, y))) free.push(y);
	if (free.length === 0) return null;
	return { x, y: free[getRandomInteger(0, free.length - 1, rng)] };
}
