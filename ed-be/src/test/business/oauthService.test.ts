import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthType } from '@eternaltwin/core/auth/auth-type';

const oauthClientInstance = { getAuthorizationUri: vi.fn().mockReturnValue('http://auth'), getAccessToken: vi.fn() };
const etwinClientInstance = { getAuthSelf: vi.fn() };

vi.mock('@eternaltwin/oauth-client-http/rfc-oauth-client', () => ({
	RfcOauthClient: vi.fn(function () {
		return oauthClientInstance;
	}),
	GetAccessTokenError: class GetAccessTokenError extends Error {}
}));
vi.mock('@eternaltwin/client-node', () => ({
	EternaltwinNodeClient: vi.fn(function () {
		return etwinClientInstance;
	})
}));
vi.mock('@eternaltwin/client-node/error', () => ({
	ErrorCode: { OauthCodeTimeError: 'timeerr', OauthCodeFormatError: 'fmterr' }
}));
vi.mock('../../context.js', () => ({ GLOBAL: { config: {} }, LOGGER: { error: vi.fn(), log: vi.fn() } }));
vi.mock('../../config/game.config.js', () => ({
	default: { general: { initialMoney: 100, dailyGridRewards: 5 }, dinoz: {} }
}));
vi.mock('../../dao/dinozDao.js', () => ({ updateDinoz: vi.fn() }));
vi.mock('../../dao/logDao.js', () => ({ createLog: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({
	archiveOldUsername: vi.fn(),
	createPlayer: vi.fn(),
	getCommonDataRequest: vi.fn(),
	setPlayer: vi.fn(),
	updateUsernameOnRelatedTables: vi.fn()
}));
vi.mock('../../dao/playerItemDao.js', () => ({ increaseItemQuantity: vi.fn() }));
vi.mock('../../dao/rankingDao.js', () => ({ addPlayerInRanking: vi.fn(), updateCompletion: vi.fn() }));
vi.mock('../../dao/trackingDao.js', () => ({ setSpecificStat: vi.fn() }));
vi.mock('../../prisma.js', () => ({ prisma: { playerIp: { create: vi.fn() } } }));
vi.mock('../../utils/boxesLogic.js', () => ({ calculatePlayerCompletion: vi.fn().mockResolvedValue(50) }));
vi.mock('../../utils/server/sendErrors.js', () => ({ default: vi.fn() }));
vi.mock('../../business/dinozService.js', () => ({ getAvailableActions: vi.fn().mockResolvedValue([]) }));
vi.mock('../../business/clanWar.js', () => ({ eventState: vi.fn() }));
vi.mock('@drpg/core/utils/DinozUtils', () => ({
	orderDinozList: (l: unknown) => l,
	toDinozFiche: (_p: unknown, id: number) => ({ id, actions: [] })
}));
vi.mock('@drpg/core/models/event/Events', () => ({ currentEvents: () => [], GameEvent: { CHRISTMAS: 'christmas' } }));

import { createPlayer, getCommonDataRequest } from '../../dao/playerDao.js';
import { addPlayerInRanking } from '../../dao/rankingDao.js';
import { createState } from '../../utils/server/oauthState.js';
import sendError from '../../utils/server/sendErrors.js';
import { OAuth } from '../../business/oauthService.js';

const SALT = 'test-salt';
const config = {
	eternaltwin: { url: 'http://et/', clientRef: 'ref', secret: 'sec', section: 'sec' },
	selfUrl: 'http://self/',
	salt: SALT
} as never;

/** A callback query that passes the anti-CSRF check. */
function validCallbackQuery(extra: Record<string, unknown> = {}) {
	const { state, rfp } = createState(SALT);
	return { code: 'abc', state, rfp, ...extra };
}

function makeRes() {
	return { header: vi.fn(), send: vi.fn() } as never;
}

/** The message of the error handed to `sendError`. */
function errorMessage(): string {
	const [, error] = vi.mocked(sendError).mock.calls[0];
	return (error as Error).message;
}

beforeEach(() => vi.clearAllMocks());

describe('OAuth', () => {
	it('redirect sends the authorization uri and a fresh rfp', () => {
		const oauth = new OAuth(config, {} as never);
		const res = makeRes();
		oauth.redirect({} as never, res);

		const sent = (res as { send: ReturnType<typeof vi.fn> }).send.mock.calls[0][0];
		expect(sent.url).toBe('http://auth');
		// The unpredictable part is ours to add: Eternaltwin echoes `state` back unchecked.
		expect(typeof sent.rfp).toBe('string');
		expect(sent.rfp.length).toBeGreaterThan(0);

		// Only the hash of the rfp travels through Eternaltwin.
		const [, state] = oauthClientInstance.getAuthorizationUri.mock.calls[0];
		expect(state).not.toContain(sent.rfp);
	});

	it('redirect never reuses a state between two logins', () => {
		const oauth = new OAuth(config, {} as never);
		oauth.redirect({} as never, makeRes());
		oauth.redirect({} as never, makeRes());

		const [[, first], [, second]] = oauthClientInstance.getAuthorizationUri.mock.calls;
		expect(first).not.toBe(second);
	});

	it('token creates a new player on first login', async () => {
		oauthClientInstance.getAccessToken.mockResolvedValue({ accessToken: 'tok' });
		etwinClientInstance.getAuthSelf.mockResolvedValue({
			type: AuthType.AccessToken,
			user: { id: 'u1', displayName: { current: { value: 'Bob' } } }
		});
		vi.mocked(getCommonDataRequest).mockResolvedValue(null as never);
		vi.mocked(createPlayer).mockResolvedValue({ id: 'u1', connexionToken: 'ct', name: 'Bob' } as never);
		const oauth = new OAuth(config, {} as never);
		const res = makeRes();
		const req = {
			query: validCallbackQuery(),
			headers: { 'user-agent': 'jest' },
			socket: { remoteAddress: '1.2.3.4' }
		} as never;
		await oauth.token(req, res);
		expect(createPlayer).toHaveBeenCalled();
		expect(addPlayerInRanking).toHaveBeenCalled();
		expect((res as { send: ReturnType<typeof vi.fn> }).send).toHaveBeenCalled();
	});

	it('token handles an existing player daily login', async () => {
		oauthClientInstance.getAccessToken.mockResolvedValue({ accessToken: 'tok' });
		etwinClientInstance.getAuthSelf.mockResolvedValue({
			type: AuthType.AccessToken,
			user: { id: 'u1', displayName: { current: { value: 'NewName' } } }
		});
		vi.mocked(getCommonDataRequest).mockResolvedValue({
			id: 'u1',
			name: 'OldName',
			connexionToken: 'ct',
			ips: [],
			lastLogin: new Date('2000-01-01'),
			matelasseur: false,
			dinoz: [{ id: 1, life: 50, maxLife: 100, items: [], skills: [], followers: [] }]
		} as never);
		const oauth = new OAuth(config, {} as never);
		const res = makeRes();
		const req = {
			query: validCallbackQuery(),
			headers: { 'user-agent': 'jest' },
			socket: { remoteAddress: '5.6.7.8' }
		} as never;
		await oauth.token(req, res);
		expect((res as { send: ReturnType<typeof vi.fn> }).send).toHaveBeenCalled();
	});

	it('token reports an error on an invalid code', async () => {
		const oauth = new OAuth(config, {} as never);
		const res = makeRes();
		const req = { query: {}, headers: {}, socket: {} } as never;
		await oauth.token(req, res);
		expect(sendError).toHaveBeenCalled();
	});

	it('token refuses a forged state before spending the code', async () => {
		const oauth = new OAuth(config, {} as never);
		const res = makeRes();
		const req = {
			query: { code: 'abc', state: 'forged', rfp: 'whatever' },
			headers: {},
			socket: {}
		} as never;

		await oauth.token(req, res);

		expect(oauthClientInstance.getAccessToken).not.toHaveBeenCalled();
		expect(sendError).toHaveBeenCalled();
		expect(errorMessage()).toContain('Invalid or expired OAuth state');
	});

	it('token refuses an rfp belonging to another login attempt', async () => {
		const oauth = new OAuth(config, {} as never);
		const res = makeRes();
		const req = {
			query: { code: 'abc', state: createState(SALT).state, rfp: createState(SALT).rfp },
			headers: {},
			socket: {}
		} as never;

		await oauth.token(req, res);

		expect(oauthClientInstance.getAccessToken).not.toHaveBeenCalled();
	});
});
