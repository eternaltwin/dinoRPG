/**
 * DinozActor — a dinoz that walks a path through the maze.
 *
 * Wraps an `sdino` instance from `@eternaltwin/dinorpg_animations` (a Pixi
 * `Container`), positions it on the maze grid, and tweens it cell-by-cell along
 * a path produced by {@link findPath}. It flips to face its travel direction and
 * fires `onLevelChange` when it takes a staircase so the renderer can swap the
 * displayed level.
 */

import { sdino } from '@eternaltwin/dinorpg_animations';
import type { MazeRenderer } from './MazeRenderer';
import type { Cell } from '../dungeon/pathfind';

export interface DinozActorOptions {
	/** Dino "code" string. */
	code: string;
	/** Cells traversed per second. */
	speed?: number;
	onLevelChange?: (level: number) => void;
	onArrived?: () => void;
}

export class DinozActor {
	private readonly sprite: sdino;
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

		this.sprite = new sdino({ data: opts.code, flip: 1, pflag: true });
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
		this.pos = { ...cell };
	}

	/** The cell the dinoz currently occupies. */
	get cell(): Cell {
		return { ...this.pos };
	}

	/** Drop any auto-walk path and hold at the current cell for manual control. */
	takeControl(): void {
		this.stop();
		this.path = [{ ...this.pos }];
		this.seg = 0;
		this.t = 0;
	}

	/** Queue one adjacent cell to walk to (manual control); resumes the ticker. */
	enqueue(cell: Cell): void {
		this.path.push(cell);
		this.renderer.app.ticker.remove(this.tick);
		this.renderer.app.ticker.add(this.tick);
	}

	/** Start walking the given path. Restarts any walk in progress. */
	walk(path: Cell[]): void {
		this.path = path;
		this.seg = 0;
		this.t = 0;
		if (path.length > 0) this.placeAt(path[0]);
		this.renderer.app.ticker.remove(this.tick);
		if (path.length > 1) this.renderer.app.ticker.add(this.tick);
	}

	stop(): void {
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
