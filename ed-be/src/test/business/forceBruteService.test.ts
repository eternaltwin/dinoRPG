import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';

const fbInstance = { resume: vi.fn(), initializeTournament: vi.fn() };
vi.mock('../../utils/forcebruteManager.js', () => ({
	default: vi.fn(function () {
		return fbInstance;
	})
}));
vi.mock('../../dao/playerDao.js', () => ({ addMoney: vi.fn(), auth: vi.fn(), ownsDinoz: vi.fn() }));
vi.mock('../../dao/dinozSkillDao.js', () => ({ addMultipleSkillToDinoz: vi.fn() }));
vi.mock('../../dao/archiveDao.js', () => ({ archiveFight: vi.fn(), viewFight: vi.fn() }));
vi.mock('../../dao/dinozDao.js', () => ({ updateDinoz: vi.fn() }));
vi.mock('../../dao/dinozStatusDao.js', () => ({ addStatusToDinoz: vi.fn() }));
vi.mock('../../dao/dinozItemDao.js', () => ({ removeItemFromDinoz: vi.fn() }));
vi.mock('../../dao/trackingDao.js', () => ({ setSpecificStat: vi.fn() }));
vi.mock('../../utils/dinoz.js', () => ({ getRandomUpElement: vi.fn(), generateDinozDisplay: vi.fn() }));
vi.mock('../../utils/randomEnum.js', () => ({ getRandomEnumValue: vi.fn() }));
vi.mock('../../business/inventoryService.js', () => ({ generateDinozDisplay: vi.fn().mockReturnValue('d') }));
vi.mock('../../business/fightService.js', () => ({ calculateFightBetweenPlayers: vi.fn() }));
vi.mock('../../business/tournamentService.js', () => ({ getTournamentFightsToShow: vi.fn().mockResolvedValue([]) }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../prisma.js', () => ({
	prisma: {
		fBTournament: { findMany: vi.fn(), findFirst: vi.fn(), findFirstOrThrow: vi.fn() },
		gameDinoz: { findMany: vi.fn(), findFirst: vi.fn(), findFirstOrThrow: vi.fn(), count: vi.fn(), create: vi.fn() },
		dinoz: { findFirst: vi.fn() },
		fightArchive: { findMany: vi.fn() },
		player: { findUniqueOrThrow: vi.fn() },
		$queryRaw: vi.fn()
	}
}));

import { prisma } from '../../prisma.js';
import { auth } from '../../dao/playerDao.js';
import {
	resumeTournaments,
	checkFBCreation,
	getCurrentTournament,
	getCurrentEvents,
	getPlayerParticipation,
	createTournamentDinoz,
	getFBTournamentFights,
	readAllFightFromEventPool,
	getFBTournamentOpponent
} from '../../business/forceBruteService.js';
import { TournamentPhase } from '@drpg/core/models/dojo/tournament';
import { viewFight } from '../../dao/archiveDao.js';
import { ownsDinoz } from '../../dao/playerDao.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { generateDinozDisplay } from '../../utils/dinoz.js';

const req = (params = {}, body = {}) => makeRequest({ params, body });

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(auth).mockResolvedValue({ id: 'p1' } as never);
});

describe('resumeTournaments', () => {
	it('resumes each ongoing tournament', async () => {
		vi.mocked(prisma.fBTournament.findMany).mockResolvedValue([{ levelLimit: 20 }, { levelLimit: 30 }] as never);
		await resumeTournaments();
		expect(fbInstance.resume).toHaveBeenCalledTimes(2);
	});
});

describe('checkFBCreation', () => {
	it('creates a tournament when none exists and level >= 10', async () => {
		vi.mocked(prisma.fBTournament.findFirst).mockResolvedValue(null as never);
		await checkFBCreation(20);
		expect(fbInstance.initializeTournament).toHaveBeenCalled();
	});
	it('does nothing when a tournament exists', async () => {
		vi.mocked(prisma.fBTournament.findFirst).mockResolvedValue({ id: 't1' } as never);
		await checkFBCreation(20);
		expect(fbInstance.initializeTournament).not.toHaveBeenCalled();
	});
	it('does nothing for level < 10', async () => {
		vi.mocked(prisma.fBTournament.findFirst).mockResolvedValue(null as never);
		await checkFBCreation(5);
		expect(fbInstance.initializeTournament).not.toHaveBeenCalled();
	});
});

describe('getCurrentTournament', () => {
	it('returns qualif state when under 256 participants', async () => {
		vi.mocked(prisma.fBTournament.findFirst).mockResolvedValue({
			id: 't1',
			date: new Date(),
			levelLimit: 20,
			participants: [{ level: 20 }]
		} as never);
		const result = await getCurrentTournament(req({ id: 't1' }));
		expect(result?.state).toBe('qualif');
	});
	it('returns fights state when 256+ participants', async () => {
		vi.mocked(prisma.fBTournament.findFirst).mockResolvedValue({
			id: 't1',
			date: new Date(),
			levelLimit: 20,
			participants: Array.from({ length: 256 }, () => ({ level: 20 }))
		} as never);
		const result = await getCurrentTournament(req({ id: 't1' }));
		expect(result?.state).toBe('fights');
	});
	it('returns undefined when no tournament', async () => {
		vi.mocked(prisma.fBTournament.findFirst).mockResolvedValue(null as never);
		expect(await getCurrentTournament(req({ id: 't1' }))).toBeUndefined();
	});
});

describe('getCurrentEvents', () => {
	it('returns the raw query result', async () => {
		vi.mocked(prisma.$queryRaw).mockResolvedValue([{ id: 't1' }] as never);
		expect(await getCurrentEvents()).toEqual([{ id: 't1' }]);
	});
});

describe('getPlayerParticipation', () => {
	it('returns the player participating dinoz', async () => {
		vi.mocked(prisma.fBTournament.findFirstOrThrow).mockResolvedValue({ id: 't1' } as never);
		vi.mocked(prisma.gameDinoz.findMany).mockResolvedValue([
			{ id: 1, name: 'd', level: 20, display: 'x', FBTournamentId: 't1', skills: [{ skillId: 5 }] }
		] as never);
		const result = await getPlayerParticipation(req({ tournamentId: 't1' }));
		expect(result[0].skills).toEqual([5]);
	});
});

describe('createTournamentDinoz', () => {
	it('throws on invalid name', async () => {
		await expect(createTournamentDinoz(req({}, { name: '@@' }))).rejects.toThrow('OnlyLettersAndNumbers');
	});
	it('throws when the account is too young', async () => {
		vi.mocked(prisma.player.findUniqueOrThrow).mockResolvedValue({
			createdDate: new Date(),
			ranking: { points: 100 }
		} as never);
		await expect(createTournamentDinoz(req({}, { name: 'Rex', tournamentId: 't1' }))).rejects.toThrow(
			'tooYoungAccount'
		);
	});
	it('throws when not enough points', async () => {
		vi.mocked(prisma.player.findUniqueOrThrow).mockResolvedValue({
			createdDate: new Date(Date.now() - 10 * 24 * 3600 * 1000),
			ranking: { points: 1 }
		} as never);
		vi.mocked(prisma.fBTournament.findFirstOrThrow).mockResolvedValue({
			levelLimit: 20,
			teamRace: '1',
			id: 't1'
		} as never);
		await expect(createTournamentDinoz(req({}, { name: 'Rex', tournamentId: 't1' }))).rejects.toThrow(
			'notEnoughPoints'
		);
	});

	it('creates a tournament dinoz when all checks pass', async () => {
		vi.mocked(prisma.player.findUniqueOrThrow).mockResolvedValue({
			createdDate: new Date(Date.now() - 10 * 24 * 3600 * 1000),
			ranking: { points: 100 }
		} as never);
		vi.mocked(prisma.fBTournament.findFirstOrThrow).mockResolvedValue({
			levelLimit: 20,
			teamRace: '1',
			id: 't1'
		} as never);
		vi.mocked(prisma.gameDinoz.findFirst).mockResolvedValue(null as never);
		vi.mocked(prisma.gameDinoz.count).mockResolvedValue(0 as never);
		vi.mocked(prisma.gameDinoz.create).mockResolvedValue({ id: 9 } as never);
		await createTournamentDinoz(req({}, { name: 'Rex', tournamentId: 't1' }));
		expect(prisma.gameDinoz.create).toHaveBeenCalled();
	});

	it('throws when a dinoz was already created today', async () => {
		vi.mocked(prisma.player.findUniqueOrThrow).mockResolvedValue({
			createdDate: new Date(Date.now() - 10 * 24 * 3600 * 1000),
			ranking: { points: 100 }
		} as never);
		vi.mocked(prisma.fBTournament.findFirstOrThrow).mockResolvedValue({
			levelLimit: 20,
			teamRace: '1',
			id: 't1'
		} as never);
		vi.mocked(prisma.gameDinoz.findFirst).mockResolvedValue({ id: 1, createdDate: new Date() } as never);
		await expect(createTournamentDinoz(req({}, { name: 'Rex', tournamentId: 't1' }))).rejects.toThrow(
			'alreadyCreatedDinoz'
		);
	});
});

describe('fight list handlers', () => {
	it('getFBTournamentFights transforms and returns fights', async () => {
		vi.mocked(prisma.fightArchive.findMany).mockResolvedValue([
			{
				id: 1,
				fighters: '[]',
				metadata: JSON.stringify({ phase: 'pools', poolNumber: 0 }),
				result: true,
				FBTournamentLeft: { id: 1 },
				FBTournamentRight: { id: 2 },
				leftPlayer: null,
				rightPlayer: null
			}
		] as never);
		const result = await getFBTournamentFights(req({ id: 't1', pool: '0', phase: TournamentPhase.POOLS }));
		expect(result).toEqual([]);
	});
	it('readAllFightFromEventPool views matching pool fights', async () => {
		vi.mocked(prisma.fightArchive.findMany).mockResolvedValue([
			{
				id: 1,
				metadata: JSON.stringify({ phase: TournamentPhase.POOLS, poolNumber: 0 }),
				result: true,
				FBTournamentLeft: { id: 1 },
				FBTournamentRight: { id: 2 }
			}
		] as never);
		await readAllFightFromEventPool(req({ id: 't1', pool: '0', phase: TournamentPhase.POOLS }));
		expect(viewFight).toHaveBeenCalled();
	});
});

describe('getFBTournamentOpponent', () => {
	beforeEach(() => vi.mocked(ownsDinoz).mockResolvedValue(true as never));
	it('returns a generated opponent', async () => {
		vi.mocked(prisma.dinoz.findFirst).mockResolvedValue({
			FBTournamentStep: 10,
			placeId: PlaceEnum.FORCEBRUT
		} as never);
		vi.mocked(prisma.fBTournament.findFirst).mockResolvedValue({ winnerId: 'w1' } as never);
		vi.mocked(prisma.gameDinoz.findFirstOrThrow).mockResolvedValue({ display: 'd', level: 20, seed: 'seed' } as never);
		const result = await getFBTournamentOpponent(req({ dinozId: '1' }));
		expect(result.level).toBe(20);
		expect(result.stage).toBe(10);
	});
	it('throws when the player does not own the dinoz', async () => {
		vi.mocked(ownsDinoz).mockResolvedValue(false as never);
		await expect(getFBTournamentOpponent(req({ dinozId: '1' }))).rejects.toThrow('does not own');
	});
	it('throws when not at the forcebrute place', async () => {
		vi.mocked(prisma.dinoz.findFirst).mockResolvedValue({ FBTournamentStep: 10, placeId: 1 } as never);
		await expect(getFBTournamentOpponent(req({ dinozId: '1' }))).rejects.toThrow('right place');
	});
	it('throws when there is no opponent', async () => {
		vi.mocked(prisma.dinoz.findFirst).mockResolvedValue({
			FBTournamentStep: 10,
			placeId: PlaceEnum.FORCEBRUT
		} as never);
		vi.mocked(prisma.fBTournament.findFirst).mockResolvedValue({ winnerId: null } as never);
		await expect(getFBTournamentOpponent(req({ dinozId: '1' }))).rejects.toThrow('noOpponent');
	});
});
