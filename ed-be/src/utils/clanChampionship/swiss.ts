/** Rounds of a Swiss championship: ⌈log2 n⌉ with at least 3, capped by a full round robin (n - 1, or n when odd). */
export function swissRoundCount(clanCount: number): number {
	if (clanCount < 2) return 0;
	const roundRobinLength = clanCount % 2 === 0 ? clanCount - 1 : clanCount;
	return Math.min(Math.max(3, Math.ceil(Math.log2(clanCount))), roundRobinLength);
}

/** Order-independent key of a pairing. */
export function pairKey(a: number, b: number): string {
	return a < b ? `${a}-${b}` : `${b}-${a}`;
}

export type SwissRoundInput = {
	/** Clans still in the championship, best ranked first (round 0: a random order). */
	ranked: number[];
	/** Pairings already played, as pairKey. */
	met: Set<string>;
	/** Clans that already had a bye. */
	byes: Set<number>;
	/** Home matches played so far per clan. */
	homeCount: Map<number, number>;
	rng?: () => number;
};

export type SwissRound = { pairs: [home: number, away: number][]; bye: number | null };

/** Backtracking budget: far above what a few dozen clans need, it only guards against a pathological history. */
const MAX_STEPS = 200_000;

/**
 * Pairs `clans` (ranked order) two by two, each clan meeting the closest ranked clan it can. Without `allowRematch`,
 * returns null when no pairing avoids every rematch; with it, rematches are only used when nothing else fits.
 */
function pairClans(clans: number[], met: Set<string>, allowRematch: boolean): [number, number][] | null {
	let steps = 0;
	const solve = (rest: number[]): [number, number][] | null => {
		if (rest.length === 0) return [];
		if (++steps > MAX_STEPS) return null;
		const [first, ...others] = rest;
		const fresh = others.filter(o => !met.has(pairKey(first, o)));
		const candidates = allowRematch ? [...fresh, ...others.filter(o => met.has(pairKey(first, o)))] : fresh;
		for (const opponent of candidates) {
			const tail = solve(others.filter(o => o !== opponent));
			if (tail) return [[first, opponent], ...tail];
		}
		return null;
	};
	return solve(clans);
}

/**
 * Draws one Swiss round. With an odd field, the bye goes to the lowest ranked clan that never had one and leaves a
 * rematch-free pairing of the others; a rematch is preferred over a second bye. The clan with fewer home matches
 * plays at home.
 */
export function pairSwissRound({ ranked, met, byes, homeCount, rng = Math.random }: SwissRoundInput): SwissRound {
	let bye: number | null = null;
	let pairs: [number, number][] | null = null;

	if (ranked.length % 2 === 0) {
		pairs = pairClans(ranked, met, false) ?? pairClans(ranked, met, true);
	} else {
		const fromBottom = [...ranked].reverse();
		const fresh = fromBottom.filter(c => !byes.has(c));
		const already = fromBottom.filter(c => byes.has(c));
		const attempts: [number[], boolean][] = [
			[fresh, false],
			[fresh.slice(0, 1), true],
			[already, false],
			[already.slice(0, 1), true]
		];
		for (const [candidates, allowRematch] of attempts) {
			for (const candidate of candidates) {
				const found = pairClans(
					ranked.filter(c => c !== candidate),
					met,
					allowRematch
				);
				if (found) {
					bye = candidate;
					pairs = found;
					break;
				}
			}
			if (pairs) break;
		}
	}

	return {
		bye,
		pairs: (pairs ?? []).map(([a, b]) => {
			const homeA = homeCount.get(a) ?? 0;
			const homeB = homeCount.get(b) ?? 0;
			const aAtHome = homeA === homeB ? rng() < 0.5 : homeA < homeB;
			return aAtHome ? [a, b] : [b, a];
		})
	};
}
