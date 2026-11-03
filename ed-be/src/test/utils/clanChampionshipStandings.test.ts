import { describe, expect, it } from 'vitest';
import { computeStandings, StandingMatch } from '../../utils/clanChampionship/standings.js';

let nextId = 1;
const names: Record<string, number> = {};
function idOf(name: string): number {
	return (names[name] ??= nextId++);
}

function match(home: string, away: string, homeScore: number, awayScore: number, status: StandingMatch['status']) {
	return {
		homeClanId: idOf(home),
		awayClanId: idOf(away),
		homeClanName: home,
		awayClanName: away,
		homeScore,
		awayScore,
		status
	} as StandingMatch;
}

describe('computeStandings', () => {
	it('lists every clan of the calendar with zeros before any finished match', () => {
		const rows = computeStandings([match('B', 'A', 0, 0, 'scheduled'), match('C', 'A', 0, 0, 'scheduled')]);
		expect(rows.map(r => r.clanName)).toEqual(['A', 'B', 'C']);
		for (const row of rows) expect(row).toMatchObject({ points: 0, played: 0, rank: 1 });
	});

	it('gives 3/1/0 points from the scores', () => {
		const rows = computeStandings([
			match('A', 'B', 10, 4, 'finished'),
			match('B', 'C', 5, 5, 'finished'),
			match('A', 'C', 0, 0, 'live')
		]);
		const by = (n: string) => rows.find(r => r.clanName === n);
		expect(by('A')).toMatchObject({ points: 3, won: 1, played: 1, scoreFor: 10, scoreAgainst: 4, scoreDiff: 6 });
		expect(by('B')).toMatchObject({
			points: 1,
			won: 0,
			drawn: 1,
			lost: 1,
			played: 2,
			scoreFor: 9,
			scoreAgainst: 15,
			scoreDiff: -6
		});
		expect(by('C')).toMatchObject({ points: 1, drawn: 1, played: 1, scoreDiff: 0 });
	});

	it('breaks ties on score difference then on total scored', () => {
		const rows = computeStandings([
			match('B', 'X', 7, 2, 'finished'),
			match('C', 'Y', 4, 2, 'finished'),
			match('D', 'Z', 20, 10, 'finished'),
			match('E', 'W', 12, 2, 'finished')
		]);
		const order = rows.map(r => r.clanName);
		expect(order.indexOf('B')).toBeLessThan(order.indexOf('C'));
		expect(order.indexOf('D')).toBeLessThan(order.indexOf('E'));
	});

	it('shares the rank on a full tie and orders by name', () => {
		const rows = computeStandings([match('Y', 'X', 5, 5, 'finished'), match('Z', 'W', 9, 0, 'finished')]);
		expect(rows.map(r => [r.clanName, r.rank])).toEqual([
			['Z', 1],
			['X', 2],
			['Y', 2],
			['W', 4]
		]);
	});

	it('keeps a deleted clan under its snapshot name', () => {
		const rows = computeStandings([{ ...match('Gone', 'B', 3, 1, 'finished'), homeClanId: null }]);
		expect(rows[0]).toMatchObject({ clanId: null, clanName: 'Gone', points: 3 });
	});
});
