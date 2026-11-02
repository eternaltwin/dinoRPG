/**
 * Circle-method round robin. Each round pairs every clan once; an odd field gets a bye placeholder,
 * so a clan sitting out a round simply has no match in it. The fixed clan alternates home/away per round.
 */
export function roundRobin(clanIds: number[]): [home: number, away: number][][] {
	const BYE = null;
	const slots: (number | null)[] = clanIds.length % 2 === 0 ? [...clanIds] : [...clanIds, BYE];
	const m = slots.length;
	const rotating = slots.slice(1);
	const rounds: [number, number][][] = [];

	for (let r = 0; r < m - 1; r++) {
		// Rotate the non-fixed clans by r positions, the fixed clan stays at index 0.
		const arrangement = [slots[0], ...rotating.map((_, i) => rotating[(i + r) % rotating.length])];
		const matches: [number, number][] = [];
		for (let i = 0; i < m / 2; i++) {
			const a = arrangement[i];
			const b = arrangement[m - 1 - i];
			if (a === BYE || b === BYE) continue;
			matches.push(i === 0 && r % 2 === 1 ? [b, a] : [a, b]);
		}
		rounds.push(matches);
	}
	return rounds;
}
