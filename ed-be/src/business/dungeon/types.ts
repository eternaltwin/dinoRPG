/**
 * Dungeon data model — TypeScript port of the Haxe typedefs from the DinoRPG
 * archive:
 *   - com/DungeonCodec.hx  (DungeonItem / DungeonRoom / DungeonLevel / DungeonStruct)
 *   - com/DungeonData.hx   (_DIcon / DungeonData / DungeonCommand / _DResponse)
 *
 * Sources:
 *   https://github.com/motion-twin/WebGamesArchives  (DinoRPG/src/com)
 */

// ── com/DungeonCodec.hx ──────────────────────────────────────────────────────

/**
 * `enum DungeonItem` — the index order is load-bearing: `DungeonCodec` stores
 * `Type.enumIndex(item.k)` in 4 bits, so these numeric values must not change.
 */
export enum DungeonItem {
	IKey = 0,
	IGold = 1,
	IHeal = 2,
	IScenario = 3
}

/**
 * A passage out of a room.
 *  - `up === false` : stairs going down a level
 *  - `up === true`  : stairs going up a level
 *  - `up === null && key === null` : same-level passage guarded by a monster
 *  - `up === null && key !== null` : locked door requiring key index `key`
 */
export interface DungeonDoor {
	x: number;
	y: number;
	up: boolean | null;
	key: number | null;
}

export interface DungeonItemPlacement {
	x: number;
	y: number;
	k: DungeonItem;
	v: number;
}

export interface DungeonRoom {
	id: number;
	x: number;
	y: number;
	w: number;
	h: number;
	doors: DungeonDoor[];
	item: DungeonItemPlacement | null;
}

export interface DungeonLevel {
	/** `table[x][y]` — `true` is walkable floor, `false` is wall. */
	table: boolean[][];
	rooms: DungeonRoom[];
}

export interface DungeonStruct {
	width: number;
	height: number;
	levels: DungeonLevel[];
	start: { x: number; y: number; l: number };
	exit: { x: number; y: number; l: number };
}

/** A single grid cell: level `l`, column `x`, row `y`. */
export interface Cell {
	l: number;
	x: number;
	y: number;
}

// ── com/DungeonData.hx ───────────────────────────────────────────────────────

/** `enum _DIcon` — icon shown on a dungeon cell. */
export type DIcon =
	| { kind: 'nothing' }
	| { kind: 'block' }
	| { kind: 'icon'; i: string }
	| { kind: 'monster'; m: string };

/** `typedef DungeonData` — the per-player runtime state of a dungeon run. */
export interface DungeonData {
	d: string; // encoded DungeonStruct (the `_d` field)
	x: number;
	y: number;
	l: number;
	ldelta: number;
	dir: boolean;
	sdino: string;
	smonster: string;
	fog: Uint8Array;
	flags: number[];
	keys: boolean[];
	group: { n: string; g: string }[];
	monsters: string[];
	url: string;
	lock: boolean;
	skin: string;
	sicons: DIcon[];
	tower: boolean;
	text: string | null;
	tlvl: string;
}

/** `typedef DungeonCommand` — a movement request. */
export interface DungeonCommand {
	x: number;
	y: number;
	l: number;
	dx: number;
	dy: number;
	dl: number;
}

/** `enum _DResponse` — a server response to a command. */
export type DResponse =
	| { kind: 'ok' }
	| { kind: 'url'; url: string }
	| { kind: 'message'; s: string; icon?: string; url?: string };
