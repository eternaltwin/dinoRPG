import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import { TournamentPhase } from '@drpg/core/models/dojo/tournament';

vi.mock('../../prisma.js', () => ({
	prisma: {
		tournamentTeam: { create: vi.fn(), delete: vi.fn() },
		dojo: { findUnique: vi.fn() },
		fightArchive: { findMany: vi.fn() },
		tournament: { count: vi.fn(), findMany: vi.fn() },
		dinoz: { count: vi.fn() },
		$transaction: vi.fn()
	}
}));
vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn(), getPlayerDinozInformationForTeam: vi.fn() }));
vi.mock('../../dao/archiveDao.js', () => ({ getViewedTournamentFight: vi.fn(), viewFight: vi.fn() }));
vi.mock('../../dao/tournamentDao.js', () => ({ getLatestTournament: vi.fn() }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../utils/tournamentManager.js', () => ({ default: { getCurrentTournamentState: vi.fn() } }));
vi.mock('../../utils/fight/weightedRandom.js', () => ({ default: vi.fn() }));

import { prisma } from '../../prisma.js';
import * as playerDao from '../../dao/playerDao.js';
import { getViewedTournamentFight, viewFight } from '../../dao/archiveDao.js';
import { getLatestTournament } from '../../dao/tournamentDao.js';
import TournamentManager from '../../utils/tournamentManager.js';
import weightedRandom from '../../utils/fight/weightedRandom.js';
import {
	createTournamentTeam,
	deleteTournamentTeam,
	getTournamentTeam,
	tournamentInfo,
	getTournamentFightsToShow,
	getDojoTournamentFights,
	readAllFightFromPool,
	tournamentsHistory,
	getNewLevelLimits
} from '../../business/tournamentService.js';

const req = (params = {}, body = {}) => makeRequest({ params, body });

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(playerDao.auth).mockResolvedValue({ id: 'p1' } as never);
	vi.mocked(TournamentManager.getCurrentTournamentState).mockResolvedValue({
		phase: TournamentPhase.QUALIFICATION
	} as never);
});

const latest = (overrides = {}) => ({
	id: 't1',
	teamSize: 2,
	teamRace: '1,2',
	levelLimit: 30,
	raceMinimum: 1,
	...overrides
});

describe('createTournamentTeam', () => {
	const playerDinoz = (overrides = {}) => ({
		Dojo: { id: 'd1', tournamentTeamId: null },
		dinoz: [
			{ id: 1, raceId: 1, level: 20 },
			{ id: 2, raceId: 2, level: 25 }
		],
		...overrides
	});

	it('creates the team when all checks pass', async () => {
		vi.mocked(getLatestTournament).mockResolvedValue(latest() as never);
		vi.mocked(playerDao.getPlayerDinozInformationForTeam).mockResolvedValue(playerDinoz() as never);
		await createTournamentTeam(req({}, { team: [1, 2] }));
		expect(prisma.tournamentTeam.create).toHaveBeenCalled();
	});

	it('throws when not in qualification phase', async () => {
		vi.mocked(TournamentManager.getCurrentTournamentState).mockResolvedValue({
			phase: TournamentPhase.FINALS
		} as never);
		await expect(createTournamentTeam(req({}, { team: [1, 2] }))).rejects.toThrow('qualificationOver');
	});

	it('throws when no tournament', async () => {
		vi.mocked(getLatestTournament).mockResolvedValue(null as never);
		await expect(createTournamentTeam(req({}, { team: [1, 2] }))).rejects.toThrow('No tournament found');
	});

	it('throws on wrong dinoz quantity', async () => {
		vi.mocked(getLatestTournament).mockResolvedValue(latest() as never);
		await expect(createTournamentTeam(req({}, { team: [1] }))).rejects.toThrow('wrongDinozQuantity');
	});

	it('throws when no dojo', async () => {
		vi.mocked(getLatestTournament).mockResolvedValue(latest() as never);
		vi.mocked(playerDao.getPlayerDinozInformationForTeam).mockResolvedValue(playerDinoz({ Dojo: null }) as never);
		await expect(createTournamentTeam(req({}, { team: [1, 2] }))).rejects.toThrow('inexistantDojo');
	});

	it('throws when already registered', async () => {
		vi.mocked(getLatestTournament).mockResolvedValue(latest() as never);
		vi.mocked(playerDao.getPlayerDinozInformationForTeam).mockResolvedValue(
			playerDinoz({ Dojo: { id: 'd1', tournamentTeamId: 5 } }) as never
		);
		await expect(createTournamentTeam(req({}, { team: [1, 2] }))).rejects.toThrow('alreadyRegistered');
	});

	it('throws when player misses a dinoz', async () => {
		vi.mocked(getLatestTournament).mockResolvedValue(latest() as never);
		vi.mocked(playerDao.getPlayerDinozInformationForTeam).mockResolvedValue(playerDinoz() as never);
		await expect(createTournamentTeam(req({}, { team: [1, 99] }))).rejects.toThrow('dinozNotPlayer');
	});

	it('throws on wrong race', async () => {
		vi.mocked(getLatestTournament).mockResolvedValue(latest({ teamRace: '5,6' }) as never);
		vi.mocked(playerDao.getPlayerDinozInformationForTeam).mockResolvedValue(playerDinoz() as never);
		await expect(createTournamentTeam(req({}, { team: [1, 2] }))).rejects.toThrow('wrongRace');
	});

	it('throws when a dinoz is too high level', async () => {
		vi.mocked(getLatestTournament).mockResolvedValue(latest({ levelLimit: 22 }) as never);
		vi.mocked(playerDao.getPlayerDinozInformationForTeam).mockResolvedValue(playerDinoz() as never);
		await expect(createTournamentTeam(req({}, { team: [1, 2] }))).rejects.toThrow('dinozTooHighLevel');
	});

	it('throws when not enough race diversity', async () => {
		vi.mocked(getLatestTournament).mockResolvedValue(latest({ raceMinimum: 2, teamRace: '1' }) as never);
		vi.mocked(playerDao.getPlayerDinozInformationForTeam).mockResolvedValue({
			Dojo: { id: 'd1', tournamentTeamId: null },
			dinoz: [
				{ id: 1, raceId: 1, level: 20 },
				{ id: 2, raceId: 1, level: 20 }
			]
		} as never);
		await expect(createTournamentTeam(req({}, { team: [1, 2] }))).rejects.toThrow('notEnoughDiversity');
	});
});

describe('deleteTournamentTeam', () => {
	it('deletes the team', async () => {
		vi.mocked(prisma.dojo.findUnique).mockResolvedValue({ tournamentTeamId: 7 } as never);
		await deleteTournamentTeam(req());
		expect(prisma.tournamentTeam.delete).toHaveBeenCalledWith({ where: { id: 7 } });
	});
	it('throws when no team', async () => {
		vi.mocked(prisma.dojo.findUnique).mockResolvedValue({ tournamentTeamId: null } as never);
		await expect(deleteTournamentTeam(req())).rejects.toThrow('Team inexistant');
	});
	it('throws when not in qualification', async () => {
		vi.mocked(TournamentManager.getCurrentTournamentState).mockResolvedValue(null as never);
		await expect(deleteTournamentTeam(req())).rejects.toThrow('qualificationOver');
	});
});

describe('getTournamentTeam', () => {
	it('returns the dinoz of the team', async () => {
		vi.mocked(prisma.dojo.findUnique).mockResolvedValue({ TournamentTeam: { dinoz: [{ id: 1 }] } } as never);
		expect(await getTournamentTeam(req())).toEqual([{ id: 1 }]);
	});
	it('returns [] when no team', async () => {
		vi.mocked(prisma.dojo.findUnique).mockResolvedValue({ TournamentTeam: null } as never);
		expect(await getTournamentTeam(req())).toEqual([]);
	});
});

describe('tournamentInfo', () => {
	it('returns the tournament with parsed races', async () => {
		vi.mocked(getLatestTournament).mockResolvedValue(latest({ teamRace: '1,2,3' }) as never);
		const result = await tournamentInfo(req());
		expect(result.teamRace).toEqual([1, 2, 3]);
	});
	it('throws when no tournament', async () => {
		vi.mocked(getLatestTournament).mockResolvedValue(null as never);
		await expect(tournamentInfo(req())).rejects.toThrow('No tournament found');
	});
});

describe('getTournamentFightsToShow', () => {
	it('marks bye fights as watched and limits to most advanced step', async () => {
		const fights = [
			{
				id: 1,
				metadata: { phase: TournamentPhase.QUALIFICATION, poolNumber: 0, round: 1 },
				tournamentTeamLeft: {},
				tournamentTeamRight: {}
			},
			{
				id: 2,
				metadata: { phase: TournamentPhase.QUALIFICATION, poolNumber: 0, round: 2 },
				tournamentTeamLeft: {},
				tournamentTeamRight: null
			}
		];
		vi.mocked(getViewedTournamentFight).mockResolvedValue([] as never);
		const result = await getTournamentFightsToShow(fights as never, 'p1', TournamentPhase.QUALIFICATION, 0);
		expect(result.find(f => f.id === 1)?.watched).toBe(false);
	});
});

describe('getDojoTournamentFights', () => {
	it('transforms and returns fights to show', async () => {
		vi.mocked(prisma.fightArchive.findMany).mockResolvedValue([
			{
				id: 1,
				tournamentTeamLeftId: 1,
				tournamentTeamRightId: 2,
				leftPlayer: { id: 'l', name: 'L' },
				rightPlayer: { id: 'r', name: 'R' },
				fighters: JSON.stringify([
					{ id: 1, type: 'dinoz', attacker: true },
					{ id: 2, type: 'dinoz', attacker: false }
				]),
				metadata: JSON.stringify({ phase: TournamentPhase.QUALIFICATION, poolNumber: 0, round: 1 }),
				result: 'win'
			}
		] as never);
		vi.mocked(getViewedTournamentFight).mockResolvedValue([] as never);
		const result = await getDojoTournamentFights(req({ id: 't1', pool: '0', phase: TournamentPhase.QUALIFICATION }));
		expect(result.length).toBe(1);
	});
});

describe('readAllFightFromPool', () => {
	it('views all fights in the pool', async () => {
		vi.mocked(prisma.fightArchive.findMany).mockResolvedValue([
			{
				id: 1,
				tournamentTeamLeft: { dinoz: [{ id: 1 }] },
				tournamentTeamRight: { dinoz: [{ id: 2 }] },
				metadata: JSON.stringify({ phase: TournamentPhase.QUALIFICATION, poolNumber: 0 }),
				result: 'win'
			}
		] as never);
		await readAllFightFromPool(req({ id: 't1', pool: '0', phase: TournamentPhase.QUALIFICATION }));
		expect(viewFight).toHaveBeenCalledWith('p1', 1);
	});
});

describe('tournamentsHistory', () => {
	it('returns count and history', async () => {
		vi.mocked(prisma.$transaction).mockResolvedValue([3, [{ id: 't1' }]] as never);
		const result = await tournamentsHistory(req({ page: '1' }));
		expect(result).toEqual({ count: 3, history: [{ id: 't1' }] });
	});
});

describe('getNewLevelLimits', () => {
	it('queries dinoz counts per level bracket', async () => {
		vi.mocked(prisma.$transaction).mockResolvedValue([10, 8, 6, 4, 2, 1] as never);
		vi.mocked(weightedRandom).mockReturnValue({ levelMax: 35, odds: 15 } as never);
		const result = await getNewLevelLimits([1, 2] as never);
		expect(result).toBe(35);
	});
});
