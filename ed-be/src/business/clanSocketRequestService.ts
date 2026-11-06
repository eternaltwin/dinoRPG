import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { isUuid } from '@drpg/core/utils/isUuid';
import { BoardDirection } from '@drpg/core/models/clan/clanChampionship';
import { WsClanAction, WsClanRequest, WsClanResponse } from '@drpg/core/models/serverEvents/WsClanSocket';
import { LOGGER } from '../context.js';
import { Auth, authPlayer } from '../dao/playerDao.js';
import { sendWorkerError } from '../utils/server/sendErrors.js';
import ServerState from '../utils/server/ServerState.js';
import {
	enterBoard,
	getMatchFights,
	getMyMatchBoard,
	leaveBoard,
	moveOnBoard
} from './clanChampionshipMatchService.js';
import { registerClan, unregisterClan } from './clanChampionshipService.js';

const MAX_INT = 2147483647;
const WRONG_DATA = 'Wrong data format';

const READ_ACTIONS: ReadonlySet<WsClanAction> = new Set([
	WsClanAction.CHAMPIONSHIP_GET_MATCH,
	WsClanAction.CHAMPIONSHIP_GET_FIGHTS
]);

/** Same protection as the HTTP lock middleware, which a socket never goes through: one write of a kind at a time. */
const writeLocks = new Set<string>();

function intBetween(value: unknown, min: number, max: number): number {
	if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
		throw new ExpectedError(WRONG_DATA);
	}
	return value;
}

function payloadOf(request: WsClanRequest): Record<string, unknown> {
	const { payload } = request;
	if (typeof payload !== 'object' || payload === null) throw new ExpectedError(WRONG_DATA);
	return payload;
}

async function run(authed: Auth, request: WsClanRequest): Promise<unknown> {
	switch (request.action) {
		case WsClanAction.CHAMPIONSHIP_REGISTER:
			return registerClan(authed);
		case WsClanAction.CHAMPIONSHIP_UNREGISTER:
			return unregisterClan(authed);
		case WsClanAction.CHAMPIONSHIP_GET_MATCH:
			return getMyMatchBoard(authed);
		case WsClanAction.CHAMPIONSHIP_GET_FIGHTS: {
			const { matchId, before } = payloadOf(request);
			if (typeof matchId !== 'string' || !isUuid(matchId)) throw new ExpectedError(WRONG_DATA);
			return getMatchFights(authed, matchId, intBetween(before, 1, MAX_INT));
		}
		case WsClanAction.CHAMPIONSHIP_ENTER:
			return enterBoard(authed, intBetween(payloadOf(request).dinozId, 1, MAX_INT));
		case WsClanAction.CHAMPIONSHIP_LEAVE:
			return leaveBoard(authed, intBetween(payloadOf(request).dinozId, 1, MAX_INT));
		case WsClanAction.CHAMPIONSHIP_MOVE: {
			const { dinozId, direction } = payloadOf(request);
			if (!Object.values(BoardDirection).includes(direction as BoardDirection)) throw new ExpectedError(WRONG_DATA);
			return moveOnBoard(authed, intBetween(dinozId, 1, MAX_INT), direction as BoardDirection);
		}
		default:
			throw new ExpectedError(WRONG_DATA);
	}
}

/**
 * Answers a clan socket request. Never throws: a refusal is a normal answer and must not cost the player the
 * socket. The ticket is only checked at connection time, so the player is checked again here (ban, token, terms).
 */
export async function answerClanSocketRequest(
	playerId: string,
	connexionToken: string,
	request: WsClanRequest
): Promise<WsClanResponse> {
	const { requestId, action } = request;
	const lock = READ_ACTIONS.has(action) ? null : `${action}:${playerId}`;
	try {
		if (lock && writeLocks.has(lock)) throw new ExpectedError('Too many requests');
		if (lock) writeLocks.add(lock);
		try {
			if (!ServerState.isReady()) throw new ExpectedError('Server is not ready');
			const authed = await authPlayer(playerId, connexionToken);
			const data = await run(authed, request);
			return { type: 'response', requestId, ok: true, data: (data ?? null) as never };
		} finally {
			if (lock) writeLocks.delete(lock);
		}
	} catch (err) {
		if (err instanceof ExpectedError) return { type: 'response', requestId, ok: false, error: err.message };
		LOGGER.error(`Clan socket request ${action} failed`, err);
		sendWorkerError(err as Error);
		return { type: 'response', requestId, ok: false, error: 'Internal server error' };
	}
}
