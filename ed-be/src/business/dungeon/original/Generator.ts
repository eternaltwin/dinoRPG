/**
 * Generator — base class port of `dungeon/dungeon/gen/Generator.hx`.
 * Provides the RNG helpers shared by Rooms / Noise / Gameplay.
 */

import { Rand } from './Rand.js';
import type { LevelInfos } from './Data.js';

export class Generator {
	protected r!: Rand;
	protected inf!: LevelInfos;

	protected select(inf: LevelInfos): void {
		this.inf = inf;
		this.r = new Rand(inf.seed);
	}

	protected random(n: number): number {
		return this.r.random(n);
	}

	/** Inclusive range [a, b]. */
	protected rand(a: number, b: number): number {
		return a + this.random(b - a + 1);
	}

	protected proba(n: number): boolean {
		return this.random(n) === 0;
	}

	/** Run `f` until it succeeds `n` times, bounded by `n*100` total tries. */
	protected ntry(f: () => boolean, n: number): boolean {
		let trys = n * 100;
		while (n > 0) {
			if (f()) {
				n--;
				continue;
			}
			if (--trys === 0) return false;
		}
		return true;
	}

	/** Call `f` until it returns a non-null value. */
	protected vtry<T>(f: () => T | null): T {
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const v = f();
			if (v != null) return v;
		}
	}
}
