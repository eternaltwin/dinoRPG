import { Request } from 'express';
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
	getFullClanTreasure,
	getPlayerJoinListRequest,
	getPlayerJoinRequest,
	joinClanRequest,
	leaveClanSelfRequest,
	playerHasRightRequest,
	searchClansByNameRequest,
	updateClanBannerRequest,
	updateClanContribution,
	updateClanMemberRequest,
	updateClanPageRequest,
	updateClanTreasure,
	upsertClanIngredients
} from '../dao/clansDao.js';
import { canCreateClan, canJoinClan, isPlayerLeaderOfClan } from './playerService.js';
import { addMoney, auth, removeMoney } from '../dao/playerDao.js';
import { CLAN_CREATE_MONEY, CLAN_JOIN_MONEY, CLAN_MAX_MEMBERS_AMOUNT } from '@drpg/core/constants';
import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';
import { ShopDTO } from '@drpg/core/models/shop/shopDTO';
import { decreaseIngredientQuantity, getAllIngredientsDataRequest } from '../dao/playerIngredientDao.js';
import { ingredientList } from '@drpg/core/models/ingredient/ingredientList';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import translate from '../utils/translate.js';
import { getDataForMessageDeletion } from '../dao/clanMessageDao.js';

/**
 * Get all the clans
 * @param req
 * @param req.params.page {number} page number
 * @returns Array<Clan>
 */
export async function getAllClans(req: Request) {
	if (!req.auth?.playerId) throw new Error('No auth data');
	const clans = await getAllClansRequest(Number(req.params.page));
	return clans;
}

/**
 * Search clans by name
 * @param req
 * @param req.params.page {number} page number
 * @param req.params.name {string} clan name
 * @returns Array<Clan>
 */
export async function searchClanByName(req: Request) {
	if (!req.auth?.playerId) throw new Error('No auth data');

	const clans = await searchClansByNameRequest(req.params.name, Number(req.params.page));

	return clans;
}

/**
 * Get clan by its id
 * @param req
 * @param req.params.id {number} clan id
 * @returns Clan
 */
export async function getClan(req: Request) {
	if (!req.auth?.playerId) throw new Error('No auth data');
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
	if (!req.auth?.playerId) throw new Error('No auth data');
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
		throw new ExpectedError(`Player ${authed.id} doesn't fill conditions to create a clan`);
	}

	await removeMoney(authed.id, CLAN_CREATE_MONEY);

	const clan = await createClanRequest(req.body.name, req.body.description, authed.id);
	return clan;
}

/**
 * Join clan
 * @param req
 * @param req.params.id {number} Clan id
 * @returns Clan
 */
export async function joinClan(req: Request) {
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const canCreate: boolean = await canJoinClan(req);
	if (!canCreate) {
		throw new ExpectedError(`Player ${req.auth.playerId} doesn't fill conditions to join a clan`);
	}

	await removeMoney(req.auth.playerId, CLAN_JOIN_MONEY);

	const clan = await joinClanRequest(Number(req.params.id), req.auth?.playerId);
	return clan;
}

/**
 * Join clan
 * @param req
 * @param req.params.requestId {string} Description for request
 * @returns Clan
 */
export async function acceptJoinRequest(req: Request) {
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const fullClanRequest = await clanJoinRequest(+req.params.id);
	if (!fullClanRequest) {
		throw new ExpectedError(`Request doesn't exist.`);
	}

	if (fullClanRequest.clan._count.members >= CLAN_MAX_MEMBERS_AMOUNT) {
		throw new ExpectedError(`Clan ${req.params.id} is full`);
	}

	const hasRight = await playerHasRightRequest(
		fullClanRequest.clanId,
		req.auth.playerId,
		ClanMemberRight.MEMBER_ACCEPT_AND_DENY_REQUESTS
	);

	if (!hasRight) {
		throw new ExpectedError(`You cannot accept this request`);
	}

	const join = await acceptPlayerJoinRequest(Number(req.params.id));
	return join;
}

/**
 * Deny join request
 * @param req
 * @param req.params.requestId {string} Description for request
 * @returns Clan
 */
export async function denyJoinRequest(req: Request) {
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	await addMoney(req.auth.playerId, CLAN_JOIN_MONEY);

	const deny = await denyPlayerJoinRequest(Number(req.params.id));
	return deny;
}

/**
 * Get join request of a player by its id
 * @param req
 * @returns Clan
 */
export async function getJoinRequest(req: Request) {
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}
	//TODO : pas besoin de playerId en param vu qu'on l'a dans requ.auth.playerId
	const joinRequest = await getPlayerJoinRequest(Number(req.auth.playerId));
	return joinRequest;
}

/**
 * Get join requests list for clan id
 * @param req
 * @param req.params.id {number} clan id
 * @returns Clan
 */
export async function getJoinRequestslist(req: Request) {
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

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
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const isPlayerLeader: boolean = await isPlayerLeaderOfClan(req);
	if (!isPlayerLeader) {
		throw new ExpectedError(`Player ${req.auth.playerId} is not leader of clan ${req.params.id}`);
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
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}
	if (!req.file) {
		throw new ExpectedError(`No file`);
	}
	const clanId = +req.params.id;

	const hasRight = await playerHasRightRequest(clanId, Number(req.auth?.playerId), ClanMemberRight.CLAN_EDIT_BANNER);

	if (!hasRight) {
		throw new ExpectedError(
			`Member ${req.params.id} doesn't have the right ${ClanMemberRight[ClanMemberRight.CLAN_EDIT_BANNER]}`
		);
	}

	//TODO : set file size limit ?

	await updateClanBannerRequest(clanId, req.file.buffer);

	return 'clan';
}

/**
 * Get clan banner
 * @param req
 * @param req.params.id {number} clan id
 * @returns Clan
 */
export async function getClanBanner(req: Request) {
	const banner = await getClanBannerRequest(Number(req.params.id));

	return banner;
}

/**
 * Get clan member by id
 * @param req
 * @param req.params.memberId {number} member id
 * @param req.params.clanrId {number} clan id
 * @returns member
 */
export async function getClanMember(req: Request) {
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const hasRight = await playerHasRightRequest(
		Number(req.params.clanId),
		Number(req.auth?.playerId),
		ClanMemberRight.MEMBER_EDIT
	);
	if (!hasRight) {
		throw new ExpectedError(
			`Member ${req.params.id} doesn't have the right ${ClanMemberRight[ClanMemberRight.MEMBER_EDIT]}`
		);
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
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const hasRight = await playerHasRightRequest(
		Number(req.params.clanId),
		Number(req.auth?.playerId),
		ClanMemberRight.MEMBER_EDIT
	);
	if (!hasRight) {
		throw new ExpectedError(
			`Member ${req.params.id} doesn't have the right ${ClanMemberRight[ClanMemberRight.MEMBER_EDIT]}`
		);
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
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const hasRight = await playerHasRightRequest(
		Number(req.params.clanId),
		Number(req.auth?.playerId),
		ClanMemberRight.MEMBER_EXCLUDE
	);
	if (!hasRight) {
		throw new ExpectedError(
			`Member ${req.params.id} doesn't have the right ${ClanMemberRight[ClanMemberRight.MEMBER_EXCLUDE]}`
		);
	}

	const member = await excludeClanMemberRequest(Number(req.params.id));

	return member;
}

/**
 * Leave clan
 * @param req
 * @returns member
 */
export async function leaveClanSelf(req: Request) {
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const member = await leaveClanSelfRequest(Number(req.auth?.playerId));

	return member;
}

/**
 * Get clan pages list
 * @param req
 * @param req.params.clanId {number} clan id
 * @returns member
 */
export async function getClanPages(req: Request) {
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const pages = await getClanPagesListRequest(Number(req.auth.playerId), Number(req.params.clanId));

	return pages;
}

/**
 * Get clan page with id
 * @param req
 * @param req.params.id {number} page id
 * @returns member
 */
export async function getClanPage(req: Request) {
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const page = await getClanPageRequest(Number(req.auth.playerId), Number(req.params.id));

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
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const isPublic = Boolean(req.body.isPublic);

	const hasRight = await playerHasRightRequest(
		Number(req.body.clanId),
		Number(req.auth?.playerId),
		ClanMemberRight.PAGE_MANAGE
	);
	if (!hasRight) {
		throw new ExpectedError(
			`Member ${req.params.id} doesn't have the right ${ClanMemberRight[ClanMemberRight.PAGE_MANAGE]}`
		);
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
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const hasRight = await playerHasRightRequest(
		Number(req.params.clanId),
		Number(req.auth?.playerId),
		ClanMemberRight.PAGE_MANAGE
	);
	if (!hasRight) {
		throw new ExpectedError(
			`Member ${req.params.id} doesn't have the right ${ClanMemberRight[ClanMemberRight.PAGE_MANAGE]}`
		);
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
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const hasRight = await playerHasRightRequest(
		Number(req.params.clanId),
		Number(req.auth?.playerId),
		ClanMemberRight.PAGE_MANAGE
	);
	if (!hasRight) {
		throw new ExpectedError(
			`Member ${req.params.id} doesn't have the right ${ClanMemberRight[ClanMemberRight.PAGE_MANAGE]}`
		);
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
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const messages = await getClanMessagesRequest(req.auth.playerId, Number(req.params.id), Number(req.params.page));
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
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const messages = await getClanHistoryRequest(req.auth.playerId, Number(req.params.id), Number(req.params.page));
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
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const rightString = req.params.right as keyof typeof ClanMemberRight;

	const hasRight = await playerHasRightRequest(
		Number(req.params.clanId),
		req.auth.playerId,
		ClanMemberRight[rightString]
	);
	return hasRight;
}

/**
 * Get clan messages total count
 * @param req
 * @param req.params.id {number} clan id
 * @returns Clan
 */
export async function getClanMessagesCount(req: Request) {
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

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
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

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
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}
	const clanId = +req.params.id;
	const clan = await getClanMembersListRequest(clanId);

	if (!clan || !clan.some(p => p.player.id === req.auth?.playerId)) {
		throw new ExpectedError(`Player is not in the clan`);
	}

	const ingredients = req.body.ingredients as ShopDTO[];
	const playerIngredients = await getAllIngredientsDataRequest(req.auth.playerId);
	// Throw an exception if the player doesn't exist
	if (!playerIngredients) {
		throw new ExpectedError(`Player ${req.auth.playerId} doesn't exist.`);
	}

	// Lock negative quantities
	if (ingredients.filter(i => i.quantity <= 0).length > 0) {
		throw new ExpectedError(translate(`wrongQuantity`));
	}

	const gold = ingredients.reduce(
		(acc, cur) =>
			acc + (Object.values(ingredientList).find(a => a.ingredientId === cur.itemId)?.price ?? 0) * cur.quantity,
		0
	);

	const promises = [];
	promises.push(updateClanTreasure(clanId, gold));
	promises.push(updateClanContribution(req.auth.playerId, gold));
	for (const ingredient of ingredients) {
		const playerIngredient = playerIngredients.find(i => i.ingredientId === ingredient.itemId);
		if (!playerIngredient || playerIngredient.quantity - ingredient.quantity < 0) {
			throw new ExpectedError(translate(`wrongQuantity`));
		}
		promises.push(decreaseIngredientQuantity(req.auth.playerId, ingredient.itemId, ingredient.quantity));
		promises.push(upsertClanIngredients(clanId, ingredient.itemId, ingredient.quantity));
	}

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
	if (!req.auth?.playerId) {
		throw new ExpectedError(`Unauthorized`);
	}

	const clanId = +req.params.id;
	const clan = await getClanMembersListRequest(clanId);

	if (!clan || !clan.some(p => p.player.id === req.auth?.playerId)) {
		throw new ExpectedError(`Player is not in the clan`);
	}

	const treasure = await getFullClanTreasure(clanId);

	return treasure.map(i => {
		return { itemId: i.ingredientId, quantity: i.quantity } as ShopDTO;
	});
}

export async function checkMessageCanBeDeleted(msgId: number, playerId: number): Promise<void> {
	const messageData = await getDataForMessageDeletion(msgId);

	if (messageData === null || messageData.clan === null) throw new Error('The data got cannot be null.');
	
	const isPlayerInClan = messageData.clan.members.some(player => player.id === playerId);
	if (!isPlayerInClan) throw new Error("You're trying to delete a message from an other clan.");

	const isDeletingOwnMessage = messageData.authorId === playerId;
	const isLeaderFromClan = messageData.clan.leaderId === playerId;

	if (!isDeletingOwnMessage && !isLeaderFromClan) throw new Error("You're not able to delete this message.");
}
