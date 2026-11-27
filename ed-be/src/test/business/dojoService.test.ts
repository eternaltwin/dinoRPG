import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import { TournamentPhase } from '@drpg/core/models/dojo/tournament';
import { FightOutcome } from '@drpg/core/models/fight/FightResult';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';

vi.mock('../../dao/archiveDao.js', () => ({
	archiveFight: vi.fn(),
	getAllArchivedFightRequest: vi.fn(),
	getArchivedFightRequest: vi.fn(),
	getClanChampionshipFightParticipants: vi.fn(),
	isClanChampionshipFightReplayable: vi.fn().mockResolvedValue(false),
	viewFight: vi.fn()
}));
vi.mock('../../dao/dinozDao.js', () => ({
	getDinozForDojoFight: vi.fn(),
	getRandomDinozFromLevel: vi.fn(),
	getRandomDinozOfRaceFromLevel: vi.fn(),
	getRandomPoolDinoz: vi.fn()
}));
vi.mock('../../dao/dojoDao.js', () => ({
	addOpponent: vi.fn(),
	cleanCurrentOpponentTeam: vi.fn(),
	createMyDojo: vi.fn(),
	getMyDojoDao: vi.fn(),
	getMyTeamDao: vi.fn(),
	getRecentTournamentIds: vi.fn(),
	incrementDailyReset: vi.fn(),
	replaceMyTeamDao: vi.fn(),
	upsertQualifPool: vi.fn()
}));
vi.mock('../../dao/notificationDao.js', () => ({ createNotification: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({
	auth: vi.fn(),
	getDojoChallengePreparationRequest: vi.fn(),
	getDojoDataForRanking: vi.fn(),
	getDojoFightPreparationRequest: vi.fn(),
	getPlayerDinozInformationForTeam: vi.fn(),
	getDojoFriendData: vi.fn(),
	getPlayerShopOneItemDataRequest: vi.fn(),
	spendMoney: vi.fn()
}));
vi.mock('../../dao/playerItemDao.js', () => ({ increaseItemQuantity: vi.fn(), insertItem: vi.fn() }));
vi.mock('../../dao/rankingDao.js', () => ({ getPlayerPositionDojoDAO: vi.fn() }));
vi.mock('../../dao/tournamentDao.js', () => ({ getLatestTournament: vi.fn(), incrementCashPrice: vi.fn() }));
vi.mock('../../utils/tournamentManager.js', () => ({ default: { getCurrentTournamentState: vi.fn() } }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../business/fightService.js', () => ({ calculateFightBetweenPlayers: vi.fn() }));

const txObj = {
	dojo: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
	player: { updateMany: vi.fn() },
	tournament: { update: vi.fn() },
	dojoTeam: { update: vi.fn() },
	dojoOpponents: { update: vi.fn() },
	dojoChallengeHistory: { create: vi.fn() },
	ranking: { update: vi.fn() }
};
vi.mock('../../prisma.js', () => ({
	prisma: {
		$transaction: vi.fn()
	}
}));

import { prisma } from '../../prisma.js';
import * as playerDao from '../../dao/playerDao.js';
import * as dojoDao from '../../dao/dojoDao.js';
import * as archiveDao from '../../dao/archiveDao.js';
import {
	getDinozForDojoFight,
	getRandomDinozFromLevel,
	getRandomDinozOfRaceFromLevel,
	getRandomPoolDinoz
} from '../../dao/dinozDao.js';
import { getPlayerPositionDojoDAO } from '../../dao/rankingDao.js';
import { getLatestTournament } from '../../dao/tournamentDao.js';
import TournamentManager from '../../utils/tournamentManager.js';
import { calculateFightBetweenPlayers } from '../../business/fightService.js';
import {
	getDojo,
	createMyTeam,
	getMyTeam,
	fightFriend,
	getArchivedFight,
	getAllArchivedFight,
	fightChallenge,
	skipOpponent,
	getFriendDinoz
} from '../../business/dojoService.js';
import { UnavailableReason } from '@drpg/prisma';

const req = (body = {}, params = {}) => makeRequest({ body, params });

const fightResult = (outcome = FightOutcome.AttackerWin) => ({
	outcome,
	stats: {
		attack: { endingHp: 100, startingHp: 100 },
		defense: { endingHp: 0, startingHp: 100 }
	}
});

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(playerDao.auth).mockResolvedValue({ id: 'p1', name: 'Bob', clanId: 1 } as never);
	vi.mocked(TournamentManager.getCurrentTournamentState).mockResolvedValue({
		id: 'tt',
		phase: TournamentPhase.QUALIFICATION
	} as never);
	// $transaction supports the callback form used by fightChallenge/skipOpponent
	vi.mocked(prisma.$transaction).mockImplementation(async (arg: never) => {
		if (typeof arg === 'function') {
			txObj.dojo.findUniqueOrThrow.mockResolvedValue({ id: 'd1', reputation: 100, DojoChallengeHistory: [] });
			txObj.player.updateMany.mockResolvedValue({ count: 1 });
			return (arg as unknown as (tx: unknown) => unknown)(txObj);
		}
		return [];
	});
	vi.mocked(dojoDao.getRecentTournamentIds).mockResolvedValue(['tt', 'prev']);
	vi.mocked(getRandomPoolDinoz).mockResolvedValue(null);
	vi.mocked(getRandomDinozOfRaceFromLevel).mockResolvedValue(null);
});

describe('getDojo', () => {
	it('returns existing dojo, rank, and tournament', async () => {
		vi.mocked(dojoDao.getMyDojoDao).mockResolvedValue({ id: 'd1' } as never);
		vi.mocked(getPlayerPositionDojoDAO).mockResolvedValue(3 as never);
		const result = await getDojo(req());
		expect(result.dojo).toEqual({ id: 'd1' });
		expect(result.rank).toBe(3);
	});
	it('creates a dojo when none exists', async () => {
		vi.mocked(dojoDao.getMyDojoDao).mockResolvedValue(null as never);
		vi.mocked(dojoDao.createMyDojo).mockResolvedValue({ id: 'new' } as never);
		vi.mocked(getPlayerPositionDojoDAO).mockResolvedValue(1 as never);
		const result = await getDojo(req());
		expect(dojoDao.createMyDojo).toHaveBeenCalled();
		expect(result.dojo).toEqual({ id: 'new' });
	});
});

describe('createMyTeam', () => {
	const dinozList = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, level: 20, raceId: i + 1 }));
	beforeEach(() => {
		vi.mocked(dojoDao.getMyDojoDao).mockResolvedValue({ id: 'd1', playerId: 'p1', dailyReset: 0 } as never);
		vi.mocked(playerDao.getPlayerDinozInformationForTeam).mockResolvedValue({ dinoz: dinozList } as never);
		vi.mocked(getRandomDinozFromLevel).mockResolvedValue({ id: 99 } as never);
		vi.mocked(dojoDao.replaceMyTeamDao).mockResolvedValue({ id: 'team' } as never);
	});
	it('creates a team with valid input', async () => {
		const result = await createMyTeam(req({ team: [1, 2, 3, 4, 5] }));
		expect(result).toEqual({ id: 'team' });
		// The daily quota and the team already selected today are checked by the conditional write
		expect(dojoDao.replaceMyTeamDao).toHaveBeenCalledWith(
			[1, 2, 3, 4, 5],
			expect.any(Array),
			'd1',
			5,
			expect.any(Date)
		);
	});
	it('refuses a new team once the waves of the day are over', async () => {
		vi.mocked(dojoDao.getMyDojoDao).mockResolvedValue({ id: 'd1', playerId: 'p1', dailyReset: 5 } as never);
		await expect(createMyTeam(req({ team: [1, 2, 3, 4, 5] }))).rejects.toThrow('dailySeriesOver');
		expect(dojoDao.replaceMyTeamDao).not.toHaveBeenCalled();
	});
	it('refuses to replace a team selected today', async () => {
		vi.mocked(dojoDao.replaceMyTeamDao).mockResolvedValue(null);
		await expect(createMyTeam(req({ team: [1, 2, 3, 4, 5] }))).rejects.toThrow('teamAlreadyChanged');
	});
	it('throws when not in qualification', async () => {
		vi.mocked(TournamentManager.getCurrentTournamentState).mockResolvedValue(null as never);
		await expect(createMyTeam(req({ team: [1, 2, 3, 4, 5] }))).rejects.toThrow('qualificationOver');
	});
	it('throws when wrong number of dinoz', async () => {
		await expect(createMyTeam(req({ team: [1, 2] }))).rejects.toThrow('wrongDinozInTeam');
	});
	it('throws when a dinoz is not the player', async () => {
		await expect(createMyTeam(req({ team: [1, 2, 3, 4, 99] }))).rejects.toThrow('dinozNotPlayer');
	});
	it('throws when a dinoz is too low level', async () => {
		vi.mocked(playerDao.getPlayerDinozInformationForTeam).mockResolvedValue({
			dinoz: [
				{ id: 1, level: 5, raceId: 1 },
				{ id: 2, level: 20, raceId: 2 },
				{ id: 3, level: 20, raceId: 3 },
				{ id: 4, level: 20, raceId: 4 },
				{ id: 5, level: 20, raceId: 5 }
			]
		} as never);
		await expect(createMyTeam(req({ team: [1, 2, 3, 4, 5] }))).rejects.toThrow('dinozTooLowLevel');
	});
	it('refuses a team of 4 races', async () => {
		vi.mocked(playerDao.getPlayerDinozInformationForTeam).mockResolvedValue({
			dinoz: [1, 2, 3, 4, 4].map((raceId, i) => ({ id: i + 1, level: 20, raceId }))
		} as never);
		await expect(createMyTeam(req({ team: [1, 2, 3, 4, 5] }))).rejects.toThrow('dojo.qualif.notEnoughRaces');
		expect(dojoDao.replaceMyTeamDao).not.toHaveBeenCalled();
		expect(dojoDao.upsertQualifPool).not.toHaveBeenCalled();
	});
	it('counts a demon and a normal dinoz of the same race once', async () => {
		// Dinoz 5 is the demon of race 4: it keeps the raceId of its race
		vi.mocked(playerDao.getPlayerDinozInformationForTeam).mockResolvedValue({
			dinoz: [
				{ id: 1, level: 20, raceId: 1 },
				{ id: 2, level: 20, raceId: 2 },
				{ id: 3, level: 20, raceId: 3 },
				{ id: 4, level: 20, raceId: 4 },
				{ id: 5, level: 30, raceId: 4 }
			]
		} as never);
		await expect(createMyTeam(req({ team: [1, 2, 3, 4, 5] }))).rejects.toThrow('dojo.qualif.notEnoughRaces');
	});
	it('accepts 5 races and registers the team in the pool of the tournament', async () => {
		await createMyTeam(req({ team: [1, 2, 3, 4, 5] }));
		expect(dojoDao.upsertQualifPool).toHaveBeenCalledWith(
			'tt',
			dinozList.map(d => ({ id: d.id, raceId: d.raceId, level: d.level }))
		);
	});
});

describe('opponent picking', () => {
	beforeEach(() => {
		vi.mocked(dojoDao.getMyDojoDao).mockResolvedValue({ id: 'd1', playerId: 'p1', dailyReset: 0 } as never);
		vi.mocked(dojoDao.replaceMyTeamDao).mockResolvedValue({ id: 'team' } as never);
	});
	const pickedOpponents = () => [...vi.mocked(dojoDao.replaceMyTeamDao).mock.calls[0][1]].sort((a, b) => a - b);
	it('draws one opponent of the same race per race, from the highest dinoz of each race', async () => {
		vi.mocked(playerDao.getPlayerDinozInformationForTeam).mockResolvedValue({
			dinoz: [
				{ id: 1, level: 20, raceId: 1 },
				{ id: 2, level: 25, raceId: 1 },
				{ id: 3, level: 30, raceId: 2 },
				{ id: 4, level: 15, raceId: 3 },
				{ id: 5, level: 40, raceId: 4 },
				{ id: 6, level: 12, raceId: 5 }
			]
		} as never);
		const excludedAtCall: number[][] = [];
		vi.mocked(getRandomPoolDinoz).mockImplementation(async (raceId: number, _level, exclude: number[]) => {
			excludedAtCall.push([...exclude]);
			return { id: 100 + raceId };
		});
		await createMyTeam(req({ team: [1, 2, 3, 4, 5, 6] }));
		const calls = vi.mocked(getRandomPoolDinoz).mock.calls;
		// Slots are ordered by level: race 4 (40), race 2 (30), race 1 (25), race 3 (15), race 5 (12)
		expect(calls.map(c => [c[0], c[1]])).toEqual([
			[4, 40],
			[2, 30],
			[1, 25],
			[3, 15],
			[5, 12]
		]);
		// Current and previous tournaments, the player id, the team and the opponents already picked are excluded
		expect(calls.every(c => c[3] === 'p1' && c[4].join() === 'tt,prev')).toBe(true);
		expect(excludedAtCall[0]).toEqual([1, 2, 3, 4, 5, 6]);
		expect(excludedAtCall[4]).toEqual([1, 2, 3, 4, 5, 6, 104, 102, 101, 103]);
		expect(getRandomDinozOfRaceFromLevel).not.toHaveBeenCalled();
		expect(getRandomDinozFromLevel).not.toHaveBeenCalled();
		expect(pickedOpponents()).toEqual([101, 102, 103, 104, 105]);
	});
	it('keeps 5 races drawn at random when the team has more', async () => {
		vi.mocked(playerDao.getPlayerDinozInformationForTeam).mockResolvedValue({
			dinoz: Array.from({ length: 7 }, (_, i) => ({ id: i + 1, level: 20, raceId: i + 1 }))
		} as never);
		vi.mocked(getRandomPoolDinoz).mockImplementation(async (raceId: number) => ({ id: 100 + raceId }));
		await createMyTeam(req({ team: [1, 2, 3, 4, 5, 6, 7] }));
		const races = vi.mocked(getRandomPoolDinoz).mock.calls.map(c => c[0]);
		expect(races).toHaveLength(5);
		expect(new Set(races).size).toBe(5);
	});
	it('falls back to the same race in the whole game, then to any race', async () => {
		vi.mocked(playerDao.getPlayerDinozInformationForTeam).mockResolvedValue({
			dinoz: Array.from({ length: 5 }, (_, i) => ({ id: i + 1, level: 20 + i, raceId: i + 1 }))
		} as never);
		// Race 1 comes from the pool, race 2 from the whole game, the other ones from any race
		vi.mocked(getRandomPoolDinoz).mockImplementation(async (raceId: number) => (raceId === 1 ? { id: 201 } : null));
		vi.mocked(getRandomDinozOfRaceFromLevel).mockImplementation(async (raceId: number) =>
			raceId === 2 ? { id: 202 } : null
		);
		let next = 300;
		vi.mocked(getRandomDinozFromLevel).mockImplementation(async () => ({ id: next++ }) as never);
		await createMyTeam(req({ team: [1, 2, 3, 4, 5] }));
		expect(getRandomPoolDinoz).toHaveBeenCalledTimes(5);
		expect(getRandomDinozOfRaceFromLevel).toHaveBeenCalledTimes(4);
		expect(getRandomDinozFromLevel).toHaveBeenCalledTimes(3);
		expect(pickedOpponents()).toEqual([201, 202, 300, 301, 302]);
	});
	it('creates no opponent when a slot cannot be filled', async () => {
		vi.mocked(playerDao.getPlayerDinozInformationForTeam).mockResolvedValue({
			dinoz: Array.from({ length: 5 }, (_, i) => ({ id: i + 1, level: 20, raceId: i + 1 }))
		} as never);
		vi.mocked(getRandomDinozFromLevel).mockResolvedValue(null);
		await createMyTeam(req({ team: [1, 2, 3, 4, 5] }));
		expect(vi.mocked(dojoDao.replaceMyTeamDao).mock.calls[0][1]).toEqual([]);
	});
});

describe('getMyTeam', () => {
	it('throws when no dojo', async () => {
		vi.mocked(dojoDao.getMyTeamDao).mockResolvedValue(null as never);
		await expect(getMyTeam(req())).rejects.toThrow('inexistantDojo');
	});
	it('returns dojo directly when team empty', async () => {
		vi.mocked(dojoDao.getMyTeamDao).mockResolvedValue({ team: [], DojoOpponents: [], dailyReset: 0 } as never);
		expect(await getMyTeam(req())).toEqual({ team: [], DojoOpponents: [], dailyReset: 0 });
	});
	it('regenerates opponents when all achieved', async () => {
		vi.mocked(dojoDao.getMyTeamDao).mockResolvedValue({
			id: 'd1',
			playerId: 'p1',
			team: [{ dinoz: { id: 1, level: 20, raceId: 3 } }],
			DojoOpponents: [],
			dailyReset: 0
		} as never);
		vi.mocked(dojoDao.cleanCurrentOpponentTeam).mockResolvedValue([
			{ dinoz: { id: 1, level: 20, raceId: 3 } }
		] as never);
		vi.mocked(getRandomDinozFromLevel).mockResolvedValue({ id: 50 } as never);
		vi.mocked(dojoDao.addOpponent).mockResolvedValue({ dinozId: 50 } as never);
		const result = await getMyTeam(req());
		expect(result.DojoOpponents).toBeDefined();
		// The race of the team dinoz drives the draw
		expect(getRandomPoolDinoz).toHaveBeenCalledWith(3, 20, expect.any(Array), 'p1', ['tt', 'prev']);
	});
});

describe('fightFriend', () => {
	beforeEach(() => {
		vi.mocked(playerDao.getDojoFightPreparationRequest).mockImplementation(
			async (id: never) =>
				({
					money: 1000,
					cooker: false,
					dinoz: [{ id: 1, unavailableReason: null }],
					clanId: 1
				}) as never
		);
		vi.mocked(getDinozForDojoFight).mockResolvedValue([
			{ id: 1, items: [], maxLife: 100, life: 50, playerId: 'p1' }
		] as never);
		vi.mocked(calculateFightBetweenPlayers).mockReturnValue(fightResult() as never);
		vi.mocked(playerDao.spendMoney).mockResolvedValue(true as never);
		vi.mocked(getLatestTournament).mockResolvedValue({ id: 'tt' } as never);
		vi.mocked(archiveDao.archiveFight).mockResolvedValue({ id: 'arch', result: true } as never);
	});
	it('runs a friendly fight', async () => {
		const result = await fightFriend(req({ left: [1], right: [1], rightId: 'p2' }));
		expect(result.fight).toEqual({ id: 'arch', result: true });
	});
	it('accepts dinoz locked on the clan championship board', async () => {
		vi.mocked(playerDao.getDojoFightPreparationRequest).mockResolvedValue({
			money: 1000,
			cooker: false,
			dinoz: [{ id: 1, unavailableReason: UnavailableReason.clanChampionship }],
			clanId: 1
		} as never);
		const result = await fightFriend(req({ left: [1], right: [1], rightId: 'p2' }));
		expect(result.fight).toEqual({ id: 'arch', result: true });
	});
	it('throws when left player invalid', async () => {
		vi.mocked(playerDao.getDojoFightPreparationRequest).mockResolvedValueOnce(null as never);
		await expect(fightFriend(req({ left: [1], right: [1], rightId: 'p2' }))).rejects.toThrow('dinozNotPlayer');
	});
	it('throws when right player missing', async () => {
		vi.mocked(playerDao.getDojoFightPreparationRequest)
			.mockResolvedValueOnce({ money: 1000, cooker: false, dinoz: [{ id: 1, unavailableReason: null }] } as never)
			.mockResolvedValueOnce(null as never);
		await expect(fightFriend(req({ left: [1], right: [1], rightId: 'p2' }))).rejects.toThrow('playerNotFound');
	});
	it('throws when not enough gold', async () => {
		vi.mocked(playerDao.getDojoFightPreparationRequest).mockResolvedValue({
			money: 0,
			cooker: false,
			dinoz: [{ id: 1, unavailableReason: null }]
		} as never);
	});
	it('throws when not in same clan', async () => {
		vi.mocked(playerDao.getDojoFightPreparationRequest).mockResolvedValue({
			money: 1000,
			cooker: false,
			dinoz: [{ id: 1, unavailableReason: null }],
			clanId: 2
		} as never);
		await expect(fightFriend(req({ left: [1], right: [1], rightId: 'p2' }))).rejects.toThrow('error.notInYourClan');
	});
});

describe('getDojoFriendData', () => {
	it('throws when player is not found', async () => {
		vi.mocked(playerDao.getDojoFriendData).mockResolvedValue(null);
		await expect(getFriendDinoz(req({}, { id: 1 }))).rejects.toThrow('playerNotFound');
	});
	it('throws when player is not in same clan', async () => {
		vi.mocked(playerDao.getDojoFriendData).mockResolvedValue({ dinoz: [], clanId: 2 });
		await expect(getFriendDinoz(req({}, { id: 1 }))).rejects.toThrow('error.notInYourClan');
	});
	it('returns player available dinoz if all ok', async () => {
		vi.mocked(playerDao.getDojoFriendData).mockResolvedValue({
			dinoz: [
				{ id: 1, name: 'abc', display: '0123', level: 1, unavailableReason: null },
				{ id: 2, name: 'abc', display: '0123', level: 1, unavailableReason: UnavailableReason.resting },
				{ id: 3, name: 'abc', display: '0123', level: 1, unavailableReason: UnavailableReason.frozen },
				{ id: 4, name: 'abc', display: '0123', level: 1, unavailableReason: UnavailableReason.unfreezing },
				{ id: 5, name: 'abc', display: '0123', level: 1, unavailableReason: UnavailableReason.unsacrificing },
				{ id: 6, name: 'abc', display: '0123', level: 1, unavailableReason: UnavailableReason.selling }
			],
			clanId: 1
		});
		let result = await getFriendDinoz(req({}, { id: 1 }));
		expect(result.length).toBe(2);
	});
	it('keeps dinoz locked on the clan championship board', async () => {
		vi.mocked(playerDao.getDojoFriendData).mockResolvedValue({
			dinoz: [
				{ id: 1, name: 'abc', display: '0123', level: 1, unavailableReason: null },
				{ id: 2, name: 'abc', display: '0123', level: 1, unavailableReason: UnavailableReason.clanChampionship }
			],
			clanId: 1
		});
		const result = await getFriendDinoz(req({}, { id: 1 }));
		expect(result.map(d => d.id)).toEqual([1, 2]);
	});
});

describe('getArchivedFight / getAllArchivedFight', () => {
	it('returns a parsed archived fight', async () => {
		vi.mocked(archiveDao.getArchivedFightRequest).mockResolvedValue({
			fighters: '[]',
			result: true,
			steps: '[]',
			seed: 's',
			leftPlayer: null,
			rightPlayer: null
		} as never);
		const result = await getArchivedFight(req({}, { id: 'f1' }));
		expect(result.id).toBe('f1');
	});
	it('throws when archive not found', async () => {
		vi.mocked(archiveDao.getArchivedFightRequest).mockResolvedValue(null as never);
		await expect(getArchivedFight(req({}, { id: 'f1' }))).rejects.toThrow('archiveNotFound');
	});
	describe('clan championship archives', () => {
		const cdcArchive = () =>
			vi.mocked(archiveDao.getArchivedFightRequest).mockResolvedValue({
				fighters: '[]',
				result: true,
				steps: '[]',
				seed: 's',
				leftPlayer: null,
				rightPlayer: null,
				metadata: JSON.stringify({ kind: 'clanChampionship', matchId: 'm', placeId: 1 })
			} as never);
		it('denies a non-participant without recording a view', async () => {
			cdcArchive();
			vi.mocked(archiveDao.viewFight).mockClear();
			vi.mocked(archiveDao.getClanChampionshipFightParticipants).mockResolvedValue(['p2']);
			await expect(getArchivedFight(req({}, { id: 'f1' }))).rejects.toThrow('No replay found.');
			expect(archiveDao.viewFight).not.toHaveBeenCalled();
		});
		it('allows a participant', async () => {
			cdcArchive();
			vi.mocked(archiveDao.getClanChampionshipFightParticipants).mockResolvedValue(['p1']);
			const result = await getArchivedFight(req({}, { id: 'f1' }));
			expect(result.id).toBe('f1');
			expect(archiveDao.viewFight).toHaveBeenCalledWith('p1', 'f1');
		});
	});
	it('returns filtered dojo archives', async () => {
		vi.mocked(archiveDao.getAllArchivedFightRequest).mockResolvedValue({
			archive: [
				{ id: 1, fighters: '[]', metadata: JSON.stringify({ placeId: PlaceEnum.DOJO }) },
				{ id: 2, fighters: '[]', metadata: null }
			],
			totalArchive: 2
		} as never);
		const result = await getAllArchivedFight(req({}, { page: '0' }));
		expect(result.quantity).toBe(2);
		expect(result.archive.length).toBe(2);
	});
	it('excludes clan championship archives even when their place is the dojo', async () => {
		vi.mocked(archiveDao.getAllArchivedFightRequest).mockResolvedValue({
			archive: [
				{ id: 1, fighters: '[]', metadata: JSON.stringify({ kind: 'clanChampionship', placeId: PlaceEnum.DOJO }) },
				{ id: 2, fighters: '[]', metadata: JSON.stringify({ placeId: PlaceEnum.DOJO }) }
			],
			totalArchive: 2
		} as never);
		const result = await getAllArchivedFight(req({}, { page: '0' }));
		expect(result.archive.map(f => f.id)).toEqual([2]);
	});
});

describe('fightChallenge', () => {
	beforeEach(() => {
		vi.mocked(playerDao.getDojoChallengePreparationRequest).mockResolvedValue({
			money: 1000,
			Dojo: {
				id: 'd1',
				team: [{ dinozId: 1, fighted: false }],
				DojoOpponents: [{ dinozId: 2, achieved: false }],
				activeChallenge: { type: 'damage', goal: 1 },
				DojoChallengeHistory: []
			}
		} as never);
		vi.mocked(playerDao.getPlayerShopOneItemDataRequest).mockImplementation(
			async (id: string, itemId: number) =>
				({
					items: [{ id: itemId, quantity: 0 }],
					rewards: [],
					shopKeeper: false
				}) as never
		);
		vi.mocked(getDinozForDojoFight).mockResolvedValue([
			{ id: 1, items: [], maxLife: 100, life: 50, skills: [], playerId: 'p1', level: 20, raceId: 1 }
		] as never);
		vi.mocked(calculateFightBetweenPlayers).mockReturnValue(fightResult() as never);
		vi.mocked(archiveDao.archiveFight).mockResolvedValue({ id: 'arch', result: true } as never);
		vi.mocked(getLatestTournament).mockResolvedValue({ id: 'tt' } as never);
	});
	const fighter = (id: number, playerId: string, dinoz: { level: number; raceId: number }) => [
		{ id, items: [], maxLife: 100, life: 50, skills: [], playerId, ...dinoz }
	];
	const fighters = (attacker: { level: number; raceId: number }, target: { level: number; raceId: number }) =>
		vi
			.mocked(getDinozForDojoFight)
			.mockResolvedValueOnce(fighter(1, 'p1', attacker) as never)
			.mockResolvedValueOnce(fighter(2, 'p2', target) as never);
	const featured = (featuredRace: number | null) =>
		vi.mocked(TournamentManager.getCurrentTournamentState).mockResolvedValue({
			id: 'tt',
			phase: TournamentPhase.QUALIFICATION,
			featuredRace
		} as never);
	const reputationIncrement = () => txObj.dojo.update.mock.calls[0][0].data.reputation.increment;
	it('runs a challenge fight and returns the result', async () => {
		const result = await fightChallenge(req({ myDinoz: 1, opponent: 2 }));
		expect(result.victory).toBe(true);
		expect(result.fight).toEqual({ id: 'arch', result: true });
		// The mocked fight also wins the challenge: 4 + 4
		expect(result.challengeWon).toBe(true);
		expect(result.gain).toEqual({ base: 8, levelBonus: 0, featuredMultiplier: 1, total: 8 });
		expect(reputationIncrement()).toBe(8);
	});
	it('multiplies the gain by 1.5 when the attacker is of the race of the day', async () => {
		featured(1);
		fighters({ level: 20, raceId: 1 }, { level: 20, raceId: 2 });
		const result = await fightChallenge(req({ myDinoz: 1, opponent: 2 }));
		expect(result.gain.featuredMultiplier).toBe(1.5);
		expect(reputationIncrement()).toBe(12);
	});
	it('doubles the gain when both dinoz are of the race of the day', async () => {
		featured(1);
		fighters({ level: 20, raceId: 1 }, { level: 20, raceId: 1 });
		const result = await fightChallenge(req({ myDinoz: 1, opponent: 2 }));
		expect(result.gain.featuredMultiplier).toBe(2);
		expect(reputationIncrement()).toBe(16);
	});
	it('adds 2 points against a target 12 levels higher', async () => {
		fighters({ level: 20, raceId: 1 }, { level: 32, raceId: 2 });
		const result = await fightChallenge(req({ myDinoz: 1, opponent: 2 }));
		expect(result.gain.levelBonus).toBe(2);
		expect(reputationIncrement()).toBe(10);
		// The ranking still uses round(worth × reputation): 1 victory out of 1 fight, 100 + 10
		expect(txObj.ranking.update).toHaveBeenCalledWith({ where: { playerId: 'p1' }, data: { dojo: 110 } });
	});
	it('earns nothing on a defeat', async () => {
		featured(1);
		fighters({ level: 20, raceId: 1 }, { level: 40, raceId: 1 });
		vi.mocked(calculateFightBetweenPlayers).mockReturnValue(fightResult(FightOutcome.DefenderWin) as never);
		vi.mocked(archiveDao.archiveFight).mockResolvedValue({ id: 'arch', result: false } as never);
		const result = await fightChallenge(req({ myDinoz: 1, opponent: 2 }));
		expect(result.victory).toBe(false);
		expect(result.gain.total).toBe(0);
		expect(reputationIncrement()).toBe(0);
	});
	it('throws when not in qualification', async () => {
		vi.mocked(TournamentManager.getCurrentTournamentState).mockResolvedValue(null as never);
		await expect(fightChallenge(req({ myDinoz: 1, opponent: 2 }))).rejects.toThrow('qualificationOver');
	});
	it('throws when no dojo', async () => {
		vi.mocked(playerDao.getDojoChallengePreparationRequest).mockResolvedValue({ money: 1000, Dojo: null } as never);
		await expect(fightChallenge(req({ myDinoz: 1, opponent: 2 }))).rejects.toThrow('inexistantDojo');
	});
	it('throws when not enough gold', async () => {
		vi.mocked(playerDao.getDojoChallengePreparationRequest).mockResolvedValue({
			money: 0,
			Dojo: { team: [], DojoOpponents: [] }
		} as never);
		await expect(fightChallenge(req({ myDinoz: 1, opponent: 2 }))).rejects.toThrow('notEnoughGold');
	});
	it('throws when dinoz already fighted', async () => {
		vi.mocked(playerDao.getDojoChallengePreparationRequest).mockResolvedValue({
			money: 1000,
			Dojo: { team: [{ dinozId: 1, fighted: true }], DojoOpponents: [{ dinozId: 2, achieved: false }] }
		} as never);
		await expect(fightChallenge(req({ myDinoz: 1, opponent: 2 }))).rejects.toThrow('alreadyFighted');
	});
});

describe('skipOpponent', () => {
	beforeEach(() => {
		vi.mocked(playerDao.getDojoChallengePreparationRequest).mockResolvedValue({
			money: 1000,
			Dojo: {
				id: 'd1',
				activeChallenge: { type: 'damage', goal: 1 },
				DojoOpponents: [{ dinozId: 2, fighted: true, achieved: false }]
			}
		} as never);
		vi.mocked(playerDao.getDojoDataForRanking).mockResolvedValue({
			reputation: 100,
			DojoChallengeHistory: []
		} as never);
	});
	it('skips an opponent', async () => {
		await skipOpponent(req({ opponent: 2 }));
		expect(prisma.$transaction).toHaveBeenCalled();
	});
	it('throws when opponent not found', async () => {
		vi.mocked(playerDao.getDojoChallengePreparationRequest).mockResolvedValue({
			money: 1000,
			Dojo: { id: 'd1', DojoOpponents: [] }
		} as never);
		await expect(skipOpponent(req({ opponent: 2 }))).rejects.toThrow('inexistantOpponent');
	});
	it('throws when opponent not fought', async () => {
		vi.mocked(playerDao.getDojoChallengePreparationRequest).mockResolvedValue({
			money: 1000,
			Dojo: { id: 'd1', DojoOpponents: [{ dinozId: 2, fighted: false, achieved: false }] }
		} as never);
		await expect(skipOpponent(req({ opponent: 2 }))).rejects.toThrow('notFightedOpponent');
	});
});
