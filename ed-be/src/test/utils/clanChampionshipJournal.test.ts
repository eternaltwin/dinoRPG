import { describe, expect, it } from 'vitest';
import {
	FightJournalEntryDTO,
	journalPagesDisconnected,
	mergeFightJournal
} from '@drpg/core/models/clan/clanChampionship';

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

describe('journalPagesDisconnected', () => {
	it('is false when the refreshed page still overlaps the previous one', () => {
		expect(journalPagesDisconnected(range(60, 11), range(75, 26))).toBe(false);
	});

	it('is true when a full refreshed page no longer reaches the previous one', () => {
		expect(journalPagesDisconnected(range(60, 11), range(160, 111))).toBe(true);
	});

	it('is false for a short refreshed page', () => {
		expect(journalPagesDisconnected(range(60, 11), range(70, 61))).toBe(false);
	});

	it('is false without a previous page', () => {
		expect(journalPagesDisconnected([], range(160, 111))).toBe(false);
	});
});
