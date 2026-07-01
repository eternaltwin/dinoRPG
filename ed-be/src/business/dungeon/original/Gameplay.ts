/**
 * Gameplay — TypeScript port of `gfx/dungeon/gen/Gameplay.hx`.
 *
 * Turns a connected room layout into a playable dungeon: picks a start, builds
 * a branch/metabranch tree, then iteratively pushes the player outward — placing
 * a key, locking the doors behind it, and scattering heal / scenario / gold in
 * the dead-ends it just opened — until no branches remain, at which point the
 * last "key" location becomes the exit.
 */

import { Generator } from './Generator.js';
import { DungeonItem } from '../types.js';
import type { Level, Room } from './Data.js';
import type { LevelInfos } from './Data.js';

class Branch {
	id: number;
	start: Room;
	rooms: Room[] = [];
	subs: Branch[] = [];
	links: Branch[] = [];
	constructor(id: number, start: Room) {
		this.id = id;
		this.start = start;
	}
}

export class Gameplay extends Generator {
	private reach: number[][] = [];
	private branchs: Branch[] = [];
	private visitedRooms: Room[] = [];
	private visitTag = 0;

	private distantPos(r: Room): { x: number; y: number } {
		for (let x = r.x; x < r.x2; x++) for (let y = r.y; y < r.y2; y++) this.reach[x][y] = 0xffffff;
		for (const d of r.doors) this.fillReach(r, d.x, d.y, 0);
		let max = -1;
		let mx = -1;
		let my = -1;
		for (let x = r.x; x < r.x2; x++)
			for (let y = r.y; y < r.y2; y++) {
				const v = this.reach[x][y];
				if (v > max && v !== 0xffffff) {
					max = v;
					mx = x;
					my = y;
				}
			}
		if (max === -1) throw new Error('assert');
		return { x: mx, y: my };
	}

	private fillReach(r: Room, x: number, y: number, dist: number): void {
		const t = (r.level as Level).table[x][y];
		if (!t) return;
		if (x < r.x - 1 || y < r.y - 1 || x > r.x2 || y > r.y2) return;
		if (this.reach[x][y] < dist) return;
		this.reach[x][y] = dist;
		dist++;
		this.fillReach(r, x + 1, y, dist);
		this.fillReach(r, x - 1, y, dist);
		this.fillReach(r, x, y + 1, dist);
		this.fillReach(r, x, y - 1, dist);
	}

	gameplay(inf: LevelInfos): void {
		this.select(inf);
		this.reach = [];
		for (let x = 0; x < inf.width; x++) this.reach[x] = new Array<number>(inf.height).fill(0);
		for (const l of inf.levels)
			for (const r of l.rooms) {
				r.tag = -1;
				r.tmp = 0;
			}
		const l0 = 0;
		const r0 = inf.levels[l0].rooms.first() as Room;
		const p0 = this.distantPos(r0);
		inf.start = { l: l0, x: p0.x, y: p0.y };
		inf.exit = inf.start; // tmp

		this.branchs = [];
		this.buildBranches();

		r0.item = { x: inf.start.x, y: inf.start.y, k: null, v: -1 };

		// reach central branch
		this.visitedRooms = [];
		this.visitTag = 1;

		let b = this.branchs[r0.tag];
		let doorCount = 0;
		let scenarioCount = 0;
		// eslint-disable-next-line no-constant-condition
		while (true) {
			// make sure that we visit some more branches
			while (this.visitedRooms.length < 10) {
				this.visit(b);
				let b2: Branch | null = null;
				for (const l of b.links) if (l.id > b.id && (b2 == null || l.id > b2.id)) b2 = l;
				if (b2 == null) break;
				b = b2;
			}

			// choose where to put the key
			doorCount++;
			const k = this.makeDeadEnd(doorCount * 2);
			const kpos = this.distantPos(k);
			k.item = { x: kpos.x, y: kpos.y, k: DungeonItem.IKey, v: doorCount };

			// give treasures to the dead-ends we reached
			let dsum = 0;
			let heal = true;
			let scenario = this.r.random(3) === 0;
			for (const r of this.visitedRooms)
				if (r.doors.length === 1 && r.item == null) {
					if (scenario) {
						const pos = this.distantPos(r);
						r.item = { x: pos.x, y: pos.y, k: DungeonItem.IScenario, v: scenarioCount++ };
						scenario = false;
					} else if (heal) {
						const pos = this.distantPos(r);
						r.item = { x: pos.x, y: pos.y, k: DungeonItem.IHeal, v: 0 };
						heal = false;
					} else dsum += r.dist;
				}
			for (const r of this.visitedRooms)
				if (r.doors.length === 1 && r.item == null) {
					const pos = this.distantPos(r);
					const amount = Math.ceil((this.visitedRooms.length * 10 * r.dist) / dsum);
					r.item = { x: pos.x, y: pos.y, k: DungeonItem.IGold, v: amount };
				}

			// reduce the visited rooms to the minimum
			while (this.reduceDoors()) {
				/* loop */
			}
			// make sure we don't have a door over a stair
			while (this.expandDoors()) {
				/* loop */
			}
			// lock doors
			const nexts = this.closeDoors(doorCount);

			// no more rooms to explore -> the last key is actually the exit
			if (nexts.length === 0) {
				k.item = null;
				inf.exit = { l: (k.level as Level).id, x: kpos.x, y: kpos.y };
				break;
			}

			// update the distance map starting from where we got the key
			this.updateRoomsDist(k);

			// make sure we visit some new branches
			this.visitedRooms = [];
			this.visitTag++;
			for (const r of nexts) this.visit(this.branchs[r.tag]);
			b = this.branchs[nexts[this.random(nexts.length)].tag];
		}
		// end
		r0.item = null;
	}

	private updateRoomsDist(r: Room): void {
		for (const l of this.inf.levels) for (const rr of l.rooms) rr.dist = 999999;
		this.calcRoomDist(r, 0);
	}

	private calcRoomDist(r: Room, dist: number): void {
		if (r.dist <= dist) return;
		r.dist = dist;
		dist++;
		for (const d of r.doors) this.calcRoomDist(d.other(r), dist);
	}

	private visit(b: Branch): void {
		for (const r of b.rooms) {
			if (r.tmp !== 0) continue;
			r.tmp = this.visitTag;
			this.visitedRooms.push(r);
		}
	}

	private makeDeadEnd(k: number): Room {
		const dl: Room[] = [];
		for (const l of this.inf.levels) for (const r of l.rooms) if (r.doors.length === 1 && r.item == null) dl.push(r);
		dl.sort((r1, r2) => r1.dist - r2.dist);
		const len = dl.length;
		let pos = this.random(k);
		if (pos >= len) pos = len - 1;
		for (let i = 0; i < pos; i++) this.visitRec(dl[i]);
		let found: Room | null = dl.length === 0 ? null : dl[pos];
		// no dead-end left: take the most distant unvisited room
		if (found == null) {
			let dmin = -1;
			for (const r of this.visitedRooms) r.tmp = 0;
			for (const l of this.inf.levels)
				for (const r of l.rooms)
					if (r.dist > dmin && r.tmp === 0 && r.item == null) {
						found = r;
						dmin = r.dist;
					}
			for (const r of this.visitedRooms) r.tmp = this.visitTag;
		}
		if (found == null) throw new Error('no room for dead-end');
		this.visitRec(found);
		return found;
	}

	private visitRec(r: Room): void {
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const b = this.branchs[r.tag];
			this.visit(b);
			let next: Room | null = null;
			for (const d of r.doors) {
				const r2 = d.other(r);
				if (r2.dist < r.dist) {
					next = r2;
					break;
				}
			}
			if (next == null) break;
			r = next;
		}
	}

	private reduceDoors(): boolean {
		for (const r of this.visitedRooms) {
			const min = r.dist >= 5 ? 1 : 2;
			if (r.item != null || r.doors.length <= min || r.tmp === 0) continue;
			let count = 0;
			for (const d of r.doors) if (d.other(r).tmp === 0) count++;
			if (count === r.doors.length - 1) {
				r.tmp = 0;
				this.visitedRooms.splice(this.visitedRooms.indexOf(r), 1);
				return true;
			}
		}
		return false;
	}

	private expandDoors(): boolean {
		let found = false;
		// we can't simply stop visiting on a stair
		for (const r of this.visitedRooms.slice())
			for (const d of r.doors) {
				const r2 = d.other(r);
				if (r2.tmp === 0 && r.level !== r2.level) {
					r2.tmp = this.visitTag;
					this.visitedRooms.push(r2);
					found = true;
				}
			}
		return found;
	}

	private closeDoors(id: number): Room[] {
		const nexts: Room[] = [];
		for (const l of this.inf.levels)
			for (const r of l.rooms) {
				if (r.tmp === 0) continue;
				for (const d of r.doors) {
					const r2 = d.other(r);
					if (r2.tmp === 0) {
						d.status = id;
						nexts.push(r2);
					}
				}
			}
		return nexts;
	}

	private buildBranches(): void {
		// build branches starting from each dead-end
		for (const l of this.inf.levels)
			for (const r of l.rooms)
				if (r.tag < 0 && r.doors.length === 1) {
					const b = new Branch(this.branchs.length, r);
					this.branchs.push(b);
					this.buildBranch(r, b);
				}
		let found = true;
		while (found) {
			found = false;
			// build metabranches (can group several branches together)
			for (const l of this.inf.levels)
				for (const r of l.rooms)
					if (r.tag < 0) {
						let n = 0;
						for (const d of r.doors) if (d.other(r).tag < 0) n++;
						if (n <= 1) {
							const b = new Branch(this.branchs.length, r);
							found = true;
							this.branchs.push(b);
							for (const d of r.doors) {
								const r2 = d.other(r);
								if (r2.tag >= 0) {
									const bsub = this.branchs[r2.tag];
									const i = b.subs.indexOf(bsub);
									if (i >= 0) b.subs.splice(i, 1);
									b.subs.push(bsub);
								}
							}
							this.buildBranch(r, b);
						}
					}
			if (found) continue;
			// break cycle branches
			for (const l of this.inf.levels) {
				for (const r of l.rooms)
					if (r.tag < 0) {
						let count = 0;
						for (const d of r.doors) if (d.other(r).dist <= r.dist) count++;
						if (count > 1) {
							const b = new Branch(this.branchs.length, r);
							found = true;
							this.branchs.push(b);
							this.buildBranchConnect(r, b);
							break;
						}
					}
				if (found) break;
			}
		}
		// build branch links
		for (const b of this.branchs)
			for (const b2 of b.subs) {
				b.links.push(b2);
				b2.links.push(b);
			}
	}

	private buildBranch(r: Room, b: Branch): void {
		b.rooms.push(r);
		r.tag = b.id;
		for (const d of r.doors) {
			const r2 = d.other(r);
			if (r2.tag < 0 && r2.doors.length <= 2) this.buildBranch(r2, b);
		}
	}

	private buildBranchConnect(r: Room, b: Branch): void {
		b.rooms.push(r);
		r.tag = b.id;
		for (const d of r.doors) {
			const r2 = d.other(r);
			if (r2.tag < 0) {
				if (r2.doors.length <= 2) this.buildBranchConnect(r2, b);
			} else {
				const b2 = this.branchs[r2.tag];
				if (b2 !== b) {
					const i = b.subs.indexOf(b2);
					if (i >= 0) b.subs.splice(i, 1);
					b.subs.push(b2);
				}
			}
		}
	}
}
