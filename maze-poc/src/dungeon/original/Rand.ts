/**
 * Rand — deterministic PRNG standing in for Motion Twin's `mt.Rand`.
 *
 * `mt.Rand` (like `mt.BitCodec`) was never open-sourced, so the exact sequence
 * it produced for a given seed is unrecoverable. This xorshift32 generator
 * exposes the same surface the generator uses (`random(n)` -> int in [0, n)),
 * so the ported algorithm is faithful even though a given seed yields a
 * different — but equally valid — dungeon than the historical client would.
 */
export class Rand {
	private state: number;

	constructor(seed: number) {
		this.state = seed >>> 0 || 0x9e3779b9;
	}

	private next(): number {
		let x = this.state;
		x ^= x << 13;
		x ^= x >>> 17;
		x ^= x << 5;
		this.state = x >>> 0;
		return this.state;
	}

	/** Uniform integer in [0, n). */
	random(n: number): number {
		return n <= 0 ? 0 : this.next() % n;
	}
}
