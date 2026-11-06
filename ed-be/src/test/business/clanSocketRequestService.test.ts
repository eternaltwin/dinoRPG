import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { BoardDirection } from '@drpg/core/models/clan/clanChampionship';
import { WsClanAction, WsClanRequest } from '@drpg/core/models/serverEvents/WsClanSocket';

vi.mock('../../context.js', () => ({
	LOGGER: { warn: vi.fn(), log: vi.fn(), error: vi.fn(), info: vi.fn() },
	DISCORD: { sendError: vi.fn() }
}));
vi.mock('../../dao/playerDao.js', () => ({ authPlayer: vi.fn() }));
vi.mock('../../utils/server/sendErrors.js', () => ({ sendWorkerError: vi.fn() }));
vi.mock('../../utils/server/ServerState.js', () => ({ default: { isReady: vi.fn() } }));
vi.mock('../../business/clanChampionshipMatchService.js', () => ({
	enterBoard: vi.fn(),
	getMatchFights: vi.fn(),
	getMyMatchBoard: vi.fn(),
	leaveBoard: vi.fn(),
	moveOnBoard: vi.fn()
}));
vi.mock('../../business/clanChampionshipService.js', () => ({ registerClan: vi.fn(), unregisterClan: vi.fn() }));

import { authPlayer } from '../../dao/playerDao.js';
import { sendWorkerError } from '../../utils/server/sendErrors.js';
import ServerState from '../../utils/server/ServerState.js';
import {
	enterBoard,
	getMatchFights,
	getMyMatchBoard,
	moveOnBoard
} from '../../business/clanChampionshipMatchService.js';
import { registerClan } from '../../business/clanChampionshipService.js';
import { answerClanSocketRequest } from '../../business/clanSocketRequestService.js';

const authed = { id: 'p1', clanId: 1 };
const MATCH = 'a0000000-0000-4000-8000-000000000001';

const request = (action: WsClanAction, payload?: unknown) => ({ requestId: 'r1', action, payload }) as WsClanRequest;
const answer = (action: WsClanAction, payload?: unknown) =>
	answerClanSocketRequest('p1', 'token', request(action, payload));

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(ServerState.isReady).mockReturnValue(true);
	vi.mocked(authPlayer).mockResolvedValue(authed as never);
});

describe('answerClanSocketRequest', () => {
	it('checks the player with the credentials of the connection, then answers with the same requestId', async () => {
		vi.mocked(moveOnBoard).mockResolvedValue({ fight: null });
		const res = await answer(WsClanAction.CHAMPIONSHIP_MOVE, { dinozId: 5, direction: BoardDirection.E });
		expect(authPlayer).toHaveBeenCalledWith('p1', 'token');
		expect(moveOnBoard).toHaveBeenCalledWith(authed, 5, BoardDirection.E);
		expect(res).toEqual({ type: 'response', requestId: 'r1', ok: true, data: { fight: null } });
	});

	it('answers null for an action without a result', async () => {
		const res = await answer(WsClanAction.CHAMPIONSHIP_REGISTER);
		expect(registerClan).toHaveBeenCalledWith(authed);
		expect(res).toEqual({ type: 'response', requestId: 'r1', ok: true, data: null });
	});

	it('runs nothing for a banned player or an outdated token', async () => {
		vi.mocked(authPlayer).mockRejectedValue(new ExpectedError('Action forbidden: you have been banned'));
		const res = await answer(WsClanAction.CHAMPIONSHIP_ENTER, { dinozId: 5 });
		expect(enterBoard).not.toHaveBeenCalled();
		expect(res).toEqual({
			type: 'response',
			requestId: 'r1',
			ok: false,
			error: 'Action forbidden: you have been banned'
		});
	});

	it('runs nothing while the server is not ready', async () => {
		vi.mocked(ServerState.isReady).mockReturnValue(false);
		const res = await answer(WsClanAction.CHAMPIONSHIP_GET_MATCH);
		expect(getMyMatchBoard).not.toHaveBeenCalled();
		expect(res).toMatchObject({ ok: false, error: 'Server is not ready' });
	});

	it('answers a refusal instead of throwing, without reporting it', async () => {
		vi.mocked(enterBoard).mockRejectedValue(new ExpectedError('clanChampionship.noLiveMatch'));
		const res = await answer(WsClanAction.CHAMPIONSHIP_ENTER, { dinozId: 5 });
		expect(res).toMatchObject({ ok: false, error: 'clanChampionship.noLiveMatch' });
		expect(sendWorkerError).not.toHaveBeenCalled();
	});

	it('hides and reports an unexpected error', async () => {
		vi.mocked(enterBoard).mockRejectedValue(new Error('secret database detail'));
		const res = await answer(WsClanAction.CHAMPIONSHIP_ENTER, { dinozId: 5 });
		expect(res).toMatchObject({ ok: false, error: 'Internal server error' });
		expect(sendWorkerError).toHaveBeenCalled();
	});

	it.each([
		[WsClanAction.CHAMPIONSHIP_ENTER, undefined],
		[WsClanAction.CHAMPIONSHIP_ENTER, { dinozId: '5' }],
		[WsClanAction.CHAMPIONSHIP_ENTER, { dinozId: 1.5 }],
		[WsClanAction.CHAMPIONSHIP_LEAVE, { dinozId: 0 }],
		[WsClanAction.CHAMPIONSHIP_MOVE, { dinozId: 5, direction: 'UP' }],
		[WsClanAction.CHAMPIONSHIP_GET_FIGHTS, { matchId: 'nope', before: 1 }],
		[WsClanAction.CHAMPIONSHIP_GET_FIGHTS, { matchId: MATCH, before: 2147483648 }],
		['championship.unknown' as WsClanAction, undefined]
	])('refuses wrong data: %s %j', async (action, payload) => {
		const res = await answer(action, payload);
		expect(res).toMatchObject({ ok: false, error: 'Wrong data format' });
		expect(enterBoard).not.toHaveBeenCalled();
		expect(moveOnBoard).not.toHaveBeenCalled();
		expect(getMatchFights).not.toHaveBeenCalled();
	});

	it('refuses the same write while the first one runs, then accepts it again', async () => {
		let finish = () => {};
		vi.mocked(enterBoard).mockImplementationOnce(() => new Promise(resolve => (finish = () => resolve())));
		const first = answer(WsClanAction.CHAMPIONSHIP_ENTER, { dinozId: 5 });
		const second = await answer(WsClanAction.CHAMPIONSHIP_ENTER, { dinozId: 6 });
		expect(second).toMatchObject({ ok: false, error: 'Too many requests' });

		await vi.waitFor(() => expect(enterBoard).toHaveBeenCalledTimes(1));
		finish();
		expect(await first).toMatchObject({ ok: true });

		vi.mocked(enterBoard).mockResolvedValue(undefined);
		expect(await answer(WsClanAction.CHAMPIONSHIP_ENTER, { dinozId: 6 })).toMatchObject({ ok: true });
	});

	it('does not block another player, nor reads', async () => {
		let finish = () => {};
		vi.mocked(enterBoard).mockImplementationOnce(() => new Promise(resolve => (finish = () => resolve())));
		const first = answer(WsClanAction.CHAMPIONSHIP_ENTER, { dinozId: 5 });
		vi.mocked(enterBoard).mockResolvedValue(undefined);
		const other = await answerClanSocketRequest(
			'p2',
			'token',
			request(WsClanAction.CHAMPIONSHIP_ENTER, { dinozId: 6 })
		);
		expect(other).toMatchObject({ ok: true });

		vi.mocked(getMyMatchBoard).mockResolvedValue(null);
		const reads = await Promise.all([
			answer(WsClanAction.CHAMPIONSHIP_GET_MATCH),
			answer(WsClanAction.CHAMPIONSHIP_GET_MATCH)
		]);
		expect(reads.every(read => read.ok)).toBe(true);

		await vi.waitFor(() => expect(enterBoard).toHaveBeenCalledTimes(2));
		finish();
		await first;
	});
});
