/**
 * Noise — TypeScript port of `dungeon/dungeon/gen/Noise.hx`.
 *
 * Carves organic, non-rectangular edges into each room while keeping all doors
 * mutually reachable, then optionally erodes thin spikes (`filtersPasses`).
 * Driven by `inf.noiseAmount` / `inf.filtersPasses`.
 */

import { Generator } from './Generator.js';
import type { Level, Room } from './Data.js';
import type { LevelInfos } from './Data.js';

export class Noise extends Generator {
	private reach: boolean[][] = [];

	noise(inf: LevelInfos): void {
		this.select(inf);
		this.reach = [];
		for (let x = 0; x < inf.width; x++) this.reach[x] = new Array<boolean>(inf.height).fill(false);
		for (const l of inf.levels)
			for (const r of l.rooms) {
				this.noiseRoom(r);
				for (let i = 0; i < inf.filtersPasses; i++) if (!this.noiseFilter(r)) break;
			}
	}

	private noiseRoom(r: Room): void {
		const noise = Math.ceil(r.w * r.h * this.inf.noiseAmount);
		if (
			noise <= 0 ||
			(this.inf.noNoiseProba > 0 && this.proba(this.inf.noNoiseProba)) ||
			!this.proba(this.inf.noiseProba)
		)
			return;
		const t = (r.level as Level).table;
		// hide doors
		let d0 = null;
		for (const d of r.doors) {
			t[d.x][d.y] = false;
			if (d.other(r).level === r.level) d0 = d;
		}
		// if we don't have a side door, start from a level door
		if (d0 == null) {
			d0 = r.doors.first();
			if (d0 == null) return;
			t[d0.x][d0.y] = true;
		}
		// select start point
		let sx = d0.x;
		let sy = d0.y;
		if (sx < r.x) sx++;
		else if (sy < r.y) sy++;
		else if (sx === r.x2) sx--;
		else if (sy === r.y2) sy--;
		// if our room is a dead-end, keep one other point visible
		let cx = sx;
		let cy = sy;
		if (r.doors.length === 1) {
			do {
				cx = this.rand(r.x, r.x2 - 1);
				cy = this.rand(r.y, r.y2 - 1);
			} while (cx === sx && cy === sy);
		}
		// add random noise while doors stay reachable
		for (let i = 0; i < noise; i++) {
			const x = r.x + this.random(r.w);
			const y = r.y + this.random(r.h);
			if (!t[x][y]) continue;
			if (x === cx && y === cy) continue;
			// don't make holes
			if (t[x - 1][y] && t[x + 1][y] && t[x][y - 1] && t[x][y + 1]) continue;
			t[x][y] = false;
			this.clearReach(r);
			this.buildReach(t, sx, sy);
			let ok = this.reach[cx][cy];
			if (ok) {
				for (const d of r.doors)
					if (!this.reach[d.x][d.y]) {
						ok = false;
						break;
					}
			}
			if (!ok) t[x][y] = true;
		}
		// eliminate unreachable places
		this.clearReach(r);
		this.buildReach(t, sx, sy);
		for (let x = r.x; x < r.x2; x++) for (let y = r.y; y < r.y2; y++) if (!this.reach[x][y]) t[x][y] = false;
		// show doors
		for (const d of r.doors) t[d.x][d.y] = true;
	}

	private noiseFilter(r: Room): boolean {
		const t = (r.level as Level).table;
		for (let x = r.x; x < r.x2; x++)
			for (let y = r.y; y < r.y2; y++)
				if (t[x][y]) {
					const sum = (t[x - 1][y] ? 1 : 0) + (t[x + 1][y] ? 1 : 0) + (t[x][y - 1] ? 1 : 0) + (t[x][y + 1] ? 1 : 0);
					this.reach[x][y] = sum === 1;
				} else this.reach[x][y] = false;
		for (const d of r.doors) {
			this.reach[d.x][d.y] = false;
			this.reach[d.x - 1][d.y] = false;
			this.reach[d.x + 1][d.y] = false;
			this.reach[d.x][d.y - 1] = false;
			this.reach[d.x][d.y + 1] = false;
		}
		let ok = false;
		for (let x = r.x; x < r.x2; x++)
			for (let y = r.y; y < r.y2; y++)
				if (this.reach[x][y]) {
					t[x][y] = false;
					ok = true;
				}
		return ok;
	}

	private clearReach(r: Room): void {
		for (let px = r.x - 1; px < r.x2 + 1; px++) for (let py = r.y - 1; py < r.y2 + 1; py++) this.reach[px][py] = false;
	}

	private buildReach(t: boolean[][], x: number, y: number): void {
		if (this.reach[x][y]) return;
		this.reach[x][y] = true;
		if (!t[x][y]) return;
		this.buildReach(t, x - 1, y);
		this.buildReach(t, x, y - 1);
		this.buildReach(t, x + 1, y);
		this.buildReach(t, x, y + 1);
	}
}
