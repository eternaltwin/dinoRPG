/**
 * HxList — minimal port of Haxe's `List` semantics used by the generator.
 *
 * The distinction matters: in Haxe, `List.push` inserts at the *head* and
 * `List.add` appends at the *tail*, and `first()` returns the head. The original
 * generator relies on that ordering (e.g. picking `rooms.first()` as a start),
 * so this models it rather than using a plain array.
 */
export class HxList<T> implements Iterable<T> {
	private items: T[] = [];

	/** Haxe `List.push` — insert at the head. */
	push(x: T): void {
		this.items.unshift(x);
	}

	/** Haxe `List.add` — append at the tail. */
	add(x: T): void {
		this.items.push(x);
	}

	first(): T | null {
		return this.items.length > 0 ? this.items[0] : null;
	}

	remove(x: T): boolean {
		const i = this.items.indexOf(x);
		if (i < 0) return false;
		this.items.splice(i, 1);
		return true;
	}

	isEmpty(): boolean {
		return this.items.length === 0;
	}

	get length(): number {
		return this.items.length;
	}

	map<U>(f: (x: T) => U): U[] {
		return this.items.map(f);
	}

	toArray(): T[] {
		return this.items.slice();
	}

	static fromArray<T>(arr: T[]): HxList<T> {
		const l = new HxList<T>();
		for (const x of arr) l.add(x);
		return l;
	}

	[Symbol.iterator](): Iterator<T> {
		// iterate over a snapshot so callers can remove during iteration
		return this.items.slice()[Symbol.iterator]();
	}
}
