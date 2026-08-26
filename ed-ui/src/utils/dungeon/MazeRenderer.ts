import { Application, BlurFilter, Container, Graphics, Sprite, Text } from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';
import { DropShadowFilter } from '@pixi/filter-drop-shadow';
// @ts-expect-error smonster is missing from the package's sdino.d.ts typings.
import { smonster } from '@eternaltwin/dinorpg_animations';
import { KEY_SKIN_COUNT, SKINS } from '@drpg/core/models/dungeon/DungeonClient';
import type { MazeDims, RendererOptions, RevealedCell, Skin } from '@drpg/core/models/dungeon/DungeonClient';
import { gfx, pad2 } from './dungeonAssets.js';

/** The slice of smonster (a Pixi Container) we use — the published typings omit it. */
type SMonster = Container & { collider: { width: number; height: number }; playing: boolean };

/**
 * Draws only the cells the server has revealed ({@link MazeRenderer#applyReveal});
 * unknown cells stay the skin's fog colour. Wall edges are composited from the
 * skin's front/back/side/corner pieces, split over two planes so the dinoz is
 * occluded by near walls.
 */
export class MazeRenderer {
	readonly app: Application;
	readonly cell: number;
	readonly actorLayer: Container;
	/** Ground + overground tiles only, kept apart from mapLayer so the filters below miss icons/monsters. */
	private readonly groundLayer: Container;
	private readonly mapLayer: Container;
	/** North faces, behind the dinoz. */
	private readonly wallBackLayer: Container;
	/** South/side faces, in front of the dinoz. */
	private readonly wallFrontLayer: Container;
	/** Per-skin atmosphere wash over the whole level. */
	private readonly maskLayer: Container;
	/** Blurred fog plane over unknown cells. */
	private readonly fogLayer: Container;
	/** Fade-out squares on freshly revealed cells. */
	private readonly fxLayer: Container;
	private readonly fx: { g: Graphics; cpt: number }[] = [];
	private readonly viewW: number;
	private readonly viewH: number;
	private readonly dims: MazeDims;
	private readonly sharedFxBlur: BlurFilter;
	/** Everything the server has revealed so far, per level, keyed "x * height + y". */
	private readonly known: Map<number, RevealedCell>[];
	private skins: Skin[];
	private level = 0;
	private debug = false;
	private dirty = false;
	/** Overground zone noise seed — key it to the dungeon id to keep decoration stable across refreshes. */
	private readonly noiseSeed: number;
	/** Cached zone id (0..2) per cell, one grid per level. */
	private readonly zones = new Map<number, Uint8Array>();
	/** Animated monster sprites, keyed "l,x,y" — created once, re-attached on each level redraw. */
	private readonly monsterSprites = new Map<string, SMonster>();
	/** The open message box, if any. */
	private msgBox: Container | null = null;
	/** Eased camera position in world px; NaN until the first focus(), which snaps. */
	private camX = NaN;
	private camY = NaN;

	private layerCachePending = false;
	private fogDirty = true;

	constructor(parent: HTMLElement, dims: MazeDims, opts: RendererOptions = {}) {
		this.cell = opts.cell ?? 24;
		this.noiseSeed = opts.noiseSeed ?? (Math.random() * 0x7fffffff) | 0;
		this.dims = dims;
		this.known = Array.from({ length: dims.levels }, () => new Map<number, RevealedCell>());
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

		this.groundLayer = new Container();
		this.mapLayer = new Container();
		this.wallBackLayer = new Container();
		this.actorLayer = new Container();
		this.actorLayer.sortableChildren = true; // leader (zIndex 1) draws over followers
		this.wallFrontLayer = new Container();
		this.maskLayer = new Container();
		this.fogLayer = new Container();
		this.fxLayer = new Container();
		this.app.stage.addChild(
			this.groundLayer,
			this.mapLayer,
			this.wallBackLayer,
			this.actorLayer,
			this.wallFrontLayer,
			this.maskLayer,
			this.fogLayer,
			this.fxLayer
		);
		// Ground post-processing: drop shadow + dark inner glow (occlusion) + muted outer glow (tint).
		const s = this.cell / 40;
		this.groundLayer.filters = [
			new DropShadowFilter({ offset: { x: 15 * s, y: 0 }, color: 0x000000, alpha: 0.3, blur: 3 * s, quality: 2 }),
			new GlowFilter({
				distance: 64 * s,
				innerStrength: 2,
				outerStrength: 0,
				color: 0x000000,
				alpha: 0.35,
				quality: 0.2
			}),
			new GlowFilter({
				distance: 64 * s,
				outerStrength: 2,
				innerStrength: 0,
				color: 0x72525b,
				alpha: 0.6,
				quality: 0.2
			})
		];
		this.sharedFxBlur = new BlurFilter(this.fogBlur, 2);
		this.app.ticker.add(this.updateFx, this);

		this.showLevel(0);
	}

	get currentLevel(): number {
		return this.level;
	}
	get levelCount(): number {
		return this.dims.levels;
	}

	/**
	 * Fold newly revealed cells into the known map; redraw if any are visible.
	 * `origin` is the player's cell *after* the move — it orients each fade-fx
	 * away from the player. Omit it for an axis-aligned fade.
	 */
	applyReveal(cells: RevealedCell[], origin?: { x: number; y: number }): void {
		let dirty = false;
		for (const c of cells) {
			const level = this.known[c.l];
			if (!level) continue;
			const isNew = !level.has(this.key(c.x, c.y));
			if (!c.monster) {
				// Team defeated since last reveal.
				const stale = this.monsterSprites.get(`${c.l},${c.x},${c.y}`);
				if (stale) {
					this.retireMonster(stale);
					this.monsterSprites.delete(`${c.l},${c.x},${c.y}`);
				}
			}
			level.set(this.key(c.x, c.y), c);
			if (c.l === this.level) {
				dirty = true;
				if (isNew) {
					// Only mark the fog dirty when a cell is new.
					this.fogDirty = true;
					this.revealFx(c.x, c.y, origin);
				}
			}
		}
		if (dirty) this.dirty = true;
	}

	/** Pixel center of cell (x, y). */
	center(x: number, y: number): { x: number; y: number } {
		return { x: x * this.cell + this.cell / 2, y: y * this.cell + this.cell / 2 };
	}

	/**
	 * Keep world point (px, py) centered, easing 10% per call toward it and
	 * clamped to the map bounds. Snaps on the first call so entering a level
	 * doesn't fly the camera in from a corner.
	 */
	focus(px: number, py: number): void {
		const worldW = this.dims.width * this.cell;
		const worldH = this.dims.height * this.cell;
		const clampX = (v: number): number => Math.max(0, Math.min(v, Math.max(0, worldW - this.viewW)));
		const clampY = (v: number): number => Math.max(0, Math.min(v, Math.max(0, worldH - this.viewH)));
		const targetX = clampX(px - this.viewW / 2);
		const targetY = clampY(py - this.viewH / 2);
		this.camX = Number.isNaN(this.camX) ? targetX : this.camX + (targetX - this.camX) * 0.1;
		this.camY = Number.isNaN(this.camY) ? targetY : this.camY + (targetY - this.camY) * 0.1;
		this.app.stage.position.set(-this.camX, -this.camY);
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
		this.groundLayer.removeChildren();
		this.mapLayer.removeChildren();
		this.wallBackLayer.removeChildren();
		this.wallFrontLayer.removeChildren();
		this.maskLayer.removeChildren();
		this.drawLevel(skin);
		this.drawEntities();
		this.drawMask(skin);

		// Show fog only if it needs an update
		if (this.fogDirty) {
			this.fogDirty = false;
			this.fogLayer.cacheAsBitmap = false;
			this.fogLayer.removeChildren();
			this.drawFog(skin);
		}
		// Defer cache as bitmap to the top of the following tick
		this.layerCachePending = true;
	}

	// ── tiles ────────────────────────────────────────────────────────────────

	private drawLevel(skin: Skin): void {
		const known = this.known[this.level];
		const w = this.dims.width;
		const h = this.dims.height;
		const at = (x: number, y: number): RevealedCell | undefined => known.get(this.key(x, y));
		const floor = (x: number, y: number): boolean => at(x, y)?.floor === true;
		// Only a known wall (or the map border) grows wall pieces; an unknown neighbour is still fog.
		const wall = (x: number, y: number): boolean => x < 0 || y < 0 || x >= w || y >= h || at(x, y)?.floor === false;
		// The single foot line the side strips and south corners rest on: 8px past the 40px cell, scaled.
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
				// ponytail: skipped the original's outline glow on overgrounds; add if they look flat.
				if (val > 0) this.tile(`overground_${over}_${pad2(val)}`, c.x, c.y);
			}
		}
		// Row by row so lower cells' pieces draw over higher ones. Every piece is placed at
		// native scale: front rises off the N edge, back hangs off the S edge, sides and S
		// corners rest their foot on B + OV.
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				if (!floor(x, y)) continue;
				const c = this.cell;
				const L = x * c;
				const T = y * c;
				const R = L + c;
				const B = T + c;
				const F = B + OV; // shared foot line
				const f = 1 + (this.hash(x, y, 7) % skin.frontCount);
				const back = this.wallBackLayer;
				const front = this.wallFrontLayer;
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

	// ── overground decoration ─────────────────────────────────────────────────
	//
	// Two overlay themes per skin, painted by zone noise: a cell whose zone id reaches the
	// layer's threshold gets the full tile (15); a bordering cell gets the edge piece picked
	// by a corner bitmask (8=NW 4=NE 2=SW 1=SE) over its 8 neighbours.

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
	 * Zone id (0..2) per cell for one level: a seeded value-noise lattice, bilerped
	 * and thresholded into three bands.
	 * ponytail: one octave where the original used four — add more if patches look too round.
	 */
	private zoneIds(l: number): Uint8Array {
		let z = this.zones.get(l);
		if (z) return z;
		const skin = this.skinFor(l);
		const w = this.dims.width;
		const h = this.dims.height;
		const step = skin.perlin === 'dense' ? 5 : 7; // lattice period, in cells
		const lo = skin.perlin === 'few' ? 60 : 85;
		const hi = skin.perlin === 'few' ? 75 : 115;
		const lat = (ix: number, iy: number): number => {
			let v =
				(Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ this.noiseSeed ^ Math.imul(l + 1, 2246822519)) >>> 0;
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
				const n =
					a +
					(lat(ix + 1, iy) - a) * u +
					(lat(ix, iy + 1) - a) * v +
					(a + lat(ix + 1, iy + 1) - lat(ix + 1, iy) - lat(ix, iy + 1)) * u * v;
				z[x * h + y] = n < lo ? 2 : n < hi ? 1 : 0;
			}
		}
		this.zones.set(l, z);
		return z;
	}

	/**
	 * A fog-tinted wash over the whole level, strength scaled by skin.mask (0..100).
	 * ponytail: the original used a vignette graphic we don't have — flat rect capped at
	 * an 18% tint so it reads as atmosphere; raise MASK_MAX if a real asset replaces it.
	 */
	private drawMask(skin: Skin): void {
		if (skin.mask <= 0) return;
		const MASK_MAX = 0.18;
		const g = new Graphics();
		g.beginFill(skin.fog, (skin.mask / 100) * MASK_MAX);
		g.drawRect(0, 0, this.dims.width * this.cell, this.dims.height * this.cell);
		g.endFill();
		this.maskLayer.addChild(g);
	}

	/** Fog/reveal-fx blur radius — tuned stronger than the original's 32/40px, Pixi's blur falls off faster. */
	private get fogBlur(): number {
		return this.cell * 1.2;
	}

	/** Cell key; unique as long as y < height. */
	private key(x: number, y: number): number {
		return x * this.dims.height + y;
	}

	/**
	 * One jittered circle per unknown cell rather than a rect: circles always overlap their
	 * neighbours, so the union is a round blob and the blur has no square corners to soften.
	 */
	private drawFog(skin: Skin): void {
		const known = this.known[this.level];
		const isKnown = (x: number, y: number): boolean => known.has(this.key(x, y));
		const c = this.cell;
		const g = new Graphics();
		g.beginFill(skin.fog);
		for (let y = 0; y < this.dims.height; y++)
			for (let x = 0; x < this.dims.width; x++) {
				if (isKnown(x, y)) continue;
				const h = this.hash(x, y, 11);
				const r = c * 1.75;
				const ox = c * (((h >> 6) % 100) / 100 - 0.5) * 0.3;
				const oy = c * (((h >> 12) % 100) / 100 - 0.5) * 0.3;
				g.drawCircle((x + 0.5) * c + ox, (y + 0.5) * c + oy, r);
			}
		g.endFill();
		g.filters = [this.sharedFxBlur];
		this.fogLayer.addChild(g);
	}

	/** Blurred fog square over the cell, fading out, oriented away from `origin` (the player's cell). */
	private revealFx(x: number, y: number, origin?: { x: number; y: number }): void {
		const g = new Graphics();
		g.beginFill(this.skinFor(this.level).fog);
		g.drawRect(-this.cell / 2, -this.cell / 2, this.cell, this.cell);
		g.endFill();
		const p = this.center(x, y);
		g.position.set(p.x, p.y);
		if (origin) g.rotation = Math.atan2(origin.y - y, origin.x - x);
		g.filters = [this.sharedFxBlur];
		this.fxLayer.addChild(g);
		this.fx.push({ g, cpt: 0 });
	}

	private updateFx(dt: number): void {
		if (this.layerCachePending) {
			this.layerCachePending = false;
			this.groundLayer.cacheAsBitmap = true;
			this.wallBackLayer.cacheAsBitmap = true;
			this.wallFrontLayer.cacheAsBitmap = true;
			this.fogLayer.cacheAsBitmap = true;
		}
		if (this.dirty) {
			this.dirty = false;
			// Ticker listeners share no error isolation: an uncaught throw here stops it
			// requesting further frames and silently freezes the whole canvas.
			try {
				this.showLevel(this.level);
			} catch (err) {
				console.error('MazeRenderer: showLevel failed', err);
			}
		}
		for (let i = this.fx.length - 1; i >= 0; i--) {
			const f = this.fx[i];
			f.cpt += 0.045 * dt;
			f.g.alpha = Math.cos(f.cpt);
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

	// ── message box ──────────────────────────────────────────────────────────

	get messageOpen(): boolean {
		return this.msgBox != null;
	}

	closeMessage(): void {
		this.msgBox?.destroy({ children: true });
		this.msgBox = null;
	}

	/**
	 * A panel framed with the msgbox_* tiles (23px top/bottom strips, 41px sides, corners over
	 * them), centered in the view with an optional icon on the top border. A click dismisses it;
	 * the page blocks movement while one is open.
	 */
	showMessage(text: string, icon?: string): void {
		this.closeMessage();
		const pad = 8;
		const w = 320;
		const label = new Text(text, {
			fill: 0xf5deb0,
			fontSize: text.length <= 100 ? 20 : 13,
			fontFamily: 'Verdana, sans-serif',
			wordWrap: true,
			wordWrapWidth: w - pad * 2
		});
		const h = Math.max(50, label.height + pad * 2.5);
		const x = (this.viewW - w) / 2;
		const y = (this.viewH - h) / 2;
		const box = new Container();
		// Undo the stage scroll so the box is view-fixed.
		box.position.set(-this.app.stage.position.x, -this.app.stage.position.y);
		const g = new Graphics();
		g.beginFill(0x4d1e10);
		g.drawRect(x, y, w, h);
		g.endFill();
		box.addChild(g);
		const part = (name: string, px: number, py: number, ax = 0, ay = 0): void => {
			const sp = new Sprite(gfx(name));
			sp.anchor.set(ax, ay);
			sp.position.set(px, py);
			box.addChild(sp);
		};
		for (let i = 1; i < Math.floor(w / 23); i++) {
			part('msgbox_top', x + i * 23, y);
			part('msgbox_bottom', x + i * 23, y + h, 0, 1);
		}
		for (let i = 1; i < Math.floor(h / 41); i++) {
			part('msgbox_left', x, y + i * 41);
			part('msgbox_right', x + w, y + i * 41, 1, 0);
		}
		part('msgbox_topleft', x, y);
		part('msgbox_topright', x + w, y, 1, 0);
		part('msgbox_bottomleft', x, y + h, 0, 1);
		part('msgbox_bottomright', x + w, y + h, 1, 1);
		if (icon) {
			const sp = new Sprite(gfx(icon));
			sp.anchor.set(0.5);
			sp.position.set(x + w / 2, y - 5);
			box.addChild(sp);
		}
		label.position.set(x + pad, y + pad);
		box.addChild(label);
		box.filters = [
			new GlowFilter({ distance: 32, outerStrength: 2, innerStrength: 0, color: 0x000000, alpha: 0.7, quality: 0.2 })
		];
		box.eventMode = 'static';
		box.cursor = 'pointer';
		box.on('pointerdown', () => this.closeMessage());
		this.app.stage.addChild(box);
		this.msgBox = box;
	}

	// ── revealed entities ────────────────────────────────────────────────────

	private drawEntities(): void {
		for (const c of this.known[this.level].values()) {
			if (!c.icon) continue;
			this.drawIcon(c);
		}
	}

	private drawIcon(c: RevealedCell): void {
		// key_<n>: skins cycle so every key in a maze looks distinct.
		if (c.icon?.startsWith('key_')) {
			const v = Number(c.icon.slice(4));
			this.sprite(`item_key_${pad2(((v - 1) % KEY_SKIN_COUNT) + 1)}`, c.x, c.y, this.cell * 0.7);
			return;
		}
		switch (c.icon) {
			case 'start':
			case 'exit':
			case 'stair_up':
				this.sprite('item_stair_up', c.x, c.y - 0.4, this.cell * 1.2);
				break;
			case 'stair_down':
				this.sprite('item_stair_down', c.x, c.y - 0.4, this.cell * 0.9);
				break;
			case 'door_v':
			case 'door_h':
				this.sprite(`item_${c.icon}_01`, c.x, c.y, this.cell * 1.3);
				break;
			case 'door_v_open':
			case 'door_h_open':
				this.sprite(`item_${c.icon}`, c.x, c.y, this.cell * 1.3);
				break;
			case 'monster':
				if (c.monster) this.monsterAt(c);
				else this.sprite('item_skel', c.x, c.y, this.cell * 0.8);
				break;
			case 'gold':
				this.sprite('item_gold', c.x, c.y, this.cell * 0.8);
				break;
			case 'heal':
				this.sprite('item_heal', c.x, c.y, this.cell * 0.8);
				break;
			case 'chest':
				this.sprite('item_chest', c.x, c.y, this.cell * 0.8);
				break;
			default:
				this.sprite('item_scroll', c.x, c.y, this.cell * 0.7);
				break;
		}
	}

	/** The team's first monster, standing (animated) on its cell. */
	private monsterAt(c: RevealedCell): void {
		const key = `${c.l},${c.x},${c.y}`;
		let m = this.monsterSprites.get(key);
		if (!m) {
			m = new smonster({ type: c.monster, pflag: true }) as SMonster;
			m.scale.set((this.cell * 2) / 90);
			this.monsterSprites.set(key, m);
		}
		const p = this.center(c.x, c.y);
		m.position.set(p.x, p.y + this.cell * 0.25);
		this.mapLayer.addChild(m);
	}

	// ── primitives ─────────────────────────────────────────────────────────────

	/** A full-cell ground/overground tile, optionally mirrored. */
	private tile(name: string, cx: number, cy: number, flipX = false, flipY = false): void {
		const sp = new Sprite(gfx(name));
		sp.anchor.set(0.5);
		const c = this.cell;
		sp.position.set(cx * c + c / 2, cy * c + c / 2);
		sp.scale.set((c / sp.texture.width) * (flipX ? -1 : 1), (c / sp.texture.height) * (flipY ? -1 : 1));
		this.groundLayer.addChild(sp);
	}

	/**
	 * A wall-edge piece at its native aspect ratio (scaled by `cell / 40`, the original tile
	 * unit) and pinned to a cell edge via the `(ax, ay)` anchor. Walls overhang their cell.
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

	/** Stable per-cell pseudo-random index. */
	private hash(x: number, y: number, salt = 0): number {
		let v = (Math.imul(x + salt, 73856093) ^ Math.imul(y + salt, 19349663)) >>> 0;
		v ^= v >>> 13;
		return v >>> 0;
	}

	/**
	 * The smonster Animator leaks a Ticker.shared listener it never detaches (same as sdino,
	 * see DinozActor.destroy). Freeze before destroying so the leaked listener no-ops.
	 */
	private retireMonster(m: SMonster): void {
		m.playing = false;
		m.destroy({ children: true });
	}

	destroy(): void {
		// Sprites on other levels are detached from the stage, so app.destroy would miss them.
		for (const m of this.monsterSprites.values()) this.retireMonster(m);
		this.monsterSprites.clear();
		this.app.destroy(true, { children: true });
	}
}