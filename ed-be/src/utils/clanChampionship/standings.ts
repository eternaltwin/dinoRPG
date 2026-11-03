import { ClanChampionshipMatchStatus, ClanChampionshipStandingDTO } from '@drpg/core/models/clan/clanChampionship';

export type StandingMatch = {
	homeClanId: number | null;
	awayClanId: number | null;
	homeClanName: string;
	awayClanName: string;
	homeScore: number;
	awayScore: number;
	status: ClanChampionshipMatchStatus;
};

const POINTS_WIN = 3;
const POINTS_DRAW = 1;

type Row = Omit<ClanChampionshipStandingDTO, 'rank'>;

/**
 * Championship table. Rows are keyed by snapshot name so a deleted clan keeps its line. Only finished matches
 * score; win/draw come from the scores (the winner id is null for a deleted winner too).
 */
export function computeStandings(matches: StandingMatch[]): ClanChampionshipStandingDTO[] {
	const rows = new Map<string, Row>();
	const rowOf = (name: string, clanId: number | null): Row => {
		let row = rows.get(name);
		if (!row) {
			row = {
				clanId,
				clanName: name,
				played: 0,
				won: 0,
				drawn: 0,
				lost: 0,
				points: 0,
				scoreFor: 0,
				scoreAgainst: 0,
				scoreDiff: 0
			};
			rows.set(name, row);
		} else if (row.clanId === null) {
			row.clanId = clanId;
		}
		return row;
	};

	for (const m of matches) {
		const home = rowOf(m.homeClanName, m.homeClanId);
		const away = rowOf(m.awayClanName, m.awayClanId);
		if (m.status !== 'finished') continue;
		for (const [row, scored, conceded] of [
			[home, m.homeScore, m.awayScore],
			[away, m.awayScore, m.homeScore]
		] as const) {
			row.played++;
			row.scoreFor += scored;
			row.scoreAgainst += conceded;
			row.scoreDiff = row.scoreFor - row.scoreAgainst;
			if (scored > conceded) {
				row.won++;
				row.points += POINTS_WIN;
			} else if (scored === conceded) {
				row.drawn++;
				row.points += POINTS_DRAW;
			} else {
				row.lost++;
			}
		}
	}

	const sorted = [...rows.values()].sort(
		(a, b) =>
			b.points - a.points ||
			b.scoreDiff - a.scoreDiff ||
			b.scoreFor - a.scoreFor ||
			a.clanName.localeCompare(b.clanName)
	);
	const tied = (a: Row, b: Row) => a.points === b.points && a.scoreDiff === b.scoreDiff && a.scoreFor === b.scoreFor;
	return sorted.map((row, i) => ({ rank: sorted.findIndex(o => tied(o, row)) + 1 || i + 1, ...row }));
}
