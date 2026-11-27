import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import dayjs from 'dayjs';

vi.mock('../../context.js', () => ({
	LOGGER: { log: vi.fn(), error: vi.fn() },
	DISCORD: { sendNewsNotification: vi.fn() }
}));
vi.mock('../../business/fightService.js', () => ({ calculateFightBetweenPlayers: vi.fn() }));
vi.mock('../../business/tournamentService.js', () => ({ getNewLevelLimits: vi.fn() }));
vi.mock('../../dao/dinozDao.js', () => ({ getDinozForDojoFight: vi.fn(), selectDinozForDojoFight: vi.fn() }));
vi.mock('../../dao/playerRewardsDao.js', () => ({ addRewardToPlayer: vi.fn() }));
vi.mock('../../dao/playerItemDao.js', () => ({ increaseItemQuantity: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({ addMoney: vi.fn() }));
vi.mock('../../dao/newsDao.js', () => ({ createNews: vi.fn() }));
vi.mock('../../dao/notificationDao.js', () => ({ createNotification: vi.fn() }));
vi.mock('../../utils/rewarder.js', () => ({ rewarder: vi.fn(), describeRewards: vi.fn(() => '') }));
vi.mock('../../utils/tournament.cache.js', () => ({ invalidateTournamentCache: vi.fn() }));
vi.mock('../../utils/server/translate.js', () => ({ translateTarget: (k: string) => k, default: (k: string) => k }));
vi.mock('node-schedule', () => {
	const job = { cancel: vi.fn(), schedule: vi.fn() };
	return { scheduleJob: vi.fn(), scheduledJobs: new Proxy({}, { get: () => job }) };
});
vi.mock('../../business/newsService.js', () => ({ createTranslatedNews: vi.fn(), createNewsPoll: vi.fn() }));
vi.mock('../../dao/tournamentDao.js', () => ({ getArchetypeContext: vi.fn(), getPreviousTournamentId: vi.fn() }));
// The catalogue is implemented by another lot: only its contract is used here
vi.mock('@drpg/core/models/dojo/tournamentArchetypes', () => ({
	nextMeta: vi.fn(),
	rollCandidates: vi.fn(),
	TEAM_SIZE_MIN: 3,
	TEAM_SIZE_MAX: 6
}));

import TournamentManager, { resolveRaceMinimumLocal, resolveTeamSizeLocal } from '../../utils/tournamentManager.js';
import { createNewsPoll, createTranslatedNews } from '../../business/newsService.js';
import { getArchetypeContext, getPreviousTournamentId } from '../../dao/tournamentDao.js';
import { nextMeta, rollCandidates, ArchetypeCandidate } from '@drpg/core/models/dojo/tournamentArchetypes';
import { getNewLevelLimits } from '../../business/tournamentService.js';
import { LOGGER } from '../../context.js';
import { Lang, NewsType } from '@drpg/prisma';
import { RaceEnum } from '@drpg/core/models/enums/RaceEnum';

type MockPrisma = Record<string, Record<string, ReturnType<typeof vi.fn>>>;
function mockPrisma(overrides: Partial<MockPrisma> = {}): MockPrisma {
	return {
		tournament: {
			findFirst: vi.fn(),
			findUnique: vi.fn(),
			findUniqueOrThrow: vi.fn(),
			update: vi.fn(),
			create: vi.fn(),
			count: vi.fn()
		},
		fightArchive: { findFirst: vi.fn(), findMany: vi.fn() },
		dinoz: { updateMany: vi.fn() },
		pollOption: { findMany: vi.fn() },
		pollVote: { groupBy: vi.fn() },
		ranking: { findMany: vi.fn() },
		$queryRaw: vi.fn(),
		...overrides
	} as MockPrisma;
}

beforeEach(() => vi.clearAllMocks());

describe('getCurrentState', () => {
	it('reports the qualification phase for a tournament starting in the future', async () => {
		const manager = new TournamentManager('t1', dayjs().add(2, 'day').toDate());
		const prisma = mockPrisma();
		prisma.tournament.findUnique.mockResolvedValue({ id: 't1', nextRound: new Date() });
		prisma.fightArchive.findFirst.mockResolvedValue(null);
		const state = await manager.getCurrentState(prisma as never);
		expect(state.phase).toBeDefined();
		expect(state.round).toBe(0);
	});
	it('computes the round from the last fight', async () => {
		const manager = new TournamentManager('t1', dayjs().subtract(20, 'day').toDate());
		const prisma = mockPrisma();
		prisma.tournament.findUnique.mockResolvedValue({ id: 't1', nextRound: new Date() });
		prisma.fightArchive.findFirst.mockResolvedValue({ tournamentStep: 3 });
		const state = await manager.getCurrentState(prisma as never);
		expect(state.round).toBe(4);
	});
	it('throws when the tournament is missing', async () => {
		const manager = new TournamentManager('t1', new Date());
		const prisma = mockPrisma();
		prisma.tournament.findUnique.mockResolvedValue(null);
		await expect(manager.getCurrentState(prisma as never)).rejects.toThrow('non trouvé');
	});
});

describe('getCurrentTournament / getCurrentTournamentState', () => {
	it('returns the full tournament state', async () => {
		const prisma = mockPrisma();
		const t = {
			id: 't1',
			date: dayjs().subtract(1, 'day').toDate(),
			cashPrice: 100,
			levelLimit: 30,
			featuredRaces: [],
			nextRound: new Date()
		};
		prisma.tournament.findFirst.mockResolvedValue(t);
		prisma.tournament.findUnique.mockResolvedValue(t);
		prisma.fightArchive.findFirst.mockResolvedValue(null);
		const result = await TournamentManager.getCurrentTournament(prisma as never);
		expect(result?.id).toBe('t1');
		expect(result?.cashPrice).toBe(100);
		const state = await TournamentManager.getCurrentTournamentState(prisma as never);
		expect(state?.id).toBe('t1');
	});
	it('returns null when no tournament', async () => {
		const prisma = mockPrisma();
		prisma.tournament.findFirst.mockResolvedValue(null);
		expect(await TournamentManager.getCurrentTournament(prisma as never)).toBeNull();
	});
});

describe('postponeNextTournamentIfPending', () => {
	it('returns false when no tournament with next round', async () => {
		const prisma = mockPrisma();
		prisma.tournament.findFirst.mockResolvedValue(null);
		expect(await TournamentManager.postponeNextTournamentIfPending(prisma as never, new Date())).toBe(false);
	});
	it('postpones when the tournament is over (round 8) and the new date is later', async () => {
		const prisma = mockPrisma();
		const nextRound = dayjs().add(1, 'day').toDate();
		const t = { id: 't1', date: dayjs().subtract(20, 'day').toDate(), nextRound };
		prisma.tournament.findFirst.mockResolvedValue(t);
		prisma.tournament.findUnique.mockResolvedValue(t);
		prisma.fightArchive.findFirst.mockResolvedValue({ tournamentStep: 7 });
		const result = await TournamentManager.postponeNextTournamentIfPending(
			prisma as never,
			dayjs().add(5, 'day').toDate()
		);
		expect(result).toBe(true);
		expect(prisma.tournament.update).toHaveBeenCalled();
	});
	it('skips when the tournament is still ongoing', async () => {
		const prisma = mockPrisma();
		const t = { id: 't1', date: dayjs().subtract(1, 'day').toDate(), nextRound: dayjs().add(1, 'day').toDate() };
		prisma.tournament.findFirst.mockResolvedValue(t);
		prisma.tournament.findUnique.mockResolvedValue(t);
		prisma.fightArchive.findFirst.mockResolvedValue({ tournamentStep: 1 });
		expect(
			await TournamentManager.postponeNextTournamentIfPending(prisma as never, dayjs().add(5, 'day').toDate())
		).toBe(false);
	});
});

describe('getActiveTeams', () => {
	it('returns winners from the previous round', async () => {
		const prisma = mockPrisma();
		const t = {
			id: 't1',
			date: dayjs().subtract(20, 'day').toDate(),
			cashPrice: 0,
			levelLimit: 30,
			nextRound: new Date()
		};
		prisma.tournament.findFirst.mockResolvedValue(t);
		prisma.tournament.findUnique.mockResolvedValue(t);
		prisma.fightArchive.findFirst.mockResolvedValue({ tournamentStep: 2 });
		prisma.fightArchive.findMany.mockResolvedValue([
			{ tournamentTeamLeftId: 'a', tournamentTeamRightId: 'b', result: true },
			{ tournamentTeamLeftId: 'c', tournamentTeamRightId: null, result: false }
		]);
		const result = await TournamentManager.getActiveTeams(prisma as never);
		expect(result?.winners.length).toBe(2);
	});
	it('returns qualified teams at round 0', async () => {
		const prisma = mockPrisma();
		const t = { id: 't1', date: dayjs().add(2, 'day').toDate(), cashPrice: 0, levelLimit: 30, nextRound: new Date() };
		prisma.tournament.findFirst.mockResolvedValue(t);
		prisma.tournament.findUnique.mockResolvedValue(t);
		prisma.fightArchive.findFirst.mockResolvedValue(null);
		prisma.tournament.findUniqueOrThrow.mockResolvedValue({ teamSize: 3 });
		prisma.$queryRaw.mockResolvedValue([{ tournamentTeamId: 'x' }]);
		const result = await TournamentManager.getActiveTeams(prisma as never);
		expect(result?.winners).toEqual([{ tournamentTeamId: 'x' }]);
	});
	it('returns null when no tournament', async () => {
		const prisma = mockPrisma();
		prisma.tournament.findFirst.mockResolvedValue(null);
		expect(await TournamentManager.getActiveTeams(prisma as never)).toBeNull();
	});
});

describe('resume', () => {
	it('schedules the next round when a future match is pending', async () => {
		const prisma = mockPrisma();
		const t = { id: 't1', date: dayjs().subtract(2, 'day').toDate(), nextRound: dayjs().add(1, 'day').toDate() };
		prisma.tournament.findFirst.mockResolvedValue(t);
		prisma.tournament.findUnique.mockResolvedValue(t);
		prisma.fightArchive.findFirst.mockResolvedValue({ tournamentStep: 2 });
		const result = await TournamentManager.resume(prisma as never);
		expect(result).toBeInstanceOf(TournamentManager);
	});
	it('schedules first tournament creation when none exists', async () => {
		const prisma = mockPrisma();
		prisma.tournament.findFirst.mockResolvedValue(null);
		expect(await TournamentManager.resume(prisma as never)).toBeNull();
	});
});

const candidate = (key: string, extra: Partial<ArchetypeCandidate> = {}): ArchetypeCandidate => ({
	meta: 'races',
	key,
	teamRace: [RaceEnum.MOUEFFE, RaceEnum.PIGMOU, RaceEnum.WINKS],
	rules: {},
	...extra
});
const CANDIDATES = [
	candidate('monorace', { teamRace: [RaceEnum.SIRAIN], raceMinimum: 1 }),
	candidate('duo_race'),
	candidate('binomes')
];
const CONTEXT = {
	lastQualifiedRaces: {},
	recentRegisteredRaces: {},
	lastFeaturedRaces: [],
	lastChampionRaces: [],
	lastFinalistSkills: {},
	racePopulation: {}
};
// Monday of the qualification of a tournament whose pools happen on the week of 2026-11-23
const QUALIF_START = new Date(2026, 10, 16);

describe('openNextFormatVote', () => {
	beforeEach(() => {
		vi.mocked(nextMeta).mockReturnValue({ key: 'races', enabled: true, order: 0, subs: [] });
		vi.mocked(rollCandidates).mockReturnValue(CANDIDATES);
		vi.mocked(getArchetypeContext).mockResolvedValue(CONTEXT);
		vi.mocked(getPreviousTournamentId).mockResolvedValue('t0');
		vi.mocked(createTranslatedNews).mockResolvedValue({ id: 42 } as never);
		vi.mocked(createNewsPoll).mockResolvedValue({ id: 7 } as never);
	});

	function votePrisma(current: Record<string, unknown>) {
		const prisma = mockPrisma();
		prisma.tournament.findUniqueOrThrow.mockResolvedValue(current);
		prisma.tournament.count.mockResolvedValue(3);
		return prisma;
	}

	it('rolls the candidates of the next meta, publishes the news and its poll, and stores them', async () => {
		const manager = new TournamentManager('t1', QUALIF_START);
		const prisma = votePrisma({ metaArchetype: 'ffa', nextCandidates: null, nextPollId: null });

		await manager.openNextFormatVote(prisma as never, ['team1', 'team2']);

		expect(nextMeta).toHaveBeenCalledWith('ffa');
		expect(getArchetypeContext).toHaveBeenCalledWith(prisma, {
			referenceTournamentId: 't1',
			finishedTournamentId: 't0',
			qualifiedTeamIds: ['team1', 'team2']
		});
		expect(rollCandidates).toHaveBeenCalledWith('races', CONTEXT);

		expect(createTranslatedNews).toHaveBeenCalledTimes(1);
		const newsCall = vi.mocked(createTranslatedNews).mock.calls[0];
		expect(newsCall[1]).toBe(NewsType.tid_vote);
		expect(newsCall[2]).toBe('tournament.vote.newsTitle');
		expect(newsCall[4]).toBe('tournament.vote.newsCorpus');
		expect(newsCall[6]).toBe(true);
		const frBody = newsCall[5][Lang.fr];
		expect(frBody.number).toBe('IV');
		for (const c of CANDIDATES) {
			expect(frBody.candidates).toContain(c.key);
		}

		expect(createNewsPoll).toHaveBeenCalledTimes(1);
		const [newsId, options, endDate] = vi.mocked(createNewsPoll).mock.calls[0];
		expect(newsId).toBe(42);
		expect(options).toHaveLength(3);
		options.forEach((option, index) => {
			expect(option.optionText).toBe(CANDIDATES[index].key);
			expect(option.orderIndex).toBe(index);
			expect(Object.keys(option.labels).sort()).toEqual(Object.values(Lang).sort());
		});
		// Planned creation of the next tournament (round 8): two weeks after the qualification start
		expect(endDate).toEqual(new Date(2026, 10, 30));

		expect(prisma.tournament.update).toHaveBeenCalledWith({
			where: { id: 't1' },
			data: { nextCandidates: CANDIDATES, nextPollId: 7 }
		});
	});

	it('does nothing when the candidates are already stored', async () => {
		const manager = new TournamentManager('t1', QUALIF_START);
		const prisma = votePrisma({ metaArchetype: 'ffa', nextCandidates: CANDIDATES, nextPollId: 7 });

		await manager.openNextFormatVote(prisma as never);

		expect(rollCandidates).not.toHaveBeenCalled();
		expect(createTranslatedNews).not.toHaveBeenCalled();
		expect(createNewsPoll).not.toHaveBeenCalled();
		expect(prisma.tournament.update).not.toHaveBeenCalled();
	});

	it('logs and does not throw when the vote cannot be opened', async () => {
		const manager = new TournamentManager('t1', QUALIF_START);
		const prisma = votePrisma({ metaArchetype: 'ffa', nextCandidates: null, nextPollId: null });
		vi.mocked(createNewsPoll).mockRejectedValue(new Error('db down'));

		await expect(manager.openNextFormatVote(prisma as never)).resolves.toBeUndefined();

		expect(LOGGER.error).toHaveBeenCalled();
		expect(prisma.tournament.update).not.toHaveBeenCalled();
	});

	it('does not open a vote without candidate', async () => {
		const manager = new TournamentManager('t1', QUALIF_START);
		const prisma = votePrisma({ metaArchetype: 'ffa', nextCandidates: null, nextPollId: null });
		vi.mocked(rollCandidates).mockReturnValue([]);

		await manager.openNextFormatVote(prisma as never);

		expect(createTranslatedNews).not.toHaveBeenCalled();
		expect(prisma.tournament.update).not.toHaveBeenCalled();
	});
});

describe('generateNextRound at the end of the qualification', () => {
	beforeEach(() => {
		// Monday of the pools week, before the first round of Tuesday
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date(2026, 10, 23, 13));
	});
	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	function roundZeroPrisma() {
		const prisma = mockPrisma();
		prisma.tournament.findUnique.mockResolvedValue({ id: 't1', nextRound: new Date(2026, 10, 22, 23, 59) });
		prisma.tournament.findUniqueOrThrow.mockResolvedValue({ poison: false, teamSize: 4 });
		prisma.fightArchive.findFirst.mockResolvedValue(null);
		prisma.ranking.findMany.mockResolvedValue([]);
		prisma.$queryRaw.mockResolvedValue([{ tournamentTeamId: 'team1' }, { tournamentTeamId: 'team2' }]);
		return prisma;
	}

	it('opens the vote once, with the qualified teams, after rewarding the qualification', async () => {
		const manager = new TournamentManager('t1', QUALIF_START);
		const prisma = roundZeroPrisma();
		vi.spyOn(manager as never, 'generateAndSaveFight').mockResolvedValue(undefined as never);
		const reward = vi.spyOn(manager, 'rewardQualification');
		const vote = vi.spyOn(manager, 'openNextFormatVote').mockResolvedValue();

		await manager.generateNextRound(prisma as never);

		expect(vote).toHaveBeenCalledTimes(1);
		expect(vote.mock.calls[0][1]?.sort()).toEqual(['team1', 'team2']);
		expect(reward.mock.invocationCallOrder[0]).toBeLessThan(vote.mock.invocationCallOrder[0]);
	});

	it('still generates the round when the vote fails', async () => {
		const manager = new TournamentManager('t1', QUALIF_START);
		const prisma = roundZeroPrisma();
		const fights = vi.spyOn(manager as never, 'generateAndSaveFight').mockResolvedValue(undefined as never);
		// Fails inside openNextFormatVote, which must catch it
		prisma.tournament.findUniqueOrThrow
			.mockResolvedValueOnce({ poison: false, teamSize: 4 })
			.mockRejectedValueOnce(new Error('db down'));

		await manager.generateNextRound(prisma as never);

		expect(LOGGER.error).toHaveBeenCalled();
		expect(fights).toHaveBeenCalled();
		expect(prisma.tournament.update).toHaveBeenCalled();
	});
});

describe('createTournament', () => {
	beforeEach(() => {
		vi.mocked(nextMeta).mockReturnValue({ key: 'races', enabled: true, order: 0, subs: [] });
		vi.mocked(rollCandidates).mockReturnValue(CANDIDATES);
		vi.mocked(getArchetypeContext).mockResolvedValue(CONTEXT);
		vi.mocked(getNewLevelLimits).mockResolvedValue(35);
		vi.mocked(createTranslatedNews).mockResolvedValue({ id: 1 } as never);
	});
	afterEach(() => vi.restoreAllMocks());

	function creationPrisma(latest: Record<string, unknown> | null) {
		const prisma = mockPrisma();
		prisma.tournament.findFirst.mockResolvedValue(latest);
		prisma.tournament.create.mockResolvedValue({ id: 'new' });
		prisma.tournament.count.mockResolvedValue(5);
		return prisma;
	}

	function votedPrisma() {
		const prisma = creationPrisma({ id: 't1', metaArchetype: 'ffa', nextCandidates: CANDIDATES, nextPollId: 7 });
		prisma.pollOption.findMany.mockResolvedValue([
			{ id: 100, orderIndex: 0 },
			{ id: 101, orderIndex: 1 },
			{ id: 102, orderIndex: 2 }
		]);
		// Votes 0 / 5 / 2 -> weights 1 / 6 / 3 -> cumulated bands [0, 0.1[, [0.1, 0.7[, [0.7, 1[
		prisma.pollVote.groupBy.mockResolvedValue([
			{ pollOptionId: 101, _count: { _all: 5 } },
			{ pollOptionId: 102, _count: { _all: 2 } }
		]);
		return prisma;
	}

	it('draws among the voted candidates with a weight of votes + 1', async () => {
		const prisma = votedPrisma();
		vi.spyOn(Math, 'random').mockReturnValue(0.65);

		await TournamentManager.createTournament(prisma as never);

		expect(prisma.pollVote.groupBy).toHaveBeenCalledWith({
			by: ['pollOptionId'],
			where: { pollId: 7 },
			_count: { _all: true }
		});
		expect(rollCandidates).not.toHaveBeenCalled();
		const data = prisma.tournament.create.mock.calls[0][0].data;
		expect(data.formatName).toBe('duo_race');
		expect(data.metaArchetype).toBe('races');

		// The vote result is announced
		const startNews = vi.mocked(createTranslatedNews).mock.calls[0];
		expect(startNews[1]).toBe(NewsType.tid_start);
		expect(startNews[5][Lang.fr].voteResult).toContain('tournament.vote.result');
	});

	it('gives a chance to a candidate without vote and picks each band', async () => {
		let prisma = votedPrisma();
		vi.spyOn(Math, 'random').mockReturnValue(0.05);
		await TournamentManager.createTournament(prisma as never);
		expect(prisma.tournament.create.mock.calls[0][0].data.formatName).toBe('monorace');

		prisma = votedPrisma();
		vi.spyOn(Math, 'random').mockReturnValue(0.75);
		await TournamentManager.createTournament(prisma as never);
		expect(prisma.tournament.create.mock.calls[0][0].data.formatName).toBe('binomes');
	});

	it('falls back to a random sub of the next meta without candidates', async () => {
		const prisma = creationPrisma({ id: 't1', metaArchetype: 'ffa', nextCandidates: null, nextPollId: null });
		vi.spyOn(Math, 'random').mockReturnValue(0);

		await TournamentManager.createTournament(prisma as never);

		expect(prisma.pollVote.groupBy).not.toHaveBeenCalled();
		expect(nextMeta).toHaveBeenCalledWith('ffa');
		expect(getArchetypeContext).toHaveBeenCalledWith(prisma, {
			referenceTournamentId: 't1',
			finishedTournamentId: 't1'
		});
		expect(rollCandidates).toHaveBeenCalledWith('races', CONTEXT);
		const data = prisma.tournament.create.mock.calls[0][0].data;
		expect(data.formatName).toBe('monorace');
		expect(vi.mocked(createTranslatedNews).mock.calls[0][5][Lang.fr].voteResult).toBe('');
	});

	it('creates the first tournament without any previous one', async () => {
		const prisma = creationPrisma(null);

		await TournamentManager.createTournament(prisma as never);

		expect(nextMeta).toHaveBeenCalledWith(null);
		expect(getArchetypeContext).not.toHaveBeenCalled();
		expect(prisma.tournament.create).toHaveBeenCalled();
	});

	it('uses a default archetype when the catalogue fails', async () => {
		const prisma = creationPrisma(null);
		vi.mocked(rollCandidates).mockImplementation(() => {
			throw new Error('Not implemented');
		});

		await TournamentManager.createTournament(prisma as never);

		const data = prisma.tournament.create.mock.calls[0][0].data;
		expect(data.formatName).toBe('ffa_open');
		expect(data.metaArchetype).toBe('ffa');
		expect(LOGGER.error).toHaveBeenCalled();
	});

	it('stores the sub, its rules, the common parameters and 7 distinct featured races', async () => {
		const chosen = candidate('element_min', {
			meta: 'restrictive',
			rules: { elementMin: { element: 1, min: 10 } },
			teamSize: 4
		});
		vi.mocked(rollCandidates).mockReturnValue([chosen]);
		const prisma = creationPrisma(null);

		await TournamentManager.createTournament(prisma as never);

		const data = prisma.tournament.create.mock.calls[0][0].data;
		expect(data.metaArchetype).toBe('restrictive');
		expect(data.formatName).toBe('element_min');
		expect(data.rules).toEqual({ elementMin: { element: 1, min: 10 } });
		expect(data.teamRace).toBe(chosen.teamRace.toString());
		expect(data.teamSize).toBe(4);
		expect(data.raceMinimum).toBeGreaterThanOrEqual(2);
		expect(data.raceMinimum).toBeLessThanOrEqual(3);
		expect(typeof data.poison).toBe('boolean');
		expect(data.levelLimit).toBe(35);
		expect(getNewLevelLimits).toHaveBeenCalledWith(chosen.teamRace);
		expect(data.featuredRaces).toHaveLength(7);
		expect(new Set(data.featuredRaces).size).toBe(7);
		const races = Object.values(RaceEnum).filter(r => typeof r === 'number');
		for (const race of data.featuredRaces) expect(races).toContain(race);

		// The rules of the sub are announced
		expect(vi.mocked(createTranslatedNews).mock.calls[0][5][Lang.fr].subRules).toContain('elementMin');
	});
});

describe('common parameters (temporary local helpers)', () => {
	it('resolves the team size', () => {
		expect(resolveTeamSizeLocal({ teamSize: 2 })).toBe(2);
		expect(resolveTeamSizeLocal({ teamSizes: [4, 6] }, () => 0.99)).toBe(6);
		expect(resolveTeamSizeLocal({}, () => 0)).toBe(3);
		expect(resolveTeamSizeLocal({}, () => 0.99)).toBe(6);
	});
	it('resolves the minimum number of races', () => {
		expect(resolveRaceMinimumLocal({ raceMinimum: 1, teamRace: [] }, 5)).toBe(1);
		expect(resolveRaceMinimumLocal({ teamRace: [1, 3, 5, 7] }, 6, () => 0.99)).toBe(4);
		expect(resolveRaceMinimumLocal({ teamRace: [1, 3, 5, 7] }, 3, () => 0)).toBe(2);
		expect(resolveRaceMinimumLocal({ teamRace: [13] }, 4, () => 0.5)).toBe(1);
	});
});
