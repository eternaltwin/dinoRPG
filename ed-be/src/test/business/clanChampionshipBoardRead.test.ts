import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../context.js', () => ({ DISCORD: { sendError: vi.fn() }, LOGGER: { error: vi.fn() } }));
vi.mock('node-schedule', () => ({ scheduleJob: vi.fn(), scheduledJobs: {} }));
vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn() }));
vi.mock('../../dao/clansDao.js', () => ({ playerHasRightRequest: vi.fn() }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../prisma.js', () => ({
	prisma: {
		clanEvent: { findFirst: vi.fn() },
		clanChampionshipMatch: { findFirst: vi.fn() },
		clanChampionshipPiece: { findMany: vi.fn() },
		clanChampionshipFight: { findMany: vi.fn() }
	}
}));

import { auth } from '../../dao/playerDao.js';
import { prisma } from '../../prisma.js';
import { getMyMatchBoard } from '../../business/clanChampionshipMatchService.js';

const p = prisma as any;
const HOME = 1;
const AWAY = 2;
const ME = 'me';

const event = {
	id: 'ev-1',
	eventType: 'championship',
	startDate: new Date('2026-11-09T00:00:00.000Z'),
	endDate: new Date('2026-12-02T18:00:00.000Z'),
	config: JSON.stringify({
		eventType: 'championship',
		places: [PlaceEnum.DINOVILLE],
		registrationEnd: '2026-11-23T00:00:00.000Z',
		phase: 'running'
	})
};

const match = (o: Record<string, unknown> = {}) => ({
	id: 'a0000000-0000-4000-8000-000000000001',
	eventId: 'ev-1',
	round: 1,
	homeClanId: HOME,
	awayClanId: AWAY,
	homeClanName: 'Home',
	awayClanName: 'Away',
	westClanId: HOME,
	homeScore: 7,
	awayScore: 3,
	ticksApplied: 4,
	placeId: 1,
	obstacles: [5],
	startsAt: new Date('2026-11-23T18:00:00.000Z'),
	endsAt: new Date('2026-11-25T18:00:00.000Z'),
	status: 'live',
	...o
});

const piece = (id: number, clanId: number, playerId: string, o: Record<string, unknown> = {}) => ({
	id,
	dinozId: id,
	playerId,
	clanId,
	state: 'onBoard',
	x: 0,
	y: id,
	actionPoints: 2,
	dinoz: { name: `d${id}`, display: 'disp', level: 3, life: 8, maxLife: 10, player: { name: `p-${playerId}` } },
	...o
});

beforeEach(() => {
	vi.clearAllMocks();
	p.clanEvent.findFirst.mockResolvedValue(event);
	p.clanChampionshipMatch.findFirst.mockResolvedValue(match());
	p.clanChampionshipFight.findMany.mockResolvedValue([]);
	(auth as any).mockResolvedValue({ id: ME, clanId: HOME });
});

describe('getMyMatchBoard', () => {
	it('returns null without a clan', async () => {
		(auth as any).mockResolvedValue({ id: ME, clanId: null });
		expect(await getMyMatchBoard(makeRequest())).toBeNull();
	});

	it('returns null without a live or finished match', async () => {
		p.clanChampionshipMatch.findFirst.mockResolvedValue(null);
		expect(await getMyMatchBoard(makeRequest())).toBeNull();
	});

	it('hides life, maxLife and actionPoints of enemy pieces only', async () => {
		p.clanChampionshipPiece.findMany.mockResolvedValue([
			piece(1, HOME, ME),
			piece(2, HOME, 'mate'),
			piece(3, AWAY, 'foe', { x: 19 })
		]);
		const board = await getMyMatchBoard(makeRequest());
		const [mine, ally, enemy] = board!.pieces;
		expect(mine).toMatchObject({ mine: true, ally: false, life: 8, maxLife: 10, actionPoints: 2 });
		expect(ally).toMatchObject({
			mine: false,
			ally: true,
			life: 8,
			maxLife: 10,
			actionPoints: 2,
			playerName: 'p-mate'
		});
		expect(enemy).toMatchObject({ mine: false, ally: false, name: 'd3', display: 'disp', level: 3 });
		expect(enemy).not.toHaveProperty('life');
		expect(enemy).not.toHaveProperty('maxLife');
		expect(enemy).not.toHaveProperty('actionPoints');
	});

	it('maps west/east, scores, score lines and quota', async () => {
		p.clanChampionshipPiece.findMany.mockResolvedValue([
			piece(1, HOME, ME, { x: 4, y: 0 }),
			piece(2, HOME, ME, { state: 'left', x: null, y: null }),
			piece(3, AWAY, 'foe', { x: 15, y: 1 }),
			piece(4, AWAY, 'foe', { state: 'dead', x: null, y: null })
		]);
		const board = await getMyMatchBoard(makeRequest());
		expect(board).toMatchObject({
			round: 1,
			status: 'live',
			ticksApplied: 4,
			obstacles: [5],
			west: { clanId: HOME, name: 'Home', score: 7, quotaUsed: 2 },
			east: { clanId: AWAY, name: 'Away', score: 3, quotaUsed: 2 },
			deadDinozIds: [4]
		});
		expect(board!.pieces).toHaveLength(2);
		expect(board!.west.scoreLine).toBeGreaterThan(0);
		expect(board!.east.scoreLine).toBeGreaterThan(0);
	});

	it('swaps sides when the away clan is west', async () => {
		p.clanChampionshipMatch.findFirst.mockResolvedValue(match({ westClanId: AWAY }));
		p.clanChampionshipPiece.findMany.mockResolvedValue([]);
		const board = await getMyMatchBoard(makeRequest());
		expect(board!.west).toMatchObject({ clanId: AWAY, name: 'Away', score: 3 });
		expect(board!.east).toMatchObject({ clanId: HOME, name: 'Home', score: 7 });
	});

	it('puts the surviving clan east when the deleted west clan has no id', async () => {
		p.clanChampionshipMatch.findFirst.mockResolvedValue(match({ westClanId: null, awayClanId: null }));
		p.clanChampionshipPiece.findMany.mockResolvedValue([]);
		const board = await getMyMatchBoard(makeRequest());
		expect(board!.east).toMatchObject({ clanId: HOME, name: 'Home' });
		expect(board!.west).toMatchObject({ clanId: null, name: 'Away' });
	});

	it('falls back to the latest finished match', async () => {
		p.clanChampionshipMatch.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(match({ status: 'finished' }));
		p.clanChampionshipPiece.findMany.mockResolvedValue([piece(1, HOME, ME, { state: 'left', x: null, y: null })]);
		const board = await getMyMatchBoard(makeRequest());
		expect(board).toMatchObject({ status: 'finished', pieces: [], west: { quotaUsed: 1 } });
		expect(p.clanChampionshipMatch.findFirst).toHaveBeenLastCalledWith(
			expect.objectContaining({ where: expect.objectContaining({ status: 'finished' }) })
		);
	});

	it('exposes the journal: archiveId only for participants, newest first, capped at 50', async () => {
		p.clanChampionshipPiece.findMany.mockResolvedValue([]);
		const row = (id: number, players: string[]) => ({
			createdAt: new Date(2026, 10, 24, 10, id),
			attackerClanId: AWAY,
			attackerWon: true,
			participantDinozIds: [1, 2, 3],
			participantPlayerIds: players,
			deadDinozIds: [2],
			archiveId: `arch-${id}`
		});
		p.clanChampionshipFight.findMany.mockResolvedValue([row(2, [ME, 'foe']), row(1, ['foe'])]);
		const board = await getMyMatchBoard(makeRequest());
		expect(p.clanChampionshipFight.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ orderBy: { createdAt: 'desc' }, take: 50 })
		);
		expect(board!.fights).toEqual([
			{
				createdAt: row(2, []).createdAt,
				attackerClanId: AWAY,
				attackerWon: true,
				participantCount: 3,
				deadDinozIds: [2],
				archiveId: 'arch-2'
			},
			expect.objectContaining({ archiveId: null, participantCount: 3 })
		]);
	});
});
