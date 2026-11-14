import { describe, expect, it } from 'vitest';
import seedrandom from 'seedrandom';
import { pairKey, pairSwissRound, swissRoundCount } from '../../utils/clanChampionship/swiss.js';

const empty = () => ({ met: new Set<string>(), byes: new Set<number>(), homeCount: new Map<number, number>() });

describe('swissRoundCount', () => {
	it('is ⌈log2 n⌉ with at least 3 rounds, capped by a full round robin', () => {
		const counts = [0, 1, 2, 3, 4, 5, 8, 9, 16, 17, 33].map(swissRoundCount);
		expect(counts).toEqual([0, 0, 1, 3, 3, 3, 3, 4, 4, 5, 6]);
	});
});

describe('pairSwissRound', () => {
	it('pairs adjacent clans of the ranking', () => {
		const { pairs, bye } = pairSwissRound({ ranked: [1, 2, 3, 4], ...empty() });
		expect(bye).toBeNull();
		expect(pairs.map(([a, b]) => pairKey(a, b))).toEqual(['1-2', '3-4']);
	});

	it('avoids a rematch with the next closest clan', () => {
		const { pairs } = pairSwissRound({ ranked: [1, 2, 3, 4], ...empty(), met: new Set([pairKey(1, 2)]) });
		expect(pairs.map(([a, b]) => pairKey(a, b))).toEqual(['1-3', '2-4']);
	});

	it('backtracks when the greedy pairing leads to a dead end', () => {
		// 1-2 then 3-4 is forbidden, 1-3 leaves 2-4 forbidden: only 1-4 / 2-3 works
		const met = new Set([pairKey(1, 2), pairKey(3, 4), pairKey(2, 4)]);
		const { pairs } = pairSwissRound({ ranked: [1, 2, 3, 4], ...empty(), met });
		expect(pairs.map(([a, b]) => pairKey(a, b))).toEqual(['1-4', '2-3']);
	});

	it('falls back on a rematch when nothing else fits', () => {
		const { pairs } = pairSwissRound({ ranked: [1, 2], ...empty(), met: new Set([pairKey(1, 2)]) });
		expect(pairs.map(([a, b]) => pairKey(a, b))).toEqual(['1-2']);
	});

	it('gives the bye to the lowest ranked clan without one', () => {
		expect(pairSwissRound({ ranked: [1, 2, 3, 4, 5], ...empty() }).bye).toBe(5);
		expect(pairSwissRound({ ranked: [1, 2, 3, 4, 5], ...empty(), byes: new Set([5]) }).bye).toBe(4);
	});

	it('plays the clan with fewer home matches at home', () => {
		const { pairs } = pairSwissRound({ ranked: [1, 2], ...empty(), homeCount: new Map([[1, 2]]) });
		expect(pairs).toEqual([[2, 1]]);
	});

	it('runs whole championships without rematch nor second bye', () => {
		const rng = seedrandom('swiss');
		for (let n = 2; n <= 24; n++) {
			for (let run = 0; run < 20; run++) {
				const clans = Array.from({ length: n }, (_, i) => i + 1);
				const points = new Map(clans.map(c => [c, 0]));
				const history = empty();
				const byeCount = new Map<number, number>();
				for (let round = 0; round < swissRoundCount(n); round++) {
					const ranked = [...clans].sort((a, b) => (points.get(b) as number) - (points.get(a) as number));
					const { pairs, bye } = pairSwissRound({ ranked, ...history, rng });
					expect(pairs.length).toBe(Math.floor(n / 2));
					expect(new Set([...pairs.flat(), ...(bye === null ? [] : [bye])]).size).toBe(n);
					if (bye !== null) {
						history.byes.add(bye);
						byeCount.set(bye, (byeCount.get(bye) ?? 0) + 1);
						points.set(bye, (points.get(bye) as number) + 3);
					}
					for (const [home, away] of pairs) {
						expect(history.met.has(pairKey(home, away))).toBe(false);
						history.met.add(pairKey(home, away));
						history.homeCount.set(home, (history.homeCount.get(home) ?? 0) + 1);
						const outcome = rng();
						if (outcome < 0.45) points.set(home, (points.get(home) as number) + 3);
						else if (outcome < 0.9) points.set(away, (points.get(away) as number) + 3);
						else {
							points.set(home, (points.get(home) as number) + 1);
							points.set(away, (points.get(away) as number) + 1);
						}
					}
				}
				for (const count of byeCount.values()) expect(count).toBe(1);
			}
		}
	});
});
