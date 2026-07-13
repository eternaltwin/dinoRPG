import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { OfferStatus } from '@drpg/prisma';

vi.mock('../../dao/dinozDao.js', () => ({ getAllDinozFicheLite: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({
	auth: vi.fn(),
	checkBeforeDeletion: vi.fn(),
	getCanCreateClanRequest: vi.fn(),
	getCanJoinClanRequest: vi.fn(),
	getCommonDataRequest: vi.fn(),
	getPlayerArchivedSiteId: vi.fn(),
	getPlayerDataRequest: vi.fn(),
	getPlayerRewardsRequest: vi.fn(),
	getToolTipInfos: vi.fn(),
	isPlayerLeaderOfClanRequest: vi.fn(),
	resetUser: vi.fn(),
	searchPlayersByNameOrId: vi.fn(),
	setPlayer: vi.fn()
}));
vi.mock('../../dao/tournamentDao.js', () => ({ getLatestTournament: vi.fn() }));
vi.mock('../../business/dinozService.js', () => ({ getAvailableActions: vi.fn().mockResolvedValue([]) }));
vi.mock('../../business/clanWar.js', () => ({ eventState: vi.fn().mockResolvedValue({ active: false }) }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../context.js', () => ({ GLOBAL: { config: { eternaltwin: { url: 'http://et/' } } } }));
vi.mock('node-fetch', () => ({ default: vi.fn() }));
vi.mock('sanitize-html', () => ({ default: (s: string) => s }));
vi.mock('@drpg/core/utils/DinozUtils', () => ({
	orderDinozList: (l: unknown) => l,
	toDinozFiche: (_p: unknown, id: number) => ({ id, actions: [] }),
	toDinozFicheLite: (d: unknown) => d,
	toDinozPublicFiche: (d: unknown) => d
}));
vi.mock('@drpg/core/utils/twinoidGoals', () => ({ convertToPlayerStats: () => [] }));

import * as playerDao from '../../dao/playerDao.js';
import { getAllDinozFicheLite } from '../../dao/dinozDao.js';
import { getLatestTournament } from '../../dao/tournamentDao.js';
import fetch from 'node-fetch';
import {
	getCommonData,
	getAccountData,
	getArchivedData,
	setCustomText,
	searchPlayers,
	getDinozList,
	canCreateClan,
	canJoinClan,
	isPlayerLeaderOfClan,
	playerToolTip,
	resetAccount,
	updatePlayerSettings
} from '../../business/playerService.js';

const req = (params = {}, body = {}) => makeRequest({ params, body });

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(playerDao.auth).mockResolvedValue({ id: 'p1' } as never);
});

describe('getCommonData', () => {
	it('builds common data with player options and clan event', async () => {
		vi.mocked(playerDao.getCommonDataRequest).mockResolvedValue({
			id: 'p1',
			money: 100,
			connexionToken: 'tok',
			name: 'bob',
			dinoz: [{ id: 1 }],
			ClanMember: { clanId: 4 },
			rewards: [{ rewardId: Reward.PDA }],
			skipFight: false,
			skipLevel: false,
			archivedSiteId: null,
			shareArchivedData: false,
			displayedNotifications: 3,
			role: 'USER',
			priest: false,
			shopKeeper: false,
			notifications: [],
			discoveredSkills: []
		} as never);
		const result = await getCommonData(req());
		expect(result.id).toBe('p1');
		expect(result.playerOptions.hasPDA).toBe(true);
		expect(result.clanEvent).toEqual({ active: false });
	});

	it('throws when the player does not exist', async () => {
		vi.mocked(playerDao.getCommonDataRequest).mockResolvedValue(null as never);
		await expect(getCommonData(req())).rejects.toThrow("doesn't exist");
	});
});

describe('getAccountData', () => {
	const base = (overrides = {}) => ({
		id: 'p2',
		name: 'alice',
		createdDate: new Date(),
		ClanMember: { clan: { id: 1, name: 'c' } },
		ranking: { dinozCount: 2, points: 10, completion: 50 },
		rewards: [{ rewardId: 3 }, { rewardId: 1 }],
		dinoz: [{ id: 1 }],
		customText: 'hi',
		playerTracking: [],
		shareArchivedData: false,
		archivedSiteId: null,
		...overrides
	});

	it('returns player info', async () => {
		vi.mocked(playerDao.getPlayerDataRequest).mockResolvedValue(base() as never);
		const result = await getAccountData(req({ id: 'p2' }));
		expect(result.name).toBe('alice');
		expect(result.epicRewards).toEqual([1, 3]);
	});

	it('throws when player missing', async () => {
		vi.mocked(playerDao.getPlayerDataRequest).mockResolvedValue(null as never);
		await expect(getAccountData(req({ id: 'p2' }))).rejects.toThrow("doesn't exist");
	});

	it('throws when ranking missing', async () => {
		vi.mocked(playerDao.getPlayerDataRequest).mockResolvedValue(base({ ranking: null }) as never);
		await expect(getAccountData(req({ id: 'p2' }))).rejects.toThrow('ranking');
	});

	it('fetches archived data when shared and archivedSiteId set', async () => {
		vi.mocked(playerDao.getPlayerDataRequest).mockResolvedValue(
			base({ shareArchivedData: true, archivedSiteId: 9 }) as never
		);
		vi.mocked(fetch as never).mockResolvedValue({
			json: vi.fn().mockResolvedValue({ links: { twinoid: { current: { user: { id: 't1' } } } }, stats: [] })
		} as never);
		vi.mocked(playerDao.getPlayerArchivedSiteId).mockResolvedValue({ archivedSiteId: 9 } as never);
		const result = await getAccountData(req({ id: 'p2' }));
		expect(result).toBeDefined();
	});
});

describe('getArchivedData', () => {
	it('returns mapped stats when twinoid link and archivedSiteId present', async () => {
		vi.mocked(fetch as never)
			.mockResolvedValueOnce({
				json: vi.fn().mockResolvedValue({ links: { twinoid: { current: { user: { id: 't1' } } } } })
			} as never)
			.mockResolvedValueOnce({
				json: vi.fn().mockResolvedValue({ stats: [{ stat_key: 'kills', score: 5 }] })
			} as never);
		vi.mocked(playerDao.getPlayerArchivedSiteId).mockResolvedValue({ archivedSiteId: 9 } as never);
		const result = await getArchivedData(req({ id: 'p2' }));
		expect(result).toEqual([{ stat: 'kills', quantity: 5 }]);
	});

	it('returns empty when no twinoid link', async () => {
		vi.mocked(fetch as never).mockResolvedValue({
			json: vi.fn().mockResolvedValue({ links: { twinoid: {} } })
		} as never);
		vi.mocked(playerDao.getPlayerArchivedSiteId).mockResolvedValue(null as never);
		expect(await getArchivedData(req({ id: 'p2' }))).toEqual([]);
	});
});

describe('setCustomText', () => {
	it('sets sanitized text when player has PLUME', async () => {
		vi.mocked(playerDao.getPlayerRewardsRequest).mockResolvedValue({ rewards: [{ rewardId: Reward.PLUME }] } as never);
		await setCustomText(req({}, { message: 'hello world' }));
		expect(playerDao.setPlayer).toHaveBeenCalledWith('p1', { customText: 'hello world' });
	});

	it('throws when player missing', async () => {
		vi.mocked(playerDao.getPlayerRewardsRequest).mockResolvedValue(null as never);
		await expect(setCustomText(req({}, { message: 'hi there' }))).rejects.toThrow("doesn't exist");
	});

	it('throws when player lacks PLUME', async () => {
		vi.mocked(playerDao.getPlayerRewardsRequest).mockResolvedValue({ rewards: [] } as never);
		await expect(setCustomText(req({}, { message: 'hi there' }))).rejects.toThrow('cannot edit');
	});

	it('throws when text too short', async () => {
		vi.mocked(playerDao.getPlayerRewardsRequest).mockResolvedValue({ rewards: [{ rewardId: Reward.PLUME }] } as never);
		await expect(setCustomText(req({}, { message: 'a' }))).rejects.toThrow('tooShortMessage');
	});
});

describe('simple delegating endpoints', () => {
	it('searchPlayers returns dao result', async () => {
		vi.mocked(playerDao.searchPlayersByNameOrId).mockResolvedValue([{ id: 'x' }] as never);
		expect(await searchPlayers(req({ search: 'bob' }))).toEqual([{ id: 'x' }]);
	});

	it('getDinozList maps fiche lite', async () => {
		vi.mocked(getAllDinozFicheLite).mockResolvedValue([{ id: 1 }] as never);
		expect(await getDinozList(req())).toEqual([{ id: 1 }]);
	});

	it('getDinozList throws when none', async () => {
		vi.mocked(getAllDinozFicheLite).mockResolvedValue(null as never);
		await expect(getDinozList(req())).rejects.toThrow("doesn't exist");
	});

	it('canCreateClan / canJoinClan / isPlayerLeaderOfClan delegate', async () => {
		vi.mocked(playerDao.getCanCreateClanRequest).mockResolvedValue(true as never);
		vi.mocked(playerDao.getCanJoinClanRequest).mockResolvedValue(false as never);
		vi.mocked(playerDao.isPlayerLeaderOfClanRequest).mockResolvedValue(true as never);
		expect(await canCreateClan(req())).toBe(true);
		expect(await canJoinClan(req())).toBe(false);
		expect(await isPlayerLeaderOfClan(req({ id: '2' }))).toBe(true);
	});

	it('playerToolTip returns infos or throws', async () => {
		vi.mocked(playerDao.getToolTipInfos).mockResolvedValue({ id: 'p' } as never);
		expect(await playerToolTip(req({ id: 'p' }))).toEqual({ id: 'p' });
		vi.mocked(playerDao.getToolTipInfos).mockResolvedValue(null as never);
		await expect(playerToolTip(req({ id: 'p' }))).rejects.toThrow('Missing player');
	});
});

describe('resetAccount', () => {
	const deletable = (overrides = {}) => ({
		bids: [],
		offers: [],
		ClanMember: null,
		targetedCases: [],
		LeftFightArchives: [],
		RightFightArchives: [],
		...overrides
	});

	it('resets the user when all checks pass', async () => {
		vi.mocked(getLatestTournament).mockResolvedValue(null as never);
		vi.mocked(playerDao.checkBeforeDeletion).mockResolvedValue(deletable() as never);
		await resetAccount(req());
		expect(playerDao.resetUser).toHaveBeenCalledWith('p1');
	});

	it('throws when no player found', async () => {
		vi.mocked(getLatestTournament).mockResolvedValue(null as never);
		vi.mocked(playerDao.checkBeforeDeletion).mockResolvedValue(null as never);
		await expect(resetAccount(req())).rejects.toThrow('No player found');
	});

	it('throws when bids ongoing', async () => {
		vi.mocked(getLatestTournament).mockResolvedValue(null as never);
		vi.mocked(playerDao.checkBeforeDeletion).mockResolvedValue(deletable({ bids: [{ id: 1 }] }) as never);
		await expect(resetAccount(req())).rejects.toThrow('bidsOngoing');
	});

	it('throws when offer ongoing', async () => {
		vi.mocked(getLatestTournament).mockResolvedValue(null as never);
		vi.mocked(playerDao.checkBeforeDeletion).mockResolvedValue(
			deletable({ offers: [{ status: OfferStatus.ONGOING }] }) as never
		);
		await expect(resetAccount(req())).rejects.toThrow('bidsOngoing');
	});

	it('throws when in clan', async () => {
		vi.mocked(getLatestTournament).mockResolvedValue(null as never);
		vi.mocked(playerDao.checkBeforeDeletion).mockResolvedValue(deletable({ ClanMember: { clanId: 1 } }) as never);
		await expect(resetAccount(req())).rejects.toThrow('inClan');
	});

	it('throws when ban pending', async () => {
		vi.mocked(getLatestTournament).mockResolvedValue(null as never);
		vi.mocked(playerDao.checkBeforeDeletion).mockResolvedValue(deletable({ targetedCases: [{ id: 1 }] }) as never);
		await expect(resetAccount(req())).rejects.toThrow('banPending');
	});

	it('throws when qualified for ongoing tournament', async () => {
		vi.mocked(getLatestTournament).mockResolvedValue({ id: 5 } as never);
		vi.mocked(playerDao.checkBeforeDeletion).mockResolvedValue(deletable({ LeftFightArchives: [{ id: 1 }] }) as never);
		await expect(resetAccount(req())).rejects.toThrow('ongoingDojoTournament');
	});
});

describe('updatePlayerSettings', () => {
	it.each(['skipLevel', 'skipFight', 'archivedSiteId', 'shareArchivedData'])('updates %s', async setting => {
		await updatePlayerSettings(req({ setting }, { setting: true }));
		expect(playerDao.setPlayer).toHaveBeenCalledWith('p1', { [setting]: true });
	});

	it('updates displayedNotifications when valid', async () => {
		await updatePlayerSettings(req({ setting: 'displayedNotifications' }, { setting: 5 }));
		expect(playerDao.setPlayer).toHaveBeenCalledWith('p1', { displayedNotifications: 5 });
	});

	it('throws for invalid displayedNotifications', async () => {
		await expect(updatePlayerSettings(req({ setting: 'displayedNotifications' }, { setting: 0 }))).rejects.toThrow(
			'Invalid number'
		);
	});
});
