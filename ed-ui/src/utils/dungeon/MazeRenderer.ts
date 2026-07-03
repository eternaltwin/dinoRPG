import { Application, BlurFilter, Container, Graphics, Sprite, Text } from 'pixi.js';
import { SKINS } from '@drpg/core/models/dungeon/DungeonClient';
import type { MazeDims, RendererOptions, RevealedCell, Skin } from '@drpg/core/models/dungeon/DungeonClient';
import { gfx, pad2 } from './dungeonAssets.js';

/**
 * MazeRenderer — draws only the cells the server has revealed.
 *
 * Fog of war: the renderer never sees the layout. It accumulates the cells the
 * backend reveals — {@link MazeRenderer#applyReveal} — and draws only those;
 * every unknown cell stays the skin's fog colour.
 *
 * Per the archive's `View.hx`: walkable cells get a ground tile, and wall edges
 * are composited from front (N), back (S), side (W/E, mirrored) and corner
 * (diagonal, mirrored) pieces of the level's skin, split over two planes so the
 * dinoz is occluded by near walls.
 */
export class MazeRenderer {
	readonly app: Application;
	readonly cell: number;
	readonly actorLayer: Container;
	private readonly mapLayer: Container;
	// View.hx's two wall planes: north faces (front + N corners) sit behind the
	// dinoz; the south/side faces (sides + back + S corners) sit in front of it,
	// so the dinoz is occluded by near walls and walks over far ones.
	private readonly wallBackLayer: Container;
	private readonly wallFrontLayer: Container;
	// Blurred fog plane over unknown cells, topmost — View.hx blurs its fog
	// bitmap (BlurFilter 32px on 40px cells) so fog bleeds ~one cell over the
	// revealed frontier instead of cutting hard at the cell edge.
	private readonly fogLayer: Container;
	// View.hx fx_reveal: a blurred fog-coloured square fading off each freshly
	// revealed cell (addFadeFx — alpha = cos(cpt), cpt += 0.07/frame).
	private readonly fxLayer: Container;
	private readonly fx: { g: Graphics; cpt: number }[] = [];
	private readonly viewW: number;
	private readonly viewH: number;
	private readonly dims: MazeDims;
	/** Everything the server has revealed so far, per level, keyed "x,y". */
	private readonly known: Map<string, RevealedCell>[];
	private skins: Skin[];
	private level = 0;
	private debug = false;
	// Overground zone noise (View.hx initZones): purely decorative, so — like the
	// original's Std.random(9999) seed — it's random per entry, not per run.
	private readonly noiseSeed = (Math.random() * 0x7fffffff) | 0;
	/** Cached zone id (0..2) per cell, one grid per level. */
	private readonly zones = new Map<number, Uint8Array>();

	constructor(parent: HTMLElement, dims: MazeDims, opts: RendererOptions = {}) {
		this.cell = opts.cell ?? 24;
		this.dims = dims;
		this.known = Array.from({ length: dims.levels }, () => new Map<string, RevealedCell>());
		this.skins = opts.skins && opts.skins.length > 0 ? opts.skins : [SKINS[0]];
		this.viewW = opts.view?.w ?? dims.width * this.cell;
		this.viewH = opts.view?.h ?? dims.height * this.cell;
		this.app = new Application({
			width: this.viewW,
			height: this.viewH,
			background: this.skinFor(0).fog,
			antialias: false
		});
		parent.appendChild(this.app.view as HTMLCanvasElement);

		this.mapLayer = new Container();
		this.wallBackLayer = new Container();
		this.actorLayer = new Container();
		this.actorLayer.sortableChildren = true; // leader (zIndex 1) draws over followers
		this.wallFrontLayer = new Container();
		this.fogLayer = new Container();
		this.fxLayer = new Container();
		this.app.stage.addChild(
			this.mapLayer,
			this.wallBackLayer,
			this.actorLayer,
			this.wallFrontLayer,
			this.fogLayer,
			this.fxLayer
		);
		this.app.ticker.add(this.updateFx, this);

		this.showLevel(0);
	}

	get currentLevel(): number {
		return this.level;
	}
	get levelCount(): number {
		return this.dims.levels;
	}

	/** Fold newly revealed cells into the known map; redraw if any are visible. */
	applyReveal(cells: RevealedCell[]): void {
		let dirty = false;
		for (const c of cells) {
			const level = this.known[c.l];
			if (!level) continue;
			const isNew = !level.has(`${c.x},${c.y}`);
			level.set(`${c.x},${c.y}`, c);
			if (c.l === this.level) {
				dirty = true;
				if (isNew) this.revealFx(c.x, c.y);
			}
		}
		if (dirty) this.showLevel(this.level);
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
		const worldW = this.dims.width * this.cell;
		const worldH = this.dims.height * this.cell;
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

	showLevel(l: number): void {
		const lv = Math.max(0, Math.min(l, this.dims.levels - 1));
		if (lv !== this.level) this.clearFx(); // fades belong to the level they started on
		this.level = lv;
		const skin = this.skinFor(this.level);
		this.app.renderer.background.color = skin.fog;
		this.mapLayer.removeChildren();
		this.wallBackLayer.removeChildren();
		this.wallFrontLayer.removeChildren();
		this.fogLayer.removeChildren();
		this.drawLevel(skin);
		this.drawEntities();
		this.drawFog(skin);
		this.drawLabel(this.level, skin);
	}

	// ── tiles ────────────────────────────────────────────────────────────────

	private drawLevel(skin: Skin): void {
		const known = this.known[this.level];
		const w = this.dims.width;
		const h = this.dims.height;
		const at = (x: number, y: number): RevealedCell | undefined => known.get(`${x},${y}`);
		const floor = (x: number, y: number): boolean => at(x, y)?.floor === true;
		// Fog three-state: only a *known* wall (or the map border) grows wall
		// pieces. An unknown neighbour draws nothing — it is still fog.
		const wall = (x: number, y: number): boolean => x < 0 || y < 0 || x >= w || y >= h || at(x, y)?.floor === false;
		// View.hx's only wall overhang: the corner offset SIZE+8 (a flat 8px past
		// the 40px cell). Scaled to our cell, that is the single foot line the side
		// strips and the south corners all rest on — nothing is ever stretched.
		const OV = this.cell * (8 / 40);

		// Ground first, then overground decoration, then wall edges on top.
		for (const c of known.values()) {
			if (!c.floor) continue;
			const g = 1 + (this.hash(c.x, c.y) % skin.groundCount);
			this.tile(`ground_${skin.ground}_${pad2(g)}`, c.x, c.y);
			for (const mid of [1, 2]) {
				const over = skin.over[mid - 1];
				if (!over) continue;
				const val = this.overVal(mid, c.x, c.y);
				// ponytail: skipped View.hx's GlowFilter(0x0,0.7,2,2) outline on the
				// overground plane — needs pixi-filters; add if the overlays look flat.
				if (val > 0) this.tile(`overground_${over}_${pad2(val)}`, c.x, c.y);
			}
		}
		// Row by row (top to bottom) so lower cells' pieces draw over higher ones.
		// Mirrors View.hx displayLevel(): every piece is placed at native scale,
		// front rising off the N edge, back hanging off the S edge, the W/E sides
		// and the S corners all resting their foot on the shared line B + OV.
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				if (!floor(x, y)) continue;
				const c = this.cell;
				const L = x * c;
				const T = y * c;
				const R = L + c;
				const B = T + c;
				const F = B + OV; // shared foot line for sides + south corners
				const f = 1 + (this.hash(x, y, 7) % skin.frontCount);
				const back = this.wallBackLayer; // behind the dinoz (north faces)
				const front = this.wallFrontLayer; // in front of the dinoz (near faces)
				if (wall(x, y - 1)) this.edge(`front_${skin.name}_${pad2(f)}`, L, T, 0, 1, false, false, back);
				if (wall(x - 1, y)) this.edge(`side_${skin.name}_01`, L, F - 9, 1, 1, false, false, front);
				if (wall(x + 1, y)) this.edge(`side_${skin.name}_01`, R, F - 9, 1, 1, true, false, front);
				if (wall(x, y + 1)) this.edge(`back_${skin.name}_01`, L, B - 21, 0, 0, false, false, front);
				if (wall(x, y - 1) && wall(x - 1, y)) this.edge(`corner_${skin.name}_01`, L, T, 1, 1, false, false, back);
				if (wall(x, y - 1) && wall(x + 1, y)) this.edge(`corner_${skin.name}_01`, R, T, 1, 1, true, false, back);
				if (wall(x, y + 1) && wall(x - 1, y)) this.edge(`corner_${skin.name}_01`, L, F, 1, 1, false, false, front);
				if (wall(x, y + 1) && wall(x + 1, y)) this.edge(`corner_${skin.name}_01`, R, F, 1, 1, true, false, front);
			}
		}
	}

	// ── overground decoration (View.hx getOverMap / initZones) ────────────────
	//
	// Two overlay themes per skin, painted over the ground by zone noise: a cell
	// whose zone id reaches the layer's threshold gets the full tile (15); a cell
	// bordering such a zone gets the matching edge piece, picked by a corner
	// bitmask (8=NW 4=NE 2=SW 1=SE) built from its 8 neighbours.

	/** Frame 1..15 of overlay `mid` for cell (x,y), or 0 for nothing. */
	private overVal(mid: number, x: number, y: number): number {
		const z = this.zoneIds(this.level);
		const w = this.dims.width;
		const h = this.dims.height;
		const id = (cx: number, cy: number): number =>
			z[Math.max(0, Math.min(cx, w - 1)) * h + Math.max(0, Math.min(cy, h - 1))];
		if (id(x, y) >= mid) return 15;
		let val = 0;
		if (id(x - 1, y - 1) >= mid) val |= 8;
		if (id(x, y - 1) >= mid) val |= 12;
		if (id(x + 1, y - 1) >= mid) val |= 4;
		if (id(x - 1, y) >= mid) val |= 10;
		if (id(x + 1, y) >= mid) val |= 5;
		if (id(x - 1, y + 1) >= mid) val |= 2;
		if (id(x, y + 1) >= mid) val |= 3;
		if (id(x + 1, y + 1) >= mid) val |= 1;
		return val;
	}

	/**
	 * Zone id (0..2) per cell for one level. View.hx thresholds Flash perlinNoise
	 * into three bands; we bilerp a seeded value-noise lattice instead.
	 * // ponytail: one octave where the original used up to four — same blobby
	 * // zones, add octaves only if the patches look too round.
	 */
	private zoneIds(l: number): Uint8Array {
		let z = this.zones.get(l);
		if (z) return z;
		const skin = this.skinFor(l);
		const w = this.dims.width;
		const h = this.dims.height;
		const step = skin.perlin === 'dense' ? 5 : 7; // lattice period, cells (View.hx base 5/5 vs 7/7)
		const lo = skin.perlin === 'few' ? 60 : 85;
		const hi = skin.perlin === 'few' ? 75 : 115;
		const lat = (ix: number, iy: number): number => {
			let v = (Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ this.noiseSeed ^ Math.imul(l + 1, 2246822519)) >>> 0;
			v = Math.imul(v ^ (v >>> 13), 1274126177);
			return ((v ^ (v >>> 16)) >>> 0) % 256;
		};
		z = new Uint8Array(w * h);
		for (let x = 0; x < w; x++) {
			for (let y = 0; y < h; y++) {
				const ix = Math.floor(x / step);
				const iy = Math.floor(y / step);
				const tx = x / step - ix;
				const ty = y / step - iy;
				const u = tx * tx * (3 - 2 * tx);
				const v = ty * ty * (3 - 2 * ty);
				const a = lat(ix, iy);
				const n = a + (lat(ix + 1, iy) - a) * u + (lat(ix, iy + 1) - a) * v + (a + lat(ix + 1, iy + 1) - lat(ix + 1, iy) - lat(ix, iy + 1)) * u * v;
				z[x * h + y] = n < lo ? 2 : n < hi ? 1 : 0;
			}
		}
		this.zones.set(l, z);
		return z;
	}

	/**
	 * Fog plane: one rect per unknown cell in the skin's fog colour, blurred as
	 * in View.hx (32px on 40px cells). The background already IS the fog colour,
	 * so only the outward bleed shows — fog softly overlaps ~one cell of the
	 * revealed frontier.
	 */
	private drawFog(skin: Skin): void {
		const known = this.known[this.level];
		const g = new Graphics();
		g.beginFill(skin.fog);
		const c = this.cell;
		const isKnown = (x: number, y: number): boolean => known.has(`${x},${y}`);
		for (let y = 0; y < this.dims.height; y++)
			for (let x = 0; x < this.dims.width; x++) {
				if (isKnown(x, y)) continue;
				g.drawRect(x * c, y * c, c, c);
				// Organic frontier: bulge hash-jittered circles into each revealed
				// neighbour so the blurred edge reads as clouds, not a ruler line.
				for (const [dx, dy] of [
					[1, 0],
					[-1, 0],
					[0, 1],
					[0, -1]
				]) {
					if (!isKnown(x + dx, y + dy)) continue;
					const h = this.hash(x * 4 + dx, y * 4 + dy, 11);
					const r = c * (0.35 + (h % 100) / 300); // 0.35..0.68 cell
					const t = c * ((((h >> 7) % 100) / 100 - 0.5) * 0.8); // slide along the shared edge
					g.drawCircle((x + 0.5 + dx * 0.5) * c + dy * t, (y + 0.5 + dy * 0.5) * c + dx * t, r);
				}
			}
		g.endFill();
		g.filters = [new BlurFilter(this.cell * (32 / 40))];
		this.fogLayer.addChild(g);
	}

	/** View.hx's fx_reveal: blurred fog square over the cell, fading out. */
	private revealFx(x: number, y: number): void {
		const g = new Graphics();
		g.beginFill(this.skinFor(this.level).fog);
		g.drawRect(x * this.cell, y * this.cell, this.cell, this.cell);
		g.endFill();
		g.filters = [new BlurFilter(this.cell * (32 / 40))];
		this.fxLayer.addChild(g);
		this.fx.push({ g, cpt: 0 });
	}

	private updateFx(dt: number): void {
		for (let i = this.fx.length - 1; i >= 0; i--) {
			const f = this.fx[i];
			f.cpt += 0.045 * dt; // View.hx: cpt += 0.07/frame at the swf's 40fps
			f.g.alpha = Math.cos(f.cpt);
			// ponytail: original kept fx until cpt >= π with negative (invisible) alpha; drop at π/2, same look.
			if (f.cpt >= Math.PI / 2) {
				f.g.destroy();
				this.fx.splice(i, 1);
			}
		}
	}

	private clearFx(): void {
		for (const f of this.fx) f.g.destroy();
		this.fx.length = 0;
	}

	// ── revealed entities (icons the server sent along with the cells) ────────

	private drawEntities(): void {
		for (const c of this.known[this.level].values()) {
			if (!c.icon) continue;
			this.drawIcon(c);
		}
	}

	private drawIcon(c: RevealedCell): void {
		switch (c.icon) {
			case 'start':
				this.ring(c.x, c.y, 0x4caf50);
				break;
			case 'exit':
				this.sprite('item_stair_down', c.x, c.y, this.cell * 0.9);
				this.ring(c.x, c.y, 0x9c27b0);
				break;
			case 'stair_up':
				this.sprite('item_stair_up', c.x, c.y, this.cell * 0.9);
				break;
			case 'stair_down':
				this.sprite('item_stair_down', c.x, c.y, this.cell * 0.9);
				break;
			case 'door_v':
			case 'door_h':
				this.sprite(c.icon === 'door_v' ? 'item_door_v_01' : 'item_door_h_01', c.x, c.y, this.cell);
				break;
			case 'monster':
				this.sprite('item_skel', c.x, c.y, this.cell * 0.7);
				break;
			case 'key':
				this.sprite('item_key_01', c.x, c.y, this.cell * 0.7);
				break;
			case 'gold':
				this.sprite('item_gold', c.x, c.y, this.cell * 0.8);
				break;
			case 'heal':
				this.sprite('item_chest', c.x, c.y, this.cell * 0.8);
				break;
			default:
				this.sprite('item_scroll', c.x, c.y, this.cell * 0.7);
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
	private edge(
		name: string,
		px: number,
		py: number,
		ax: number,
		ay: number,
		flipX = false,
		flipY = false,
		layer: Container = this.mapLayer
	): void {
		const sp = new Sprite(gfx(name));
		if (name === 'front_egypt_06') {
			py += 7;
		}
		sp.anchor.set(ax, ay);
		const s = this.cell / 40;
		sp.scale.set(s * (flipX ? -1 : 1), s * (flipY ? -1 : 1));
		sp.position.set(px, py);
		layer.addChild(sp);
		if (this.debug) this.outlineEdge(name, px, py, ax, ay, s, flipX, flipY, sp.texture.width, sp.texture.height, layer);
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
		th: number,
		layer: Container
	): void {
		const side = name.split('_')[0];
		const color = side === 'front' ? 0xff4444 : side === 'side' ? 0x44ff44 : side === 'back' ? 0x4488ff : 0xffdd00;
		const w = tw * s;
		const h = th * s;
		const minX = px - (flipX ? 1 - ax : ax) * w;
		const minY = py - (flipY ? 1 - ay : ay) * h;
		const g = new Graphics();
		g.lineStyle(1, color, 0.9);
		g.beginFill(color, 0.12);
		g.drawRect(minX, minY, w, h);
		g.endFill();
		layer.addChild(g);
		const label = new Text(side, { fill: color, fontSize: 9, fontFamily: 'monospace' });
		label.position.set(minX + 1, minY + 1);
		layer.addChild(label);
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
		const label = new Text(`Level ${l + 1} / ${this.dims.levels} — ${skin.name}`, {
			fill: 0xffffff,
			fontSize: 13,
			fontFamily: 'monospace',
			dropShadow: true,
			dropShadowDistance: 1,
			dropShadowAlpha: 0.8
		});
		label.position.set(6, 6);
		this.fogLayer.addChild(label);
	}

	/** Stable per-cell pseudo-random index. */
	private hash(x: number, y: number, salt = 0): number {
		let v = (Math.imul(x + salt, 73856093) ^ Math.imul(y + salt, 19349663)) >>> 0;
		v ^= v >>> 13;
		return v >>> 0;
	}

	destroy(): void {
		this.app.destroy(true, { children: true });
	}
}
