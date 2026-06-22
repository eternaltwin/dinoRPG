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
vi.mock('@eternaltwin/client-node/error', () => ({ ErrorCode: { OauthCodeTimeError: 'timeerr', OauthCodeFormatError: 'fmterr' } }));
vi.mock('../../context.js', () => ({ GLOBAL: { config: {} }, LOGGER: { error: vi.fn(), log: vi.fn() } }));
vi.mock('../../config/game.config.js', () => ({ default: { general: { initialMoney: 100, dailyGridRewards: 5 }, dinoz: {} } }));
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
import sendError from '../../utils/server/sendErrors.js';
import { OAuth } from '../../business/oauthService.js';

const config = {
	eternaltwin: { url: 'http://et/', clientRef: 'ref', secret: 'sec', section: 'sec' },
	selfUrl: 'http://self/'
} as never;

function makeRes() {
	return { header: vi.fn(), send: vi.fn() } as never;
}

beforeEach(() => vi.clearAllMocks());

describe('OAuth', () => {
	it('redirect sends the authorization uri', () => {
		const oauth = new OAuth(config, {} as never);
		const res = makeRes();
		oauth.redirect({} as never, res);
		expect((res as { send: ReturnType<typeof vi.fn> }).send).toHaveBeenCalledWith({ url: 'http://auth' });
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
		const req = { query: { code: 'abc' }, headers: { 'user-agent': 'jest' }, socket: { remoteAddress: '1.2.3.4' } } as never;
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
		const req = { query: { code: 'abc' }, headers: { 'user-agent': 'jest' }, socket: { remoteAddress: '5.6.7.8' } } as never;
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
});
