import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import { TournamentPhase } from '@drpg/core/models/dojo/tournament';
import { FightOutcome } from '@drpg/core/models/fight/FightResult';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';

vi.mock('../../dao/archiveDao.js', () => ({
	archiveFight: vi.fn(),
	getAllArchivedFightRequest: vi.fn(),
	getArchivedFightRequest: vi.fn(),
	viewFight: vi.fn()
}));
vi.mock('../../dao/dinozDao.js', () => ({ getDinozForDojoFight: vi.fn(), getRandomDinozFromLevel: vi.fn() }));
vi.mock('../../dao/dojoDao.js', () => ({
	addOpponent: vi.fn(),
	cleanCurrentOpponentTeam: vi.fn(),
	createMyDojo: vi.fn(),
	getMyDojoDao: vi.fn(),
	getMyTeamDao: vi.fn(),
	incrementDailyReset: vi.fn(),
	replaceMyTeamDao: vi.fn()
}));
vi.mock('../../dao/notificationDao.js', () => ({ createNotification: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({
	auth: vi.fn(),
	getDojoChallengePreparationRequest: vi.fn(),
	getDojoDataForRanking: vi.fn(),
	getDojoFightPreparationRequest: vi.fn(),
	getPlayerDinozInformationForTeam: vi.fn(),
	spendMoney: vi.fn()
}));
vi.mock('../../dao/playerItemDao.js', () => ({ increaseItemQuantity: vi.fn() }));
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
import { getDinozForDojoFight, getRandomDinozFromLevel } from '../../dao/dinozDao.js';
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
	skipOpponent
} from '../../business/dojoService.js';

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
	vi.mocked(playerDao.auth).mockResolvedValue({ id: 'p1', name: 'Bob' } as never);
	vi.mocked(TournamentManager.getCurrentTournamentState).mockResolvedValue({ id: 'tt', phase: TournamentPhase.QUALIFICATION } as never);
	// $transaction supports the callback form used by fightChallenge/skipOpponent
	vi.mocked(prisma.$transaction).mockImplementation(async (arg: never) => {
		if (typeof arg === 'function') {
			txObj.dojo.findUniqueOrThrow.mockResolvedValue({ id: 'd1', reputation: 100, DojoChallengeHistory: [] });
			txObj.player.updateMany.mockResolvedValue({ count: 1 });
			return (arg as unknown as (tx: unknown) => unknown)(txObj);
		}
		return [];
	});
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
	const dinozList = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, level: 20 }));
	beforeEach(() => {
		vi.mocked(dojoDao.getMyDojoDao).mockResolvedValue({ id: 'd1', playerId: 'p1' } as never);
		vi.mocked(playerDao.getPlayerDinozInformationForTeam).mockResolvedValue({ dinoz: dinozList } as never);
		vi.mocked(getRandomDinozFromLevel).mockResolvedValue({ id: 99 } as never);
		vi.mocked(dojoDao.replaceMyTeamDao).mockResolvedValue({ id: 'team' } as never);
	});
	it('creates a team with valid input', async () => {
		const result = await createMyTeam(req({ team: [1, 2, 3, 4, 5] }));
		expect(result).toEqual({ id: 'team' });
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
		vi.mocked(playerDao.getPlayerDinozInformationForTeam).mockResolvedValue(
			{ dinoz: [{ id: 1, level: 5 }, { id: 2, level: 20 }, { id: 3, level: 20 }, { id: 4, level: 20 }, { id: 5, level: 20 }] } as never
		);
		await expect(createMyTeam(req({ team: [1, 2, 3, 4, 5] }))).rejects.toThrow('dinozTooLowLevel');
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
			team: [{ dinoz: { id: 1, level: 20 } }],
			DojoOpponents: [],
			dailyReset: 0
		} as never);
		vi.mocked(dojoDao.cleanCurrentOpponentTeam).mockResolvedValue([{ dinoz: { id: 1, level: 20 } }] as never);
		vi.mocked(getRandomDinozFromLevel).mockResolvedValue({ id: 50 } as never);
		vi.mocked(dojoDao.addOpponent).mockResolvedValue({ dinozId: 50 } as never);
		const result = await getMyTeam(req());
		expect(result.DojoOpponents).toBeDefined();
	});
});

describe('fightFriend', () => {
	beforeEach(() => {
		vi.mocked(playerDao.getDojoFightPreparationRequest).mockImplementation(
			async (id: never) =>
				({
					money: 1000,
					cooker: false,
					dinoz: [{ id: 1, unavailableReason: null }]
				}) as never
		);
		vi.mocked(getDinozForDojoFight).mockResolvedValue([{ id: 1, items: [], maxLife: 100, life: 50, playerId: 'p1' }] as never);
		vi.mocked(calculateFightBetweenPlayers).mockReturnValue(fightResult() as never);
		vi.mocked(playerDao.spendMoney).mockResolvedValue(true as never);
		vi.mocked(getLatestTournament).mockResolvedValue({ id: 'tt' } as never);
		vi.mocked(archiveDao.archiveFight).mockResolvedValue({ id: 'arch', result: true } as never);
	});
	it('runs a friendly fight', async () => {
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
		await expect(fightFriend(req({ left: [1], right: [1], rightId: 'p2' }))).rejects.toThrow('inexistantOpponent');
	});
	it('throws when not enough gold', async () => {
		vi.mocked(playerDao.getDojoFightPreparationRequest).mockResolvedValue(
			{ money: 0, cooker: false, dinoz: [{ id: 1, unavailableReason: null }] } as never
		);
		await expect(fightFriend(req({ left: [1], right: [1], rightId: 'p2' }))).rejects.toThrow('notEnoughGold');
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
		vi.mocked(getDinozForDojoFight).mockResolvedValue([{ id: 1, items: [], maxLife: 100, life: 50, skills: [], playerId: 'p1' }] as never);
		vi.mocked(calculateFightBetweenPlayers).mockReturnValue(fightResult() as never);
		vi.mocked(archiveDao.archiveFight).mockResolvedValue({ id: 'arch', result: true } as never);
		vi.mocked(getLatestTournament).mockResolvedValue({ id: 'tt' } as never);
	});
	it('runs a challenge fight and returns the result', async () => {
		const result = await fightChallenge(req({ myDinoz: 1, opponent: 2 }));
		expect(result.victory).toBe(true);
		expect(result.fight).toEqual({ id: 'arch', result: true });
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
		vi.mocked(playerDao.getDojoChallengePreparationRequest).mockResolvedValue({ money: 0, Dojo: { team: [], DojoOpponents: [] } } as never);
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
		vi.mocked(playerDao.getDojoDataForRanking).mockResolvedValue({ reputation: 100, DojoChallengeHistory: [] } as never);
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
