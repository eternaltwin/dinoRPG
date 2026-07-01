/**
 * MazeRenderer — draws a decoded {@link DungeonStruct} with Pixi.js using the
 * real DinoRPG dungeon tileset (gfx/dungeon/gfx).
 *
 * Per the archive's `View.hx`: each cell is a square tile; walkable cells get a
 * ground tile, and wall edges are composited from front (N), back (S), side
 * (W/E, mirrored) and corner (diagonal, mirrored) pieces of the level's skin.
 * Items, doors and stairs are drawn as their item_ / interf_ sprites. The
 * background is filled with the skin's fog colour.
 *
 * Call {@link loadDungeonAssets} (with {@link allAssetNames}) before
 * constructing, so textures resolve synchronously.
 */

import { Application, Container, Graphics, Sprite, Text } from 'pixi.js';
import { DungeonItem } from '../dungeon/types';
import type { DungeonStruct, DungeonLevel, DungeonDoor } from '../dungeon/types';
import { SKINS } from './skins';
import type { Skin } from './skins';
import { gfx } from './assets';

export interface RendererOptions {
	cell?: number;
	/** One skin per level (cycled if shorter than the level count). */
	skins?: Skin[];
	/** Visible canvas size (px). Defaults to the full map (no scrolling). */
	view?: { w: number; h: number };
}

export class MazeRenderer {
	readonly app: Application;
	readonly cell: number;
	readonly actorLayer: Container;
	private readonly mapLayer: Container;
	private readonly viewW: number;
	private readonly viewH: number;
	private d: DungeonStruct;
	private skins: Skin[];
	private level = 0;
	private debug = false;

	constructor(parent: HTMLElement, d: DungeonStruct, opts: RendererOptions = {}) {
		this.cell = opts.cell ?? 24;
		this.d = d;
		this.skins = opts.skins && opts.skins.length > 0 ? opts.skins : [SKINS[0]];
		this.viewW = opts.view?.w ?? d.width * this.cell;
		this.viewH = opts.view?.h ?? d.height * this.cell;
		this.app = new Application({
			width: this.viewW,
			height: this.viewH,
			background: this.skinFor(0).fog,
			antialias: false
		});
		parent.appendChild(this.app.view as HTMLCanvasElement);

		this.mapLayer = new Container();
		this.actorLayer = new Container();
		this.app.stage.addChild(this.mapLayer);
		this.app.stage.addChild(this.actorLayer);

		this.showLevel(0);
	}

	get currentLevel(): number {
		return this.level;
	}
	get levelCount(): number {
		return this.d.levels.length;
	}

	/** Pixel center of cell (x, y). */
	center(x: number, y: number): { x: number; y: number } {
		return { x: x * this.cell + this.cell / 2, y: y * this.cell + this.cell / 2 };
	}

	/**
	 * Scroll the camera so world point (px, py) stays inside a centered dead-zone.
	 * The target roams freely within that inner box; the camera only pans once it
	 * would cross the edge — so the dino isn't glued to the center. Clamped to the
	 * map bounds.
	 */
	focus(px: number, py: number): void {
		const worldW = this.d.width * this.cell;
		const worldH = this.d.height * this.cell;
		const marginX = this.viewW * 0.35;
		const marginY = this.viewH * 0.35;
		let camX = -this.app.stage.position.x;
		let camY = -this.app.stage.position.y;
		const sx = px - camX;
		const sy = py - camY;
		if (sx < marginX) camX = px - marginX;
		else if (sx > this.viewW - marginX) camX = px - (this.viewW - marginX);
		if (sy < marginY) camY = py - marginY;
		else if (sy > this.viewH - marginY) camY = py - (this.viewH - marginY);
		camX = Math.max(0, Math.min(camX, Math.max(0, worldW - this.viewW)));
		camY = Math.max(0, Math.min(camY, Math.max(0, worldH - this.viewH)));
		this.app.stage.position.set(-camX, -camY);
	}

	/** Toggle wall-frame debug overlay: each edge piece gets a coloured box + side label. */
	setDebug(on: boolean): void {
		this.debug = on;
		this.showLevel(this.level);
	}

	skinFor(level: number): Skin {
		return this.skins[level % this.skins.length];
	}

	setDungeon(d: DungeonStruct, skins?: Skin[]): void {
		this.d = d;
		if (skins && skins.length > 0) this.skins = skins;
		this.app.renderer.resize(d.width * this.cell, d.height * this.cell);
		this.showLevel(Math.min(this.level, d.levels.length - 1));
	}

	showLevel(l: number): void {
		this.level = Math.max(0, Math.min(l, this.d.levels.length - 1));
		const skin = this.skinFor(this.level);
		this.app.renderer.background.color = skin.fog;
		this.mapLayer.removeChildren();
		this.drawLevel(this.d.levels[this.level], skin);
		this.drawEntities(this.d, this.level);
		this.drawLabel(this.level, skin);
	}

	// ── tiles ────────────────────────────────────────────────────────────────

	private drawLevel(level: DungeonLevel, skin: Skin): void {
		const t = level.table;
		const w = this.d.width;
		const h = this.d.height;
		const wall = (x: number, y: number): boolean => x < 0 || y < 0 || x >= w || y >= h || !(t[x]?.[y] ?? false);
		// View.hx's only wall overhang: the corner offset SIZE+8 (a flat 8px past
		// the 40px cell). Scaled to our cell, that is the single foot line the side
		// strips and the south corners all rest on — nothing is ever stretched.
		const OV = this.cell * (8 / 40);

		// Ground first, then wall edges on top.
		for (let x = 0; x < w; x++) {
			for (let y = 0; y < h; y++) {
				if (wall(x, y)) continue;
				const g = 1 + (this.hash(x, y) % skin.groundCount);
				this.tile(`ground_${skin.ground}_${this.p2(g)}`, x, y);
			}
		}
		// Row by row (top to bottom) so lower cells' pieces draw over higher ones.
		// Mirrors View.hx displayLevel(): every piece is placed at native scale,
		// front rising off the N edge, back hanging off the S edge, the W/E sides
		// and the S corners all resting their foot on the shared line B + OV.
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				if (wall(x, y)) continue;
				const c = this.cell;
				const L = x * c;
				const T = y * c;
				const R = L + c;
				const B = T + c;
				const F = B + OV; // shared foot line for sides + south corners
				const f = 1 + (this.hash(x, y, 7) % skin.frontCount);
				if (wall(x, y - 1)) this.edge(`front_${skin.name}_${this.p2(f)}`, L, T, 0, 1);
				if (wall(x - 1, y)) this.edge(`side_${skin.name}_01`, L, F, 1, 1);
				if (wall(x + 1, y)) this.edge(`side_${skin.name}_01`, R, F, 1, 1, true);
				if (wall(x, y + 1)) this.edge(`back_${skin.name}_01`, L, B, 0, 0);
				if (wall(x, y - 1) && wall(x - 1, y)) this.edge(`corner_${skin.name}_01`, L, T, 1, 1);
				if (wall(x, y - 1) && wall(x + 1, y)) this.edge(`corner_${skin.name}_01`, R, T, 1, 1, true);
				if (wall(x, y + 1) && wall(x - 1, y)) this.edge(`corner_${skin.name}_01`, L, F, 1, 1);
				if (wall(x, y + 1) && wall(x + 1, y)) this.edge(`corner_${skin.name}_01`, R, F, 1, 1, true);
			}
		}
	}

	// ── doors / items / stairs / start / exit ─────────────────────────────────

	private drawEntities(d: DungeonStruct, l: number): void {
		const t = d.levels[l].table;
		const floor = (x: number, y: number): boolean => t[x]?.[y] ?? false;

		for (const room of d.levels[l].rooms) {
			for (const door of room.doors) this.drawDoor(door, floor);
			if (room.item) this.drawItem(room.item.x, room.item.y, room.item.k);
		}

		if (d.start.l === l) this.ring(d.start.x, d.start.y, 0x4caf50);
		if (d.exit.l === l) {
			this.sprite('item_stair_down', d.exit.x, d.exit.y, this.cell * 0.9);
			this.ring(d.exit.x, d.exit.y, 0x9c27b0);
		}
	}

	private drawDoor(door: DungeonDoor, floor: (x: number, y: number) => boolean): void {
		if (door.up === true) {
			this.sprite('item_stair_up', door.x, door.y, this.cell * 0.9);
			return;
		}
		if (door.up === false) {
			this.sprite('item_stair_down', door.x, door.y, this.cell * 0.9);
			return;
		}
		if (door.key != null) {
			const vertical = floor(door.x - 1, door.y) && floor(door.x + 1, door.y);
			this.sprite(vertical ? 'item_door_v_01' : 'item_door_h_01', door.x, door.y, this.cell);
			return;
		}
		// plain passage guarded by a monster
		this.sprite('item_skel', door.x, door.y, this.cell * 0.7);
	}

	private drawItem(x: number, y: number, k: DungeonItem): void {
		switch (k) {
			case DungeonItem.IKey:
				this.sprite('item_key_01', x, y, this.cell * 0.7);
				break;
			case DungeonItem.IGold:
				this.sprite('item_gold', x, y, this.cell * 0.8);
				break;
			case DungeonItem.IHeal:
				this.sprite('item_chest', x, y, this.cell * 0.8);
				break;
			default:
				this.sprite('item_scroll', x, y, this.cell * 0.7);
				break;
		}
	}

	// ── primitives ─────────────────────────────────────────────────────────────

	/** A full-cell tile, optionally mirrored. */
	private tile(name: string, cx: number, cy: number, flipX = false, flipY = false): void {
		const sp = new Sprite(gfx(name));
		sp.anchor.set(0.5);
		const c = this.cell;
		sp.position.set(cx * c + c / 2, cy * c + c / 2);
		sp.scale.set((c / sp.texture.width) * (flipX ? -1 : 1), (c / sp.texture.height) * (flipY ? -1 : 1));
		this.mapLayer.addChild(sp);
	}

	/**
	 * A wall-edge piece, drawn at its native aspect ratio (scaled by `cell / 40`,
	 * the original tile unit) and pinned to a cell edge via `(ax, ay)` anchor.
	 * Mirrors `View.hx`, where walls have real height and overhang the cell.
	 */
	private edge(name: string, px: number, py: number, ax: number, ay: number, flipX = false, flipY = false): void {
		const sp = new Sprite(gfx(name));
		sp.anchor.set(ax, ay);
		const s = this.cell / 40;
		sp.scale.set(s * (flipX ? -1 : 1), s * (flipY ? -1 : 1));
		sp.position.set(px, py);
		this.mapLayer.addChild(sp);
		if (this.debug) this.outlineEdge(name, px, py, ax, ay, s, flipX, flipY, sp.texture.width, sp.texture.height);
	}

	/** Boxes an edge sprite and tags it with its side (front/side/back/corner). */
	private outlineEdge(
		name: string,
		px: number,
		py: number,
		ax: number,
		ay: number,
		s: number,
		flipX: boolean,
		flipY: boolean,
		tw: number,
		th: number
	): void {
		const side = name.split('_')[0];
		const color =
			side === 'front' ? 0xff4444 : side === 'side' ? 0x44ff44 : side === 'back' ? 0x4488ff : 0xffdd00;
		const w = tw * s;
		const h = th * s;
		const minX = px - (flipX ? 1 - ax : ax) * w;
		const minY = py - (flipY ? 1 - ay : ay) * h;
		const g = new Graphics();
		g.lineStyle(1, color, 0.9);
		g.beginFill(color, 0.12);
		g.drawRect(minX, minY, w, h);
		g.endFill();
		this.mapLayer.addChild(g);
		const label = new Text(side, { fill: color, fontSize: 9, fontFamily: 'monospace' });
		label.position.set(minX + 1, minY + 1);
		this.mapLayer.addChild(label);
	}

	/** An aspect-preserving sprite that fits within `size`, centered on a cell. */
	private sprite(name: string, cx: number, cy: number, size: number): void {
		const sp = new Sprite(gfx(name));
		sp.anchor.set(0.5);
		const c = this.cell;
		sp.position.set(cx * c + c / 2, cy * c + c / 2);
		sp.scale.set(size / Math.max(sp.texture.width, sp.texture.height));
		this.mapLayer.addChild(sp);
	}

	private ring(cx: number, cy: number, color: number): void {
		const g = new Graphics();
		const p = this.center(cx, cy);
		const r = this.cell * 0.46;
		g.lineStyle(2, color, 0.95);
		g.beginFill(color, 0.18);
		g.drawCircle(p.x, p.y, r);
		g.endFill();
		this.mapLayer.addChild(g);
	}

	private drawLabel(l: number, skin: Skin): void {
		const label = new Text(`Level ${l + 1} / ${this.d.levels.length} — ${skin.name}`, {
			fill: 0xffffff,
			fontSize: 13,
			fontFamily: 'monospace',
			dropShadow: true,
			dropShadowDistance: 1,
			dropShadowAlpha: 0.8
		});
		label.position.set(6, 6);
		this.mapLayer.addChild(label);
	}

	/** Stable per-cell pseudo-random index. */
	private hash(x: number, y: number, salt = 0): number {
		let v = (Math.imul(x + salt, 73856093) ^ Math.imul(y + salt, 19349663)) >>> 0;
		v ^= v >>> 13;
		return v >>> 0;
	}

	private p2(n: number): string {
		return n < 10 ? `0${n}` : `${n}`;
	}

	destroy(): void {
		this.app.destroy(true, { children: true });
	}
}
