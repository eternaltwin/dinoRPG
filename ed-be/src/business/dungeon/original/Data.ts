/**
 * Data — TypeScript port of `gfx/dungeon/gen/Data.hx`.
 *
 * Room / Door / Group / Level / LevelInfos, used by the room generator and the
 * gameplay (lock-and-key) pass. `item.k` uses the shared {@link DungeonItem}
 * enum so the result encodes with {@link DungeonCodec}.
 */

import type { DungeonItem } from '../types.js';
import { HxList } from './HxList.js';

export interface RoomItem {
	x: number;
	y: number;
	/** null is used transiently by Gameplay for the start marker. */
	k: DungeonItem | null;
	v: number;
}

export class Group {
	id: number;
	rooms: Room[] = [];
	constructor(id: number) {
		this.id = id;
	}
}

export class Door {
	r1: Room;
	r2: Room | null;
	x = 0;
	y = 0;
	status = 0;
	constructor(r1: Room, r2: Room | null) {
		this.r1 = r1;
		this.r2 = r2;
		this.status = 0;
	}
	other(r: Room): Room {
		return (this.r1 === r ? this.r2 : this.r1) as Room;
	}
}

export class Room {
	level: Level | null;
	id: number;
	x: number;
	y: number;
	w: number;
	h: number;
	readonly x2: number;
	readonly y2: number;
	doors: HxList<Door> = new HxList<Door>();
	group: Group | null = null;
	dist = 0;
	tag = 0;
	tmp = 0;
	item: RoomItem | null = null;

	constructor(level: Level | null, id: number, x: number, y: number, w: number, h: number) {
		this.level = level;
		this.id = id;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.x2 = x + w;
		this.y2 = y + h;
	}

	/** True when `r` is exactly one cell away (shared wall) and overlaps. */
	touch(r: Room): boolean {
		return (
			((this.x === r.x2 + 1 || r.x === this.x2 + 1) && this.y < r.y2 && r.y < this.y2) ||
			((this.y === r.y2 + 1 || r.y === this.y2 + 1) && this.x < r.x2 && r.x < this.x2)
		);
	}

	/** True when this room overlaps `r` by at least `n` cells on both axes. */
	over(r: Room, n: number): boolean {
		return this.x + n <= r.x2 && r.x + n <= this.x2 && this.y + n <= r.y2 && r.y + n <= this.y2;
	}

	addGroupRec(g: Group): void {
		if (this.group === g) return;
		if (this.group != null) throw new Error('assert');
		this.group = g;
		g.rooms.push(this);
		for (const d of this.doors) d.other(this).addGroupRec(g);
	}
}

export class Level {
	id: number;
	table: boolean[][];
	rooms: HxList<Room> = new HxList<Room>();
	groups: HxList<Group> = new HxList<Group>();

	constructor(id: number, w: number, h: number) {
		this.id = id;
		this.table = [];
		for (let x = 0; x < w; x++) this.table[x] = new Array<boolean>(h).fill(false);
	}

	removeRoom(r: Room): boolean {
		if (!this.rooms.remove(r)) return false;
		for (let x = r.x; x < r.x2; x++) for (let y = r.y; y < r.y2; y++) this.table[x][y] = false;
		return true;
	}
}

export class LevelInfos {
	// input
	width: number;
	height: number;
	nlevels: number;
	roomsPerLevel: number;
	roomMinSize: number;
	roomMaxSize: number;

	// noise
	noiseAmount: number;
	noNoiseProba: number;
	noiseProba: number;
	filtersPasses: number;

	// output
	seed = 0;
	levels: Level[] = [];
	start: { l: number; x: number; y: number } = { l: 0, x: 0, y: 0 };
	exit: { l: number; x: number; y: number } = { l: 0, x: 0, y: 0 };

	constructor(w: number, h: number, n: number) {
		this.width = w;
		this.height = h;
		this.nlevels = n;
		this.roomMinSize = 3;
		this.roomMaxSize = 10;
		this.roomsPerLevel = Math.ceil((w * h) / 30);
		this.noiseAmount = 0;
		this.noNoiseProba = 0;
		this.noiseProba = 0;
		this.filtersPasses = 0;
	}
}
