/**
 * DungeonCodec — TypeScript port of `com/DungeonCodec.hx`.
 *
 * Serialises a {@link DungeonStruct} to a compact string and back. The room
 * floor-plan (`table`) is run-length encoded; rooms, doors, items, start and
 * exit are bit-packed. See {@link BitCodec} for the (re-implemented) bit layer.
 *
 * The structure of `encode` / `decode` / `encodeTable` / `decodeTable` /
 * `saveBits` / `nbits` mirrors the Haxe original 1:1.
 */

import { BitCodec } from './BitCodec';
import { DungeonItem } from './types';
import type { DungeonStruct, DungeonLevel, DungeonRoom, DungeonDoor, DungeonItemPlacement } from './types';

export class DungeonCodec {
	d!: DungeonStruct;
	private bc!: BitCodec;

	/** Number of bits needed to represent the value `v` (>= 1). */
	static nbits(v: number): number {
		let n = 1;
		while (v >= 1 << n) n++;
		return n;
	}

	/** Variable-length run encoder used by {@link encodeTable}. */
	private saveBits(b: BitCodec, nbits: number, k: number): void {
		if (k < 4) {
			b.write(1, 0);
			b.write(2, k);
		} else if (k <= 8) {
			b.write(2, 2);
			b.write(3, k - 1);
		} else {
			b.write(2, 3);
			b.write(nbits, k - 1);
		}
	}

	/** RLE-encode the `w*h` floor cells of a room, column-major from (px,py). */
	private encodeTable(t: boolean[][], px: number, py: number, w: number, h: number): void {
		const nbits = DungeonCodec.nbits(w * h - 1);
		let c = false;
		let k = 0;
		for (let x = 0; x < w; x++) {
			for (let y = 0; y < h; y++) {
				if ((t[px + x][py + y] ?? false) === c) {
					k++;
				} else {
					this.saveBits(this.bc, nbits, k);
					k = 1;
					c = !c;
				}
			}
		}
		this.saveBits(this.bc, nbits, k);
	}

	/** Inverse of {@link encodeTable}: fills `t` for the room rectangle. */
	private decodeTable(t: boolean[][], px: number, py: number, w: number, h: number): void {
		const nbits = DungeonCodec.nbits(w * h - 1);
		let x = px;
		let y = py;
		let c = false;
		const wEnd = w + px;
		const hEnd = h + py;
		while (x < wEnd) {
			let k: number;
			if (this.bc.read(1) === 0) k = this.bc.read(2);
			else if (this.bc.read(1) === 0) k = this.bc.read(3) + 1;
			else k = this.bc.read(nbits) + 1;
			while (k > 0) {
				t[x][y] = c;
				k--;
				y++;
				if (y === hEnd) {
					y = py;
					x++;
				}
			}
			c = !c;
		}
	}

	encode(d?: DungeonStruct): string {
		if (d) this.d = d;
		const dd = this.d;
		this.bc = new BitCodec(null);
		const bc = this.bc;
		bc.write(8, dd.width);
		bc.write(8, dd.height);
		let nrooms = 0;
		let nmonsters = 0;
		let nscenarios = 0;
		let nkeys = 0;
		for (const l of dd.levels) nrooms += l.rooms.length;
		bc.write(8, dd.levels.length);
		const rbits = DungeonCodec.nbits(nrooms);
		bc.write(5, rbits);
		const xybits = DungeonCodec.nbits(dd.width > dd.height ? dd.width : dd.height);
		const whbits = xybits - 1;
		for (const l of dd.levels) {
			bc.write(rbits, l.rooms.length);
			for (const r of l.rooms) {
				bc.write(xybits, r.x);
				bc.write(xybits, r.y);
				bc.write(whbits, r.w);
				bc.write(whbits, r.h);
				this.encodeTable(l.table, r.x, r.y, r.w, r.h);
				bc.write(5, r.doors.length);
				for (const door of r.doors) {
					bc.write(xybits, door.x);
					bc.write(xybits, door.y);
					bc.write(2, door.up == null ? (door.key == null ? 2 : 3) : door.up ? 1 : 0);
					if (door.key != null) bc.write(6, door.key);
					else if (door.up == null) nmonsters++;
				}
				if (r.item != null) {
					bc.write(1, 1);
					bc.write(xybits, r.item.x);
					bc.write(xybits, r.item.y);
					bc.write(4, r.item.k);
					bc.write(8, r.item.v);
					if (r.item.k === DungeonItem.IKey) nkeys++;
					else if (r.item.k === DungeonItem.IScenario) nscenarios++;
				} else {
					bc.write(1, 0);
				}
			}
		}
		bc.write(xybits, dd.start.x);
		bc.write(xybits, dd.start.y);
		bc.write(8, dd.start.l);
		bc.write(xybits, dd.exit.x);
		bc.write(xybits, dd.exit.y);
		bc.write(8, dd.exit.l);
		const sign = `${dd.width}x${dd.height}x${dd.levels.length} ${nrooms}R ${nmonsters}M ${nscenarios}S ${nkeys}K`;
		return `[[${sign}]]` + bc.toString() + bc.crcStr();
	}

	removeSignature(s: string): string {
		if (s.substr(0, 2) === '[[') s = s.substr(s.indexOf(']]') + 2);
		return s;
	}

	/** Decode `s` into `this.d`. Returns `true` when the CRC checks out. */
	decode(s: string): boolean {
		s = this.removeSignature(s);
		this.bc = new BitCodec(s);
		const bc = this.bc;
		const width = bc.read(8);
		const height = bc.read(8);
		const nlevels = bc.read(8);
		const rbits = bc.read(5);
		const xybits = DungeonCodec.nbits(width > height ? width : height);
		const whbits = xybits - 1;
		// Guard against arbitrary / incompatible strings: bail cleanly instead of
		// allocating huge tables or looping over garbage room counts.
		if (width < 1 || width > 256 || height < 1 || height > 256 || nlevels < 1 || nlevels > 64) return false;
		const levels: DungeonLevel[] = [];
		this.d = {
			width,
			height,
			levels,
			start: { x: 0, y: 0, l: 0 },
			exit: { x: 0, y: 0, l: 0 }
		};
		let rid = 0;
		for (let i = 0; i < nlevels; i++) {
			const t: boolean[][] = [];
			for (let x = 0; x < width; x++) t[x] = new Array<boolean>(height).fill(false);
			const rooms: DungeonRoom[] = [];
			const nr = bc.read(rbits);
			if (nr > width * height) return false;
			for (let j = 0; j < nr; j++) {
				const x = bc.read(xybits);
				const y = bc.read(xybits);
				const w = bc.read(whbits);
				const h = bc.read(whbits);
				const doors: DungeonDoor[] = [];
				let item: DungeonItemPlacement | null = null;
				if (x < 0 || y < 0 || w < 1 || h < 1 || x + w > width || y + h > height) return false;
				this.decodeTable(t, x, y, w, h);
				const nd = bc.read(5);
				for (let k = 0; k < nd; k++) {
					let up: boolean | null = null;
					let key: number | null = null;
					const dx = bc.read(xybits);
					const dy = bc.read(xybits);
					switch (bc.read(2)) {
						case 0:
							up = false;
							break;
						case 1:
							up = true;
							break;
						case 2:
							up = null;
							break;
						default:
							up = null;
							key = bc.read(6);
							break;
					}
					if (dx < 0 || dy < 0 || dx >= width || dy >= height) return false;
					doors.push({ x: dx, y: dy, up, key });
					t[dx][dy] = true;
				}
				if (bc.read(1) === 1) {
					const ix = bc.read(xybits);
					const iy = bc.read(xybits);
					const k = bc.read(4) as DungeonItem;
					const v = bc.read(8);
					item = { x: ix, y: iy, k, v };
				}
				rooms.push({ id: rid++, x, y, w, h, doors, item });
			}
			levels.push({ table: t, rooms });
		}
		this.d.start.x = bc.read(xybits);
		this.d.start.y = bc.read(xybits);
		this.d.start.l = bc.read(8);
		this.d.exit.x = bc.read(xybits);
		this.d.exit.y = bc.read(xybits);
		this.d.exit.l = bc.read(8);
		return bc.crcStr() === s.substr(s.length - 4, 4);
	}
}
