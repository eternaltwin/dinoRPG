/**
 * Fog-of-war reveal policy — the server-only knowledge boundary.
 *
 * Given the decrypted {@link DungeonStruct} and the cell the dinoz just entered,
 * this computes the cells the player is now allowed to see: the entered cell plus
 * its four orthogonal neighbours (with their true walkability), and the icon of
 * any entity sitting on a revealed cell. The full layout never leaves the server;
 * only these cells are ever sent to the client.
 *
 * // ponytail: neighbour reveal only. Swap for whole-room reveal (rooms are in the
 * struct) if the fog feels too tight — the client side needs no change.
 */

import { DungeonItem } from './types.js';
import type { DungeonStruct } from './types.js';

/** A single cell the client is permitted to know about. */
export interface RevealedCell {
	l: number;
	x: number;
	y: number;
	/** true = walkable floor, false = wall. */
	floor: boolean;
	/** Semantic entity token the renderer maps to a sprite, if any. */
	icon?: string;
}

/** Cell key used for the run's "already revealed" set. */
export const cellKey = (l: number, x: number, y: number): string => `${l},${x},${y}`;

/** Icon token for whatever entity sits on cell (l,x,y), or undefined. */
function iconAt(d: DungeonStruct, l: number, x: number, y: number): string | undefined {
	if (d.start.l === l && d.start.x === x && d.start.y === y) return 'start';
	if (d.exit.l === l && d.exit.x === x && d.exit.y === y) return 'exit';
	const floor = (fx: number, fy: number): boolean => d.levels[l].table[fx]?.[fy] ?? false;
	for (const room of d.levels[l].rooms) {
		for (const door of room.doors) {
			if (door.x !== x || door.y !== y) continue;
			if (door.up === true) return 'stair_up';
			if (door.up === false) return 'stair_down';
			if (door.key != null) return floor(x - 1, y) && floor(x + 1, y) ? 'door_v' : 'door_h';
			return 'monster';
		}
		if (room.item && room.item.x === x && room.item.y === y) {
			switch (room.item.k) {
				case DungeonItem.IKey:
					return 'key';
				case DungeonItem.IGold:
					return 'gold';
				case DungeonItem.IHeal:
					return 'heal';
				default:
					return 'scroll';
			}
		}
	}
	return undefined;
}

/** The candidate cells revealed by standing on (l,x,y): the cell + 4 neighbours. */
export function revealAround(d: DungeonStruct, l: number, x: number, y: number): RevealedCell[] {
	const out: RevealedCell[] = [];
	const at = [
		[x, y],
		[x + 1, y],
		[x - 1, y],
		[x, y + 1],
		[x, y - 1]
	];
	for (const [cx, cy] of at) {
		if (cx < 0 || cy < 0 || cx >= d.width || cy >= d.height) continue;
		out.push({ l, x: cx, y: cy, floor: d.levels[l].table[cx]?.[cy] ?? false, icon: iconAt(d, l, cx, cy) });
	}
	return out;
}
