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
	// Ground + overground tiles only (View.hx's groundBitmap raster) — kept apart
	// from mapLayer's icons/monsters so the ground-only filter stack below doesn't
	// touch them, matching View.hx which never filters its item/monster clips.
	private readonly groundLayer: Container;
	private readonly mapLayer: Container;
	// View.hx's two wall planes: north faces (front + N corners) sit behind the
	// dinoz; the south/side faces (sides + back + S corners) sit in front of it,
	// so the dinoz is occluded by near walls and walks over far ones.
	private readonly wallBackLayer: Container;
	private readonly wallFrontLayer: Container;
	// Per-skin atmosphere wash (View.hx skin.mask) — a flat fog-tinted rect over
	// the whole level, above the map but below the fog-of-war unknown-cell fog.
	private readonly maskLayer: Container;
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
	private readonly sharedFxBlur: BlurFilter;
	/** Everything the server has revealed so far, per level, keyed "x,y". */
	private readonly known: Map<string, RevealedCell>[];
	private skins: Skin[];
	private level = 0;
	private debug = false;
	// Overground zone noise (View.hx initZones). Seeded from opts so the caller
	// can key it to the dungeon id and keep decoration stable across refreshes.
	private readonly noiseSeed: number;
	/** Cached zone id (0..2) per cell, one grid per level. */
	private readonly zones = new Map<number, Uint8Array>();
	/** Animated monster sprites, keyed "l,x,y" — created once, re-attached on each level redraw. */
	private readonly monsterSprites = new Map<string, SMonster>();
	/** The message box (View.hx winMsg), if one is open. */
	private msgBox: Container | null = null;
	// View.hx updateScroll's eased camera position (View.hx view.dx/dy), world px.
	// NaN until the first focus() call, which snaps instead of easing in from (0,0).
	private camX = NaN;
	private camY = NaN;

	constructor(parent: HTMLElement, dims: MazeDims, opts: RendererOptions = {}) {
		this.cell = opts.cell ?? 24;
		this.noiseSeed = opts.noiseSeed ?? (Math.random() * 0x7fffffff) | 0;
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
		// View.hx's post-processing on the merged ground+overground raster: an inner
		// drop shadow plus a dark inner glow (ambient occlusion) and a muted outer
		// glow (ambient tint). Never touches walls/icons/monsters, same as the original.
		// ponytail: @pixi/filter-drop-shadow has no inner/knockout mode like Flash's —
		// approximated as a regular outer shadow; swap for a custom shader if it reads flat.
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
	 * `origin` is the player's cell at reveal time (View.hx posX/posY at the point
	 * updateFog() runs, i.e. *after* the move) — orients each reveal's fade-fx away
	 * from the player, per View.hx's `atan2(posY-py, posX-px)`. Omit it to skip
	 * the rotation (fx still fades, just axis-aligned).
	 */
	applyReveal(cells: RevealedCell[], origin?: { x: number; y: number }): void {
		let dirty = false;
		for (const c of cells) {
			const level = this.known[c.l];
			if (!level) continue;
			const isNew = !level.has(`${c.x},${c.y}`);
			if (!c.monster) {
				// Team defeated since last reveal: retire its animated sprite.
				const stale = this.monsterSprites.get(`${c.l},${c.x},${c.y}`);
				if (stale) {
					this.retireMonster(stale);
					this.monsterSprites.delete(`${c.l},${c.x},${c.y}`);
				}
			}
			level.set(`${c.x},${c.y}`, c);
			if (c.l === this.level) {
				dirty = true;
				if (isNew) this.revealFx(c.x, c.y, origin);
			}
		}
		if (dirty) this.showLevel(this.level);
	}

	/** Pixel center of cell (x, y). */
	center(x: number, y: number): { x: number; y: number } {
		return { x: x * this.cell + this.cell / 2, y: y * this.cell + this.cell / 2 };
	}

	/**
	 * Scroll the camera to keep world point (px, py) centered, easing 10%/frame
	 * toward that target every call — View.hx's `updateScroll()` (`view.dx +=
	 * (target - view.dx) * 0.1`, every frame, no dead zone). Snaps instead of
	 * easing in on the very first call, so entering a level doesn't fly the
	 * camera in from a corner. Clamped to the map bounds (View.hx doesn't clamp,
	 * but its fixed-size stage never needed to).
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
		this.groundLayer.cacheAsBitmap = false;
		this.wallBackLayer.cacheAsBitmap = false;
		this.wallFrontLayer.cacheAsBitmap = false;
		this.fogLayer.cacheAsBitmap = false;
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
		this.fogLayer.removeChildren();
		this.drawLevel(skin);
		this.drawEntities();
		this.drawMask(skin);
		this.drawFog(skin);
		this.groundLayer.cacheAsBitmap = true;
		this.wallBackLayer.cacheAsBitmap = true;
		this.wallFrontLayer.cacheAsBitmap = true;
		this.fogLayer.cacheAsBitmap = true;
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
	 * View.hx skin.mask: a skin.fog-tinted wash over the whole level, strength
	 * scaled by skin.mask (0 = none, e.g. forest; 100 = strongest, e.g. crypt).
	 * Screen-space-fixed in the original (attached to the root, not the scrolling
	 * level clip); a full-world rect of a flat colour looks identical either way.
	 * ponytail: View.hx's `mask` is a library graphic we don't have (likely a
	 * soft vignette, not a flat fill) — `_alpha = skin.mask` (0-100) was its clip
	 * alpha, not a fill alpha, so using skin.mask/100 directly on an opaque rect
	 * painted solid fog colour over the whole ground at mask=100. Capped instead
	 * to a max ~18% tint so it reads as atmosphere; raise MASK_MAX if a real
	 * vignette asset replaces this flat rect.
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

	/**
	 * Fog/reveal-fx blur radius. View.hx used BlurFilter(32,32,1) (quality 1) on a
	 * 40px cell; ported 1:1 (cell*32/40) it read too sharp — Pixi's blur falls off
	 * faster than Flash's at the same nominal strength, so this is tuned stronger
	 * than the literal archive value. Bump further if it's still too crisp.
	 */
	private get fogBlur(): number {
		return this.cell * 1.2;
	}

	/**
	 * Fog plane: one big jittered circle per unknown cell instead of a rect —
	 * circles always overlap their neighbours (radius > half the cell spacing,
	 * even after jitter), so the union is a round blob with no straight edge to
	 * begin with. The blur on top only has seams to soften, not square corners.
	 */
	private drawFog(skin: Skin): void {
		const known = this.known[this.level];
		const isKnown = (x: number, y: number): boolean => known.has(`${x},${y}`);
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

	/**
	 * View.hx's fx_reveal: blurred fog square over the cell, fading out, oriented
	 * away from `origin` (the player's cell) — `atan2(posY-py, posX-px)`.
	 */
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

	// ── message box (View.hx message()) ───────────────────────────────────────

	get messageOpen(): boolean {
		return this.msgBox != null;
	}

	closeMessage(): void {
		this.msgBox?.destroy({ children: true });
		this.msgBox = null;
	}

	/**
	 * View.hx message(): a panel framed with the msgbox_* tiles — solid 0x4d1e10
	 * fill, 23px top/bottom strips, 41px left/right strips, 77px corners drawn
	 * over them — centered in the view, with an optional item icon riding the top
	 * border. A click dismisses it; the page blocks movement while one is open.
	 */
	showMessage(text: string, icon?: string): void {
		this.closeMessage();
		const pad = 8;
		const w = 320;
		// ponytail: Pixi wordWrap instead of the original's manual hyphenation loop
		// that re-narrowed the box for orphan last lines — same box, simpler text.
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
		// The stage scrolls the world; undo its offset so the box is view-fixed
		// (the camera cannot move while it is open — movement is blocked).
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
		// View.hx: GlowFilter(0x0,0.7,32,32,2,2) — soft dark halo around the dialog.
		box.filters = [
			new GlowFilter({ distance: 32, outerStrength: 2, innerStrength: 0, color: 0x000000, alpha: 0.7, quality: 0.2 })
		];
		box.eventMode = 'static';
		box.cursor = 'pointer';
		box.on('pointerdown', () => this.closeMessage());
		this.app.stage.addChild(box);
		this.msgBox = box;
	}

	// ── revealed entities (icons the server sent along with the cells) ────────

	private drawEntities(): void {
		for (const c of this.known[this.level].values()) {
			if (!c.icon) continue;
			this.drawIcon(c);
		}
	}

	private drawIcon(c: RevealedCell): void {
		// 'key_<n>': skins cycle so every key in a maze looks distinct.
		if (c.icon?.startsWith('key_')) {
			const v = Number(c.icon.slice(4));
			this.sprite(`item_key_${pad2(((v - 1) % KEY_SKIN_COUNT) + 1)}`, c.x, c.y, this.cell * 0.7);
			return;
		}
		switch (c.icon) {
			case 'start':
				this.sprite('item_stair_down', c.x, c.y, this.cell * 1.2);
				break;
			case 'exit':
				this.sprite('item_stair_up', c.x, c.y, this.cell * 1.2);
				break;
			case 'stair_up':
				this.sprite('item_stair_up', c.x, c.y, this.cell * 0.9);
				break;
			case 'stair_down':
				this.sprite('item_stair_down', c.x, c.y, this.cell * 0.9);
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

	/** Stable per-cell pseudo-random index. */
	private hash(x: number, y: number, salt = 0): number {
		let v = (Math.imul(x + salt, 73856093) ^ Math.imul(y + salt, 19349663)) >>> 0;
		v ^= v >>> 13;
		return v >>> 0;
	}

	/**
	 * The smonster Animator registers a Ticker.shared listener it never detaches
	 * (same leak as sdino — see DinozActor.destroy). Freeze before destroying so
	 * the leaked listener no-ops instead of hitting null transforms every frame.
	 */
	private retireMonster(m: SMonster): void {
		m.playing = false;
		m.destroy({ children: true });
	}

	destroy(): void {
		// Sprites on other levels are detached from the stage, so app.destroy
		// would miss them — retire every cached sprite explicitly.
		for (const m of this.monsterSprites.values()) this.retireMonster(m);
		this.monsterSprites.clear();
		this.app.destroy(true, { children: true });
	}
}
