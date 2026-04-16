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
import { currentEvents } from '@drpg/core/models/event/Events';
import { ClanRankingType } from '@drpg/core/models/rankings/clanRanking';
import { ClanMember } from '@drpg/core/models/clan/clanMember';
import { UpdateClanMemberRequestBody, UpdateClanMemberRequestParams } from '@drpg/core/returnTypes/Clan';
import { prisma } from '../prisma.js';
import { ClanEventConfig } from '@drpg/core/models/clan/clanEventConfig';

export async function eventState() {
	const currentWar = await prisma.clanEvent.findFirst({
		where: {
			endDate: {
				gt: new Date()
			}
		}
	});
	if (!currentWar) {
		return undefined;
	}
	return {
		id: currentWar.id,
		endDate: currentWar.endDate
	};
}

async function currentWar() {
	const currentWar = await prisma.clanEvent.findFirst({
		where: {
			endDate: {
				gt: new Date()
			}
		}
	});
	if (!currentWar) {
		throw new ExpectedError('No event in progress');
	}
	if (currentWar.endDate < new Date()) {
		throw new ExpectedError('War is over');
	}
	return {
		id: currentWar.id,
		config: JSON.parse(currentWar.config) as ClanEventConfig
	};
}

export async function buildClanCastle(req: Request) {
	const authed = await auth(req);
	const war = await currentWar();

	if (!authed.ClanMember) {
		throw new ExpectedError(translate('noClan', authed));
	}

	const hasRight = await playerHasRightRequest(
		authed.ClanMember.clanId,
		authed.id,
		ClanMemberRight.MEMBER_ACCEPT_AND_DENY_REQUESTS
	);

	if (!hasRight) {
		throw new ExpectedError(translate('noRight', authed));
	}

	const randomPlace = war.config.warPlaces[Math.round(Math.random() * war.config.warPlaces.length) - 1];

	await prisma.clanCastle.upsert({
		where: {
			clanId: authed.ClanMember.clanId
		},
		create: {
			placeId: randomPlace,
			clanId: authed.ClanMember.clanId
		},
		update: {
			// Do nothing
		}
	});
}
