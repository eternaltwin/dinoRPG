/**
 * Maze POC entry point.
 *
 * Pipeline:
 *   generate -> encode -> decode (proving the codec round-trips) -> render with
 *   Pixi -> drop a dinoz at the start and walk it to the exit.
 */

import './style.css';
import { DungeonGenerator } from './dungeon/DungeonGenerator';
import { DungeonCodec } from './dungeon/DungeonCodec';
import { findPath } from './dungeon/pathfind';
import { MazeRenderer } from './render/MazeRenderer';
import { DinozActor } from './render/DinozActor';
import type { DungeonStruct } from './dungeon/types';

// A few real dino "codes" pulled from the dinorpg_animations debug page.
const DINO_CODES = ['09T1Yt9wqq4Rx000', '0A8uYQDU0FywV000', '199zX1Jn1zGXG000', '09vGg4LW1S9fn000'];

const stage = document.getElementById('stage') as HTMLDivElement;
const sigEl = document.getElementById('signature') as HTMLPreElement;
const codeEl = document.getElementById('encoded') as HTMLPreElement;
const levelsEl = document.getElementById('levels') as HTMLDivElement;
const seedEl = document.getElementById('seed') as HTMLSpanElement;

let renderer: MazeRenderer | null = null;
let actor: DinozActor | null = null;

function build(seed: number): void {
	// 1. Generate a dungeon and run it through the codec round-trip.
	const generated = DungeonGenerator.generate({ seed, levels: 2, roomsX: 5, roomsY: 5, width: 41, height: 41 });
	const codec = new DungeonCodec();
	const encoded = codec.encode(generated);

	const decoder = new DungeonCodec();
	const ok = decoder.decode(encoded);
	const dungeon: DungeonStruct = decoder.d; // render the *decoded* struct on purpose

	seedEl.textContent = String(seed);
	sigEl.textContent = encoded.slice(0, encoded.indexOf(']]') + 2) + (ok ? '  ✓ CRC ok' : '  ✗ CRC FAIL');
	codeEl.textContent = encoded;

	// 2. (Re)build the renderer.
	actor?.destroy();
	renderer?.destroy();
	renderer = new MazeRenderer(stage, dungeon, { cell: 16 });

	// 3. Level switcher buttons.
	levelsEl.replaceChildren();
	for (let l = 0; l < dungeon.levels.length; l++) {
		const btn = document.createElement('button');
		btn.textContent = `Level ${l + 1}`;
		btn.onclick = () => renderer?.showLevel(l);
		levelsEl.appendChild(btn);
	}

	// 4. Spawn the dinoz and walk it from start to exit.
	const code = DINO_CODES[seed % DINO_CODES.length];
	actor = new DinozActor(renderer, {
		code,
		speed: 5,
		onLevelChange: l => renderer?.showLevel(l)
	});
	const path = findPath(dungeon, { ...dungeon.start }, { ...dungeon.exit });
	if (path) actor.walk(path);
	else actor.placeAt({ ...dungeon.start });
}

let seed = 1;
build(seed);

(document.getElementById('regen') as HTMLButtonElement).onclick = () => build(++seed);
(document.getElementById('replay') as HTMLButtonElement).onclick = () => build(seed);
