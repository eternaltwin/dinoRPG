/**
 * Rooms — TypeScript port of `gfx/dungeon/gen/Rooms.hx`.
 *
 * Places random non-overlapping rectangular rooms (with 1-cell wall gaps),
 * connects touching rooms with doors, keeps a (mostly) spanning tree per
 * connected group, stitches levels together with stair doors at dead-ends, and
 * validates the covered surface.
 */

import { Generator } from './Generator';
import { Door, Group, Level, Room } from './Data';
import { HxList } from './HxList';
import type { LevelInfos } from './Data';

export class Rooms extends Generator {
	private surface: number;

	constructor(surface: number) {
		super();
		this.surface = surface;
	}

	/** Try up to `n` random seeds; returns null on success or a failure reason. */
	tryGenerate(inf: LevelInfos, n: number): string | null {
		let reason: string | null = null;
		for (let i = 0; i < n; i++) {
			inf.seed = Math.floor(Math.random() * 0x1000000);
			this.select(inf);
			reason = this.genLevels();
			if (reason == null) break;
		}
		return reason;
	}

	/** Deterministic single attempt with an explicit seed (used by the POC). */
	runOnce(inf: LevelInfos, seed: number): string | null {
		inf.seed = seed;
		this.select(inf);
		return this.genLevels();
	}

	private genLevels(): string | null {
		const levels: Level[] = [];
		this.inf.levels = levels;
		for (let i = 0; i < this.inf.nlevels; i++) {
			const l = this.vtry(() => this.genLevel());
			l.id = levels.length;
			levels.push(l);
		}
		// use biggest group as a start
		const l0 = levels[0];
		const g = l0.groups.toArray();
		g.sort((g1, g2) => g2.rooms.length - g1.rooms.length);
		l0.groups = HxList.fromArray(g);
		// walk the level and calculate room-distance
		const r0 = (l0.groups.first() as Group).rooms[0];
		const deadEnds: Room[] = [];
		this.walkLevel(r0, 1, deadEnds);
		while (deadEnds.length > 0) this.makeLevelDoor(deadEnds);
		// cleanup unreachable rooms
		let rid = 0;
		for (const l of levels) {
			for (const grp of l.groups.toArray()) {
				if (grp.rooms[0].dist === 0) {
					l.groups.remove(grp);
					for (const r of grp.rooms) l.removeRoom(r);
				}
			}
			for (const r of l.rooms) r.id = rid++;
		}
		// check surface
		let surfAcc = 0;
		for (const l of levels) {
			if (l.rooms.isEmpty()) return 'empty';
			for (const r of l.rooms) {
				this.initRoomDoors(r);
				surfAcc += r.w * r.h;
			}
		}
		const surf = surfAcc / (this.inf.width * this.inf.height);
		if (surf < Math.pow(this.inf.nlevels, 0.7) * this.surface) return 'surface ' + Math.floor(surf * 100) + '%';
		// assign up/down doors
		for (const l of levels)
			for (const r of l.rooms) for (const d of r.doors) if (d.x === 0 && !this.initLevelDoor(d)) return 'door';
		return null;
	}

	private initLevelDoor(d: Door): boolean {
		const r1 = d.r1;
		const r2 = d.r2 as Room;
		const x1 = r1.x < r2.x ? r2.x : r1.x;
		let x2 = r1.x2 < r2.x2 ? r1.x2 : r2.x2;
		const y1 = r1.y < r2.y ? r2.y : r1.y;
		let y2 = r1.y2 < r2.y2 ? r1.y2 : r2.y2;
		x2--;
		y2--;
		const pos = [1, 2, 3, 4];
		for (let i = 0; i < 50; i++) {
			let p = 0;
			if (pos.length > 0) {
				const x = this.random(pos.length);
				p = pos[x];
				pos.splice(x, 1);
			}
			switch (p) {
				case 0:
					d.x = this.rand(x1, x2);
					d.y = this.rand(y1, y2);
					break;
				case 1:
					d.x = x1;
					d.y = y1;
					break;
				case 2:
					d.x = x2;
					d.y = y1;
					break;
				case 3:
					d.x = x1;
					d.y = y2;
					break;
				case 4:
					d.x = x2;
					d.y = y2;
					break;
			}
			if (this.checkLevelDoor(d)) return true;
		}
		return false;
	}

	private checkLevelDoor(d: Door): boolean {
		for (const d2 of d.r1.doors) {
			if (d2 === d) continue;
			const dx = d2.x - d.x;
			const dy = d2.y - d.y;
			if (dx * dx + dy * dy <= 2) return false;
		}
		for (const d2 of (d.r2 as Room).doors) {
			if (d2 === d) continue;
			const dx = d2.x - d.x;
			const dy = d2.y - d.y;
			if (dx * dx + dy * dy <= 2) return false;
		}
		return true;
	}

	private initRoomDoors(r1: Room): void {
		for (const d of r1.doors) {
			const r2 = d.other(r1);
			if (r2.level !== r1.level) {
				continue;
			} else if (r2.x2 < r1.x) {
				d.x = r1.x - 1;
				const y1 = r1.y < r2.y ? r2.y : r1.y;
				const y2 = r1.y2 < r2.y2 ? r1.y2 : r2.y2;
				d.y = this.rand(y1, y2 - 1);
				(r1.level as Level).table[d.x][d.y] = true;
			} else if (r2.y2 < r1.y) {
				d.y = r1.y - 1;
				const x1 = r1.x < r2.x ? r2.x : r1.x;
				const x2 = r1.x2 < r2.x2 ? r1.x2 : r2.x2;
				d.x = this.rand(x1, x2 - 1);
				(r1.level as Level).table[d.x][d.y] = true;
			}
		}
	}

	private cleanDoors(g: Group, r: Room, prev: Room | null): void {
		r.group = g;
		for (const d of r.doors) {
			const r2 = d.other(r);
			if (r2 === prev) continue;
			if (r2.group === g) {
				if (this.proba(2)) {
					r.doors.remove(d);
					r2.doors.remove(d);
				}
			} else {
				this.cleanDoors(g, r2, r);
			}
		}
	}

	private genLevel(): Level {
		const l = new Level(0, this.inf.width, this.inf.height);
		this.ntry(() => this.generateRoom(l), this.inf.roomsPerLevel);
		l.groups = this.buildRoomGroups(l);
		for (const r of l.rooms) r.group = null;
		for (const g of l.groups) this.cleanDoors(g, g.rooms[this.random(g.rooms.length)], null);
		return l;
	}

	private buildRoomGroups(l: Level): HxList<Group> {
		for (const r of l.rooms) r.doors = new HxList<Door>();
		const rooms = l.rooms.toArray();
		for (const r1 of rooms) {
			for (const r2 of rooms) {
				if (r2.id > r1.id && r1.touch(r2)) {
					const d = new Door(r1, r2);
					r1.doors.push(d);
					r2.doors.push(d);
				}
			}
		}
		const groups = new HxList<Group>();
		for (const r of l.rooms)
			if (r.group == null) {
				const g = new Group(groups.length);
				r.addGroupRec(g);
				groups.push(g);
			}
		return groups;
	}

	private generateRoom(l: Level): boolean {
		const w = this.rand(this.inf.roomMinSize, this.inf.roomMaxSize);
		const h = this.rand(this.inf.roomMinSize, this.inf.roomMaxSize);
		const x = this.rand(1, this.inf.width - (w + 1));
		const y = this.rand(1, this.inf.height - (h + 1));
		for (let px = x - 1; px < x + w + 1; px++)
			for (let py = y - 1; py < y + h + 1; py++) if (l.table[px][py]) return false;
		for (let px = x; px < x + w; px++) for (let py = y; py < y + h; py++) l.table[px][py] = true;
		l.rooms.push(new Room(l, l.rooms.length, x, y, w, h));
		return true;
	}

	private walkLevel(r: Room, dist: number, deadEnds: Room[]): boolean {
		// don't loop unless we can reduce distance
		if (r.dist !== 0 && dist >= r.dist) return false;
		let walk = r.dist !== 0;
		r.dist = dist;
		for (const d of r.doors) {
			const r2 = d.other(r);
			if (this.walkLevel(r2, dist + 1, deadEnds)) walk = true;
		}
		if (!walk) deadEnds.push(r);
		return true;
	}

	private makeLevelDoor(deadEnds: Room[]): void {
		deadEnds.sort((r1, r2) => r2.dist - r1.dist);
		const r = deadEnds.shift() as Room; // most distant one
		for (const n of [1, -1]) {
			const l2 = this.inf.levels[(r.level as Level).id + n];
			if (l2 == null) continue;
			for (const r2 of l2.rooms) {
				if (r2.dist === 0 && r2.over(r, 2)) {
					const d = new Door(r, r2);
					r2.doors.push(d);
					r.doors.push(d);
					this.walkLevel(r2, r.dist + 1, deadEnds);
					return;
				}
			}
		}
	}
}
