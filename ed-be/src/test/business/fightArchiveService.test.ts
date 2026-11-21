import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../dao/archiveDao.js', () => ({
	getArchivedFightRequest: vi.fn(),
	getFavoriteFightArchives: vi.fn(),
	getPlayerFightArchives: vi.fn(),
	isFavoriteFight: vi.fn(),
	purgeFightArchivesBefore: vi.fn(),
	setFavoriteFight: vi.fn(),
	getClanChampionshipFightParticipants: vi.fn(),
	isClanChampionshipFightReplayable: vi.fn()
}));
vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn() }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));

import * as archiveDao from '../../dao/archiveDao.js';
import { auth } from '../../dao/playerDao.js';
import {
	ArchiveSummaryRow,
	fightArchiveExpiry,
	fightArchiveKind,
	getMyFavoriteFights,
	getMyFightArchives,
	purgeExpiredFightArchives,
	toFightArchiveSummary,
	updateFavoriteFight
} from '../../business/fightArchiveService.js';
import { MAX_FAVORITE_FIGHTS } from '@drpg/core/models/fight/FightArchiveList';

const ARCHIVE_ID = '00000000-0000-0000-0000-0000000000aa';

function row(overrides: Partial<ArchiveSummaryRow> = {}): ArchiveSummaryRow {
	return {
		id: ARCHIVE_ID,
		createdDate: new Date('2026-05-21T10:00:00'),
		result: true,
		fighters: JSON.stringify([
			{ id: 1, type: 'dinoz', name: 'Moi', attacker: true, display: 'x', maxHp: 10 },
			{ id: 2, type: 'dinoz', name: 'Lui', attacker: false, display: 'y', maxHp: 10 }
		]),
		metadata: null,
		tournamentId: null,
		FBTournamentId: null,
		leftPlayer: { id: 'p1', name: 'P1' },
		rightPlayer: { id: 'p2', name: 'P2' },
		FightWatched: [],
		...overrides
	};
}

describe('fightArchiveKind', () => {
	it('tells each kind of archived fight apart', () => {
		expect(fightArchiveKind(row({ metadata: JSON.stringify({ kind: 'clanChampionship', placeId: 1 }) }))).toBe(
			'clanChampionship'
		);
		expect(fightArchiveKind(row({ tournamentId: 't1', metadata: '{}' }))).toBe('tournament');
		expect(fightArchiveKind(row({ FBTournamentId: 't1', metadata: '{}' }))).toBe('forceBrute');
		expect(fightArchiveKind(row({ rightPlayer: null }))).toBe('forceBrute');
		expect(fightArchiveKind(row({ metadata: JSON.stringify({ placeId: 3, rightClanName: 'C' }) }))).toBe('clanWar');
		expect(fightArchiveKind(row({ metadata: JSON.stringify({ placeId: 3 }) }))).toBe('dojo');
		expect(fightArchiveKind(row())).toBe('dojo');
		expect(fightArchiveKind(row({ metadata: 'not json' }))).toBe('dojo');
	});
});

describe('fightArchiveExpiry', () => {
	it('is the first midnight purge after the retention period', () => {
		expect(fightArchiveExpiry(new Date('2026-05-21T10:00:00'))).toEqual(new Date('2026-11-22T00:00:00'));
		expect(fightArchiveExpiry(new Date('2026-05-21T00:00:00'))).toEqual(new Date('2026-11-22T00:00:00'));
	});
});

describe('toFightArchiveSummary', () => {
	it('keeps only what the list shows and flags my favorites', () => {
		const summary = toFightArchiveSummary(row({ FightWatched: [{ playerId: 'p1' }] }), 'p1');
		expect(summary.favorite).toBe(true);
		expect(summary.expiresAt).toBeNull();
		expect(summary.fighters).toEqual([
			{ id: 1, type: 'dinoz', name: 'Moi', attacker: true },
			{ id: 2, type: 'dinoz', name: 'Lui', attacker: false }
		]);
	});

	it('is kept but not my favorite when only someone else keeps it', () => {
		const summary = toFightArchiveSummary(row({ FightWatched: [{ playerId: 'p2' }] }), 'p1');
		expect(summary.favorite).toBe(false);
		expect(summary.expiresAt).toBeNull();
	});

	it('never expires a clan championship fight', () => {
		const summary = toFightArchiveSummary(row({ metadata: JSON.stringify({ kind: 'clanChampionship' }) }), 'p1');
		expect(summary.favorite).toBe(false);
		expect(summary.expiresAt).toBeNull();
	});

	it('gives the expiry date when nobody keeps it', () => {
		const summary = toFightArchiveSummary(row(), 'p1');
		expect(summary.expiresAt).toBe(new Date('2026-11-22T00:00:00').toISOString());
		expect(summary.rightClanName).toBeNull();
	});
});

describe('list endpoints', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(auth).mockResolvedValue({ id: 'p1' } as never);
	});

	it('pages my fights', async () => {
		vi.mocked(archiveDao.getPlayerFightArchives).mockResolvedValue({ total: 12, archives: [row()] } as never);
		const res = await getMyFightArchives(makeRequest({ params: { page: '2' } }));
		expect(archiveDao.getPlayerFightArchives).toHaveBeenCalledWith('p1', 2, 10);
		expect(res.total).toBe(12);
		expect(res.fights).toHaveLength(1);
	});

	it('lists my favorites with the limit', async () => {
		vi.mocked(archiveDao.getFavoriteFightArchives).mockResolvedValue([row({ FightWatched: [{ playerId: 'p1' }] })]);
		const res = await getMyFavoriteFights(makeRequest());
		expect(res.max).toBe(MAX_FAVORITE_FIGHTS);
		expect(res.fights[0].favorite).toBe(true);
	});
});

describe('updateFavoriteFight', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(auth).mockResolvedValue({ id: 'p1' } as never);
	});

	const req = (favorite: boolean) => makeRequest({ params: { archiveId: ARCHIVE_ID }, body: { favorite } });

	it('refuses a missing archive', async () => {
		vi.mocked(archiveDao.getArchivedFightRequest).mockResolvedValue(null);
		await expect(updateFavoriteFight(req(true))).rejects.toThrow('dojo.archiveNotFound');
		expect(archiveDao.setFavoriteFight).not.toHaveBeenCalled();
	});

	it('refuses a clan championship fight the player cannot read yet', async () => {
		vi.mocked(archiveDao.getArchivedFightRequest).mockResolvedValue({
			metadata: JSON.stringify({ kind: 'clanChampionship' })
		} as never);
		vi.mocked(archiveDao.getClanChampionshipFightParticipants).mockResolvedValue(['p2']);
		vi.mocked(archiveDao.isClanChampionshipFightReplayable).mockResolvedValue(false);
		await expect(updateFavoriteFight(req(true))).rejects.toThrow('No replay found.');
		expect(archiveDao.setFavoriteFight).not.toHaveBeenCalled();
	});

	it('adds a favorite under the limit', async () => {
		vi.mocked(archiveDao.getArchivedFightRequest).mockResolvedValue({ metadata: null } as never);
		vi.mocked(archiveDao.setFavoriteFight).mockResolvedValue(3);
		await expect(updateFavoriteFight(req(true))).resolves.toEqual({
			favorite: true,
			count: 3,
			max: MAX_FAVORITE_FIGHTS
		});
		expect(archiveDao.setFavoriteFight).toHaveBeenCalledWith('p1', ARCHIVE_ID, true, MAX_FAVORITE_FIGHTS);
	});

	it('refuses a favorite over the limit', async () => {
		vi.mocked(archiveDao.getArchivedFightRequest).mockResolvedValue({ metadata: null } as never);
		vi.mocked(archiveDao.setFavoriteFight).mockResolvedValue(null);
		await expect(updateFavoriteFight(req(true))).rejects.toThrow('favoriteFightLimit');
	});

	it('removes a favorite', async () => {
		vi.mocked(archiveDao.getArchivedFightRequest).mockResolvedValue({ metadata: null } as never);
		vi.mocked(archiveDao.setFavoriteFight).mockResolvedValue(0);
		await expect(updateFavoriteFight(req(false))).resolves.toMatchObject({ favorite: false, count: 0 });
	});
});

describe('purgeExpiredFightArchives', () => {
	it('deletes the archives older than six months', async () => {
		vi.mocked(archiveDao.purgeFightArchivesBefore).mockResolvedValue(42);
		await expect(purgeExpiredFightArchives(new Date('2026-11-22T00:00:00'))).resolves.toBe(42);
		expect(archiveDao.purgeFightArchivesBefore).toHaveBeenCalledWith(new Date('2026-05-22T00:00:00'), 5000);
	});
});
