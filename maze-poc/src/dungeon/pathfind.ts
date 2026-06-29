/**
 * Multi-level breadth-first pathfinding over a decoded {@link DungeonStruct}.
 *
 * Movement is 4-directional across walkable `table` cells. Stair doors
 * (`up !== null`) link a cell to the same coordinate on the adjacent level,
 * so a path may span several levels.
 */

import type { DungeonStruct } from './types';

export interface Cell {
	l: number;
	x: number;
	y: number;
}

const key = (l: number, x: number, y: number) => `${l},${x},${y}`;

/** Map every stair-door cell to the level it connects to. */
function buildStairs(d: DungeonStruct): Map<string, number> {
	const stairs = new Map<string, number>();
	d.levels.forEach((level, l) => {
		for (const room of level.rooms) {
			for (const door of room.doors) {
				if (door.up === true && l + 1 < d.levels.length) stairs.set(key(l, door.x, door.y), l + 1);
				else if (door.up === false && l - 1 >= 0) stairs.set(key(l, door.x, door.y), l - 1);
			}
		}
	});
	return stairs;
}

/** Shortest path from `start` to `goal`, or `null` if unreachable. */
export function findPath(d: DungeonStruct, start: Cell, goal: Cell): Cell[] | null {
	const stairs = buildStairs(d);
	const startKey = key(start.l, start.x, start.y);
	const goalKey = key(goal.l, goal.x, goal.y);
	const prev = new Map<string, string | null>();
	prev.set(startKey, null);
	const queue: Cell[] = [start];

	while (queue.length > 0) {
		const cur = queue.shift() as Cell;
		const curKey = key(cur.l, cur.x, cur.y);
		if (curKey === goalKey) return reconstruct(prev, goalKey);

		const table = d.levels[cur.l].table;
		const moves: Cell[] = [
			{ l: cur.l, x: cur.x + 1, y: cur.y },
			{ l: cur.l, x: cur.x - 1, y: cur.y },
			{ l: cur.l, x: cur.x, y: cur.y + 1 },
			{ l: cur.l, x: cur.x, y: cur.y - 1 }
		];
		const stairTo = stairs.get(curKey);
		if (stairTo !== undefined) moves.push({ l: stairTo, x: cur.x, y: cur.y });

		for (const next of moves) {
			if (next.x < 0 || next.y < 0 || next.x >= d.width || next.y >= d.height) continue;
			if (next.l === cur.l && !table[next.x][next.y]) continue;
			if (next.l !== cur.l && !d.levels[next.l].table[next.x][next.y]) continue;
			const nk = key(next.l, next.x, next.y);
			if (prev.has(nk)) continue;
			prev.set(nk, curKey);
			queue.push(next);
		}
	}
	return null;
}

function reconstruct(prev: Map<string, string | null>, goalKey: string): Cell[] {
	const path: Cell[] = [];
	let cur: string | null = goalKey;
	while (cur != null) {
		const [l, x, y] = cur.split(',').map(Number);
		path.push({ l, x, y });
		cur = prev.get(cur) ?? null;
	}
	return path.reverse();
}
