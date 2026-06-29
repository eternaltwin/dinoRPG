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
import { findPath } from './dungeon/pathfind';
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

let renderer: MazeRenderer | null = null;
let actor: DinozActor | null = null;
let seed = 1;

/** Render an already-decoded dungeon: (re)build renderer, level buttons, dino. */
function renderDungeon(dungeon: DungeonStruct, salt: number): void {
	const skins: Skin[] = dungeon.levels.map((_, l) => SKINS[(salt + l) % SKINS.length]);

	actor?.destroy();
	renderer?.destroy();
	renderer = new MazeRenderer(stage, dungeon, { cell: 24, skins });

	levelsEl.replaceChildren();
	for (let l = 0; l < dungeon.levels.length; l++) {
		const btn = document.createElement('button');
		btn.textContent = `Level ${l + 1}`;
		btn.onclick = () => renderer?.showLevel(l);
		levelsEl.appendChild(btn);
	}

	const code = DINO_CODES[Math.abs(salt) % DINO_CODES.length];
	actor = new DinozActor(renderer, { code, speed: 5, onLevelChange: l => renderer?.showLevel(l) });
	const path = findPath(dungeon, { ...dungeon.start }, { ...dungeon.exit });
	if (path) actor.walk(path);
	else actor.placeAt({ ...dungeon.start });
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

	build(seed);

	(document.getElementById('regen') as HTMLButtonElement).onclick = () => build(++seed);
	(document.getElementById('replay') as HTMLButtonElement).onclick = () => build(seed);
	importBtn.onclick = () => importString(importInput.value);
	importInput.onkeydown = e => {
		if (e.key === 'Enter') importString(importInput.value);
	};
}

void main();
