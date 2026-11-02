import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FightOutcome } from '@drpg/core/models/fight/FightResult';

vi.mock('../../context.js', () => ({ DISCORD: { sendError: vi.fn() }, LOGGER: { error: vi.fn() } }));
vi.mock('node-schedule', () => ({ scheduleJob: vi.fn(), scheduledJobs: {} }));
vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn() }));
vi.mock('../../dao/clansDao.js', () => ({ playerHasRightRequest: vi.fn() }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../prisma.js', () => ({ prisma: {} }));
vi.mock('../../business/fightService.js', () => ({ calculateFightBetweenPlayers: vi.fn() }));
vi.mock('../../dao/archiveDao.js', () => ({ archiveFight: vi.fn() }));
vi.mock('../../dao/dinozDao.js', () => ({ getDinozForChampionshipFight: vi.fn() }));
vi.mock('../../utils/gameConfig.js', () => ({ gameConfig: () => ({ dinoz: { maxLevel: 50 } }) }));
vi.mock('@drpg/core/utils/DinozUtils', async importOriginal => ({
	...(await importOriginal<object>()),
	getMaxXp: () => 1000
}));

import { calculateFightBetweenPlayers } from '../../business/fightService.js';
import { resolveBoardAttack } from '../../business/clanChampionshipMatchService.js';
import { archiveFight } from '../../dao/archiveDao.js';
import { getDinozForChampionshipFight } from '../../dao/dinozDao.js';

const MATCH_ID = 'a0000000-0000-4000-8000-000000000001';
const match = { id: MATCH_ID, westClanId: 1, homeClanId: 1, awayClanId: 2, placeId: 1 } as never;
const authed = { id: 'p1', clanId: 1 } as never;

const piece = (id: number, clanId: number, x: number, y: number, o: Record<string, unknown> = {}) => ({
	id,
	matchId: MATCH_ID,
	dinozId: id * 10,
	playerId: clanId === 1 ? 'p1' : 'p2',
	clanId,
	state: 'onBoard',
	x,
	y,
	actionPoints: 1,
	...o
});

const dinozRow = (pc: ReturnType<typeof piece>, o: Record<string, unknown> = {}) => ({
	id: pc.dinozId,
	display: '',
	playerId: pc.playerId,
	name: `d${pc.dinozId}`,
	level: 10,
	life: 50,
	maxLife: 50,
	experience: 0,
	nbrUpFire: 0,
	nbrUpWood: 0,
	nbrUpWater: 0,
	nbrUpLightning: 0,
	nbrUpAir: 0,
	items: [],
	skills: [],
	status: [],
	catches: [],
	player: { cooker: false, teacher: false },
	...o
});

const fiche = (pc: ReturnType<typeof piece>, o: Record<string, unknown> = {}) => ({
	playerId: pc.playerId,
	dinozId: pc.dinozId,
	hpLost: 0,
	itemsUsed: [],
	statusGained: [],
	escaped: false,
	...o
});

function makeTx(onBoard: ReturnType<typeof piece>[]) {
	return {
		clanChampionshipPiece: {
			findMany: vi.fn().mockResolvedValue(onBoard),
			update: vi.fn(),
			updateMany: vi.fn()
		},
		dinoz: { update: vi.fn(), updateMany: vi.fn() },
		dinozItem: { findFirst: vi.fn().mockResolvedValue({ id: 99 }), delete: vi.fn() },
		log: { create: vi.fn() }
	};
}

function setup(rows: (pc: ReturnType<typeof piece>) => unknown, result: (a: any[], d: any[]) => any) {
	vi.mocked(getDinozForChampionshipFight).mockImplementation((async (ids: number[]) =>
		ids.map(id => rows({ dinozId: id, playerId: id < 20 ? 'p1' : 'p2' } as never)).filter(Boolean)) as never);
	vi.mocked(calculateFightBetweenPlayers).mockImplementation(((_r: unknown, a: any[], _ca: unknown, d: any[]) => ({
		seed: 's',
		steps: [],
		fighters: [],
		catches: [],
		stats: {},
		...result(a, d)
	})) as never);
	vi.mocked(archiveFight).mockResolvedValue({ id: 'arch-1' } as never);
}

beforeEach(() => vi.clearAllMocks());

const ids = (team: { id: number }[]) => team.map(d => d.id).sort((a, b) => a - b);

describe('resolveBoardAttack', () => {
	it('fights 1v1 on a behind attack', async () => {
		// East victim at x=5, west attacker at x=4: attacker is on the west (behind the east victim? no) -> use east victim behind
		const att = piece(1, 2, 6, 3); // east attacker, victim west at x=7? victim west needs attacker x-1
		const def = piece(2, 1, 7, 3); // west victim at x=7, attacker x=6 = x-1 -> behind
		const bystander = piece(3, 2, 7, 4);
		const tx = makeTx([att, def, bystander]);
		setup(
			r => dinozRow(r as never),
			(a, d) => ({
				outcome: FightOutcome.AttackerWin,
				attackers: a.map(x => fiche(piece(x.id / 10, 2, 0, 0, { dinozId: x.id, playerId: 'p2' }))),
				defenders: d.map(x => fiche(piece(x.id / 10, 1, 0, 0, { dinozId: x.id, playerId: 'p1' })))
			})
		);
		await resolveBoardAttack(tx as never, match, att as never, def as never, authed);
		const [, teamA, , teamB] = vi.mocked(calculateFightBetweenPlayers).mock.calls[0];
		expect(ids(teamA)).toEqual([10]);
		expect(ids(teamB)).toEqual([20]);
	});

	it('takes every piece of the zone, and none outside, on a frontal attack', async () => {
		const att = piece(1, 1, 5, 5); // west attacker
		const def = piece(2, 2, 6, 5); // east victim at x+1 of attacker: not behind (behind would be x+1 for east: yes!)
		const defFront = piece(2, 2, 6, 5);
		void def;
		// east victim is attacked from x+1 only when behind; here the attacker is at x-1 of the east victim => frontal
		const ally = piece(3, 1, 5, 6);
		const enemyNear = piece(4, 2, 7, 6);
		const farAlly = piece(5, 1, 3, 5);
		const farEnemy = piece(6, 2, 9, 9);
		const tx = makeTx([att, defFront, ally, enemyNear, farAlly, farEnemy]);
		setup(
			r => dinozRow(r as never),
			(a, d) => ({
				outcome: FightOutcome.DefenderWin,
				attackers: a.map(x => fiche({ dinozId: x.id, playerId: 'p1' } as never)),
				defenders: d.map(x => fiche({ dinozId: x.id, playerId: 'p2' } as never))
			})
		);
		await resolveBoardAttack(tx as never, match, att as never, defFront as never, authed);
		const [, teamA, , teamB] = vi.mocked(calculateFightBetweenPlayers).mock.calls[0];
		expect(ids(teamA)).toEqual([10, 30]);
		expect(ids(teamB)).toEqual([20, 40]);
	});

	it('kills a dead defender, unlocks the dinoz, applies hp and xp, never touches fight/restingAttack', async () => {
		const att = piece(1, 2, 6, 3, { playerId: 'p2' });
		const def = piece(2, 1, 7, 3, { playerId: 'p1' });
		const tx = makeTx([att, def]);
		setup(
			r => dinozRow(r as never, { playerId: (r as any).playerId }),
			(a, d) => ({
				outcome: FightOutcome.AttackerWin,
				attackers: [fiche({ dinozId: 10, playerId: 'p2' } as never, { hpLost: 12, itemsUsed: [5] })],
				defenders: [fiche({ dinozId: 20, playerId: 'p1' } as never, { hpLost: 60 })]
			})
		);
		const res = await resolveBoardAttack(tx as never, match, att as never, def as never, authed);
		expect(res).toEqual({ archiveId: 'arch-1', outcome: FightOutcome.AttackerWin, deadDinozIds: [20] });

		const dinozUpdates = tx.dinoz.update.mock.calls.map(c => c[0]);
		const winner = dinozUpdates.find(u => u.where.id === 10);
		expect(winner.data.life).toEqual({ decrement: 12 });
		expect(winner.data.experience.increment).toBeGreaterThan(0);
		const loser = dinozUpdates.find(u => u.where.id === 20);
		expect(loser.data.life).toEqual({ decrement: 50 });
		expect(loser.data.experience).toBeUndefined();

		expect(tx.clanChampionshipPiece.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ id: 2 }),
				data: expect.objectContaining({ state: 'dead', x: null, y: null, actionPoints: 0 })
			})
		);
		expect(tx.dinoz.updateMany).toHaveBeenCalledWith({
			where: { id: 20, unavailableReason: 'clanChampionship' },
			data: { unavailableReason: null }
		});
		expect(tx.dinozItem.delete).toHaveBeenCalledTimes(1);
		const all = JSON.stringify([...dinozUpdates, ...tx.dinoz.updateMany.mock.calls]);
		expect(all).not.toContain('"fight"');
		expect(all).not.toContain('restingAttack');
		const types = tx.log.create.mock.calls.map(c => c[0].data.type);
		expect(types).toContain('Death');
		expect(types).toContain('HPLost');
		expect(types).toContain('XPEarned');
	});

	it('archives with the championship meta', async () => {
		const att = piece(1, 2, 6, 3, { playerId: 'p2' });
		const def = piece(2, 1, 7, 3, { playerId: 'p1' });
		const tx = makeTx([att, def]);
		setup(
			r => dinozRow(r as never),
			() => ({
				outcome: FightOutcome.DefenderWin,
				attackers: [fiche({ dinozId: 10, playerId: 'p2' } as never)],
				defenders: [fiche({ dinozId: 20, playerId: 'p1' } as never)]
			})
		);
		await resolveBoardAttack(tx as never, match, att as never, def as never, authed);
		expect(archiveFight).toHaveBeenCalledWith(
			expect.anything(),
			false,
			'p2',
			'p1',
			JSON.stringify({ kind: 'clanChampionship', matchId: MATCH_ID }),
			tx
		);
	});

	it('skips a participant whose dinoz the DAO does not return', async () => {
		const att = piece(1, 2, 6, 3, { playerId: 'p2' });
		const def = piece(2, 1, 7, 3, { playerId: 'p1' });
		const ally = piece(3, 1, 7, 4, { playerId: 'p1' });
		const tx = makeTx([att, def, ally]);
		setup(
			r => ((r as any).dinozId === 30 ? null : dinozRow(r as never)),
			(a, d) => ({
				outcome: FightOutcome.AttackerWin,
				attackers: a.map(x => fiche({ dinozId: x.id, playerId: 'p2' } as never)),
				defenders: d.map(x => fiche({ dinozId: x.id, playerId: 'p1' } as never))
			})
		);
		await resolveBoardAttack(tx as never, match, att as never, def as never, authed);
		const [, , , teamB] = vi.mocked(calculateFightBetweenPlayers).mock.calls[0];
		expect(ids(teamB)).toEqual([20]);
	});

	it('settles participants sorted by dinoz id', async () => {
		const att = piece(3, 2, 6, 3, { playerId: 'p2' });
		const def = piece(2, 1, 7, 3, { playerId: 'p1' });
		const ally = piece(1, 1, 7, 4, { playerId: 'p1' });
		const tx = makeTx([att, def, ally]);
		setup(
			r => dinozRow(r as never),
			(a, d) => ({
				outcome: FightOutcome.AttackerWin,
				attackers: a.map(x => fiche({ dinozId: x.id, playerId: 'p2' } as never)),
				defenders: d.map(x => fiche({ dinozId: x.id, playerId: 'p1' } as never))
			})
		);
		await resolveBoardAttack(tx as never, match, att as never, def as never, authed);
		const order = tx.dinoz.update.mock.calls.map(c => c[0].where.id);
		expect(order).toEqual([...order].sort((a, b) => a - b));
	});

	it('skips the logs of a participant without player', async () => {
		const att = piece(1, 2, 6, 3, { playerId: 'p2' });
		const def = piece(2, 1, 7, 3, { playerId: 'p1' });
		const tx = makeTx([att, def]);
		setup(
			r => dinozRow(r as never, (r as any).dinozId === 10 ? { playerId: null } : {}),
			(a, d) => ({
				outcome: FightOutcome.AttackerWin,
				attackers: a.map(x => fiche({ dinozId: x.id, playerId: 'p2' } as never, { hpLost: 1 })),
				defenders: d.map(x => fiche({ dinozId: x.id, playerId: 'p1' } as never, { hpLost: 1 }))
			})
		);
		await resolveBoardAttack(tx as never, match, att as never, def as never, authed);
		const logged = tx.log.create.mock.calls.map(c => c[0].data.dinoz.connect.id);
		expect(logged).not.toContain(10);
		expect(logged).toContain(20);
	});
});

describe('resolveBoardAttack xp', () => {
	const duel = async (
		hp: { att: any; def: any },
		rowOverrides: Record<number, Record<string, unknown>> = {},
		outcome = FightOutcome.AttackerWin
	) => {
		const att = piece(1, 2, 6, 3, { playerId: 'p2' });
		const def = piece(2, 1, 7, 3, { playerId: 'p1' });
		const tx = makeTx([att, def]);
		setup(
			r => dinozRow(r as never, rowOverrides[(r as any).dinozId] ?? {}),
			() => ({
				outcome,
				attackers: [fiche({ dinozId: 10, playerId: 'p2' } as never, hp.att)],
				defenders: [fiche({ dinozId: 20, playerId: 'p1' } as never, hp.def)]
			})
		);
		await resolveBoardAttack(tx as never, match, att as never, def as never, authed);
		return (id: number) => tx.dinoz.update.mock.calls.map(c => c[0]).find(u => u.where.id === id);
	};

	it('a surviving dinoz on the losing side gains xp', async () => {
		const upd = await duel({ att: { hpLost: 0 }, def: { hpLost: 10 } });
		expect(upd(20).data.experience.increment).toBeGreaterThan(0);
	});

	it('an escaped survivor gains 0 xp', async () => {
		const upd = await duel({ att: { hpLost: 0 }, def: { hpLost: 10, escaped: true } });
		expect(upd(20).data.experience).toBeUndefined();
	});

	it('xp is zero for a dinoz at the xp cap', async () => {
		const upd = await duel({ att: { hpLost: 0 }, def: { hpLost: 10 } }, { 10: { experience: 1000 } });
		expect(upd(10).data.experience.increment).toBe(0);
		expect(upd(20).data.experience.increment).toBeGreaterThan(0);
	});
});
