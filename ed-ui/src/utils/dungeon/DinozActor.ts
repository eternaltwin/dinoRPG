import { sdino } from '@eternaltwin/dinorpg_animations';
import type { Cell, DinozActorOptions } from '@drpg/core/models/dungeon/DungeonClient';
import type { MazeRenderer } from './MazeRenderer.js';

/**
 * DinozActor — a dinoz that walks the maze cell by cell.
 *
 * Wraps an `sdino` instance from `@eternaltwin/dinorpg_animations` (a Pixi
 * `Container`), positions it on the maze grid, and tweens it along the cells
 * queued by {@link DinozActor#enqueue} — each one a server-validated move. It
 * flips to face its travel direction and fires `onLevelChange` when it takes a
 * staircase so the renderer can swap the displayed level.
 */
export class DinozActor {
	// The published sdino typings miss the inherited flip(n) method.
	private readonly sprite: sdino & { flip(n: number): void };
	private readonly renderer: MazeRenderer;
	private readonly speed: number;
	// Followers (lead=false) tag along: they never move the camera or switch the
	// displayed level, and hide while their cell is on a level not being shown.
	private readonly lead: boolean;
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
		this.lead = opts.lead ?? true;
		this.onLevelChange = opts.onLevelChange;
		this.onArrived = opts.onArrived;

		this.sprite = new sdino({ data: opts.code, flip: 1, pflag: true }) as sdino & { flip(n: number): void };
		// Scale the dino down to roughly two cells tall.
		const target = renderer.cell * 2;
		this.sprite.scale.set(target / 90);
		this.sprite.zIndex = this.lead ? 1 : 0;
		renderer.actorLayer.addChild(this.sprite);
	}

	placeAt(cell: Cell): void {
		if (this.lead && this.renderer.currentLevel !== cell.l) {
			this.renderer.showLevel(cell.l);
			this.onLevelChange?.(cell.l);
		}
		const p = this.renderer.center(cell.x, cell.y);
		this.sprite.position.set(p.x, p.y + this.renderer.cell * 0.25);
		if (this.lead) this.renderer.focus(this.sprite.x, this.sprite.y);
		this.pos = { ...cell };
		this.sprite.visible = this.pos.l === this.renderer.currentLevel;
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
		if (this.lead && this.renderer.currentLevel !== from.l) {
			this.renderer.showLevel(from.l);
			this.onLevelChange?.(from.l);
		}
		this.sprite.visible = from.l === this.renderer.currentLevel;

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
		if (this.lead) this.renderer.focus(this.sprite.x, this.sprite.y);

		if (this.t >= 1) {
			this.pos = { l: to.l, x: to.x, y: to.y };
			this.seg++;
			this.t = 0;
		}
	}

	destroy(): void {
		this.stop();
		// The sdino Animator registers a Ticker.shared listener it never detaches.
		// Left playing, it throws on the destroyed parts every frame and that kills
		// the shared ticker for every sdino still alive — they all stop animating.
		// Freezing it first turns the leaked listener into a no-op.
		(this.sprite as unknown as { playing: boolean }).playing = false;
		this.sprite.destroy({ children: true });
	}
}
