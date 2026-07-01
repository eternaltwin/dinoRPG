/**
 * Maze POC entry point — fog-of-war edition.
 *
 * The maze layout lives encrypted on the backend ("pixy") and NEVER reaches the
 * browser. Starting a run returns only the cells around the entrance; every
 * arrow-key step is validated server-side and returns only the newly revealed
 * cells. The maze can therefore only be solved by exploring it.
 *
 * Requires the ed-be backend on port 8081 (see /api/v1/dungeon).
 */

import './style.css';
import { MazeRenderer } from './render/MazeRenderer';
import { DinozActor } from './render/DinozActor';
import { loadDungeonAssets } from './render/assets';
import { allAssetNames, SKINS } from './render/skins';
import type { Skin } from './render/skins';
import * as pixy from './dungeon/pixyClient';
import type { Cell, RevealedCell } from './dungeon/pixyClient';

// A few real dino "codes" pulled from the dinorpg_animations debug page.
const DINO_CODES = ['09T1Yt9wqq4Rx000', '0A8uYQDU0FywV000', '199zX1Jn1zGXG000', '09vGg4LW1S9fn000'];

const stage = document.getElementById('stage') as HTMLDivElement;
const statusEl = document.getElementById('status') as HTMLSpanElement;
const debugBtn = document.getElementById('debug') as HTMLButtonElement;
const stairBtn = document.getElementById('stair-btn') as HTMLButtonElement;
const stairImg = document.getElementById('stair-icon') as HTMLImageElement;

let renderer: MazeRenderer | null = null;
let actor: DinozActor | null = null;
let runId = '';
let wallDebug = true;
// Entities pixy has revealed so far, keyed "l,x,y" — drives the stair button.
const icons = new Map<string, string>();
// Logical position = last server-confirmed cell. Moves are driven off this.
let cursor: Cell = { l: 0, x: 0, y: 0 };
// One in-flight move at a time; pixy is the authority, not the keyboard.
let moving = false;

const iconKey = (c: Cell): string => `${c.l},${c.x},${c.y}`;

function record(reveal: RevealedCell[]): void {
	for (const c of reveal) if (c.icon) icons.set(`${c.l},${c.x},${c.y}`, c.icon);
	renderer?.applyReveal(reveal);
}

/** Ask pixy for one step; on approval, walk the dinoz and fold in the reveal. */
function tryMove(dx: number, dy: number, dl = 0): void {
	if (moving || !actor || runId === '') return;
	moving = true;
	pixy
		.move(runId, dx, dy, dl)
		.then(r => {
			moving = false;
			if (!r.ok) return; // wall / no stair: pixy said no, nothing was revealed
			record(r.reveal);
			cursor = { ...r.pos };
			actor?.enqueue(cursor);
		})
		.catch(err => {
			moving = false;
			statusEl.textContent = `✗ ${err instanceof Error ? err.message : String(err)}`;
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
	stairImg.src = `${import.meta.env.BASE_URL}dungeon/gfx/${icon === 'stair_up' ? 'interf_stair_up' : 'interf_stair_down'}.png`;
	stairBtn.hidden = false;
}
function hideStair(): void {
	if (stairShownFor === null) return;
	stairShownFor = null;
	stairBtn.hidden = true;
}

/** Start a fresh run: pixy generates + encrypts; we get the entrance reveal only. */
async function build(): Promise<void> {
	statusEl.textContent = 'asking pixy for a dungeon…';
	let run: pixy.StartRunResult;
	try {
		run = await pixy.startRun();
	} catch (err) {
		statusEl.textContent = `✗ pixy unreachable — is ed-be running on 8081? (${
			err instanceof Error ? err.message : String(err)
		})`;
		return;
	}
	statusEl.textContent = `run ${run.runId.slice(0, 8)}… — explore!`;

	actor?.destroy();
	renderer?.destroy();
	icons.clear();
	hideStair();

	runId = run.runId;
	const skins: Skin[] = Array.from({ length: run.levels }, (_, l) => SKINS[(run.skinSalt + l) % SKINS.length]);
	// cell 45 → the dino renders at native resolution; 500×350 viewport scrolls.
	renderer = new MazeRenderer(
		stage,
		{ width: run.width, height: run.height, levels: run.levels },
		{ cell: 45, skins, view: { w: 500, h: 350 } }
	);
	renderer.setDebug(wallDebug);

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

async function main(): Promise<void> {
	await loadDungeonAssets(allAssetNames());

	debugBtn.textContent = wallDebug ? 'Wall debug: ON' : 'Wall debug: OFF';
	await build();

	(document.getElementById('regen') as HTMLButtonElement).onclick = () => void build();

	debugBtn.onclick = () => {
		wallDebug = !wallDebug;
		debugBtn.textContent = wallDebug ? 'Wall debug: ON' : 'Wall debug: OFF';
		renderer?.setDebug(wallDebug);
	};

	stairBtn.onclick = () => {
		const icon = icons.get(iconKey(cursor));
		if (icon === 'stair_up') tryMove(0, 0, 1);
		else if (icon === 'stair_down' || icon === 'exit') tryMove(0, 0, -1);
	};

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
	window.addEventListener('keydown', e => {
		const d = ARROWS[e.key];
		if (!d) return;
		e.preventDefault();
		if (!held.includes(e.key)) held.push(e.key);
	});
	window.addEventListener('keyup', e => {
		const i = held.indexOf(e.key);
		if (i >= 0) held.splice(i, 1);
	});

	const frame = (): void => {
		if (actor && !moving && held.length > 0 && actor.pending === 0) {
			const d = ARROWS[held[held.length - 1]];
			tryMove(d[0], d[1]);
		}
		updateStairButton();
		requestAnimationFrame(frame);
	};
	requestAnimationFrame(frame);
}

void main();
