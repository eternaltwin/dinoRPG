import { describe, expect, it } from 'vitest';
import { FightJournalEntryDTO, mergeFightJournal } from '@drpg/core/models/clan/clanChampionship';

function range(from: number, to: number): FightJournalEntryDTO[] {
	const out: FightJournalEntryDTO[] = [];
	for (let id = from; id >= to; id--) {
		out.push({
			id,
			createdAt: new Date(),
			attackerClanId: 1,
			attackerWon: true,
			participantCount: 2,
			deadDinozIds: [],
			archiveId: null
		});
	}
	return out;
}

const ids = (l: FightJournalEntryDTO[]) => l.map(f => f.id);
const seq = (from: number, to: number) => Array.from({ length: from - to + 1 }, (_, i) => from - i);

describe('mergeFightJournal', () => {
	it('appends older pages after the newest ones', () => {
		expect(ids(mergeFightJournal(range(60, 11), range(10, 1)))).toEqual(seq(60, 1));
	});

	it('drops older entries now covered by a refreshed board', () => {
		const older = [...range(13, 1), ...range(10, 1)];
		expect(ids(mergeFightJournal(range(63, 14), older))).toEqual(seq(63, 1));
	});

	it('returns the older entries when the board has no fights', () => {
		expect(ids(mergeFightJournal([], [...range(10, 6), ...range(8, 1)]))).toEqual(seq(10, 1));
	});
});
