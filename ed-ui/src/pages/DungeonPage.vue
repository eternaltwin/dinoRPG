<template>
	<div class="dungeon-page">
		<div class="toolbar">
			<button @click="toggleDebug">Wall debug: {{ wallDebug ? 'ON' : 'OFF' }}</button>
			<span class="status">{{ status }}</span>
		</div>
		<div ref="stageEl" class="stage">
			<button v-show="stairIcon !== ''" class="stair-btn" title="Take these stairs" @click="takeStair">
				<img :src="stairIcon" alt="stairs" />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
/**
 * DungeonPage — fog-of-war maze client (moved from the maze-poc workspace).
 *
 * The maze layout lives encrypted on the backend and NEVER reaches the browser.
 * Entering a dungeon returns only the cells around the entrance; every arrow-key
 * step is validated server-side and returns only the newly revealed cells. The
 * maze can therefore only be solved by exploring it.
 *
 * Rendered with Pixi.js using the original DinoRPG dungeon tileset
 * (src/assets/dungeon); the dinoz is animated via @eternaltwin/dinorpg_animations.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Application, Assets, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { sdino } from '@eternaltwin/dinorpg_animations';
import { http } from '../utils/http-common';

// ── backend API (the ONLY channel to the maze layout) ─────────────────────────

interface Cell {
	l: number;
	x: number;
	y: number;
}

/** One cell the server has allowed us to see. */
interface RevealedCell {
	l: number;
	x: number;
	y: number;
	/** true = walkable floor, false = wall. */
	floor: boolean;
	/** Entity token ('start' | 'exit' | 'stair_up' | 'stair_down' | 'door_v' | 'door_h' | 'monster' | 'key' | 'gold' | 'heal' | 'scroll'). */
	icon?: string;
}

interface StartRunResult {
	runId: string;
	pos: Cell;
	width: number;
	height: number;
	levels: number;
	skinSalt: number;
	reveal: RevealedCell[];
}

interface MoveResult {
	ok: boolean;
	pos: Cell;
	reveal: RevealedCell[];
}

async function enterDungeon(id: string): Promise<StartRunResult> {
	return (await http().post<StartRunResult>(`/dungeon/${id}/enter`)).data;
}

/** One step: dx/dy for a cell move, dl (±1) to take a stair under the dinoz. */
async function moveDinoz(id: string, dx: number, dy: number, dl = 0): Promise<MoveResult> {
	return (await http().post<MoveResult>(`/dungeon/${id}/move`, { dx, dy, dl }, { silent: true })).data;
}

// ── dungeon tileset (src/assets/dungeon) ──────────────────────────────────────

const ASSET_URLS = import.meta.glob('../assets/dungeon/*.png', { eager: true, as: 'url' }) as Record<string, string>;
const assetUrl = (name: string): string => ASSET_URLS[`../assets/dungeon/${name}.png`] ?? '';

const textures = new Map<string, Texture>();

/** Preload the given tile names so {@link gfx} resolves synchronously. */
async function loadDungeonAssets(names: string[]): Promise<void> {
	await Promise.all(names.map(async n => textures.set(n, (await Assets.load(assetUrl(n))) as Texture)));
}

/** Cached texture for a tile name (falls back to white if not preloaded). */
const gfx = (name: string): Texture => textures.get(name) ?? Texture.WHITE;

// ── skins (from the archive's dungeon/dungeon/View.hx SKINS table) ────────────

interface Skin {
	/** Wall theme — front_/side_/back_/corner_<name>. */
	name: string;
	/** Ground theme — ground_<ground>. */
	ground: string;
	frontCount: number;
	groundCount: number;
	/** Background / fog colour (from View.hx). */
	fog: number;
}

const SKINS: Skin[] = [
	{ name: 'cavern', ground: 'cavern', frontCount: 4, groundCount: 5, fog: 0x392429 },
	{ name: 'crypt', ground: 'crypt', frontCount: 3, groundCount: 7, fog: 0x27191c },
	{ name: 'egypt', ground: 'sand', frontCount: 6, groundCount: 6, fog: 0x433023 },
	{ name: 'forest', ground: 'grass', frontCount: 1, groundCount: 6, fog: 0x30371e },
	{ name: 'hell', ground: 'hell', frontCount: 4, groundCount: 5, fog: 0x330d0d },
	{ name: 'ruin', ground: 'cavern', frontCount: 6, groundCount: 5, fog: 0x252730 },
	{ name: 'sewer', ground: 'sewer', frontCount: 4, groundCount: 7, fog: 0x37321e },
	{ name: 'stone', ground: 'crypt', frontCount: 2, groundCount: 7, fog: 0x352c20 }
];

/** Sprites shared by every skin (items, doors, stairs). */
const ITEM_ASSETS = [
	'item_chest',
	'item_gold',
	'item_key_01',
	'item_scroll',
	'item_skel',
	'item_door_h_01',
	'item_door_v_01',
	'item_stair_up',
	'item_stair_down'
];

const pad2 = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

/** Every tile name the renderer can use, de-duplicated (for preloading). */
function allAssetNames(): string[] {
	const set = new Set<string>(ITEM_ASSETS);
	for (const skin of SKINS) {
		set.add(`side_${skin.name}_01`);
		set.add(`back_${skin.name}_01`);
		set.add(`corner_${skin.name}_01`);
		for (let i = 1; i <= skin.frontCount; i++) set.add(`front_${skin.name}_${pad2(i)}`);
		for (let i = 1; i <= skin.groundCount; i++) set.add(`ground_${skin.ground}_${pad2(i)}`);
	}
	return [...set];
}

// ── MazeRenderer — draws only the cells the server has revealed ───────────────

interface MazeDims {
	width: number;
	height: number;
	levels: number;
}

interface RendererOptions {
	cell?: number;
	/** One skin per level (cycled if shorter than the level count). */
	skins?: Skin[];
	/** Visible canvas size (px). Defaults to the full map (no scrolling). */
	view?: { w: number; h: number };
}

/**
 * Fog of war: the renderer never sees the layout. It accumulates the cells the
 * backend reveals — {@link MazeRenderer#applyReveal} — and draws only those;
 * every unknown cell stays the skin's fog colour.
 *
 * Per the archive's `View.hx`: walkable cells get a ground tile, and wall edges
 * are composited from front (N), back (S), side (W/E, mirrored) and corner
 * (diagonal, mirrored) pieces of the level's skin, split over two planes so the
 * dinoz is occluded by near walls.
 */
class MazeRenderer {
	readonly app: Application;
	readonly cell: number;
	readonly actorLayer: Container;
	private readonly mapLayer: Container;
	// View.hx's two wall planes: north faces (front + N corners) sit behind the
	// dinoz; the south/side faces (sides + back + S corners) sit in front of it,
	// so the dinoz is occluded by near walls and walks over far ones.
	private readonly wallBackLayer: Container;
	private readonly wallFrontLayer: Container;
	private readonly viewW: number;
	private readonly viewH: number;
	private readonly dims: MazeDims;
	/** Everything the server has revealed so far, per level, keyed "x,y". */
	private readonly known: Map<string, RevealedCell>[];
	private skins: Skin[];
	private level = 0;
	private debug = false;

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
		this.wallFrontLayer = new Container();
		this.app.stage.addChild(this.mapLayer, this.wallBackLayer, this.actorLayer, this.wallFrontLayer);

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
			this.known[c.l]?.set(`${c.x},${c.y}`, c);
			if (c.l === this.level) dirty = true;
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
		this.level = Math.max(0, Math.min(l, this.dims.levels - 1));
		const skin = this.skinFor(this.level);
		this.app.renderer.background.color = skin.fog;
		this.mapLayer.removeChildren();
		this.wallBackLayer.removeChildren();
		this.wallFrontLayer.removeChildren();
		this.drawLevel(skin);
		this.drawEntities();
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

		// Ground first, then wall edges on top.
		for (const c of known.values()) {
			if (!c.floor) continue;
			const g = 1 + (this.hash(c.x, c.y) % skin.groundCount);
			this.tile(`ground_${skin.ground}_${pad2(g)}`, c.x, c.y);
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
		this.mapLayer.addChild(label);
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

// ── DinozActor — a dinoz that walks the maze cell by cell ─────────────────────

interface DinozActorOptions {
	/** Dino "code" string. */
	code: string;
	/** Cells traversed per second. */
	speed?: number;
	onLevelChange?: (level: number) => void;
	onArrived?: () => void;
}

/**
 * Wraps an `sdino` instance from `@eternaltwin/dinorpg_animations` (a Pixi
 * `Container`), positions it on the maze grid, and tweens it along the cells
 * queued by {@link DinozActor#enqueue} — each one a server-validated move. It
 * flips to face its travel direction and fires `onLevelChange` when it takes a
 * staircase so the renderer can swap the displayed level.
 */
class DinozActor {
	// The published sdino typings miss the inherited flip(n) method.
	private readonly sprite: sdino & { flip(n: number): void };
	private readonly renderer: MazeRenderer;
	private readonly speed: number;
	private readonly onLevelChange?: (level: number) => void;
	private readonly onArrived?: () => void;

	private path: Cell[] = [];
	private seg = 0;
	private t = 0;
	private facing = 1;
	private pos: Cell = { l: 0, x: 0, y: 0 };
	private readonly tick = (delta: number) => this.update(delta);

	constructor(renderer: MazeRenderer, opts: DinozActorOptions) {
		this.renderer = renderer;
		this.speed = opts.speed ?? 4;
		this.onLevelChange = opts.onLevelChange;
		this.onArrived = opts.onArrived;

		this.sprite = new sdino({ data: opts.code, flip: 1, pflag: true }) as sdino & { flip(n: number): void };
		// Scale the dino down to roughly two cells tall.
		const target = renderer.cell * 2;
		this.sprite.scale.set(target / 90);
		renderer.actorLayer.addChild(this.sprite);
	}

	placeAt(cell: Cell): void {
		if (this.renderer.currentLevel !== cell.l) {
			this.renderer.showLevel(cell.l);
			this.onLevelChange?.(cell.l);
		}
		const p = this.renderer.center(cell.x, cell.y);
		this.sprite.position.set(p.x, p.y + this.renderer.cell * 0.25);
		this.renderer.focus(this.sprite.x, this.sprite.y);
		this.pos = { ...cell };
	}

	/** The cell the dinoz currently occupies. */
	get cell(): Cell {
		return { ...this.pos };
	}

	/** Number of cells still queued ahead of the current position. */
	get pending(): number {
		return this.path.length - 1 - this.seg;
	}

	/** Hold at the current cell, ready for manual control. */
	takeControl(): void {
		this.stop();
		this.path = [{ ...this.pos }];
		this.seg = 0;
		this.t = 0;
	}

	/** Queue one adjacent cell to walk to (manual control); resumes the ticker. */
	enqueue(cell: Cell): void {
		this.path.push(cell);
		// playAnim is idempotent while already walking (no frame reset), so it's
		// safe to call per queued cell. ponytail: a brief 'stand' can slip in
		// between cells since the feeder drains to idle before the next step;
		// the fully smooth fix is the direction-based step model.
		this.sprite.playAnim('walk');
		this.renderer.app.ticker.remove(this.tick);
		this.renderer.app.ticker.add(this.tick);
	}

	stop(): void {
		this.sprite.playAnim('stand');
		this.renderer.app.ticker.remove(this.tick);
	}

	private update(delta: number): void {
		if (this.seg >= this.path.length - 1) {
			this.stop();
			this.onArrived?.();
			return;
		}
		const from = this.path[this.seg];
		const to = this.path[this.seg + 1];

		// Staircase: jump levels instantly, then continue.
		if (from.l !== to.l) {
			this.placeAt(to);
			this.seg++;
			this.t = 0;
			return;
		}

		// Make sure we are drawing the level this segment lives on.
		if (this.renderer.currentLevel !== from.l) {
			this.renderer.showLevel(from.l);
			this.onLevelChange?.(from.l);
		}

		this.t += (delta / 60) * this.speed;
		const k = Math.min(this.t, 1);

		const dx = to.x - from.x;
		if (dx !== 0) {
			const want = dx > 0 ? 1 : 0;
			if (want !== this.facing) {
				this.facing = want;
				this.sprite.flip(want);
			}
		}

		const a = this.renderer.center(from.x, from.y);
		const b = this.renderer.center(to.x, to.y);
		const yOff = this.renderer.cell * 0.25;
		this.sprite.position.set(a.x + (b.x - a.x) * k, a.y + yOff + (b.y - a.y) * k);
		this.renderer.focus(this.sprite.x, this.sprite.y);

		if (this.t >= 1) {
			this.pos = { l: to.l, x: to.x, y: to.y };
			this.seg++;
			this.t = 0;
		}
	}

	destroy(): void {
		this.stop();
		this.sprite.destroy({ children: true });
	}
}

// ── page state & control loop ─────────────────────────────────────────────────

// A few real dino "codes" pulled from the dinorpg_animations debug page.
const DINO_CODES = ['09T1Yt9wqq4Rx000', '0A8uYQDU0FywV000', '199zX1Jn1zGXG000', '09vGg4LW1S9fn000'];

const route = useRoute();
const dungeonId = route.params.id as string;

const stageEl = ref<HTMLDivElement>();
const status = ref('');
const wallDebug = ref(false);
/** URL of the stair icon to show on the overlay button; '' hides it. */
const stairIcon = ref('');

let renderer: MazeRenderer | null = null;
let actor: DinozActor | null = null;
// Entities the server has revealed so far, keyed "l,x,y" — drives the stair button.
const icons = new Map<string, string>();
// Logical position = last server-confirmed cell. Moves are driven off this.
let cursor: Cell = { l: 0, x: 0, y: 0 };
// One in-flight move at a time; the server is the authority, not the keyboard.
let moving = false;
let rafId = 0;

const iconKey = (c: Cell): string => `${c.l},${c.x},${c.y}`;

function record(reveal: RevealedCell[]): void {
	for (const c of reveal) if (c.icon) icons.set(`${c.l},${c.x},${c.y}`, c.icon);
	renderer?.applyReveal(reveal);
}

/** Ask the server for one step; on approval, walk the dinoz and fold in the reveal. */
function tryMove(dx: number, dy: number, dl = 0): void {
	if (moving || !actor) return;
	moving = true;
	moveDinoz(dungeonId, dx, dy, dl)
		.then(r => {
			moving = false;
			if (!r.ok) return; // wall / no stair: the server said no, nothing was revealed
			record(r.reveal);
			cursor = { ...r.pos };
			actor?.enqueue(cursor);
		})
		.catch(err => {
			moving = false;
			status.value = `✗ ${err instanceof Error ? err.message : String(err)}`;
		});
}

// Show the stair button (top-right of the stage) only once the dinoz has settled
// on a revealed stair cell. The button, not the step, performs the traversal.
let stairShownFor: string | null = null;
function updateStairButton(): void {
	if (!actor || moving || actor.pending > 0) return hideStair();
	const k = iconKey(actor.cell);
	const icon = icons.get(k);
	if (icon !== 'stair_up' && icon !== 'stair_down' && icon !== 'exit') return hideStair();
	if (k === stairShownFor) return;
	stairShownFor = k;
	stairIcon.value = assetUrl(icon === 'stair_up' ? 'interf_stair_up' : 'interf_stair_down');
}
function hideStair(): void {
	if (stairShownFor === null) return;
	stairShownFor = null;
	stairIcon.value = '';
}

function takeStair(): void {
	const icon = icons.get(iconKey(cursor));
	if (icon === 'stair_up') tryMove(0, 0, 1);
	else if (icon === 'stair_down' || icon === 'exit') tryMove(0, 0, -1);
}

function toggleDebug(): void {
	wallDebug.value = !wallDebug.value;
	renderer?.setDebug(wallDebug.value);
}

/** Enter the dungeon: the server decrypts the layout; we get the reveals only. */
async function build(): Promise<void> {
	status.value = 'entering the dungeon…';
	let run: StartRunResult;
	try {
		run = await enterDungeon(dungeonId);
	} catch (err) {
		status.value = `✗ ${err instanceof Error ? err.message : String(err)}`;
		return;
	}
	status.value = `run ${run.runId.slice(0, 8)}… — explore!`;

	icons.clear();
	hideStair();

	const skins: Skin[] = Array.from({ length: run.levels }, (_, l) => SKINS[(run.skinSalt + l) % SKINS.length]);
	// cell 45 → the dino renders at native resolution; 500×350 viewport scrolls.
	renderer = new MazeRenderer(
		stageEl.value as HTMLDivElement,
		{ width: run.width, height: run.height, levels: run.levels },
		{ cell: 45, skins, view: { w: 500, h: 350 } }
	);
	renderer.setDebug(wallDebug.value);

	record(run.reveal);
	actor = new DinozActor(renderer, {
		code: DINO_CODES[run.skinSalt % DINO_CODES.length],
		speed: 5,
		onLevelChange: l => renderer?.showLevel(l)
	});
	actor.placeAt({ ...run.pos });
	actor.takeControl();
	cursor = { ...run.pos };
}

const ARROWS: Record<string, [number, number]> = {
	ArrowUp: [0, -1],
	ArrowDown: [0, 1],
	ArrowLeft: [-1, 0],
	ArrowRight: [1, 0]
};
// Drive movement from held keys ourselves (a per-frame loop) instead of the
// OS key-repeat, which inserts a ~500ms pause after the first press. One
// server round-trip at a time: the next step is requested only once the
// previous one is confirmed and walked.
const held: string[] = [];
function onKeyDown(e: KeyboardEvent): void {
	if (!ARROWS[e.key]) return;
	e.preventDefault();
	if (!held.includes(e.key)) held.push(e.key);
}
function onKeyUp(e: KeyboardEvent): void {
	const i = held.indexOf(e.key);
	if (i >= 0) held.splice(i, 1);
}

onMounted(async () => {
	await loadDungeonAssets(allAssetNames());
	await build();

	window.addEventListener('keydown', onKeyDown);
	window.addEventListener('keyup', onKeyUp);

	const frame = (): void => {
		if (actor && !moving && held.length > 0 && actor.pending === 0) {
			const d = ARROWS[held[held.length - 1]];
			tryMove(d[0], d[1]);
		}
		updateStairButton();
		rafId = requestAnimationFrame(frame);
	};
	rafId = requestAnimationFrame(frame);
});

onBeforeUnmount(() => {
	cancelAnimationFrame(rafId);
	window.removeEventListener('keydown', onKeyDown);
	window.removeEventListener('keyup', onKeyUp);
	actor?.destroy();
	renderer?.destroy();
	actor = null;
	renderer = null;
});
</script>

<style scoped lang="scss">
.dungeon-page {
	padding: 12px;
}

.toolbar {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 12px;
	flex-wrap: wrap;

	button {
		background: #2b2f3a;
		color: #e6e6ea;
		border: 1px solid #3a3f4d;
		border-radius: 6px;
		padding: 7px 12px;
		font-size: 13px;
		cursor: pointer;

		&:hover {
			background: #353a47;
		}
	}
}

.status {
	color: #7e8395;
	font-size: 12px;
	font-family: monospace;
}

.stage {
	display: inline-block;
	position: relative;
	border: 1px solid #1b1e26;
	border-radius: 8px;
	overflow: hidden;
	line-height: 0;
}

.stair-btn {
	position: absolute;
	top: 8px;
	right: 8px;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 6px;
	background: rgba(20, 22, 30, 0.85);
	border: 1px solid #6b5fa8;
	border-radius: 8px;
	cursor: pointer;

	img {
		width: 32px;
		height: 32px;
		image-rendering: pixelated;
	}
}
</style>
