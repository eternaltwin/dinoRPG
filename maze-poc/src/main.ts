/**
 * Maze POC entry point.
 *
 * Pipeline:
 *   generate (original or simple generator) -> encode -> decode (proving the
 *   codec round-trips) -> render with Pixi using the real DinoRPG dungeon
 *   tileset -> walk a dinoz from the start to the exit.
 *
 * You can also paste an encoded string (from the panel below) to re-render it.
 */

import './style.css';
import { OriginalGenerator } from './dungeon/original';
import { DungeonCodec } from './dungeon/DungeonCodec';
import { findPath, buildStairs, stairKey } from './dungeon/pathfind';
import type { Cell } from './dungeon/pathfind';
import { MazeRenderer } from './render/MazeRenderer';
import { DinozActor } from './render/DinozActor';
import { loadDungeonAssets } from './render/assets';
import { allAssetNames, SKINS } from './render/skins';
import type { Skin } from './render/skins';
import type { DungeonStruct } from './dungeon/types';

// A few real dino "codes" pulled from the dinorpg_animations debug page.
const DINO_CODES = ['09T1Yt9wqq4Rx000', '0A8uYQDU0FywV000', '199zX1Jn1zGXG000', '09vGg4LW1S9fn000'];

const stage = document.getElementById('stage') as HTMLDivElement;
const sigEl = document.getElementById('signature') as HTMLPreElement;
const codeEl = document.getElementById('encoded') as HTMLPreElement;
const levelsEl = document.getElementById('levels') as HTMLDivElement;
const seedEl = document.getElementById('seed') as HTMLSpanElement;
const importInput = document.getElementById('import-str') as HTMLInputElement;
const importBtn = document.getElementById('import-btn') as HTMLButtonElement;
const importMsg = document.getElementById('import-msg') as HTMLSpanElement;
const autoBtn = document.getElementById('autosolve') as HTMLButtonElement;
const debugBtn = document.getElementById('debug') as HTMLButtonElement;
const stairBtn = document.getElementById('stair-btn') as HTMLButtonElement;
const stairImg = document.getElementById('stair-icon') as HTMLImageElement;

let renderer: MazeRenderer | null = null;
let actor: DinozActor | null = null;
let seed = 1;

// Manual control: when the auto solver is off, the arrow keys drive the dinoz.
let autoSolve = true;
let wallDebug = false;
let dungeon: DungeonStruct | null = null;
let stairs = new Map<string, number>();
// Logical target cell — where the dinoz will end up once queued moves finish.
// Driving moves off this (not the animated position) lets key presses buffer.
let cursor: Cell = { l: 0, x: 0, y: 0 };

function setAutoLabel(): void {
	autoBtn.textContent = autoSolve ? 'Auto solver: ON' : 'Auto solver: OFF (use arrow keys)';
	autoBtn.classList.toggle('on', autoSolve);
}

/** Switch the current dinoz between auto-walking the solution and manual control. */
function applyMode(): void {
	if (!actor || !dungeon) return;
	if (autoSolve) {
		const path = findPath(dungeon, actor.cell, { ...dungeon.exit });
		if (path) actor.walk(path);
	} else {
		actor.takeControl();
		cursor = actor.cell;
	}
	setAutoLabel();
}

/** Move the dinoz one cell when in manual mode. Stairs are NOT auto-traversed —
 * stepping onto one surfaces the stair button (see updateStairButton). */
function tryMove(dx: number, dy: number): void {
	if (autoSolve || !actor || !dungeon) return;
	const nx = cursor.x + dx;
	const ny = cursor.y + dy;
	if (nx < 0 || ny < 0 || nx >= dungeon.width || ny >= dungeon.height) return;
	if (!dungeon.levels[cursor.l].table[nx][ny]) return; // wall
	cursor = { l: cursor.l, x: nx, y: ny };
	actor.enqueue(cursor);
}

/** Take the stair under the dinoz, if any, changing the displayed level. */
function takeStair(): void {
	if (!actor) return;
	const here = actor.cell;
	const to = stairs.get(stairKey(here.l, here.x, here.y));
	if (to === undefined) return;
	cursor = { l: to, x: here.x, y: here.y };
	actor.enqueue(cursor);
}

// Show the stair button (top-right of the stage) only once the dinoz has settled
// on a stair cell in manual mode. The button, not the step, performs the descent.
let stairShownFor: string | null = null;
function updateStairButton(): void {
	if (autoSolve || !actor || actor.pending > 0) return hideStair();
	const here = actor.cell;
	const to = stairs.get(stairKey(here.l, here.x, here.y));
	if (to === undefined) return hideStair();
	const sk = stairKey(here.l, here.x, here.y);
	if (sk === stairShownFor) return;
	stairShownFor = sk;
	stairImg.src = `${import.meta.env.BASE_URL}dungeon/gfx/${to > here.l ? 'item_stair_up' : 'item_stair_down'}.png`;
	stairBtn.hidden = false;
}
function hideStair(): void {
	if (stairShownFor === null) return;
	stairShownFor = null;
	stairBtn.hidden = true;
}

/** Render an already-decoded dungeon: (re)build renderer, level buttons, dino. */
function renderDungeon(dungeonStruct: DungeonStruct, salt: number): void {
	const skins: Skin[] = dungeonStruct.levels.map((_, l) => SKINS[(salt + l) % SKINS.length]);

	actor?.destroy();
	renderer?.destroy();
	// cell 45 → the dino's 2-cell target equals its 90px nominal height, so it
	// renders at scale 1 (native resolution) instead of being downsized.
	// 500×350 viewport: the map is larger, so the camera scrolls to follow the dino.
	renderer = new MazeRenderer(stage, dungeonStruct, { cell: 45, skins, view: { w: 500, h: 350 } });
	renderer.setDebug(wallDebug);

	levelsEl.replaceChildren();
	for (let l = 0; l < dungeonStruct.levels.length; l++) {
		const btn = document.createElement('button');
		btn.textContent = `Level ${l + 1}`;
		btn.onclick = () => renderer?.showLevel(l);
		levelsEl.appendChild(btn);
	}

	const code = DINO_CODES[Math.abs(salt) % DINO_CODES.length];
	actor = new DinozActor(renderer, { code, speed: 5, onLevelChange: l => renderer?.showLevel(l) });

	dungeon = dungeonStruct;
	stairs = buildStairs(dungeonStruct);
	actor.placeAt({ ...dungeonStruct.start });
	cursor = actor.cell;
	if (autoSolve) {
		const path = findPath(dungeonStruct, { ...dungeonStruct.start }, { ...dungeonStruct.exit });
		if (path) actor.walk(path);
	}
}

/** Generate a fresh dungeon, run it through the codec, and render the decoded result. */
function build(s: number): void {
	const generated = OriginalGenerator.generate({ seed: s, width: 24, height: 24, levels: 3 });

	const encoded = new DungeonCodec().encode(generated);
	const decoder = new DungeonCodec();
	const ok = decoder.decode(encoded);

	seedEl.textContent = String(s);
	sigEl.textContent = encoded.slice(0, encoded.indexOf(']]') + 2) + (ok ? '  ✓ CRC ok' : '  ✗ CRC FAIL');
	codeEl.textContent = encoded;
	importMsg.textContent = '';
	renderDungeon(decoder.d, s);
}

/** Decode a pasted string and render it. */
function importString(raw: string): void {
	const s = raw.trim();
	if (s === '') {
		importMsg.textContent = 'paste a string first';
		return;
	}
	const decoder = new DungeonCodec();
	let ok = false;
	try {
		ok = decoder.decode(s);
	} catch {
		ok = false;
	}
	if (!decoder.d || decoder.d.levels.length === 0) {
		importMsg.textContent = '✗ could not decode (not a string from this codec?)';
		return;
	}
	importMsg.textContent = ok
		? '✓ loaded'
		: '✓ loaded (CRC differs — expected for original-game strings, the maze is still exact)';
	seedEl.textContent = '—';
	const sig = s.startsWith('[[') ? s.slice(0, s.indexOf(']]') + 2) : '(no signature)';
	sigEl.textContent = sig + (ok ? '  ✓ CRC ok' : '  ✗ CRC FAIL');
	codeEl.textContent = s;
	// derive a skin salt from the string so imports look stable
	let salt = 0;
	for (let i = 0; i < s.length; i++) salt = (salt * 31 + s.charCodeAt(i)) >>> 0;
	renderDungeon(decoder.d, salt);
}

async function main(): Promise<void> {
	await loadDungeonAssets(allAssetNames());

	setAutoLabel();
	build(seed);

	(document.getElementById('regen') as HTMLButtonElement).onclick = () => build(++seed);
	(document.getElementById('replay') as HTMLButtonElement).onclick = () => build(seed);
	importBtn.onclick = () => importString(importInput.value);
	importInput.onkeydown = e => {
		if (e.key === 'Enter') importString(importInput.value);
	};

	autoBtn.onclick = () => {
		autoSolve = !autoSolve;
		applyMode();
	};

	debugBtn.onclick = () => {
		wallDebug = !wallDebug;
		debugBtn.textContent = wallDebug ? 'Wall debug: ON' : 'Wall debug: OFF';
		renderer?.setDebug(wallDebug);
	};

	stairBtn.onclick = () => takeStair();

	const ARROWS: Record<string, [number, number]> = {
		ArrowUp: [0, -1],
		ArrowDown: [0, 1],
		ArrowLeft: [-1, 0],
		ArrowRight: [1, 0]
	};
	// Drive movement from held keys ourselves (a per-frame loop) instead of the
	// OS key-repeat, which inserts a ~500ms pause after the first press. We feed
	// one cell at a time only once the previous move lands, so the dinoz walks
	// continuously while held and stops within a cell on release.
	const held: string[] = [];
	window.addEventListener('keydown', e => {
		const d = ARROWS[e.key];
		// Don't hijack arrows while typing in the import box.
		if (!d || document.activeElement === importInput) return;
		e.preventDefault();
		if (!held.includes(e.key)) held.push(e.key);
	});
	window.addEventListener('keyup', e => {
		const i = held.indexOf(e.key);
		if (i >= 0) held.splice(i, 1);
	});

	const frame = (): void => {
		if (!autoSolve && actor && held.length > 0 && actor.pending === 0) {
			const d = ARROWS[held[held.length - 1]];
			tryMove(d[0], d[1]);
		}
		updateStairButton();
		requestAnimationFrame(frame);
	};
	requestAnimationFrame(frame);
}

void main();
