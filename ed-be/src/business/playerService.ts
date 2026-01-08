import { PlayerCommonData } from '@drpg/core/models/player/PlayerCommonData';
import { PlayerInfo } from '@drpg/core/models/player/PlayerInfo';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { orderDinozList, toDinozFiche, toDinozFicheLite, toDinozPublicFiche } from '@drpg/core/utils/DinozUtils';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { convertToPlayerStats } from '@drpg/core/utils/twinoidGoals';
import { AdminRole, OfferStatus } from '@drpg/prisma';
import { Request } from 'express';
import sanitizeHtml from 'sanitize-html';
import { getAllDinozFicheLite, getDinozTotalCount } from '../dao/dinozDao.js';
import {
	auth,
	checkBeforeDeletion,
	getCanCreateClanRequest,
	getCanJoinClanRequest,
	getCommonDataRequest,
	getPlayerDataRequest,
	getPlayerRewardsRequest,
	getToolTipInfos,
	isPlayerLeaderOfClanRequest,
	resetUser,
	searchPlayersByNameOrId,
	setPlayer
} from '../dao/playerDao.js';
import translate from '../utils/translate.js';
import { getAvailableActions } from './dinozService.js';
import { getLatestTournament } from '../dao/tournamentDao.js';

/**
 * @summary Get data from player on login
 * @param req
 * @return Player
 */
export async function getCommonData(req: Request) {
	const authed = await auth(req);
	const playerCommonData = await getCommonDataRequest(authed.id);
	if (!playerCommonData) {
		throw new ExpectedError(`Player ${authed.id} doesn't exist.`);
	}

	const dinoz = playerCommonData.dinoz.map(d => {
		return { ...toDinozFiche(playerCommonData, d.id, null) };
	});
	for (const d of dinoz) {
		d.actions = await getAvailableActions(d, playerCommonData);
	}

	const commonData: PlayerCommonData = {
		money: playerCommonData.money,
		dinozCount: await getDinozTotalCount(),
		dinoz: dinoz,
		id: playerCommonData.id,
		connexionToken: playerCommonData.connexionToken,
		name: playerCommonData.name,
		clanId: playerCommonData.ClanMember?.clanId,
		playerOptions: {
			hasPDA: playerCommonData.rewards.some(reward => reward.rewardId === Reward.PDA),
			hasPMI: playerCommonData.rewards.some(reward => reward.rewardId === Reward.PMI),
			hasPAC: playerCommonData.rewards.some(reward => reward.rewardId === Reward.PAC),
			skipFight: playerCommonData.skipFight,
			skipLevel: playerCommonData.skipLevel
		},
		admin: playerCommonData.role === AdminRole.ADMIN,
		priest: playerCommonData.priest,
		shopkeeper: playerCommonData.shopKeeper,
		notifications: playerCommonData.notifications,
		discoveredSkills: playerCommonData.discoveredSkills
	};

	// Order dinoz
	commonData.dinoz = orderDinozList(commonData.dinoz);

	return commonData;
}

/**
 * @summary Get data from an account
 * @param req
 * @param req.params.id {string} PlayerId
 * @return PlayerInfo
 */
export async function getAccountData(req: Request) {
	const playerId = req.params.id;
	const playerInfo = await getPlayerDataRequest(playerId);
	if (!playerInfo) {
		throw new ExpectedError(`Player ${playerId} doesn't exist.`);
	}

	// Clan TODO
	const clan:
		| {
				id: number;
				name: string;
		  }
		| undefined = playerInfo.ClanMember?.clan;

	if (!playerInfo.ranking) {
		throw new ExpectedError(`Player ${playerId} doesn't have a ranking.`);
	}

	const infoToSend: PlayerInfo = {
		dinozCount: playerInfo.ranking.dinozCount,
		pointCount: playerInfo.ranking.points,
		subscribedAt: playerInfo.createdDate.toISOString(),
		clan: clan,
		name: playerInfo.name,
		id: playerInfo.id,
		epicRewards: playerInfo.rewards.map(reward => reward.rewardId).sort((a, b) => a - b),
		dinoz: playerInfo.dinoz.map(dinoz => {
			return toDinozPublicFiche({
				...dinoz
			});
		}),
		customText: playerInfo.customText,
		completion: playerInfo.ranking.completion,
		stats: convertToPlayerStats(playerInfo.playerTracking)
	};

	return infoToSend;
}

/**
 * @summary Set custom text for a player
 * @param req
 * @param req.body.message {string} Message to set as custom text
 * @return void
 */
export async function setCustomText(req: Request) {
	const authed = await auth(req);

	const playerProfile = await getPlayerRewardsRequest(authed.id);
	if (!playerProfile) {
		throw new ExpectedError(`Player ${authed.id} doesn't exist.`);
	}
	//Check if user can edit
	if (!playerProfile.rewards.some(reward => reward.rewardId === Reward.PLUME)) {
		throw new ExpectedError(`Player ${authed.id} cannot edit this field`);
	}

	const sanatized = sanitizeHtml(req.body.message, {
		allowedTags: ['b', 'i', 'em', 'strong', 'a'],
		allowedAttributes: {
			a: ['href']
		}
	});

	if (sanatized.length <= 2) {
		throw new ExpectedError(translate('tooShortMessage', authed));
	}

	await setPlayer(authed.id, { customText: sanatized });
}

/**
 * @summary Fetch a list of player based on a string
 * @param req
 * @param req.params.search {string}
 * @return Array<Player>
 */
export async function searchPlayers(req: Request) {
	const playerList = await searchPlayersByNameOrId(req.params.search);

	return playerList;
}

export async function getDinozList(req: Request) {
	const authed = await auth(req);

	const playerId: string = authed.id;
	const dinozActive = await getAllDinozFicheLite(playerId);
	if (!dinozActive) {
		throw new ExpectedError(`Player ${playerId} doesn't exist.`);
	}

	return dinozActive.map(dinoz => toDinozFicheLite(dinoz));
}

/**
 * @summary Get if player fills conditions to create a new clan
 * @param req
 * @return boolean
 */
export async function canCreateClan(req: Request) {
	const authed = await auth(req);

	const canCreateClan = await getCanCreateClanRequest(authed.id);
	return canCreateClan;
}

/**
 * @summary Get if player fills conditions to create a new clan
 * @param req
 * @return boolean
 */
export async function canJoinClan(req: Request) {
	const authed = await auth(req);

	const canJoinClan = await getCanJoinClanRequest(authed.id);
	return canJoinClan;
}

/**
 * @summary Get if player fills conditions to create a new clan
 * @param req.auth.playerId player id
 * @param req.params.id clan id
 * @return boolean
 */
export async function isPlayerLeaderOfClan(req: Request) {
	const authed = await auth(req);

	const isPlayerLeaderOfClan = await isPlayerLeaderOfClanRequest(authed.id, Number(req.params.id));
	return isPlayerLeaderOfClan;
}

export async function playerToolTip(req: Request) {
	const player = await getToolTipInfos(req.params.id);

	if (!player) {
		throw new ExpectedError(`Missing player.`);
	}
	return player;
}

export async function resetAccount(req: Request) {
	const authed = await auth(req);

	const latestTournament = await getLatestTournament();
	const playerToDelete = await checkBeforeDeletion(authed.id, latestTournament?.id);

	if (!playerToDelete) {
		throw new Error('No player found.');
	}

	//Check if sell of bids are ongoing
	if (
		playerToDelete.bids.length > 0 ||
		playerToDelete.offers.filter(b => b.status === OfferStatus.ONGOING).length > 0
	) {
		throw new ExpectedError(translate(`bidsOngoing`, authed));
	}

	//Check if part of a clan
	if (playerToDelete.ClanMember) {
		throw new ExpectedError(translate(`inClan`, authed));
	}

	// Check if the player has pending ban requests
	if (playerToDelete.targetedCases.length > 0) {
		throw new ExpectedError(translate(`banPending`, authed));
	}

	// Check if the player qualified for the latest ongoing tournament
	if (
		latestTournament !== null &&
		playerToDelete.LeftFightArchives.length + playerToDelete.RightFightArchives.length > 0
	) {
		throw new ExpectedError(translate(`ongoingDojoTournament`, authed));
	}

	await resetUser(authed.id);
}

export async function updatePlayerSettings(req: Request) {
	const authed = await auth(req);
	if (req.params.setting === 'skipLevel') {
		await setPlayer(authed.id, { skipLevel: req.body.setting });
	}
	if (req.params.setting === 'skipFight') {
		await setPlayer(authed.id, { skipFight: req.body.setting });
	}
}
