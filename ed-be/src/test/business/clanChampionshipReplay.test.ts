import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../context.js', () => ({ DISCORD: { sendError: vi.fn() }, LOGGER: { error: vi.fn() } }));
vi.mock('node-schedule', () => ({ scheduleJob: vi.fn(), scheduledJobs: {} }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../business/serverEventService.js', () => ({
	publishToWsChannel: vi.fn(),
	publishToWsChannelFamily: vi.fn(),
	kickPlayerFromWsChannels: vi.fn()
}));
vi.mock('../../prisma.js', () => ({
	prisma: {
		clanChampionshipMatch: { findUnique: vi.fn() },
		clanChampionshipFrame: { findMany: vi.fn() },
		dinoz: { findMany: vi.fn() }
	}
}));

import { prisma } from '../../prisma.js';
import { getMatchReplay } from '../../business/clanChampionshipReplayService.js';
import { recordFrame } from '../../dao/clanChampionshipFrameDao.js';

const p = prisma as any;
const HOME = 1;
const AWAY = 2;
const MATCH_ID = 'a0000000-0000-4000-8000-000000000001';

const match = (o: Record<string, unknown> = {}) => ({
	id: MATCH_ID,
	round: 1,
	placeId: 3,
	startsAt: new Date('2026-11-23T18:00:00.000Z'),
	endsAt: new Date('2026-11-25T18:00:00.000Z'),
	homeClanId: HOME,
	awayClanId: AWAY,
	homeClanName: 'Home',
	awayClanName: 'Away',
	westClanId: AWAY,
	obstacles: [42],
	homeScore: 3,
	awayScore: 5,
	winnerClanId: AWAY,
	status: 'finished',
	...o
});

const authed = (clanId: number | null) => ({ id: 'p1', clanId }) as never;

beforeEach(() => {
	vi.resetAllMocks();
	p.clanChampionshipMatch.findUnique.mockResolvedValue(match());
	p.clanChampionshipFrame.findMany.mockResolvedValue([]);
	p.dinoz.findMany.mockResolvedValue([]);
});

describe('getMatchReplay', () => {
	it('refuses a reader without clan, of another clan, or before the start of the match', async () => {
		await expect(getMatchReplay(authed(null), MATCH_ID)).rejects.toThrow('clanChampionship.replayUnavailable');
		await expect(getMatchReplay(authed(9), MATCH_ID)).rejects.toThrow('clanChampionship.replayUnavailable');
		p.clanChampionshipMatch.findUnique.mockResolvedValue(match({ status: 'scheduled' }));
		await expect(getMatchReplay(authed(HOME), MATCH_ID)).rejects.toThrow('clanChampionship.replayUnavailable');
		expect(p.clanChampionshipFrame.findMany).not.toHaveBeenCalled();
	});

	it('returns every frame in version order, with the looks of every dinoz of both clans', async () => {
		const at = new Date('2026-11-23T18:10:00.000Z');
		p.clanChampionshipFrame.findMany.mockResolvedValue([
			{
				version: 4,
				createdAt: at,
				events: [{ type: 'enter', dinozId: 10, x: 0, y: 3 }],
				homeScore: 0,
				awayScore: 0,
				ticksApplied: 1,
				pieces: [
					[10, HOME, 0, 0, 3, 0, 80, 100],
					[20, AWAY, 2, -1, -1, 0, 0, 90]
				]
			}
		]);
		p.dinoz.findMany.mockResolvedValue([
			{ id: 10, name: 'Moueffe', display: 'abc', level: 12, player: { name: 'Alice' } }
		]);
		const replay = await getMatchReplay(authed(AWAY), MATCH_ID);
		expect(replay.omniscient).toBe(true);
		expect(p.clanChampionshipFrame.findMany).toHaveBeenCalledWith({
			where: { matchId: MATCH_ID },
			orderBy: { version: 'asc' }
		});
		expect(replay.westIsHome).toBe(false);
		expect(replay.frames).toEqual([
			{
				version: 4,
				at,
				events: [{ type: 'enter', dinozId: 10, x: 0, y: 3 }],
				homeScore: 0,
				awayScore: 0,
				ticksApplied: 1,
				pieces: [
					[10, HOME, 0, 0, 3, 0, 80, 100],
					[20, AWAY, 2, -1, -1, 0, 0, 90]
				],
				westScoreLine: expect.any(Number),
				eastScoreLine: expect.any(Number)
			}
		]);
		// The deleted dinoz stays in the record, without its looks
		expect(replay.dinoz).toEqual([
			{ dinozId: 10, name: 'Moueffe', display: 'abc', level: 12, playerName: 'Alice' },
			{ dinozId: 20, name: '?', display: '', level: 0, playerName: '' }
		]);
	});
	it('while live, hides the enemy life, action points, heals and fight archives', async () => {
		p.clanChampionshipMatch.findUnique.mockResolvedValue(match({ status: 'live', winnerClanId: null }));
		const pieces = [
			[10, HOME, 0, 0, 3, 2, 80, 100],
			[20, AWAY, 0, 9, 3, 1, 60, 90]
		];
		const frame = (version: number, events: unknown[]) => ({
			version,
			createdAt: new Date('2026-11-23T18:10:00.000Z'),
			events,
			homeScore: 0,
			awayScore: 0,
			ticksApplied: 1,
			pieces
		});
		p.clanChampionshipFrame.findMany.mockResolvedValue([
			frame(1, [{ type: 'heal', dinozId: 10, life: 80 }]),
			frame(2, [{ type: 'heal', dinozId: 20, life: 60 }]),
			frame(3, [{ type: 'attack', dinozId: 10, targetDinozId: 20, archiveId: 'arch', outcome: 0, deadDinozIds: [] }])
		]);
		const replay = await getMatchReplay(authed(HOME), MATCH_ID);
		expect(replay.omniscient).toBe(false);
		// The enemy heal is left out, the own one kept
		expect(replay.frames.map(f => f.version)).toEqual([1, 3]);
		expect(replay.frames[1].events).toEqual([
			{ type: 'attack', dinozId: 10, targetDinozId: 20, archiveId: '', outcome: 0, deadDinozIds: [] }
		]);
		for (const f of replay.frames) {
			expect(f.pieces).toEqual([
				[10, HOME, 0, 0, 3, 2, 80, 100],
				[20, AWAY, 0, 9, 3, 0, 0, 0]
			]);
		}
	});
});

describe('recordFrame', () => {
	it('stores every piece of the match, both clans, with life and action points', async () => {
		const tx = {
			clanChampionshipMatch: { findUnique: vi.fn().mockResolvedValue({ homeScore: 2, awayScore: 1, ticksApplied: 9 }) },
			clanChampionshipPiece: {
				findMany: vi.fn().mockResolvedValue([
					{
						dinozId: 10,
						clanId: HOME,
						state: 'onBoard',
						x: 4,
						y: 7,
						actionPoints: 3,
						dinoz: { life: 50, maxLife: 100 }
					},
					{
						dinozId: 20,
						clanId: AWAY,
						state: 'dead',
						x: null,
						y: null,
						actionPoints: 0,
						dinoz: { life: -5, maxLife: 90 }
					},
					{
						dinozId: 30,
						clanId: AWAY,
						state: 'left',
						x: null,
						y: null,
						actionPoints: 0,
						dinoz: { life: 70, maxLife: 70 }
					}
				])
			},
			clanChampionshipFrame: { create: vi.fn() }
		};
		await recordFrame(tx as never, MATCH_ID, 12, [{ type: 'leave', dinozId: 30 }]);
		expect(tx.clanChampionshipPiece.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ where: { matchId: MATCH_ID } })
		);
		expect(tx.clanChampionshipFrame.create).toHaveBeenCalledWith({
			data: {
				matchId: MATCH_ID,
				version: 12,
				events: [{ type: 'leave', dinozId: 30 }],
				homeScore: 2,
				awayScore: 1,
				ticksApplied: 9,
				pieces: [
					[10, HOME, 0, 4, 7, 3, 50, 100],
					[20, AWAY, 2, -1, -1, 0, 0, 90],
					[30, AWAY, 1, -1, -1, 0, 70, 70]
				]
			},
			select: { id: true }
		});
	});
});
