/**
 * FE/BE contract and client constants for the fog-of-war dungeon
 * (ed-ui DungeonPage.vue ⇄ ed-be /dungeon routes).
 */
import { DungeonType } from '@drpg/prisma/enums';
import { FightResult } from '../fight/FightResult.mjs';

export interface Cell {
	l: number;
	x: number;
	y: number;
}

/** One cell the server has allowed us to see. */
export interface RevealedCell {
	l: number;
	x: number;
	y: number;
	/** true = walkable floor, false = wall. */
	floor: boolean;
	/**
	 * Entity token ('start' | 'exit' | 'stair_up' | 'stair_down' | 'door_v' | 'door_h' |
	 * 'door_v_open' | 'door_h_open' | 'monster' | 'key_<n>' | 'gold' | 'heal' | 'scroll' | 'chest').
	 */
	icon?: string;
	/** smonster gfx name of the team's first monster — only set on 'monster' cells whose team is still alive. */
	monster?: string;
	/** Key id of the locked door on this cell — pairs the door with its key so the client can name both. */
	key?: number;
}

export interface StartRunResult {
	run: {
		id: string;
		status: 'created' | 'resumed';
		/** i18n key for an optional toast, e.g. shown when resuming an in-progress run. */
		message?: string;
	};
	pos: Cell;
	width: number;
	height: number;
	levels: number;
	skinSalt: number;
	skin: DungeonType;
	reveal: RevealedCell[];
}

export interface MoveResult {
	ok: boolean;
	pos: Cell;
	reveal: RevealedCell[];
	fight?: FightResult;
	/** Scenario reached on this step: i18n key of its text + popup icon (XML micon). */
	scenario?: { text: string; micon?: string };
	/** Gold collected on this step, if the entered cell held an uncollected pile. */
	gold?: number;
}

// ── rendering ──────────────────────────────────────────────────────────────

export interface Skin {
	/** Wall theme — front_/side_/back_/corner_<name>. */
	name: string;
	/** Ground theme — ground_<ground>. */
	ground: string;
	frontCount: number;
	groundCount: number;
	/** Background / fog colour (from View.hx). */
	fog: number;
	/**
	 * Overground decoration layers (View.hx `over`): up to two overlay themes
	 * (overground_<name>) painted over the ground where the perlin zones say so.
	 */
	over: [string | null, string | null];
	/** Zone-noise density (View.hx PerlinType: PNormal | PDense | PFew). */
	perlin: 'normal' | 'dense' | 'few';
	/**
	 * Atmosphere wash strength, 0-100 (View.hx skin.mask): a flat fog-coloured
	 * overlay across the whole level, independent of the fog-of-war unknown-cell fog.
	 */
	mask: number;
}

export interface MazeDims {
	width: number;
	height: number;
	levels: number;
}

export interface RendererOptions {
	cell?: number;
	/** One skin per level (cycled if shorter than the level count). */
	skins?: Skin[];
	/** Visible canvas size (px). Defaults to the full map (no scrolling). */
	view?: { w: number; h: number };
	/** Seed for the decorative overground noise; defaults to random per entry. */
	noiseSeed?: number;
}

export interface DinozActorOptions {
	/** Dino "code" string. */
	code: string;
	/** Cells traversed per second. */
	speed?: number;
	/** false = follower: never drives the camera or the displayed level. Default true. */
	lead?: boolean;
	onLevelChange?: (level: number) => void;
	onArrived?: () => void;
}

// ── constants (from the archive's dungeon/dungeon/View.hx SKINS table) ─────

// over/perlin come from the matching View.hx row (crypt, cavern, pyramid, forest,
// hell, ruin, sewer, mine), with its over-names mapped onto our extracted sheets:
// ruin→broken, square/ruinPurple→slab, dirt→stone, grassDark→grass.
export const SKINS: Skin[] = [
	{
		name: 'cavern',
		ground: 'cavern',
		frontCount: 4,
		groundCount: 5,
		fog: 0x392429,
		over: ['broken', 'grass'],
		perlin: 'normal',
		mask: 100 // View.hx "cavern"
	},
	{
		name: 'crypt',
		ground: 'crypt',
		frontCount: 3,
		groundCount: 7,
		fog: 0x27191c,
		over: [null, 'slab'],
		perlin: 'normal',
		mask: 100 // View.hx "crypt"
	},
	{
		name: 'egypt',
		ground: 'sand',
		frontCount: 6,
		groundCount: 6,
		fog: 0x433023,
		over: ['stone', null],
		perlin: 'normal',
		mask: 60 // View.hx "pyramid"
	},
	{
		name: 'forest',
		ground: 'grass',
		frontCount: 1,
		groundCount: 6,
		fog: 0x30371e,
		over: ['stone', 'grass'],
		perlin: 'dense',
		mask: 0 // View.hx "forest"
	},
	{
		name: 'hell',
		ground: 'hell',
		frontCount: 4,
		groundCount: 5,
		fog: 0x330d0d,
		over: ['broken', 'creep'],
		perlin: 'normal',
		mask: 100 // View.hx "hell"
	},
	{
		name: 'ruin',
		ground: 'cavern',
		frontCount: 6,
		groundCount: 5,
		fog: 0x252730,
		over: ['slab', 'grass'],
		perlin: 'normal',
		mask: 100 // View.hx "ruin"
	},
	{
		name: 'sewer',
		ground: 'sewer',
		frontCount: 4,
		groundCount: 7,
		fog: 0x37321e,
		over: ['creep', 'stone'],
		perlin: 'few',
		mask: 70 // View.hx "sewer"
	},
	{
		name: 'stone',
		ground: 'crypt',
		frontCount: 2,
		groundCount: 7,
		fog: 0x352c20,
		over: ['stone', null],
		perlin: 'dense',
		mask: 100 // View.hx "tomb3" (closest ruin/crypt combo)
	}
];

/** Number of item_key_NN sprite variants — key skins cycle through these. */
export const KEY_SKIN_COUNT = 8;

/** Sprites shared by every skin (items, doors, stairs). */
export const ITEM_ASSETS = [
	'item_chest',
	'item_heal',
	'item_gold',
	...Array.from({ length: KEY_SKIN_COUNT }, (_, i) => `item_key_0${i + 1}`),
	'item_scroll',
	'item_skel',
	'item_door_h_01',
	'item_door_v_01',
	'item_door_h_open',
	'item_door_v_open',
	'item_stair_up',
	'item_stair_down'
];

/** Arrow key → (dx, dy). */
export const ARROWS: Record<string, [number, number]> = {
	ArrowUp: [0, -1],
	ArrowDown: [0, 1],
	ArrowLeft: [-1, 0],
	ArrowRight: [1, 0]
};
