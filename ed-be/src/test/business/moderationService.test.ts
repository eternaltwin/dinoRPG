import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import { ModerationReason, ModerationAction } from '@drpg/prisma';

vi.mock('../../dao/playerDao.js', () => ({
	auth: vi.fn(),
	getBannedPlayers: vi.fn(),
	getPlayerBanInfo: vi.fn(),
	getPlayerInfoToReport: vi.fn()
}));
vi.mock('../../dao/moderationDao.js', () => ({
	createModerationReport: vi.fn(),
	createClanModerationReport: vi.fn(),
	getModerationReport: vi.fn(),
	getModerationReports: vi.fn(),
	setModerationReport: vi.fn()
}));
vi.mock('../../dao/notificationDao.js', () => ({ createNotification: vi.fn() }));
vi.mock('../../context.js', () => ({ LOGGER: { log: vi.fn(), error: vi.fn() } }));
vi.mock('../../prisma.js', () => ({ prisma: { clan: { findUnique: vi.fn() } } }));

import * as playerDao from '../../dao/playerDao.js';
import * as modDao from '../../dao/moderationDao.js';
import { createNotification } from '../../dao/notificationDao.js';
import { prisma } from '../../prisma.js';
import {
	getPlayerToReport,
	reportPlayer,
	reportClan,
	getAllModeration,
	takeActionOnReport,
	getPaginatedBannedPlayers,
	banPlayer,
	updateBan,
	cancelBan,
	multipleBan
} from '../../business/moderationService.js';

const req = (params = {}, body = {}) => makeRequest({ params, body });

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(playerDao.auth).mockResolvedValue({ id: 'mod1', name: 'Mod' } as never);
});

describe('getPlayerToReport', () => {
	it('returns the player', async () => {
		vi.mocked(playerDao.getPlayerInfoToReport).mockResolvedValue({ id: 'p2' } as never);
		expect(await getPlayerToReport(req({ id: 'p2' }))).toEqual({ id: 'p2' });
	});
	it('throws when player missing', async () => {
		vi.mocked(playerDao.getPlayerInfoToReport).mockResolvedValue(null as never);
		await expect(getPlayerToReport(req({ id: 'p2' }))).rejects.toThrow('Inexistent player');
	});
});

describe('reportPlayer', () => {
	it('creates a report with a valid reason', async () => {
		vi.mocked(playerDao.getPlayerInfoToReport).mockResolvedValue({ id: 'p2' } as never);
		await reportPlayer(req({ id: 'p2' }, { reason: ModerationReason.avatar, comment: 'c', dinozId: 1 }));
		expect(modDao.createModerationReport).toHaveBeenCalledWith('mod1', 'p2', ModerationReason.avatar, 'c', 1);
	});
	it('throws when player missing', async () => {
		vi.mocked(playerDao.getPlayerInfoToReport).mockResolvedValue(null as never);
		await expect(reportPlayer(req({ id: 'p2' }, { reason: ModerationReason.avatar }))).rejects.toThrow('Inexistent');
	});
	it('throws on invalid reason', async () => {
		vi.mocked(playerDao.getPlayerInfoToReport).mockResolvedValue({ id: 'p2' } as never);
		await expect(reportPlayer(req({ id: 'p2' }, { reason: 'nope' }))).rejects.toThrow('Invalid reason');
	});
});

describe('reportClan', () => {
	it('creates a clan report, mapping other->clanOther', async () => {
		vi.mocked(prisma.clan.findUnique).mockResolvedValue({ leaderId: 'l1' } as never);
		await reportClan(req({ id: '3' }, { reason: ModerationReason.other, comment: 'c' }));
		expect(modDao.createClanModerationReport).toHaveBeenCalledWith('mod1', 'l1', 3, ModerationReason.clanOther, 'c');
	});
	it('throws on invalid reason', async () => {
		await expect(reportClan(req({ id: '3' }, { reason: 'bad' }))).rejects.toThrow('Invalid reason');
	});
	it('throws when clan missing', async () => {
		vi.mocked(prisma.clan.findUnique).mockResolvedValue(null as never);
		await expect(reportClan(req({ id: '3' }, { reason: ModerationReason.clanBehavior }))).rejects.toThrow('Inexistent clan');
	});
});

describe('getAllModeration / getPaginatedBannedPlayers', () => {
	it('delegate to dao with page', async () => {
		vi.mocked(modDao.getModerationReports).mockResolvedValue([{ id: 1 }] as never);
		vi.mocked(playerDao.getBannedPlayers).mockResolvedValue([{ id: 'p' }] as never);
		expect(await getAllModeration(req({ page: '2' }))).toEqual([{ id: 1 }]);
		expect(await getPaginatedBannedPlayers(req({ page: '1' }))).toEqual([{ id: 'p' }]);
	});
});

describe('takeActionOnReport', () => {
	const report = { target: { id: 'p2', name: 'Bad' }, reason: ModerationReason.avatar };
	beforeEach(() => vi.mocked(modDao.getModerationReport).mockResolvedValue(report as never));

	it('throws when report missing', async () => {
		vi.mocked(modDao.getModerationReport).mockResolvedValue(null as never);
		await expect(takeActionOnReport(req({ id: '1' }, { action: ModerationAction.closed }))).rejects.toThrow('Missing moderation');
	});
	it('closes a report', async () => {
		await takeActionOnReport(req({ id: '1' }, { action: ModerationAction.closed }));
		expect(modDao.setModerationReport).toHaveBeenCalledWith(1, { sorted: ModerationAction.closed });
	});
	it('warns a player', async () => {
		await takeActionOnReport(req({ id: '1' }, { action: ModerationAction.warning }));
		expect(createNotification).toHaveBeenCalled();
	});
	it.each([ModerationAction.shortBan, ModerationAction.mediumBan, ModerationAction.longBan])(
		'applies timed ban %s',
		async action => {
			await takeActionOnReport(req({ id: '1' }, { action }));
			expect(createNotification).toHaveBeenCalled();
			expect(modDao.setModerationReport).toHaveBeenCalled();
		}
	);
	it('applies infinite ban', async () => {
		await takeActionOnReport(req({ id: '1' }, { action: ModerationAction.infiniteBan }));
		expect(modDao.setModerationReport).toHaveBeenCalled();
	});
});

describe('banPlayer', () => {
	beforeEach(() => {
		vi.mocked(playerDao.getPlayerBanInfo).mockResolvedValue({ name: 'Bad' } as never);
		vi.mocked(modDao.createModerationReport).mockResolvedValue({ id: 7 } as never);
	});
	it('throws when player not found', async () => {
		vi.mocked(playerDao.getPlayerBanInfo).mockResolvedValue(null as never);
		await expect(banPlayer(req({ id: 'p2' }, { action: ModerationAction.shortBan }))).rejects.toThrow('Player not found');
	});
	it.each([ModerationAction.shortBan, ModerationAction.mediumBan, ModerationAction.longBan])(
		'bans with %s',
		async action => {
			await banPlayer(req({ id: 'p2' }, { action, reason: ModerationReason.multi }));
			expect(modDao.setModerationReport).toHaveBeenCalled();
		}
	);
	it('bans infinitely', async () => {
		await banPlayer(req({ id: 'p2' }, { action: ModerationAction.infiniteBan, reason: ModerationReason.multi }));
		expect(modDao.setModerationReport).toHaveBeenCalled();
	});
});

describe('updateBan', () => {
	const player = (overrides = {}) => ({ name: 'Bad', banCase: { id: 3, banDate: new Date() }, ...overrides });
	it('throws when player not found', async () => {
		vi.mocked(playerDao.getPlayerBanInfo).mockResolvedValue(null as never);
		await expect(updateBan(req({ id: 'p2' }, { action: ModerationAction.shortBan }))).rejects.toThrow('not found');
	});
	it('throws when not banned', async () => {
		vi.mocked(playerDao.getPlayerBanInfo).mockResolvedValue(player({ banCase: null }) as never);
		await expect(updateBan(req({ id: 'p2' }, {}))).rejects.toThrow('not banned');
	});
	it('throws when missing ban date', async () => {
		vi.mocked(playerDao.getPlayerBanInfo).mockResolvedValue(player({ banCase: { id: 3, banDate: null } }) as never);
		await expect(updateBan(req({ id: 'p2' }, {}))).rejects.toThrow('missing ban date');
	});
	it('updates the ban', async () => {
		vi.mocked(playerDao.getPlayerBanInfo).mockResolvedValue(player() as never);
		await updateBan(req({ id: 'p2' }, { action: ModerationAction.mediumBan, reason: ModerationReason.multi }));
		expect(modDao.setModerationReport).toHaveBeenCalledWith(3, expect.objectContaining({ sorted: ModerationAction.mediumBan }));
	});
});

describe('cancelBan', () => {
	it('throws when player not found', async () => {
		vi.mocked(playerDao.getPlayerBanInfo).mockResolvedValue(null as never);
		await expect(cancelBan(req({ id: 'p2' }))).rejects.toThrow('not found');
	});
	it('throws when not banned', async () => {
		vi.mocked(playerDao.getPlayerBanInfo).mockResolvedValue({ name: 'B', banCase: null } as never);
		await expect(cancelBan(req({ id: 'p2' }))).rejects.toThrow('not banned');
	});
	it('cancels the ban', async () => {
		vi.mocked(playerDao.getPlayerBanInfo).mockResolvedValue({ name: 'B', banCase: { id: 9 } } as never);
		await cancelBan(req({ id: 'p2' }));
		expect(modDao.setModerationReport).toHaveBeenCalledWith(9, { bannedUser: { disconnect: true } });
	});
});

describe('multipleBan', () => {
	it('bans each player in the list', async () => {
		vi.mocked(modDao.createModerationReport).mockResolvedValue({ id: 1 } as never);
		vi.mocked(playerDao.getPlayerBanInfo).mockResolvedValue({ name: 'B' } as never);
		await multipleBan(req({}, { list: ['a', 'b'] }));
		expect(modDao.createModerationReport).toHaveBeenCalledTimes(2);
		expect(modDao.setModerationReport).toHaveBeenCalledTimes(2);
	});
});
