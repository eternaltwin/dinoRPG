import { CLAN_CREATE_MONEY, CLAN_JOIN_MONEY, CLAN_MAX_MEMBERS_AMOUNT } from '@drpg/core/constants';
import { ClanForSearch, ClanLite, PlayerClanJoinRequest } from '@drpg/core/models/clan/clan';
import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';
import { ingredientList } from '@drpg/core/models/ingredient/ingredientList';
import { ShopDTO } from '@drpg/core/models/shop/shopDTO';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { NotificationSeverity } from '@drpg/prisma';
import { Request } from 'express';
import { LOGGER } from '../context.js';
import { getDataForMessageDeletion } from '../dao/clanMessageDao.js';
import {
	acceptPlayerJoinRequest,
	clanJoinRequest,
	createClanPageRequest,
	createClanRequest,
	deleteClanPageRequest,
	deleteClanRequest,
	denyPlayerJoinRequest,
	excludeClanMemberRequest,
	getAllClansRequest,
	getClanBannerRequest,
	getClanHistoryCountRequest,
	getClanHistoryRequest,
	getClanMemberRequest,
	getClanMembersListRequest,
	getClanMessagesCountRequest,
	getClanMessagesRequest,
	getClanPageRequest,
	getClanPagesListRequest,
	getClanRequest,
	getEventRankingClansRequest,
	getFullClanTreasure,
	getPlayerJoinListRequest,
	getPlayerJoinRequest,
	getRankingClansRequest,
	joinClanRequest,
	leaveClanSelfRequest,
	playerHasRightRequest,
	searchClansByName,
	searchClansByNameRequest,
	updateClanBannerRequest,
	updateClanContribution,
	updateClanLanguagesRequest,
	updateClanMemberRequest,
	updateClanPageRequest,
	updateClanTreasure,
	upsertClanIngredients
} from '../dao/clansDao.js';
import { createNotification } from '../dao/notificationDao.js';
import { addMoney, auth, removeMoney } from '../dao/playerDao.js';
import { decreaseIngredientQuantity, getAllIngredientsDataRequest } from '../dao/playerIngredientDao.js';
import translate from '../utils/translate.js';
import { canCreateClan, canJoinClan, isPlayerLeaderOfClan } from './playerService.js';
import { JoinClanResponse, JoinRequestListResponse } from '@drpg/core/models/clan/clanJoinRequest';
import { getCurrentEvents } from './forceBruteService.js';
import { currentEvents, GameEvent } from '@drpg/core/models/event/Events';
import { ClanRankingType } from '@drpg/core/models/rankings/clanRanking';

/**
 * Get all the clans
 * @param req
 * @param req.params.page {number} page number
 * @returns Array<Clan>
 */
export async function getAllClans(req: Request): Promise<ClanLite[]> {
	await auth(req);
	const page = +req.params.page;
	const clans = await getAllClansRequest(page);
	return clans;
}

/**
 * Get ranking of clans
 * @param req
 * @param req.params.page {number} page number
 * @returns Array<Clan>
 */
export async function getRankingClans(req: Request) {
	await auth(req);
	const page = +req.params.page;
	if (req.params.type === ClanRankingType.TREASURE) {
		return await getRankingClansRequest(page);
	} else if (req.params.type === ClanRankingType.EVENT) {
		const event = currentEvents();
		return await getEventRankingClansRequest(page, event[0].name);
	}
	return await getRankingClansRequest(page);
}

/**
 * Search clans by name
 * @param req
 * @param req.params.page {number} page number
 * @param req.params.name {string} clan name
 * @returns Array<Clan>
 */
export async function searchClanByName(req: Request): Promise<ClanLite[]> {
	await auth(req);

	const clans = await searchClansByNameRequest(req.params.name, Number(req.params.page));

	return clans;
}

/**
 * Search clans by name
 * @param req
 * @param req.params.name {string} clan name
 * @returns Array<Clan>
 */
export async function searchClans(req: Request): Promise<ClanForSearch[]> {
	await auth(req);

	const clans = await searchClansByName(req.params.name);

	return clans;
}

/**
 * Get clan by its id
 * @param req
 * @param req.params.id {number} clan id
 * @returns Clan
 */
export async function getClan(req: Request) {
	await auth(req);
	const clan = await getClanRequest(Number(req.params.id));
	return clan;
}

/**
 * Get clanMembers list by clan id
 * @param req
 * @param req.params.id {number} clan id
 * @returns Array of clanMembers
 */
export async function getClanMembers(req: Request) {
	await auth(req);
	const members = await getClanMembersListRequest(Number(req.params.id));
	return members;
}

/**
 * Create clan
 * @param req
 * @param req.body.name {string} New clan name
 * @param req.body.description {string} New clan description
 * @returns Clan
 */
export async function createClan(req: Request) {
	const authed = await auth(req);

	const namedClan = await searchClansByNameRequest(req.body.name, 1);
	if (namedClan.length > 0) {
		throw new ExpectedError(translate('existingNameClan', authed));
	}

	const canCreate: boolean = await canCreateClan(req);
	if (!canCreate) {
		throw new ExpectedError(`Player ${authed.name} doesn't fill conditions to create a clan`);
	}

	await removeMoney(authed.id, CLAN_CREATE_MONEY);

	const clan = await createClanRequest(req.body.name, req.body.description, req.body.languages, authed.id);
	return clan;
}

/**
 * Join clan
 * @param req
 * @param req.params.id {number} Clan id
 * @returns Clan
 */
export async function joinClan(req: Request): Promise<JoinClanResponse> {
	const authed = await auth(req);

	const canCreate: boolean = await canJoinClan(req);
	if (!canCreate) {
		throw new ExpectedError(`Player ${authed.name} doesn't fill conditions to join a clan`);
	}

	await removeMoney(authed.id, CLAN_JOIN_MONEY);

	const clan = await joinClanRequest(Number(req.params.id), authed.id);
	const notificationMember = [clan.clan.leaderId, ...clan.clan.members.map(m => m.playerId)];
	for (const member of notificationMember) {
		await createNotification(
			member,
			clan.player.name,
			NotificationSeverity.newClanApply,
			`/clan/${clan.clan.id}/members`
		);
	}

	return clan;
}

/**
 * Join clan
 * @param req
 * @param req.params.requestId {string} Description for request
 * @returns Clan
 */
export async function acceptJoinRequest(req: Request) {
	const authed = await auth(req);

	const fullClanRequest = await clanJoinRequest(+req.params.id);
	if (!fullClanRequest) {
		throw new ExpectedError(`Request doesn't exist.`);
	}

	if (fullClanRequest.clan._count.members >= CLAN_MAX_MEMBERS_AMOUNT) {
		throw new ExpectedError(`Clan ${req.params.id} is full`);
	}

	const hasRight = await playerHasRightRequest(
		fullClanRequest.clanId,
		authed.id,
		ClanMemberRight.MEMBER_ACCEPT_AND_DENY_REQUESTS
	);

	if (!hasRight) {
		throw new ExpectedError(`You cannot accept this request`);
	}

	const join = await acceptPlayerJoinRequest(+req.params.id, authed.id);
	return join;
}

/**
 * Deny join request
 * @param req
 * @param req.params.requestId {string} Description for request
 * @returns Clan
 */
export async function denyJoinRequest(req: Request) {
	const authed = await auth(req);

	await addMoney(authed.id, CLAN_JOIN_MONEY);

	const deny = await denyPlayerJoinRequest(Number(req.params.id));
	return deny;
}

/**
 * Get join request of a player by its id
 * @param req
 * @returns Clan
 */
export async function getJoinRequest(req: Request): Promise<PlayerClanJoinRequest | null> {
	const authed = await auth(req);

	//pas besoin de playerId en param vu qu'on l'a dans requ.auth.playerId
	const joinRequest = await getPlayerJoinRequest(authed.id);
	return joinRequest;
}

/**
 * Get join requests list for clan id
 * @param req
 * @param req.params.id {number} clan id
 * @returns Clan
 */
export async function getJoinRequestslist(req: Request): Promise<JoinRequestListResponse> {
	await auth(req);

	const deny = await getPlayerJoinListRequest(Number(req.params.id));
	return deny;
}

/**
 * Delete clan
 * @param req
 * @param req.params.id {number} Clan id
 * @returns Clan
 */
export async function deleteClan(req: Request) {
	const authed = await auth(req);

	const isPlayerLeader: boolean = await isPlayerLeaderOfClan(req);
	if (!isPlayerLeader) {
		throw new ExpectedError(`Player ${authed.name} is not leader of clan ${req.params.id}`);
	}

	const clan = await deleteClanRequest(Number(req.params.id));
	return clan;
}

/**
 * Update clan banner
 * @param req
 * @param req.params.id {number} clan id
 * @param req.body.image {bytes} new banner
 * @returns Clan
 */
export async function updateClanBanner(req: Request) {
	const authed = await auth(req);

	if (!req.file) {
		throw new ExpectedError(`No file`);
	}
	const clanId = +req.params.id;

	const hasRight = await playerHasRightRequest(clanId, authed.id, ClanMemberRight.CLAN_EDIT_BANNER);

	if (!hasRight) {
		throw new ExpectedError(`Member ${req.params.id} doesn't have the right ${ClanMemberRight.CLAN_EDIT_BANNER}`);
	}

	//TODO : set file size limit ?

	await updateClanBannerRequest(clanId, req.file.buffer);

	return 'clan';
}

/**
 * Update clan language
 * @param req
 * @param req.params.id {number} clan id
 * @param req.body.language new language
 * @returns Clan
 */
export async function updateClanLanguages(req: Request) {
	const authed = await auth(req);

	const clanId = +req.params.id;

	const hasRight = await playerHasRightRequest(clanId, authed.id, ClanMemberRight.CLAN_EDIT_LANG);

	if (!hasRight) {
		throw new ExpectedError(`Member ${req.params.id} doesn't have the right ${ClanMemberRight.CLAN_EDIT_LANG}`);
	}

	const clan = await updateClanLanguagesRequest(clanId, req.body.languages);

	return clan.langs;
}

/**
 * Get clan banner
 * @param req
 * @param req.params.id {number} clan id
 * @returns Clan
 */
export async function getClanBanner(req: Request) {
	const banner = await getClanBannerRequest(Number(req.params.id));

	return banner?.banner;
}

/**
 * Get clan member by id
 * @param req
 * @param req.params.memberId {number} member id
 * @param req.params.clanrId {number} clan id
 * @returns member
 */
export async function getClanMember(req: Request) {
	const authed = await auth(req);

	const hasRight = await playerHasRightRequest(Number(req.params.clanId), authed.id, ClanMemberRight.MEMBER_EDIT);
	if (!hasRight) {
		throw new ExpectedError(`Member ${req.params.id} doesn't have the right ${ClanMemberRight.MEMBER_EDIT}`);
	}

	const member = await getClanMemberRequest(Number(req.params.memberId));

	return member;
}

/**
 * Update clan member rights & nickname
 * @param req
 * @param req.params.clanId {number} clan id
 * @param req.body.clanMember {ClanMember} clan member with edited fields
 * @returns member
 */
export async function updateClanMember(req: Request) {
	const authed = await auth(req);

	const hasRight = await playerHasRightRequest(Number(req.params.clanId), authed.id, ClanMemberRight.MEMBER_EDIT);
	if (!hasRight) {
		throw new ExpectedError(`Member ${req.params.id} doesn't have the right ${ClanMemberRight.MEMBER_EDIT}`);
	}

	const member = await updateClanMemberRequest(
		req.body.clanMember.id,
		Number(req.params.clanId),
		req.body.clanMember.rights,
		req.body.clanMember.nickname
	);

	return member;
}

/**
 * Exclude clan member
 * @param req
 * @param req.params.id {number} member id
 * @param req.params.clanId {number} clan id
 * @returns member
 */
export async function excludeClanMember(req: Request) {
	const authed = await auth(req);

	const hasRight = await playerHasRightRequest(Number(req.params.clanId), authed.id, ClanMemberRight.MEMBER_EXCLUDE);
	if (!hasRight) {
		throw new ExpectedError(`Member ${req.params.id} doesn't have the right ${ClanMemberRight.MEMBER_EXCLUDE}`);
	}

	const member = await excludeClanMemberRequest(+req.params.id, authed.id);

	return member;
}

/**
 * Leave clan
 * @param req
 * @returns member
 */
export async function leaveClanSelf(req: Request) {
	const authed = await auth(req);

	const member = await leaveClanSelfRequest(authed.id);

	return member;
}

/**
 * Get clan pages list
 * @param req
 * @param req.params.clanId {number} clan id
 * @returns member
 */
export async function getClanPages(req: Request) {
	const authed = await auth(req);

	const pages = await getClanPagesListRequest(authed.id, Number(req.params.clanId));

	return pages;
}

/**
 * Get clan page with id
 * @param req
 * @param req.params.id {number} page id
 * @returns member
 */
export async function getClanPage(req: Request) {
	const authed = await auth(req);

	const page = await getClanPageRequest(authed.id, Number(req.params.id));

	return page;
}

/**
 * Create clan page
 * @param req
 * @param req.body.clanId {string} Clan id
 * @param req.body.name {string} New page name
 * @param req.body.content {string} New page content
 * @param req.body.isPublic {string} boolean if page is public
 * @returns Page
 */
export async function createClanPage(req: Request) {
	const authed = await auth(req);

	const isPublic = Boolean(req.body.isPublic);

	const hasRight = await playerHasRightRequest(Number(req.body.clanId), authed.id, ClanMemberRight.PAGE_MANAGE);
	if (!hasRight) {
		throw new ExpectedError(`Member ${req.params.id} doesn't have the right ${ClanMemberRight.PAGE_MANAGE}`);
	}

	const page = await createClanPageRequest(Number(req.body.clanId), req.body.name, req.body.content, isPublic);
	return page;
}

/**
 * Delete clan page
 * @param req
 * @param req.params.pageId {number} page id
 * @param req.params.clanId {number} clan id
 * @returns page
 */
export async function deleteClanPage(req: Request) {
	const authed = await auth(req);

	const hasRight = await playerHasRightRequest(Number(req.params.clanId), authed.id, ClanMemberRight.PAGE_MANAGE);
	if (!hasRight) {
		throw new ExpectedError(`Member ${req.params.id} doesn't have the right ${ClanMemberRight.PAGE_MANAGE}`);
	}

	const page = await deleteClanPageRequest(Number(req.params.pageId));

	return page;
}

/**
 * Update clan page
 * @param req
 * @param req.params.id {number} page id
 * @param req.params.clanId {number} clan id
 * @param req.body.content {string} page content
 * @param req.body.isPublic {boolean} is page public
 * @returns page
 */
export async function updateClanPage(req: Request) {
	const authed = await auth(req);

	const hasRight = await playerHasRightRequest(Number(req.params.clanId), authed.id, ClanMemberRight.PAGE_MANAGE);
	if (!hasRight) {
		throw new ExpectedError(`Member ${req.params.id} doesn't have the right ${ClanMemberRight.PAGE_MANAGE}`);
	}

	const page = await updateClanPageRequest(Number(req.params.id), req.body.name, req.body.content, req.body.isPublic);

	return page;
}

/**
 * Get clan messages by clan id
 * @param req
 * @param req.params.id {number} clan id
 * @param req.params.page {number} page number
 * @returns messages list
 */
export async function getClanMessages(req: Request) {
	const authed = await auth(req);

	const messages = await getClanMessagesRequest(authed.id, Number(req.params.id), Number(req.params.page));
	return messages;
}

/**
 * Get clan history by clan id
 * @param req
 * @param req.params.id {number} clan id
 * @param req.params.page {number} page number
 * @returns Clan
 */
export async function getClanHistory(req: Request) {
	const authed = await auth(req);

	const messages = await getClanHistoryRequest(authed.id, Number(req.params.id), Number(req.params.page));
	return messages;
}

/**
 * Get player has right boolean
 * @param req
 * @param req.params.clanId {number} clan id
 * @param req.params.right {string} right code
 * @returns boolean
 */
export async function getPlayerHasRight(req: Request) {
	const authed = await auth(req);

	const rightString = req.params.right as keyof typeof ClanMemberRight;

	const hasRight = await playerHasRightRequest(Number(req.params.clanId), authed.id, ClanMemberRight[rightString]);
	return hasRight;
}

/**
 * Get clan messages total count
 * @param req
 * @param req.params.id {number} clan id
 * @returns Clan
 */
export async function getClanMessagesCount(req: Request) {
	await auth(req);

	const count = await getClanMessagesCountRequest(Number(req.params.id));

	return { count };
}

/**
 * Get clan history total count
 * @param req
 * @param req.params.id {number} clan id
 * @returns Clan
 */
export async function getClanHistoryCount(req: Request) {
	await auth(req);

	const count = await getClanHistoryCountRequest(Number(req.params.id));

	return { count };
}

/**
 * Give clan a set of ingredients
 * @param req
 * @param req.params.id {number} clan id
 * @param req.body.ingredients
 * @returns void
 */
export async function giveClanIngredients(req: Request) {
	const authed = await auth(req);
	const clanId = +req.params.id;
	const clan = await getClanMembersListRequest(clanId);

	if (!clan || !clan.some(p => p.player.id === authed.id)) {
		throw new ExpectedError(`Player is not in the clan`);
	}

	const ingredients = req.body.ingredients as ShopDTO[];
	const playerIngredients = await getAllIngredientsDataRequest(authed.id);
	// Throw an exception if the player doesn't exist
	if (!playerIngredients) {
		throw new ExpectedError(`Player ${authed.id} doesn't exist.`);
	}

	// Lock negative quantities
	if (ingredients.some(i => i.quantity <= 0)) {
		throw new ExpectedError(translate(`wrongQuantity`));
	}

	const ingredientToGive = playerIngredients
		.filter(i => ingredients.some(a => a.itemId === i.ingredientId))
		.filter(i => {
			const givenIngredient = ingredients.find(a => a.itemId === i.ingredientId);
			if (!givenIngredient) {
				LOGGER.error(`Cannot find ingredient ${i.ingredientId} in database for player ${authed.id} donation.`);
				throw new ExpectedError('Error');
			}
			return i.quantity >= givenIngredient.quantity;
		})
		.map(i => {
			const givenIngredient = ingredients.find(a => a.itemId === i.ingredientId);
			const ingredientReference = Object.values(ingredientList).find(a => a.ingredientId === i.ingredientId);
			if (!givenIngredient || !ingredientReference) {
				LOGGER.error(`Cannot find ingredient ${i.ingredientId} in database for player ${authed.id} donation.`);
				throw new ExpectedError('Error');
			}
			return {
				ingredientId: i.ingredientId,
				quantity: givenIngredient.quantity,
				gold: givenIngredient.quantity * ingredientReference.price
			};
		});

	let totalGold = 0;
	const promises = [];
	for (const ingredient of ingredientToGive) {
		totalGold += ingredient.gold;
		promises.push(decreaseIngredientQuantity(authed.id, ingredient.ingredientId, ingredient.quantity));
		promises.push(upsertClanIngredients(clanId, ingredient.ingredientId, ingredient.quantity));
	}
	promises.push(updateClanTreasure(clanId, totalGold));
	promises.push(updateClanContribution(authed.id, totalGold));

	await Promise.all(promises);
	return;
}

/**
 * Get clan treasure details
 * @param req
 * @param req.params.id {number} clan id
 * @returns Clan
 */
export async function getClanTreasureDetails(req: Request) {
	const authed = await auth(req);

	const clanId = +req.params.id;
	const clan = await getClanMembersListRequest(clanId);

	if (!clan || !clan.some(p => p.player.id === authed.id)) {
		throw new ExpectedError(`Player is not in the clan`);
	}

	const treasure = await getFullClanTreasure(clanId);

	return treasure.map(i => {
		return { itemId: i.ingredientId, quantity: i.quantity } as ShopDTO;
	});
}

export async function checkMessageCanBeDeleted(msgId: number, playerId: string): Promise<void> {
	const messageData = await getDataForMessageDeletion(msgId);

	if (messageData === null || messageData.clan === null) throw new Error('The data got cannot be null.');

	const isPlayerInClan = messageData.clan.members.some(player => player.playerId === playerId);
	if (!isPlayerInClan) throw new Error("You're trying to delete a message from an other clan.");

	const isDeletingOwnMessage = messageData.authorId === playerId;
	const isLeaderFromClan = messageData.clan.leaderId === playerId;

	if (!isDeletingOwnMessage && !isLeaderFromClan) throw new Error("You're not able to delete this message.");
}
