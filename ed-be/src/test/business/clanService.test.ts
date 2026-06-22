import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import { ClanRankingType } from '@drpg/core/models/rankings/clanRanking';
import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';

vi.mock('../../dao/clansDao.js', () =>
	Object.fromEntries(
		[
			'acceptPlayerJoinRequest', 'clanJoinRequest', 'createClanPageRequest', 'createClanRequest', 'deleteClanPageRequest',
			'deleteClanRequest', 'denyPlayerJoinRequest', 'excludeClanMemberRequest', 'getAllClansRequest', 'getClanBannerRequest',
			'getClanHistoryCountRequest', 'getClanHistoryRequest', 'getClanMemberRequest', 'getClanMembersListRequest',
			'getClanMessagesCountRequest', 'getClanMessagesRequest', 'getClanPageRequest', 'getClanPagesListRequest',
			'getClanRequestPrivate', 'getClanRequestPublic', 'getEventRankingClansRequest', 'getFullClanTreasure',
			'getPlayerJoinListRequest', 'getPlayerJoinRequest', 'getRankingClansRequest', 'getRankingWarClansRequest',
			'joinClanRequest', 'leaveClanSelfRequest', 'playerHasRightRequest', 'searchClansByName', 'searchClansByNameRequest',
			'updateClanBannerRequest', 'updateClanContribution', 'updateClanLanguagesRequest', 'updateClanMemberRequest',
			'updateClanPageRequest', 'updateClanTreasure', 'upsertClanIngredients'
		].map(m => [m, vi.fn()])
	)
);
vi.mock('../../dao/clanMessageDao.js', () => ({ getDataForMessageDeletion: vi.fn() }));
vi.mock('../../dao/notificationDao.js', () => ({ createNotification: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({ addMoney: vi.fn(), auth: vi.fn(), removeMoney: vi.fn() }));
vi.mock('../../dao/playerIngredientDao.js', () => ({
	decreaseIngredientQuantity: vi.fn(),
	getAllIngredientsDataRequest: vi.fn()
}));
vi.mock('../../dao/dinozDao.js', () => ({ updateDinoz: vi.fn() }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('../../context.js', () => ({ LOGGER: { error: vi.fn(), log: vi.fn() } }));
vi.mock('../../business/playerService.js', () => ({
	canCreateClan: vi.fn(),
	canJoinClan: vi.fn(),
	isPlayerLeaderOfClan: vi.fn()
}));
vi.mock('../../prisma.js', () => ({ prisma: { clanCastle: { findUnique: vi.fn() } } }));
vi.mock('@drpg/core/models/event/Events', () => ({ currentEvents: () => [{ name: 'evt' }] }));

import * as clansDao from '../../dao/clansDao.js';
import { getDataForMessageDeletion } from '../../dao/clanMessageDao.js';
import { createNotification } from '../../dao/notificationDao.js';
import * as playerDao from '../../dao/playerDao.js';
import { getAllIngredientsDataRequest } from '../../dao/playerIngredientDao.js';
import { prisma } from '../../prisma.js';
import { updateDinoz } from '../../dao/dinozDao.js';
import { canCreateClan, canJoinClan, isPlayerLeaderOfClan } from '../../business/playerService.js';
import * as svc from '../../business/clanService.js';

const req = (params = {}, body = {}, file?: unknown) => makeRequest({ params, body, file } as never);

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(playerDao.auth).mockResolvedValue({ id: 'p1', name: 'Bob', clanId: 1 } as never);
	vi.mocked(clansDao.playerHasRightRequest).mockResolvedValue(true as never);
});

describe('listing & search', () => {
	it('getAllClans', async () => {
		vi.mocked(clansDao.getAllClansRequest).mockResolvedValue([{ id: 1 }] as never);
		expect(await svc.getAllClans(req({ page: '1' }))).toEqual([{ id: 1 }]);
	});
	it('getRankingClans by type', async () => {
		vi.mocked(clansDao.getRankingClansRequest).mockResolvedValue(['t'] as never);
		vi.mocked(clansDao.getEventRankingClansRequest).mockResolvedValue(['e'] as never);
		vi.mocked(clansDao.getRankingWarClansRequest).mockResolvedValue(['w'] as never);
		expect(await svc.getRankingClans(req({ page: '1', type: ClanRankingType.TREASURE }))).toEqual(['t']);
		expect(await svc.getRankingClans(req({ page: '1', type: ClanRankingType.EVENT }))).toEqual(['e']);
		expect(await svc.getRankingClans(req({ page: '1', type: ClanRankingType.WAR }))).toEqual(['w']);
		expect(await svc.getRankingClans(req({ page: '1', type: 'other' }))).toEqual(['t']);
	});
	it('searchClanByName and searchClans', async () => {
		vi.mocked(clansDao.searchClansByNameRequest).mockResolvedValue([{ id: 1 }] as never);
		vi.mocked(clansDao.searchClansByName).mockResolvedValue([{ id: 2 }] as never);
		expect(await svc.searchClanByName(req({ name: 'x', page: '1' }))).toEqual([{ id: 1 }]);
		expect(await svc.searchClans(req({ name: 'x' }))).toEqual([{ id: 2 }]);
	});
	it('getClan private and public', async () => {
		vi.mocked(clansDao.getClanRequestPrivate).mockResolvedValue({ id: 1, priv: true } as never);
		vi.mocked(clansDao.getClanRequestPublic).mockResolvedValue({ id: 2, priv: false } as never);
		expect(await svc.getClan(req({ id: '1' }))).toEqual({ id: 1, priv: true });
		expect(await svc.getClan(req({ id: '2' }))).toEqual({ id: 2, priv: false });
	});
	it('getClanMembers', async () => {
		vi.mocked(clansDao.getClanMembersListRequest).mockResolvedValue([{ id: 'm' }] as never);
		expect(await svc.getClanMembers(req({ id: '1' }))).toEqual([{ id: 'm' }]);
	});
});

describe('createClan', () => {
	it('creates a clan', async () => {
		vi.mocked(clansDao.searchClansByNameRequest).mockResolvedValue([] as never);
		vi.mocked(canCreateClan).mockResolvedValue(true as never);
		vi.mocked(clansDao.createClanRequest).mockResolvedValue({ id: 9 } as never);
		expect(await svc.createClan(req({}, { name: 'c', description: 'd', languages: ['fr'] }))).toEqual({ id: 9 });
		expect(playerDao.removeMoney).toHaveBeenCalled();
	});
	it('throws on existing name', async () => {
		vi.mocked(clansDao.searchClansByNameRequest).mockResolvedValue([{ id: 1 }] as never);
		await expect(svc.createClan(req({}, { name: 'c' }))).rejects.toThrow('existingNameClan');
	});
	it('throws when cannot create', async () => {
		vi.mocked(clansDao.searchClansByNameRequest).mockResolvedValue([] as never);
		vi.mocked(canCreateClan).mockResolvedValue(false as never);
		await expect(svc.createClan(req({}, { name: 'c' }))).rejects.toThrow("doesn't fill conditions");
	});
});

describe('join flow', () => {
	it('joinClan notifies members', async () => {
		vi.mocked(canJoinClan).mockResolvedValue(true as never);
		vi.mocked(clansDao.joinClanRequest).mockResolvedValue({
			clan: { id: 1, leaderId: 'l', members: [{ playerId: 'm1' }] },
			player: { name: 'Bob' }
		} as never);
		await svc.joinClan(req({ id: '1' }));
		expect(createNotification).toHaveBeenCalledTimes(2);
	});
	it('joinClan throws when cannot join', async () => {
		vi.mocked(canJoinClan).mockResolvedValue(false as never);
		await expect(svc.joinClan(req({ id: '1' }))).rejects.toThrow("doesn't fill conditions");
	});
	it('acceptJoinRequest accepts', async () => {
		vi.mocked(clansDao.clanJoinRequest).mockResolvedValue({ clanId: 1, clan: { _count: { members: 1 } } } as never);
		vi.mocked(clansDao.acceptPlayerJoinRequest).mockResolvedValue({
			id: 1, dateJoin: new Date(), rights: 0, donation: 0, player: {}, clan: {}
		} as never);
		const result = await svc.acceptJoinRequest(req({ id: '1' }));
		expect(result.id).toBe(1);
	});
	it('acceptJoinRequest throws when request missing', async () => {
		vi.mocked(clansDao.clanJoinRequest).mockResolvedValue(null as never);
		await expect(svc.acceptJoinRequest(req({ id: '1' }))).rejects.toThrow("doesn't exist");
	});
	it('acceptJoinRequest throws when clan full', async () => {
		vi.mocked(clansDao.clanJoinRequest).mockResolvedValue({ clanId: 1, clan: { _count: { members: 999 } } } as never);
		await expect(svc.acceptJoinRequest(req({ id: '1' }))).rejects.toThrow('is full');
	});
	it('acceptJoinRequest throws without right', async () => {
		vi.mocked(clansDao.clanJoinRequest).mockResolvedValue({ clanId: 1, clan: { _count: { members: 1 } } } as never);
		vi.mocked(clansDao.playerHasRightRequest).mockResolvedValue(false as never);
		await expect(svc.acceptJoinRequest(req({ id: '1' }))).rejects.toThrow('cannot accept');
	});
	it('denyJoinRequest refunds and denies', async () => {
		vi.mocked(clansDao.denyPlayerJoinRequest).mockResolvedValue({ ok: true } as never);
		await svc.denyJoinRequest(req({ id: '1' }));
		expect(playerDao.addMoney).toHaveBeenCalled();
	});
	it('getJoinRequest and getJoinRequestslist', async () => {
		vi.mocked(clansDao.getPlayerJoinRequest).mockResolvedValue({ id: 1 } as never);
		vi.mocked(clansDao.getPlayerJoinListRequest).mockResolvedValue({ list: [] } as never);
		expect(await svc.getJoinRequest(req())).toEqual({ id: 1 });
		expect(await svc.getJoinRequestslist(req({ id: '1' }))).toEqual({ list: [] });
	});
});

describe('deleteClan', () => {
	it('deletes when leader, freeing defenders', async () => {
		vi.mocked(isPlayerLeaderOfClan).mockResolvedValue(true as never);
		vi.mocked(prisma.clanCastle.findUnique).mockResolvedValue({ defenseOrder: [10, 11] } as never);
		expect(await svc.deleteClan(req({ id: '3' }))).toBe(3);
		expect(updateDinoz).toHaveBeenCalledTimes(2);
	});
	it('throws when not leader', async () => {
		vi.mocked(isPlayerLeaderOfClan).mockResolvedValue(false as never);
		await expect(svc.deleteClan(req({ id: '3' }))).rejects.toThrow('not leader');
	});
});

describe('right-guarded updates', () => {
	it('updateClanBanner updates with file', async () => {
		vi.mocked(clansDao.updateClanBannerRequest).mockResolvedValue(undefined as never);
		expect(await svc.updateClanBanner(req({ id: '1' }, {}, { buffer: Buffer.from('x') }))).toBe('clan');
	});
	it('updateClanBanner throws without file', async () => {
		await expect(svc.updateClanBanner(req({ id: '1' }))).rejects.toThrow('No file');
	});
	it('updateClanBanner throws without right', async () => {
		vi.mocked(clansDao.playerHasRightRequest).mockResolvedValue(false as never);
		await expect(svc.updateClanBanner(req({ id: '1' }, {}, { buffer: Buffer.from('x') }))).rejects.toThrow('right');
	});
	it('updateClanLanguages', async () => {
		vi.mocked(clansDao.updateClanLanguagesRequest).mockResolvedValue({ langs: ['fr'] } as never);
		expect(await svc.updateClanLanguages(req({ id: '1' }, { languages: ['fr'] }))).toEqual(['fr']);
	});
	it('updateClanLanguages throws without right', async () => {
		vi.mocked(clansDao.playerHasRightRequest).mockResolvedValue(false as never);
		await expect(svc.updateClanLanguages(req({ id: '1' }, {}))).rejects.toThrow('right');
	});
	it('getClanMember', async () => {
		vi.mocked(clansDao.getClanMemberRequest).mockResolvedValue({ id: 'm' } as never);
		expect(await svc.getClanMember(req({ clanId: '1', memberId: '2' }))).toEqual({ id: 'm' });
	});
	it('getClanMember throws without right', async () => {
		vi.mocked(clansDao.playerHasRightRequest).mockResolvedValue(false as never);
		await expect(svc.getClanMember(req({ clanId: '1', memberId: '2' }))).rejects.toThrow('right');
	});
	it('updateClanMember', async () => {
		vi.mocked(clansDao.updateClanMemberRequest).mockResolvedValue({ id: 'm' } as never);
		const r = req({ clanId: '1' }, { clanMember: { id: 2, rights: 1, nickname: 'n' } });
		expect(await svc.updateClanMember(r as never)).toEqual({ id: 'm' });
	});
	it('updateClanMember throws without right', async () => {
		vi.mocked(clansDao.playerHasRightRequest).mockResolvedValue(false as never);
		const r = req({ clanId: '1' }, { clanMember: { id: 2, rights: 1, nickname: 'n' } });
		await expect(svc.updateClanMember(r as never)).rejects.toThrow('right');
	});
	it('excludeClanMember', async () => {
		vi.mocked(clansDao.excludeClanMemberRequest).mockResolvedValue({ id: 'm' } as never);
		expect(await svc.excludeClanMember(req({ clanId: '1', id: '2' }))).toEqual({ id: 'm' });
	});
	it('excludeClanMember throws without right', async () => {
		vi.mocked(clansDao.playerHasRightRequest).mockResolvedValue(false as never);
		await expect(svc.excludeClanMember(req({ clanId: '1', id: '2' }))).rejects.toThrow('right');
	});
});

describe('pages, leave, banner, messages, history', () => {
	it('leaveClanSelf', async () => {
		vi.mocked(clansDao.leaveClanSelfRequest).mockResolvedValue({ id: 'm' } as never);
		expect(await svc.leaveClanSelf(req())).toEqual({ id: 'm' });
	});
	it('getClanPages / getClanPage', async () => {
		vi.mocked(clansDao.getClanPagesListRequest).mockResolvedValue([{ id: 1 }] as never);
		vi.mocked(clansDao.getClanPageRequest).mockResolvedValue({ id: 2 } as never);
		expect(await svc.getClanPages(req({ clanId: '1' }))).toEqual([{ id: 1 }]);
		expect(await svc.getClanPage(req({ id: '2' }))).toEqual({ id: 2 });
	});
	it('createClanPage / deleteClanPage / updateClanPage', async () => {
		vi.mocked(clansDao.createClanPageRequest).mockResolvedValue({ id: 1 } as never);
		vi.mocked(clansDao.deleteClanPageRequest).mockResolvedValue({ id: 1 } as never);
		vi.mocked(clansDao.updateClanPageRequest).mockResolvedValue({ id: 1 } as never);
		expect(await svc.createClanPage(req({}, { clanId: '1', name: 'n', content: 'c', isPublic: true }))).toEqual({ id: 1 });
		expect(await svc.deleteClanPage(req({ clanId: '1', pageId: '2' }))).toEqual({ id: 1 });
		expect(await svc.updateClanPage(req({ clanId: '1', id: '2' }, { name: 'n', content: 'c', isPublic: false }))).toEqual({ id: 1 });
	});
	it('createClanPage throws without right', async () => {
		vi.mocked(clansDao.playerHasRightRequest).mockResolvedValue(false as never);
		await expect(svc.createClanPage(req({}, { clanId: '1' }))).rejects.toThrow('right');
	});
	it('getClanBanner', async () => {
		vi.mocked(clansDao.getClanBannerRequest).mockResolvedValue({ banner: 'b' } as never);
		expect(await svc.getClanBanner(req({ id: '1' }))).toBe('b');
	});
	it('getClanMessages / getClanHistory / counts', async () => {
		vi.mocked(clansDao.getClanMessagesRequest).mockResolvedValue([{ id: 1 }] as never);
		vi.mocked(clansDao.getClanHistoryRequest).mockResolvedValue([{ id: 2 }] as never);
		vi.mocked(clansDao.getClanHistoryCountRequest).mockResolvedValue(5 as never);
		vi.mocked(clansDao.getClanMessagesCountRequest).mockResolvedValue(7 as never);
		expect(await svc.getClanMessages(req({ id: '1', page: '0' }))).toEqual([{ id: 1 }]);
		expect(await svc.getClanHistory(req({ id: '1', page: '0' }))).toEqual({ history: [{ id: 2 }], count: 5 });
		expect(await svc.getClanMessagesCount(req({ id: '1' }))).toEqual({ count: 7 });
		expect(await svc.getClanHistoryCount(req({ id: '1' }))).toEqual({ count: 5 });
	});
	it('getPlayerHasRight', async () => {
		vi.mocked(clansDao.playerHasRightRequest).mockResolvedValue(true as never);
		expect(await svc.getPlayerHasRight(req({ clanId: '1', right: 'MEMBER_EDIT' }))).toBe(true);
	});
});

describe('ingredients & treasure', () => {
	it('giveClanIngredients donates valid ingredients', async () => {
		vi.mocked(clansDao.getClanMembersListRequest).mockResolvedValue([{ player: { id: 'p1' } }] as never);
		vi.mocked(getAllIngredientsDataRequest).mockResolvedValue({ ingredients: [{ ingredientId: 1, quantity: 10 }] } as never);
		await svc.giveClanIngredients(req({ id: '1' }, { ingredients: [{ itemId: 1, quantity: 5 }] }));
		expect(clansDao.updateClanTreasure).toHaveBeenCalled();
	});
	it('giveClanIngredients throws when not in clan', async () => {
		vi.mocked(clansDao.getClanMembersListRequest).mockResolvedValue([{ player: { id: 'other' } }] as never);
		await expect(svc.giveClanIngredients(req({ id: '1' }, { ingredients: [] }))).rejects.toThrow('not in the clan');
	});
	it('giveClanIngredients throws on negative quantity', async () => {
		vi.mocked(clansDao.getClanMembersListRequest).mockResolvedValue([{ player: { id: 'p1' } }] as never);
		vi.mocked(getAllIngredientsDataRequest).mockResolvedValue({ ingredients: [] } as never);
		await expect(
			svc.giveClanIngredients(req({ id: '1' }, { ingredients: [{ itemId: 1, quantity: 0 }] }))
		).rejects.toThrow('wrongQuantity');
	});
	it('getClanTreasureDetails', async () => {
		vi.mocked(clansDao.getClanMembersListRequest).mockResolvedValue([{ player: { id: 'p1' } }] as never);
		vi.mocked(clansDao.getFullClanTreasure).mockResolvedValue({ gold: 5 } as never);
		expect(await svc.getClanTreasureDetails(req({ id: '1' }))).toEqual({ gold: 5 });
	});
	it('getClanTreasureDetails throws when not in clan', async () => {
		vi.mocked(clansDao.getClanMembersListRequest).mockResolvedValue([] as never);
		await expect(svc.getClanTreasureDetails(req({ id: '1' }))).rejects.toThrow('not in the clan');
	});
});

describe('checkMessageCanBeDeleted', () => {
	it('allows own message', async () => {
		vi.mocked(getDataForMessageDeletion).mockResolvedValue({
			clan: { members: [{ playerId: 'p1' }], leaderId: 'l' },
			authorId: 'p1'
		} as never);
		await expect(svc.checkMessageCanBeDeleted(1, 'p1')).resolves.toBeUndefined();
	});
	it('throws when data null', async () => {
		vi.mocked(getDataForMessageDeletion).mockResolvedValue(null as never);
		await expect(svc.checkMessageCanBeDeleted(1, 'p1')).rejects.toThrow('cannot be null');
	});
	it('throws when not in clan', async () => {
		vi.mocked(getDataForMessageDeletion).mockResolvedValue({
			clan: { members: [{ playerId: 'other' }], leaderId: 'l' },
			authorId: 'other'
		} as never);
		await expect(svc.checkMessageCanBeDeleted(1, 'p1')).rejects.toThrow('other clan');
	});
	it('throws when not owner nor leader', async () => {
		vi.mocked(getDataForMessageDeletion).mockResolvedValue({
			clan: { members: [{ playerId: 'p1' }], leaderId: 'l' },
			authorId: 'other'
		} as never);
		await expect(svc.checkMessageCanBeDeleted(1, 'p1')).rejects.toThrow('not able to delete');
	});
});
